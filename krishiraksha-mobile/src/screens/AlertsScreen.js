import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';

const SEEDED_ALERTS = [
  {
    id: 'alt_1',
    type: 'weather_window',
    severity: 'High',
    disease: 'Early Blight',
    probability: 82,
    windowDays: 5,
    message:
      'Microclimate forecast over next 5 days indicates prolonged 86% RH and 24–27°C temperatures creating an 82% favorable window for Early Blight.',
    preventiveActions: [
      'Prune lower senescent leaves to improve under-canopy airflow',
      'Apply Trichoderma viride bio-fungicide prophylactic spray before forecasted evening rains',
      'Avoid overhead sprinkler irrigation; maintain root-zone drip only',
    ],
    timeAgo: '4h ago',
  },
  {
    id: 'alt_2',
    type: 'proximity_cluster',
    severity: 'Medium',
    disease: 'Pune-Khed Solanaceae Cluster',
    probability: 65,
    windowDays: 3,
    message:
      'Active Early Blight corridor detected expanding 0.35 km/day towards your sub-division. 5 verified cases within 4.2 km radius.',
    preventiveActions: [
      'Scout border rows every 48 hours for concentric target lesions',
      'Ensure strict equipment sanitation when moving between plots',
    ],
    timeAgo: '1d ago',
  },
];

export const AlertsScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState(SEEDED_ALERTS);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts?field_id=104');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge API alerts
      }
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('alerts_title')} />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('alerts_subtitle')}
        </Text>

        {alerts.map((alt) => {
          const isHigh = alt.severity === 'High';
          return (
            <View
              key={alt.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: isHigh ? theme.colors.danger : theme.colors.warning,
                },
              ]}
            >
              <View style={styles.alertCardTop}>
                <View style={styles.typeRow}>
                  <Text style={styles.alertIcon}>{isHigh ? '🚨' : '⚠️'}</Text>
                  <View>
                    <Text style={[styles.diseaseTitle, { color: theme.colors.text }]}>
                      {alt.disease}
                    </Text>
                    <Text style={[styles.timeAgo, { color: theme.colors.textMuted }]}>
                      {alt.timeAgo}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.probBadge,
                    {
                      backgroundColor: isHigh ? theme.colors.dangerBg : theme.colors.warningBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.probText,
                      { color: isHigh ? theme.colors.danger : theme.colors.warning },
                    ]}
                  >
                    {alt.probability}% Risk Window
                  </Text>
                </View>
              </View>

              <Text style={[styles.alertMessage, { color: theme.colors.text }]}>
                {alt.message}
              </Text>

              {/* Preventive Actions */}
              <View style={[styles.actionsBox, { backgroundColor: theme.colors.borderLight }]}>
                <Text style={[styles.actionsBoxTitle, { color: theme.colors.textSecondary }]}>
                  🛡️ Recommended Preventive Actions:
                </Text>
                {alt.preventiveActions.map((action, i) => (
                  <View key={i} style={styles.actionItemRow}>
                    <Text style={[styles.bullet, { color: theme.colors.primary }]}>•</Text>
                    <Text style={[styles.actionItemText, { color: theme.colors.text }]}>
                      {action}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
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
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  alertCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  diseaseTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  timeAgo: {
    fontSize: 11,
  },
  probBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  probText: {
    fontSize: 11,
    fontWeight: '800',
  },
  alertMessage: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 12,
  },
  actionsBox: {
    padding: 12,
    borderRadius: 10,
  },
  actionsBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bullet: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  actionItemText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
});
