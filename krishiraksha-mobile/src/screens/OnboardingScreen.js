import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';

const { width } = Dimensions.get('window');

export const OnboardingScreen = ({ onFinish }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      id: '1',
      icon: '🌱',
      titleKey: 'onboard_title_1',
      descKey: 'onboard_desc_1',
      badge: 'CLOSED-LOOP DECISION ENGINE',
    },
    {
      id: '2',
      icon: '📷',
      titleKey: 'onboard_title_2',
      descKey: 'onboard_desc_2',
      badge: 'POINT & SCAN CAMERA',
    },
    {
      id: '3',
      icon: '📊',
      titleKey: 'onboard_title_3',
      descKey: 'onboard_desc_3',
      badge: 'REAL-TIME IOT & TRAPS',
    },
    {
      id: '4',
      icon: '🤝',
      titleKey: 'onboard_title_4',
      descKey: 'onboard_desc_4',
      badge: 'ICAR EXPERTS + AI COPILOT',
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top bar with Skip button */}
      <View style={styles.topBar}>
        <View style={[styles.logoPill, { backgroundColor: theme.colors.primaryBg }]}>
          <Text style={[styles.logoPillText, { color: theme.colors.primaryDark }]}>
            KrishiRaksha SIH26131
          </Text>
        </View>
        <TouchableOpacity onPress={onFinish} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            {t('btn_skip')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.primaryBg }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={[styles.badgeContainer, { backgroundColor: theme.colors.borderLight }]}>
              <Text style={[styles.badgeText, { color: theme.colors.primaryDark }]}>
                {item.badge}
              </Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t(item.titleKey)}
            </Text>
            <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
              {t(item.descKey)}
            </Text>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === idx ? theme.colors.primary : theme.colors.border,
                  width: currentIndex === idx ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started Action Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.actionBtnText}>
            {currentIndex === slides.length - 1 ? t('btn_get_started') : t('btn_next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  logoPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  logoPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 52,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionBtn: {
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
