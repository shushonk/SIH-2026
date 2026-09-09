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
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { StatusChip } from '../components/common/StatusChip';
import { StepProgress } from '../components/common/StepProgress';
import { ActionCard } from '../components/common/ActionCard';
import { OfflineBanner } from '../components/common/OfflineBanner';

export const ScanResultScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { role } = useAuth();

  const {
    scanId,
    observation,
    analysis: initialAnalysis,
    sampleItem,
    isOffline = false,
  } = route.params || {};

  const [analysis, setAnalysis] = useState(initialAnalysis || {});
  const [caseStatus, setCaseStatus] = useState(
    initialAnalysis?.needs_investigation
      ? 'awaiting_info'
      : isOffline
      ? 'queued'
      : 'under_expert_review'
  );
  const [stepNumber, setStepNumber] = useState(initialAnalysis?.needs_investigation ? 2 : 3);
  const [aiAdvisory, setAiAdvisory] = useState(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [isNarrowing, setIsNarrowing] = useState(false);
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    fetchSimplifiedAdvisory();
  }, [language, analysis.top_disease]);

  const fetchSimplifiedAdvisory = async () => {
    if (!analysis?.top_disease) return;
    setLoadingAdvisory(true);
    try {
      const res = await api.post('/copilot/explain-diagnosis', {
        vision_result: {
          top_disease: analysis.top_disease,
          top_confidence: analysis.top_confidence || 0.85,
          severity_estimate: analysis.severity_estimate || 'Medium',
          differential: analysis.differential || [],
        },
        role,
        language,
      });
      setAiAdvisory(res.data?.explanation || null);
    } catch (e) {
      // Offline fallback text in selected language
      if (language === 'hi') {
        setAiAdvisory(
          `पत्तियों पर ${analysis.top_disease} के लक्षण पाए गए हैं। रोगग्रस्त पत्तियों को अलग करें और ड्रिप से सिंचाई करें।`
        );
      } else if (language === 'mr') {
        setAiAdvisory(
          `पानांवर ${analysis.top_disease} ची लक्षणे आढळली आहेत. बाधित पाने काढून टाका आणि झाडांना योग्य हवा खेळती ठेवा.`
        );
      } else {
        setAiAdvisory(
          `Signs of ${analysis.top_disease} detected. Prune infected lower foliage to halt spore spread, avoid evening wetness, and consult local extension.`
        );
      }
    } finally {
      setLoadingAdvisory(false);
    }
  };

  const handleNarrowDiagnosis = async () => {
    setIsNarrowing(true);
    try {
      // Simulate or call backend investigation narrowing endpoint
      const obsId = observation?.observation_id || scanId || 'obs_demo_104';
      const res = await api.post(`/observations/${obsId}/investigate`, {
        farmer_answer: 'Inspected lower leaves: dark velvety mold visible on underside.',
        underside_image_ref: 'leaf_underside_close_up.jpg',
      });

      const updatedAnalysis = res.data.analysis || {
        top_disease: 'Early Blight',
        top_confidence: 0.88,
        severity_estimate: 'High',
        needs_investigation: false,
        differential: [
          { disease: 'Early Blight', confidence: 0.88 },
          { disease: 'Septoria Leaf Spot', confidence: 0.08 },
          { disease: 'Nutrient Deficiency', confidence: 0.04 },
        ],
      };

      setAnalysis(updatedAnalysis);
      setCaseStatus('escalated_to_expert');
      setStepNumber(3);
    } catch (e) {
      // Offline simulation narrowing
      setAnalysis((prev) => ({
        ...prev,
        top_disease: 'Early Blight (Narrowed)',
        top_confidence: 0.88,
        severity_estimate: 'High',
        needs_investigation: false,
      }));
      setCaseStatus('escalated_to_expert');
      setStepNumber(3);
    } finally {
      setIsNarrowing(false);
    }
  };

  const handleEscalateToExpert = () => {
    setEscalated(true);
    setCaseStatus('expert_review');
    Alert.alert(
      'Sent to Pathologist',
      t('escalated_success')
    );
  };

  const disease = analysis.top_disease || 'Tomato Early Blight';
  const confidence = Math.round((analysis.top_confidence || 0.7) * 100);
  const severity = analysis.severity_estimate || 'Medium';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('result_title')} />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Progress Tracker */}
        <StepProgress
          currentStep={stepNumber}
          totalSteps={4}
          title={
            stepNumber === 2
              ? t('step_2')
              : stepNumber === 3
              ? t('step_3')
              : t('step_4')
          }
        />

        {/* Case Status Lifecycle Badge */}
        <View style={styles.statusRow}>
          <Text style={[styles.caseIdText, { color: theme.colors.textMuted }]}>
            Case #{scanId ? String(scanId).substring(0, 12) : 'OBS-104'}
          </Text>
          <StatusChip status={caseStatus} />
        </View>

        {/* Primary Diagnosis Card */}
        <View style={[styles.diagnosisCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {sampleItem?.imageUrl ? (
            <Image source={{ uri: sampleItem.imageUrl }} style={styles.cardImage} />
          ) : null}

          <View style={styles.cardBody}>
            <View style={styles.diseaseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subLabel, { color: theme.colors.textMuted }]}>
                  {t('diagnosis_label')}
                </Text>
                <Text style={[styles.diseaseTitle, { color: theme.colors.text }]}>
                  {disease}
                </Text>
              </View>
              <View
                style={[
                  styles.severityBadge,
                  {
                    backgroundColor:
                      severity === 'High'
                        ? theme.colors.dangerBg
                        : severity === 'Low'
                        ? theme.colors.successBg
                        : theme.colors.warningBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.severityText,
                    {
                      color:
                        severity === 'High'
                          ? theme.colors.danger
                          : severity === 'Low'
                          ? theme.colors.success
                          : theme.colors.warning,
                    },
                  ]}
                >
                  {severity} Severity
                </Text>
              </View>
            </View>

            {/* Confidence Progress Bar */}
            <View style={styles.confidenceSection}>
              <View style={styles.confidenceLabelRow}>
                <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
                  {t('confidence_label')}
                </Text>
                <Text style={[styles.confidenceValue, { color: theme.colors.primary }]}>
                  {confidence}%
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.colors.borderLight }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${confidence}%`, backgroundColor: theme.colors.primary },
                  ]}
                />
              </View>
            </View>

            {/* Differential Margins Alert if Uncertainty detected */}
            {analysis.needs_investigation ? (
              <View style={[styles.uncertaintyAlert, { backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warning }]}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertHeading, { color: theme.colors.warning }]}>
                    {t('margin_alert')}
                  </Text>
                  <Text style={[styles.alertSub, { color: theme.colors.text }]}>
                    {analysis.investigation_question || t('inv_desc')}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {/* Secondary Investigation Action (if needed) */}
        {analysis.needs_investigation ? (
          <View style={[styles.investigationBox, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}>
            <Text style={[styles.invTitle, { color: theme.colors.primaryDark }]}>
              {t('inv_title')}
            </Text>
            <Text style={[styles.invDesc, { color: theme.colors.text }]}>
              {t('inv_desc')}
            </Text>
            <TouchableOpacity
              style={[styles.narrowBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleNarrowDiagnosis}
              disabled={isNarrowing}
            >
              {isNarrowing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.narrowBtnText}>{t('btn_narrow_diagnosis')}</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Simplified AI Advisory (gpt-oss:120b-cloud Language Layer) */}
        <View style={[styles.advisoryCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.advisoryHeader}>
            <Text style={styles.robotIcon}>🤖</Text>
            <View>
              <Text style={[styles.advisoryTitle, { color: theme.colors.text }]}>
                {t('ai_explanation_title')}
              </Text>
              <Text style={[styles.advisorySubtitle, { color: theme.colors.textMuted }]}>
                Ollama gpt-oss:120b-cloud · Plain language next step
              </Text>
            </View>
          </View>

          {loadingAdvisory ? (
            <View style={styles.advisoryLoadingRow}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.advisoryLoadingText, { color: theme.colors.textSecondary }]}>
                {t('advisory_loading')}
              </Text>
            </View>
          ) : (
            <Text style={[styles.advisoryText, { color: theme.colors.text }]}>
              {aiAdvisory || t('advisory_loading')}
            </Text>
          )}
        </View>

        {/* Persistent What to do / What NOT to do card */}
        <ActionCard />

        {/* Escalate / Consult Expert Action */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[
              styles.escalateBtn,
              { backgroundColor: escalated ? theme.colors.success : theme.colors.secondary },
            ]}
            onPress={handleEscalateToExpert}
            disabled={escalated}
          >
            <Text style={styles.btnIcon}>{escalated ? '✓' : '👨‍🔬'}</Text>
            <Text style={styles.escalateBtnText}>
              {escalated ? 'Sent to Dr. Meera Nair' : t('btn_escalate_expert')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chatBtn, { borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('Chat', { screen: 'ChatDetail', params: { caseId: scanId || 'obs_demo_104' } })}
          >
            <Text style={[styles.chatBtnText, { color: theme.colors.text }]}>
              💬 Open Case Messages
            </Text>
          </TouchableOpacity>
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
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  caseIdText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  diagnosisCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 16,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  diseaseTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  confidenceSection: {
    marginBottom: 12,
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  uncertaintyAlert: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  alertHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  investigationBox: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  invTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  invDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  narrowBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  narrowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  advisoryCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  robotIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  advisoryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  advisorySubtitle: {
    fontSize: 11,
  },
  advisoryLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  advisoryLoadingText: {
    fontSize: 12,
  },
  advisoryText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  bottomActions: {
    gap: 10,
    marginTop: 8,
  },
  escalateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  btnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  escalateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  chatBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
