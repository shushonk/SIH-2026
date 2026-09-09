import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const ActionCard = ({ dos, donts, style }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const doList = dos || [t('do_item_1'), t('do_item_2')];
  const dontList = donts || [t('dont_item_1'), t('dont_item_2')];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, style]}>
      <Text style={[styles.heading, { color: theme.colors.text }]}>
        {t('dos_and_donts_title')}
      </Text>

      {/* Do Section */}
      <View style={[styles.section, styles.doSection, { backgroundColor: theme.colors.successBg }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.badgeIcon}>✅</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.success }]}>DO (अनुकरणीय)</Text>
        </View>
        {doList.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: theme.colors.success }]}>•</Text>
            <Text style={[styles.bulletText, { color: theme.colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Don't Section */}
      <View style={[styles.section, styles.dontSection, { backgroundColor: theme.colors.dangerBg }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.badgeIcon}>❌</Text>
          <Text style={[styles.sectionTitle, { color: theme.colors.danger }]}>DON'T (वर्ज्य)</Text>
        </View>
        {dontList.map((item, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: theme.colors.danger }]}>•</Text>
            <Text style={[styles.bulletText, { color: theme.colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  section: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  doSection: {},
  dontSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletDot: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
});
