import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

const ONBOARDING_KEY = '@krishiraksha_onboarding_completed';

const MainApp = () => {
  const { isDark, theme } = useTheme();
  // On web, default directly to main dashboard for instant preview
  const [hasOnboarded, setHasOnboarded] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (val === 'false') {
        setHasOnboarded(false);
      } else {
        setHasOnboarded(true);
      }
    } catch (e) {
      setHasOnboarded(true);
    }
  };

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasOnboarded(true);
    } catch (e) {
      setHasOnboarded(true);
    }
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {hasOnboarded ? (
        <RootNavigator />
      ) : (
        <OnboardingScreen onFinish={handleFinishOnboarding} />
      )}
    </>
  );
};

export default function App() {
  const defaultMetrics = initialWindowMetrics || {
    frame: { x: 0, y: 0, width: 1280, height: 800 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
  };

  return (
    <SafeAreaProvider initialMetrics={defaultMetrics}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
