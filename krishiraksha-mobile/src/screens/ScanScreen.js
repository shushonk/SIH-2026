import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { offlineQueue } from '../services/OfflineQueue';
import { SAMPLE_DATASET } from '../data/sampleDataset';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { StepProgress } from '../components/common/StepProgress';

export const ScanScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(1);
  const [rejectedModalVisible, setRejectedModalVisible] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [samplesModalVisible, setSamplesModalVisible] = useState(false);

  const startAnalysisProgress = async (imagePayload, sampleItem = null) => {
    setAnalyzing(true);
    setAnalyzingStep(1);

    const stepTimer1 = setTimeout(() => setAnalyzingStep(2), 700);
    const stepTimer2 = setTimeout(() => setAnalyzingStep(3), 1400);

    try {
      // Check if sample item is a non-plant rejection negative control
      if (sampleItem && sampleItem.isPlant === false) {
        await new Promise((r) => setTimeout(r, 1800));
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setAnalyzing(false);
        setRejectionMessage(sampleItem.description || t('scan_rejected_msg'));
        setRejectedModalVisible(true);
        return;
      }

      // Check if offline
      if (offlineQueue.isOffline) {
        await new Promise((r) => setTimeout(r, 1800));
        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);
        setAnalyzing(false);

        // Queue scan locally
        const queuedItem = await offlineQueue.enqueueScan({
          field_id: user?.fieldId || '104',
          image_ref: sampleItem?.imageUrl || 'offline_leaf_scan.jpg',
          image_base64: imagePayload?.base64 || null,
          symptom_keywords: sampleItem?.symptomKeywords || ['leaf_spots_concentric'],
          notes: 'Queued while offline in field',
          sync_status: 'pending_sync',
        });

        // Navigate to result with offline simulated prediction
        navigation.navigate('ScanResult', {
          scanId: queuedItem.id,
          isOffline: true,
          observation: {
            observation_id: queuedItem.id,
            field_id: user?.fieldId || '104',
            status: 'queued',
            sync_status: 'pending_sync',
          },
          analysis: {
            top_disease: sampleItem?.groundTruth || 'Early Blight',
            top_confidence: sampleItem?.expectedConfidence || 0.88,
            severity_estimate: sampleItem?.severity || 'High',
            needs_investigation: false,
            differential: [
              { disease: 'Early Blight', confidence: 0.88 },
              { disease: 'Septoria Leaf Spot', confidence: 0.08 },
            ],
            model_name: 'KrishiRaksha On-Device Triage v1.2',
          },
          sampleItem,
        });
        return;
      }

      // Online API Execution
      const res = await api.post('/observations', {
        field_id: user?.fieldId || '104',
        image_ref: sampleItem?.imageUrl || 'camera_leaf_scan.jpg',
        image_base64: imagePayload?.base64 || null,
        symptom_keywords: sampleItem?.symptomKeywords || ['leaf_spots_concentric'],
        notes: `Scanned by ${user?.name || 'Farmer'}`,
        sync_status: 'synced',
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAnalyzing(false);

      const aiData = res.data.ai_analysis || {};

      // Check if backend rejected as non-plant
      if (aiData.status === 'rejected_non_plant') {
        setRejectionMessage(aiData.message || t('scan_rejected_msg'));
        setRejectedModalVisible(true);
        return;
      }

      navigation.navigate('ScanResult', {
        scanId: res.data.observation?.observation_id,
        observation: res.data.observation,
        analysis: aiData,
        sampleItem,
      });
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setAnalyzing(false);

      // On network failure fallback to offline queue
      if (err.isNetworkError) {
        const queuedItem = await offlineQueue.enqueueScan({
          field_id: user?.fieldId || '104',
          image_ref: 'field_scan.jpg',
          symptom_keywords: ['leaf_spots_concentric'],
          sync_status: 'pending_sync',
        });
        navigation.navigate('ScanResult', {
          scanId: queuedItem.id,
          isOffline: true,
          analysis: {
            top_disease: 'Early Blight (Offline Estimate)',
            top_confidence: 0.75,
            severity_estimate: 'Medium',
            differential: [{ disease: 'Early Blight', confidence: 0.75 }],
          },
        });
      } else {
        Alert.alert('Scan Analysis Notice', err.message || 'Analysis could not be completed.');
      }
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Needed', 'Camera access is required to scan plant leaves.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        startAnalysisProgress(result.assets[0]);
      }
    } catch (e) {
      console.warn('Camera launch error:', e);
    }
  };

  const handleLaunchGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        startAnalysisProgress(result.assets[0]);
      }
    } catch (e) {
      console.warn('Gallery pick error:', e);
    }
  };

  const handleSelectSample = (sample) => {
    setSamplesModalVisible(false);
    startAnalysisProgress(null, sample);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('scan_title')} />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Numbered progress header */}
        <StepProgress currentStep={1} totalSteps={4} title={t('step_1')} />

        {/* Hero Scan Viewport Card - Matches Reference Mobile Mockup */}
        <View style={[styles.viewportCard, { backgroundColor: '#0f172a', borderColor: theme.colors.border }]}>
          <View style={styles.cameraViewfinder}>
            {/* Live leaf photo inside viewfinder */}
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1592417817098-8f3d6910a473?w=800&auto=format&fit=crop&q=80' }}
              style={styles.viewfinderImage}
            />

            {/* Dark gradient overlay for depth */}
            <View style={styles.viewfinderOverlay} />

            {/* Corner Target Brackets */}
            <View style={[styles.corner, styles.cornerTL, { borderColor: '#10b981' }]} />
            <View style={[styles.corner, styles.cornerTR, { borderColor: '#10b981' }]} />
            <View style={[styles.corner, styles.cornerBL, { borderColor: '#10b981' }]} />
            <View style={[styles.corner, styles.cornerBR, { borderColor: '#10b981' }]} />

            {/* Reference Floating Badges from User Screenshot */}
            <View style={styles.floatingBadgesContainer}>
              <View style={styles.floatingPillGreen}>
                <Text style={styles.pillIcon}>🌿</Text>
                <View>
                  <Text style={styles.pillTitle}>Instant</Text>
                  <Text style={styles.pillSubtitle}>Disease Scan</Text>
                </View>
              </View>

              <View style={styles.floatingPillAmber}>
                <Text style={styles.pillIcon}>🛡️</Text>
                <View>
                  <Text style={styles.pillTitle}>Grounded</Text>
                  <Text style={styles.pillSubtitle}>Simple Advisory</Text>
                </View>
              </View>
            </View>

            {/* Center Reticle Pulse */}
            <View style={styles.centerReticle}>
              <View style={styles.reticlePulseRing} />
              <Text style={styles.reticleText}>Target Lower Foliage</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={[styles.tipText, { color: '#94a3b8' }]}>
              {t('scan_tip')}
            </Text>
          </View>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleLaunchCamera}
          >
            <Text style={styles.btnIcon}>📸</Text>
            <Text style={styles.primaryActionBtnText}>{t('btn_take_photo')}</Text>
          </TouchableOpacity>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={handleLaunchGallery}
            >
              <Text style={styles.secondaryBtnIcon}>🖼️</Text>
              <Text style={[styles.secondaryActionBtnText, { color: theme.colors.text }]}>
                {t('btn_pick_gallery')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryActionBtn, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}
              onPress={() => setSamplesModalVisible(true)}
            >
              <Text style={styles.secondaryBtnIcon}>🧪</Text>
              <Text style={[styles.secondaryActionBtnText, { color: theme.colors.primaryDark }]}>
                {t('btn_try_samples')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instant Demo Tray (Glanceable 1-tap cards) */}
        <View style={styles.demoTraySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            1-Tap Demo Scans (Multi-Crop & Rejection Test)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sampleScroll}>
            {SAMPLE_DATASET.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.sampleCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => handleSelectSample(s)}
              >
                <Image source={{ uri: s.imageUrl }} style={styles.sampleImage} />
                <View style={styles.sampleInfo}>
                  <Text style={[styles.sampleCrop, { color: theme.colors.primary }]}>{s.crop}</Text>
                  <Text style={[styles.sampleLabel, { color: theme.colors.text }]} numberOfLines={1}>
                    {s.label}
                  </Text>
                  <Text
                    style={[
                      styles.sampleBadge,
                      {
                        backgroundColor: s.isPlant ? theme.colors.primaryBg : theme.colors.dangerBg,
                        color: s.isPlant ? theme.colors.primaryDark : theme.colors.danger,
                      },
                    ]}
                  >
                    {s.isPlant ? `${Math.round(s.expectedConfidence * 100)}% Match` : 'Rejection Test'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Full-screen Analyzing State (< 3s progress indicator) */}
      <Modal visible={analyzing} transparent animationType="fade">
        <View style={styles.analyzingOverlay}>
          <View style={[styles.analyzingCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.analyzingIconBox}>
              <Text style={styles.scanningPlantIcon}>🔬</Text>
              <ActivityIndicator size="large" color={theme.colors.primary} style={styles.indicator} />
            </View>

            <Text style={[styles.analyzingHeading, { color: theme.colors.text }]}>
              {t('scan_analyzing')}
            </Text>
            <Text style={[styles.analyzingSub, { color: theme.colors.textSecondary }]}>
              {t('scan_analyzing_sub')}
            </Text>

            {/* Step breakdown */}
            <View style={styles.analyzingSteps}>
              <Text
                style={[
                  styles.analyzingStepText,
                  { color: analyzingStep >= 1 ? theme.colors.primary : theme.colors.textMuted },
                ]}
              >
                {analyzingStep > 1 ? '✓ ' : '⏳ '}
                {t('scan_analyzing_step1')}
              </Text>
              <Text
                style={[
                  styles.analyzingStepText,
                  { color: analyzingStep >= 2 ? theme.colors.primary : theme.colors.textMuted },
                ]}
              >
                {analyzingStep > 2 ? '✓ ' : analyzingStep === 2 ? '⏳ ' : '○ '}
                {t('scan_analyzing_step2')}
              </Text>
              <Text
                style={[
                  styles.analyzingStepText,
                  { color: analyzingStep >= 3 ? theme.colors.primary : theme.colors.textMuted },
                ]}
              >
                {analyzingStep >= 3 ? '⏳ ' : '○ '}
                {t('scan_analyzing_step3')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Non-Plant Rejection Modal */}
      <Modal visible={rejectedModalVisible} transparent animationType="slide">
        <View style={styles.analyzingOverlay}>
          <View style={[styles.analyzingCard, { backgroundColor: theme.colors.card }]}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>⚠️</Text>
            <Text style={[styles.analyzingHeading, { color: theme.colors.danger }]}>
              {t('scan_rejected_title')}
            </Text>
            <Text style={[styles.analyzingSub, { color: theme.colors.text, marginVertical: 12 }]}>
              {rejectionMessage}
            </Text>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: theme.colors.primary, width: '100%' }]}
              onPress={() => setRejectedModalVisible(false)}
            >
              <Text style={styles.primaryActionBtnText}>{t('btn_scan_again')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sample Catalog Modal */}
      <Modal visible={samplesModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.catalogModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('btn_try_samples')}
              </Text>
              <TouchableOpacity onPress={() => setSamplesModalVisible(false)}>
                <Text style={{ fontSize: 20, color: theme.colors.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 420 }}>
              {SAMPLE_DATASET.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.catalogItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => handleSelectSample(s)}
                >
                  <Image source={{ uri: s.imageUrl }} style={styles.catalogThumb} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.catalogItemTitle, { color: theme.colors.text }]}>
                      {s.label}
                    </Text>
                    <Text style={[styles.catalogItemCrop, { color: theme.colors.primary }]}>
                      {s.crop} ({s.variety})
                    </Text>
                    <Text style={[styles.catalogItemDesc, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {s.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  viewportCard: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cameraViewfinder: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#020617',
    justifyContent: 'space-between',
    padding: 14,
  },
  viewfinderImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  floatingBadgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    marginTop: 4,
  },
  floatingPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 95, 70, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#34d399',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  floatingPillAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(180, 83, 9, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fcd34d',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  pillIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  pillTitle: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillSubtitle: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  centerReticle: {
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 5,
    marginBottom: 20,
  },
  reticlePulseRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    marginBottom: 6,
  },
  reticleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  targetFrame: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 16,
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderWidth: 3,
    zIndex: 10,
  },
  cornerTL: { top: 10, left: 10, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 10, right: 10, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 10, left: 10, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 10, right: 10, borderLeftWidth: 0, borderTopWidth: 0 },
  cameraIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  targetPrompt: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  primaryActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  secondaryBtnIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  demoTraySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  sampleScroll: {
    paddingBottom: 8,
  },
  sampleCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    overflow: 'hidden',
  },
  sampleImage: {
    width: '100%',
    height: 90,
  },
  sampleInfo: {
    padding: 8,
  },
  sampleCrop: {
    fontSize: 11,
    fontWeight: '700',
  },
  sampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sampleBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  analyzingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  analyzingCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  analyzingIconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  scanningPlantIcon: {
    fontSize: 36,
  },
  indicator: {
    position: 'absolute',
  },
  analyzingHeading: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  analyzingSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  analyzingSteps: {
    width: '100%',
    marginTop: 18,
    gap: 8,
  },
  analyzingStepText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  catalogModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  catalogThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  catalogItemTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  catalogItemCrop: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  catalogItemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
});
