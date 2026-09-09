import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export const StepProgress = ({ currentStep = 1, totalSteps = 4, title = '' }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.stepText, { color: theme.colors.primary }]}>
          Step {currentStep} of {totalSteps}
        </Text>
        {title ? (
          <Text style={[styles.titleText, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>
      <View style={styles.barsContainer}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <View
              key={idx}
              style={[
                styles.bar,
                {
                  backgroundColor: isCurrent
                    ? theme.colors.primary
                    : isCompleted
                    ? theme.colors.primaryLight
                    : theme.colors.borderLight,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
});
