import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../../i18n/LanguageContext';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { LivePulse } from './LivePulse';

export const Header = ({ title, subtitle, showBrand = true }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, role, quickDemoLogin } = useAuth();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
      <View style={styles.topRow}>
        {/* Left: Brand or Screen Title */}
        {showBrand ? (
          <View style={styles.brandContainer}>
            <View style={[styles.logoBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.logoIcon}>🌱</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: theme.colors.text }]}>
                {t('app_name')}
              </Text>
              <View style={styles.liveIndicatorRow}>
                <LivePulse size={7} />
                <Text style={[styles.liveText, { color: theme.colors.textMuted }]}>
                  {t('live_badge')} · {user?.fieldName ? 'Plot 104' : role}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.titleContainer}>
            <Text style={[styles.screenTitle, { color: theme.colors.text }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.screenSubtitle, { color: theme.colors.textSecondary }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}

        {/* Right action icons */}
        <View style={styles.actionsRow}>
          {/* Role switcher pill */}
          <TouchableOpacity
            style={[styles.rolePill, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}
            onPress={() => setRoleModalVisible(true)}
          >
            <Text style={[styles.rolePillText, { color: theme.colors.primaryDark }]}>
              {role}
            </Text>
          </TouchableOpacity>

          {/* Language switch button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.borderLight }]}
            onPress={() => setLangModalVisible(true)}
          >
            <Text style={styles.langButtonText}>
              {language === 'hi' ? 'हि' : language === 'mr' ? 'म' : 'EN'}
            </Text>
          </TouchableOpacity>

          {/* Theme toggle button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.borderLight }]}
            onPress={toggleTheme}
          >
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('language_selector')}
            </Text>
            {AVAILABLE_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.modalOption,
                  language === lang.code && { backgroundColor: theme.colors.primaryBg },
                ]}
                onPress={() => {
                  setLanguage(lang.code);
                  setLangModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: language === lang.code ? theme.colors.primaryDark : theme.colors.text },
                  ]}
                >
                  {lang.nativeName} ({lang.label})
                </Text>
                {language === lang.code ? (
                  <Text style={{ color: theme.colors.primaryDark, fontWeight: '700' }}>✓</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Role Selection Modal */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('demo_switch_title')}
            </Text>
            {Object.keys(DEMO_USERS).map((r) => {
              const u = DEMO_USERS[r];
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.modalOption,
                    isSelected && { backgroundColor: theme.colors.primaryBg },
                  ]}
                  onPress={() => {
                    quickDemoLogin(r);
                    setRoleModalVisible(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: isSelected ? theme.colors.primaryDark : theme.colors.text },
                      ]}
                    >
                      {r} · {u.name}
                    </Text>
                    <Text style={[styles.modalOptionSub, { color: theme.colors.textMuted }]}>
                      {u.specialization || u.jurisdiction || u.village || u.email}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Text style={{ color: theme.colors.primaryDark, fontWeight: '700' }}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  themeIcon: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
