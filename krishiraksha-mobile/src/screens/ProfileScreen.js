import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../i18n/LanguageContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { offlineQueue } from '../services/OfflineQueue';
import { getApiBase, setCustomApiBase } from '../services/api';
import { Header } from '../components/common/Header';

export const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, role, quickDemoLogin, logout } = useAuth();

  const [forceOffline, setForceOffline] = useState(offlineQueue.isOffline);
  const [apiBaseInput, setApiBaseInput] = useState(getApiBase());

  const handleToggleOffline = (val) => {
    setForceOffline(val);
    offlineQueue.toggleManualOffline(val);
  };

  const handleSaveApiBase = async () => {
    await setCustomApiBase(apiBaseInput.trim());
    Alert.alert('Saved', 'API Base URL updated.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('profile_title')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primaryBg }]}>
            <Text style={{ fontSize: 32 }}>
              {role === 'Farmer'
                ? '👨‍🌾'
                : role === 'Expert'
                ? '👩‍🔬'
                : role === 'Officer'
                ? '👮‍♂️'
                : '👨‍💼'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.userRole, { color: theme.colors.primary }]}>
              {role} {user?.specialization ? `· ${user.specialization}` : ''}
            </Text>
            <Text style={[styles.userMeta, { color: theme.colors.textMuted }]}>
              {user?.email} · {user?.village || user?.jurisdiction || 'Pune Region'}
            </Text>
          </View>
        </View>

        {/* Demo Persona Switcher */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          {t('demo_switch_title')}
        </Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          {Object.keys(DEMO_USERS).map((r) => {
            const isCurrent = role === r;
            const u = DEMO_USERS[r];
            return (
              <TouchableOpacity
                key={r}
                style={[
                  styles.personaRow,
                  isCurrent && { backgroundColor: theme.colors.primaryBg },
                  { borderBottomColor: theme.colors.borderLight },
                ]}
                onPress={() => quickDemoLogin(r)}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.personaTitle,
                      { color: isCurrent ? theme.colors.primaryDark : theme.colors.text },
                    ]}
                  >
                    {r}: {u.name}
                  </Text>
                  <Text style={[styles.personaSubtitle, { color: theme.colors.textMuted }]}>
                    {u.specialization || u.jurisdiction || u.fieldName || u.email}
                  </Text>
                </View>
                {isCurrent ? (
                  <Text style={{ color: theme.colors.primaryDark, fontWeight: '800' }}>ACTIVE</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Language Selection */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          {t('language_selector')}
        </Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.langButtonsRow}>
            {AVAILABLE_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langBtn,
                  language === lang.code
                    ? { backgroundColor: theme.colors.primary }
                    : { backgroundColor: theme.colors.borderLight },
                ]}
                onPress={() => setLanguage(lang.code)}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    { color: language === lang.code ? '#fff' : theme.colors.text },
                  ]}
                >
                  {lang.nativeName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Settings */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          {t('theme_selector')}
        </Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                {isDark ? t('theme_dark') : t('theme_light')}
              </Text>
              <Text style={[styles.toggleSub, { color: theme.colors.textMuted }]}>
                Instant dynamic token switching
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }}
            />
          </View>
        </View>

        {/* Developer & Offline Simulation */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Network & Backend Connectivity
        </Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight, paddingBottom: 12 }]}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
                Simulate Offline Mode (Requirement 2)
              </Text>
              <Text style={[styles.toggleSub, { color: theme.colors.textMuted }]}>
                Test offline queue, persistent banner, and auto-sync
              </Text>
            </View>
            <Switch
              value={forceOffline}
              onValueChange={handleToggleOffline}
              trackColor={{ true: theme.colors.warning, false: '#e2e8f0' }}
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={[styles.toggleLabel, { color: theme.colors.text, marginBottom: 6 }]}>
              Backend API Base URL
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[
                  styles.apiInput,
                  { backgroundColor: theme.colors.borderLight, color: theme.colors.text },
                ]}
                value={apiBaseInput}
                onChangeText={setApiBaseInput}
              />
              <TouchableOpacity
                style={[styles.saveApiBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveApiBase}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.colors.danger, backgroundColor: theme.colors.dangerBg }]}
          onPress={logout}
        >
          <Text style={[styles.logoutText, { color: theme.colors.danger }]}>{t('btn_logout')}</Text>
        </TouchableOpacity>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  userRole: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  userMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  personaTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  personaSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  langButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  apiInput: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  saveApiBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
