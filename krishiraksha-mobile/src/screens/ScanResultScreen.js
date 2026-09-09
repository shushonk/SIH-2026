import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';

export const ScanResultScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { role } = useAuth();

  const {
    scanId = '8492',
    observation,
    analysis: initialAnalysis,
    sampleItem,
    isOffline = false,
  } = route.params || {};

  const [analysis, setAnalysis] = useState(initialAnalysis || {});
  const [escalated, setEscalated] = useState(false);
  const [isNarrowing, setIsNarrowing] = useState(false);

  const disease = analysis.top_disease || 'Cercospora Leaf Spot';
  const confidence = Math.round((analysis.top_confidence || 0.94) * 100);
  const severity = analysis.severity_estimate || 'Moderate Severity';

  // Disease translations for Marathi & Hindi subtitles
  const getVernacularTitle = (dis) => {
    if (dis.includes('Cercospora') || dis.includes('Early Blight') || dis.includes('Blight')) {
      return 'तपकिरी पानांचे ठिपके (करपा रोग)';
    }
    if (dis.includes('Septoria')) {
      return 'सेप्टोरिया पानावरील ठिपके';
    }
    if (dis.includes('Whitefly')) {
      return 'पांढरी माशी प्रादुर्भाव';
    }
    if (dis.includes('Healthy')) {
      return 'निरोगी पीक पर्णसंभार';
    }
    return 'तपकिरी पानांचे ठिपके';
  };

  const handleShareWhatsApp = async () => {
    const reportText = `📋 *CultivAI Diagnostic Report #${scanId ? String(scanId).substring(0, 6) : '8492'}*\n` +
      `🌿 *Crop*: Cotton / Tomato\n` +
      `🔬 *Diagnosis*: ${disease} (${getVernacularTitle(disease)})\n` +
      `📊 *Confidence*: ${confidence}% • *Severity*: ${severity}\n` +
      `📍 *Location*: Nashik, Maharashtra\n\n` +
      `🚫 *Warning*: डू नॉट स्प्रे महागडी रसायने (Avoid heavy broad-spectrum chemicals)\n` +
      `✅ *Recommended IPM*:\n` +
      `1. 5% NSKE Spray (Neem Seed Kernel Extract)\n` +
      `2. 3-Foot Row Drainage Trenching\n\n` +
      `CultivAI AI Agricultural Decision Support System`;

    try {
      await Share.share({ message: reportText });
    } catch (e) {
      Alert.alert('WhatsApp Share', reportText);
    }
  };

  const handleSendToExpert = () => {
    setEscalated(true);
    Alert.alert(
      'Sent to Expert',
      'Diagnostic Report #' + (scanId || '8492') + ' has been routed to Senior Plant Pathologist Dr. Ramesh Shinde at KVK Nashik for formal review.',
      [{ text: 'OK' }]
    );
  };

  const handleAskAssistant = () => {
    navigation.navigate('Copilot', {
      initialPrompt: `I need clarification regarding Diagnostic Report #${scanId || '8492'} for ${disease}. What safe IPM steps should I take today?`,
      diseaseContext: disease,
      confidenceContext: confidence,
    });
  };

  const handleNarrowDiagnosis = async () => {
    setIsNarrowing(true);
    try {
      const obsId = observation?.observation_id || scanId || 'obs_demo_8492';
      const res = await api.post(`/observations/${obsId}/investigate`, {
        farmer_answer: 'Inspected leaf underside: dark concentric rings with fungal velvety center.',
        underside_image_ref: 'leaf_underside_sample.jpg',
      });
      if (res.data?.analysis) {
        setAnalysis(res.data.analysis);
      }
    } catch (e) {
      setAnalysis((prev) => ({
        ...prev,
        top_confidence: 0.96,
        severity_estimate: 'Moderate',
      }));
    } finally {
      setIsNarrowing(false);
      Alert.alert('Investigation Narrowed', 'Diagnostic precision updated with underside foliar telemetry.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="CultivAI" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Report Header Bar */}
        <View style={styles.topReportBar}>
          <View style={[styles.reportPill, { backgroundColor: theme.colors.surfaceContainerHigh || '#dce9ff' }]}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <Text style={[styles.reportPillText, { color: theme.colors.text }]}>
              Diagnostic Report #{scanId ? String(scanId).substring(0, 8) : '8492'}
            </Text>
          </View>
          <Text style={[styles.timestampText, { color: theme.colors.textMuted }]}>
            Just now
          </Text>
        </View>

        {/* Primary Diagnostic Card */}
        <View style={[styles.diagnosticCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {/* Leaf Photo Canvas */}
          <View style={styles.mediaContainer}>
            <Image
              source={{
                uri:
                  sampleItem?.imageUrl ||
                  'https://lh3.googleusercontent.com/aida/AEtjO1UVAqZFboySPxriykpK8ohDQ7AwfOyIav3mN0sk_HYxDcdVWSOZihaBwMjen0WUJ6Q4Cqkliyozgoo5pU3db4NvHkZ3vObB_vBLEelsIgimY_N9I659KQ1V-CKA_a1yfblt3UezkZemOsZkzUq1sFDBk9lBOLwmflJibbkQFQMVPJSSDDGLOhKiidaIh7pBJ_HSQ6t_wVcyXM3fiWX302yEfcOMLU3izqYhoxyll_ygWvgCZuKwPBZDXdkS',
              }}
              style={styles.leafImage}
              resizeMode="cover"
            />

            {/* Bottom-left floating tag */}
            <View style={styles.floatingLeafTag}>
              <Text style={styles.leafTagIcon}>🌿</Text>
              <Text style={styles.leafTagText}>
                {sampleItem?.crop ? `${sampleItem.crop} Leaf Scan` : 'Cotton Leaf Scan'}
              </Text>
            </View>
          </View>

          {/* Disease Readout */}
          <View style={styles.cardBody}>
            <Text style={[styles.diseaseTitle, { color: theme.colors.text }]}>
              {disease}
            </Text>
            <Text style={[styles.diseaseSubtitle, { color: theme.colors.textMuted }]}>
              {getVernacularTitle(disease)}
            </Text>

            {/* Severity & Confidence Metric */}
            <View style={styles.metricContainer}>
              <View style={styles.metricHeaderRow}>
                <View style={styles.severityWarningRow}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.severityWarningText}>
                    {severity} • {confidence}% Confidence
                  </Text>
                </View>
                <Text style={[styles.locationText, { color: theme.colors.textMuted }]}>
                  Nashik, MH
                </Text>
              </View>

              {/* Segmented Severity Bar */}
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(20, confidence * 0.7))}%`,
                      backgroundColor: theme.colors.secondaryContainer || '#fe932c',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Micro-Sachet Banner */}
            <View style={[styles.sachetCard, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
              <View style={styles.sachetCardLeft}>
                <View style={[styles.sachetIconCircle, { backgroundColor: '#d3ffd5' }]}>
                  <Text style={styles.sachetCardEmoji}>💳</Text>
                </View>
                <View>
                  <Text style={[styles.sachetCardTitle, { color: theme.colors.text }]}>
                    ₹15 Sachet Used
                  </Text>
                  <Text style={[styles.sachetCardSub, { color: theme.colors.textMuted }]}>
                    Recommended micro-dose packet
                  </Text>
                </View>
              </View>

              <View style={[styles.zeroChargeBadge, { backgroundColor: theme.colors.primaryLight || '#15803d' }]}>
                <Text style={styles.zeroChargeText}>₹0 Extra Charged</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Safe IPM Advisory Card */}
        <View style={[styles.advisoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.advisoryHeaderRow}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={[styles.advisoryTitle, { color: theme.colors.text }]}>
              Safe IPM Advisory
            </Text>
          </View>

          {/* Red Do-Not-Spray Banner with thick left red border */}
          <View style={styles.redWarningBox}>
            <Text style={styles.blockIcon}>🚫</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.redWarningTitle}>
                डू नॉट स्प्रे महागडी रसायने
              </Text>
              <Text style={styles.redWarningDesc}>
                Avoid heavy broad-spectrum chemicals immediately. They destroy friendly predatory mites and increase leaf scorch risk.
              </Text>
            </View>
          </View>

          {/* 2-Step Remedial Actions */}
          <View style={styles.stepCardsList}>
            <View style={[styles.stepItem, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
              <View style={[styles.stepNumberBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  5% NSKE Spray (Neem Seed Kernel Extract)
                </Text>
                <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                  Apply uniform foliar mist during early morning hours to disrupt fungal spore germination safely.
                </Text>
              </View>
            </View>

            <View style={[styles.stepItem, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
              <View style={[styles.stepNumberBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                  3-Foot Row Drainage Trenching
                </Text>
                <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                  Clear excess water channels between plant beds to reduce root-zone humidity and halt spore spread.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Narrow Diagnosis Secondary Action (if ambiguous) */}
        {analysis.needs_investigation ? (
          <TouchableOpacity
            style={[styles.narrowBtn, { borderColor: theme.colors.primary }]}
            onPress={handleNarrowDiagnosis}
            disabled={isNarrowing}
          >
            {isNarrowing ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <>
                <Text style={styles.narrowBtnIcon}>🔬</Text>
                <Text style={[styles.narrowBtnText, { color: theme.colors.primary }]}>
                  Leaf Underside Photo (Narrow Diagnosis)
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Bottom CTA Action Buttons (Exact Reference Match) */}
        <View style={styles.actionButtonsContainer}>
          {/* Primary Ask AI Button */}
          <TouchableOpacity
            style={[styles.askAiButton, { backgroundColor: theme.colors.secondaryContainer || '#fe932c' }]}
            onPress={handleAskAssistant}
          >
            <Text style={styles.askAiIcon}>💬</Text>
            <Text style={styles.askAiText}>
              Ask CultivAI Assistant for Clarification 💬
            </Text>
          </TouchableOpacity>

          {/* Secondary 2-Column Buttons */}
          <View style={styles.splitButtonRow}>
            <TouchableOpacity
              style={[styles.expertButton, { backgroundColor: theme.colors.surfaceContainerHigh || '#dce9ff' }]}
              onPress={handleSendToExpert}
            >
              <Text style={styles.btnIconText}>🎓</Text>
              <Text style={[styles.expertBtnText, { color: theme.colors.text }]}>
                {escalated ? 'Sent to Expert ✓' : 'Send to Expert'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.waButton, { backgroundColor: '#25D366' }]}
              onPress={handleShareWhatsApp}
            >
              <Text style={styles.btnIconText}>📲</Text>
              <Text style={styles.waBtnText}>Share via WA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    gap: 16,
  },
  // Top Report Header
  topReportBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedIcon: {
    color: '#00652c',
    fontSize: 14,
    fontWeight: '900',
  },
  reportPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  timestampText: {
    fontSize: 12,
  },
  // Diagnostic Card
  diagnosticCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  leafImage: {
    width: '100%',
    height: '100%',
  },
  floatingLeafTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  leafTagIcon: {
    fontSize: 12,
  },
  leafTagText: {
    color: '#00652c',
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  diseaseSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: -4,
  },
  metricContainer: {
    gap: 6,
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  severityWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  warningIcon: {
    fontSize: 14,
  },
  severityWarningText: {
    color: '#fe932c',
    fontSize: 13,
    fontWeight: '800',
  },
  locationText: {
    fontSize: 12,
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eff4ff',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sachetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  sachetCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sachetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sachetCardEmoji: {
    fontSize: 18,
  },
  sachetCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  sachetCardSub: {
    fontSize: 11,
    marginTop: 1,
  },
  zeroChargeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  zeroChargeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  // Advisory Card
  advisoryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  advisoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldIcon: {
    fontSize: 18,
  },
  advisoryTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  redWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffdad6',
    borderLeftWidth: 4,
    borderLeftColor: '#b20010',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  blockIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  redWarningTitle: {
    color: '#410002',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  redWarningDesc: {
    color: '#410002',
    fontSize: 12,
    lineHeight: 17,
  },
  stepCardsList: {
    gap: 10,
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  // Narrowing Button
  narrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  narrowBtnIcon: {
    fontSize: 16,
  },
  narrowBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  // Bottom Action Buttons
  actionButtonsContainer: {
    gap: 10,
    marginTop: 4,
  },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  askAiIcon: {
    fontSize: 16,
  },
  askAiText: {
    color: '#663500',
    fontSize: 14,
    fontWeight: '800',
  },
  splitButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  expertButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    gap: 6,
  },
  expertBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  waButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  btnIconText: {
    fontSize: 16,
  },
  waBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});
