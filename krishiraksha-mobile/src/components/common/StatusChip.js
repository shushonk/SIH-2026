import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const StatusChip = ({ status = 'analyzing', style }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const getStatusConfig = (s) => {
    const norm = String(s).toLowerCase();
    if (norm.includes('analyz')) {
      return {
        label: t('status_analyzing'),
        bg: '#e0f2fe',
        text: '#0369a1',
        border: '#bae6fd',
      };
    }
    if (norm.includes('investigat') || norm.includes('await') || norm.includes('info')) {
      return {
        label: t('status_awaiting_info'),
        bg: '#fef3c7',
        text: '#b45309',
        border: '#fde68a',
      };
    }
    if (norm.includes('expert') || norm.includes('review') || norm.includes('escalat')) {
      return {
        label: t('status_expert_review'),
        bg: '#e0e7ff',
        text: '#4338ca',
        border: '#c7d2fe',
      };
    }
    if (norm.includes('verified') || norm.includes('reviewed') || norm.includes('confirm')) {
      return {
        label: t('status_reviewed'),
        bg: '#dcfce7',
        text: '#15803d',
        border: '#bbf7d0',
      };
    }
    if (norm.includes('follow') || norm.includes('schedul')) {
      return {
        label: t('status_followup_scheduled'),
        bg: '#f3e8ff',
        text: '#7e22ce',
        border: '#e9d5ff',
      };
    }
    return {
      label: t('status_resolved'),
      bg: '#ccfbf1',
      text: '#0f766e',
      border: '#99f6e4',
    };
  };

  const cfg = getStatusConfig(status);

  return (
    <View style={[styles.chip, { backgroundColor: cfg.bg, borderColor: cfg.border }, style]}>
      <View style={[styles.dot, { backgroundColor: cfg.text }]} />
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
