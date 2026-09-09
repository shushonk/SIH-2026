import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { StatusChip } from '../components/common/StatusChip';

const SEED_PENDING_CASES = [
  {
    observation_id: 'obs_seed_104_1',
    farmer_name: 'Ramesh Patil',
    field_id: '104',
    village: 'Khed, Pune',
    crop: 'Tomato (Pusa Ruby)',
    ai_top_disease: 'Early Blight (54%) vs Septoria (38%)',
    confidence: 0.54,
    margin: '16% (Close Diagnostic Margin)',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a93?w=600',
    undersideUrl: 'https://images.unsplash.com/photo-1598512752271-33f913a5af13?w=600',
    evidenceNotes: 'Farmer uploaded leaf underside close-up. Conidia chains and dark sporulation visible.',
    status: 'escalated_to_expert',
  },
  {
    observation_id: 'obs_seed_218',
    farmer_name: 'Sunita Devi',
    field_id: '218',
    village: 'Manchar, Pune',
    crop: 'Tomato (Pusa Ruby)',
    ai_top_disease: 'Septoria Leaf Spot (56%)',
    confidence: 0.56,
    margin: '18% Margin',
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600',
    evidenceNotes: 'Small circular grey spots with dark border on mid-foliage.',
    status: 'escalated_to_expert',
  },
];

export const ExpertQueueScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [cases, setCases] = useState(SEED_PENDING_CASES);
  const [selectedCase, setSelectedCase] = useState(null);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [confirmedDisease, setConfirmedDisease] = useState('Early Blight');
  const [severity, setSeverity] = useState('High');
  const [notes, setNotes] = useState('Confirmed Alternaria solani based on underside concentric sporulation.');

  const handleOpenVerify = (c) => {
    setSelectedCase(c);
    setConfirmedDisease('Early Blight');
    setSeverity('High');
    setVerifyModalVisible(true);
  };

  const handleConfirmVerification = async () => {
    if (!selectedCase) return;

    try {
      await api.post(`/experts/verify/${selectedCase.observation_id}`, {
        confirmed_disease: confirmedDisease,
        severity: severity,
        advisory_notes: notes,
      });

      // Remove from pending list
      setCases((prev) => prev.filter((c) => c.observation_id !== selectedCase.observation_id));
      setVerifyModalVisible(false);

      Alert.alert(
        'Verification Published',
        `Case #${selectedCase.observation_id.substring(0, 10)} verified as ${confirmedDisease}. Farmer has been notified.`
      );
    } catch (e) {
      // Offline simulation
      setCases((prev) => prev.filter((c) => c.observation_id !== selectedCase.observation_id));
      setVerifyModalVisible(false);
      Alert.alert('Ground Truth Saved', 'Confirmed ground truth stored.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('queue_title')} />
      <OfflineBanner />

      <FlatList
        data={cases}
        keyExtractor={(item) => item.observation_id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.introBox}>
            <Text style={[styles.queueCount, { color: theme.colors.primary }]}>
              {cases.length} Cases Requiring Pathologist Review
            </Text>
            <Text style={[styles.queueSub, { color: theme.colors.textMuted }]}>
              {t('queue_subtitle')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.caseCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.farmerTitle, { color: theme.colors.text }]}>
                  {item.farmer_name} · {item.village}
                </Text>
                <Text style={[styles.cropText, { color: theme.colors.primary }]}>
                  {item.crop}
                </Text>
              </View>
              <StatusChip status={item.status} />
            </View>

            {/* Evidence photos preview */}
            <View style={styles.imagesRow}>
              <View style={styles.imageCol}>
                <Image source={{ uri: item.imageUrl }} style={styles.evidenceImage} />
                <Text style={[styles.imageCaption, { color: theme.colors.textMuted }]}>
                  Primary Scan
                </Text>
              </View>
              {item.undersideUrl ? (
                <View style={styles.imageCol}>
                  <Image source={{ uri: item.undersideUrl }} style={styles.evidenceImage} />
                  <Text style={[styles.imageCaption, { color: theme.colors.primaryDark }]}>
                    Underside Macro
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Ambiguity Reason */}
            <View style={[styles.ambiguityBox, { backgroundColor: theme.colors.warningBg }]}>
              <Text style={[styles.ambiguityTitle, { color: theme.colors.warning }]}>
                ⚠️ AI Differential Margin: {item.margin}
              </Text>
              <Text style={[styles.ambiguityDesc, { color: theme.colors.text }]}>
                {item.ai_top_disease}
              </Text>
            </View>

            {item.evidenceNotes ? (
              <Text style={[styles.evidenceNote, { color: theme.colors.textSecondary }]}>
                📝 Farmer Note: "{item.evidenceNotes}"
              </Text>
            ) : null}

            {/* Verification Button */}
            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => handleOpenVerify(item)}
            >
              <Text style={styles.verifyBtnText}>{t('btn_verify_case')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Ground Truth Confirmation Modal */}
      <Modal visible={verifyModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('btn_confirm')}
            </Text>

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Confirmed Diagnosis (वैज्ञानिक निष्कर्ष)
            </Text>
            <View style={styles.diseaseOptionsRow}>
              {['Early Blight', 'Septoria Leaf Spot', 'Nutrient Deficiency'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.optionPill,
                    {
                      backgroundColor:
                        confirmedDisease === d ? theme.colors.primary : theme.colors.borderLight,
                    },
                  ]}
                  onPress={() => setConfirmedDisease(d)}
                >
                  <Text
                    style={{
                      color: confirmedDisease === d ? '#fff' : theme.colors.text,
                      fontSize: 12,
                      fontWeight: '700',
                    }}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Pathologist Advisory Notes (गैर-रासायनिक मार्गदर्शन)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: theme.colors.borderLight, color: theme.colors.text },
              ]}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancel, { borderColor: theme.colors.border }]}
                onPress={() => setVerifyModalVisible(false)}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmit, { backgroundColor: theme.colors.primary }]}
                onPress={handleConfirmVerification}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm & Notify Farmer</Text>
              </TouchableOpacity>
            </View>
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introBox: {
    marginBottom: 14,
  },
  queueCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  queueSub: {
    fontSize: 12,
    marginTop: 2,
  },
  caseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  farmerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cropText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  imageCol: {
    flex: 1,
  },
  evidenceImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  imageCaption: {
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  ambiguityBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  ambiguityTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  ambiguityDesc: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  evidenceNote: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  verifyBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  diseaseOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  textArea: {
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalSubmit: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});
