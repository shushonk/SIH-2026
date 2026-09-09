import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage, AVAILABLE_LANGUAGES } from '../i18n/LanguageContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Header } from '../components/common/Header';

export const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, role, quickDemoLogin, logout } = useAuth();

  // Role-Specific Profile Content
  const renderProfessionSpecificDetails = () => {
    switch (role) {
      case 'Farmer':
        return (
          <View style={styles.professionSection}>
            {/* Farmer Holdings Card */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderEmoji}>🌾</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>
                    Agricultural Holding & Passport
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: theme.colors.textMuted }]}>
                    Plot ID #104 · Pune-Khed Agro-Climatic Zone
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.statusPillText, { color: '#166534' }]}>ACTIVE</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>1.8 Ha</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Cultivated Land</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>Clay Loam</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Soil Category</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>Drip + IoT</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Irrigation Mode</Text>
                </View>
              </View>

              <View style={[styles.fieldDetailsRow, { borderTopColor: theme.colors.borderLight }]}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Standing Crops:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>Tomato (Pusa Ruby) · Bt-Cotton (RCH-659)</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Phenological Stage:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>Flowering & Early Fruit Set (Day 48)</Text>
              </View>
            </View>

            {/* Micro-Sachet Subscription */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderEmoji}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>
                    Micro-Sachet Subscription
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: theme.colors.textMuted }]}>
                    Affordable High-Frequency Farm Diagnostics
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#ffedd5' }]}>
                  <Text style={[styles.statusPillText, { color: '#c2410c' }]}>₹15 PASS</Text>
                </View>
              </View>

              <View style={[styles.sachetInfoRow, { backgroundColor: theme.colors.borderLight }]}>
                <View>
                  <Text style={[styles.sachetScansText, { color: theme.colors.text }]}>
                    4 of 5 Scans Remaining Today
                  </Text>
                  <Text style={[styles.sachetValidityText, { color: theme.colors.textMuted }]}>
                    Valid through 30 Sep 2026 · Auto-renew disabled
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.rechargeBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => Alert.alert('Recharge Micro-Sachet', 'Recharge ₹15 for 5 instant high-precision crop foliage scans.')}
                >
                  <Text style={styles.rechargeBtnText}>Top Up</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Farmer Verifications & Badges */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text, marginBottom: 10 }]}>
                Government Certifications & Badges
              </Text>
              <View style={styles.badgeList}>
                <View style={[styles.badgePill, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                  <Text style={styles.badgeEmoji}>🌾</Text>
                  <Text style={[styles.badgeText, { color: '#15803d' }]}>PM-KISAN Registered Beneficiary</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <Text style={styles.badgeEmoji}>🏛️</Text>
                  <Text style={[styles.badgeText, { color: '#1d4ed8' }]}>MahaDBT Farmer ID: 2026-MH-8831</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#fefce8', borderColor: '#fef08a' }]}>
                  <Text style={styles.badgeEmoji}>🧪</Text>
                  <Text style={[styles.badgeText, { color: '#a16207' }]}>KVK Soil Health Card: Grade A</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'Expert':
        return (
          <View style={styles.professionSection}>
            {/* Scientific Credentials */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderEmoji}>🔬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>
                    ICAR Scientist Credentials
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: theme.colors.textMuted }]}>
                    Directorate of Plant Protection & KVK Nashik
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#e0e7ff' }]}>
                  <Text style={[styles.statusPillText, { color: '#4338ca' }]}>LEVEL 3</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>98.4%</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Concordance</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>342</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Verified Cases</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>8.4 min</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Avg Triage</Text>
                </View>
              </View>

              <View style={[styles.fieldDetailsRow, { borderTopColor: theme.colors.borderLight }]}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Scientist Reg ID:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>ICAR-PP-2018-8842</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Domain Specialization:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>Solanaceae Late Blight & Cucurbit Foliar Pathogens</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Triage Queue Status:</Text>
                <Text style={[styles.detailValue, { color: '#ea580c', fontWeight: '700' }]}>4 Ambiguous Scans Pending Review</Text>
              </View>
            </View>

            {/* Expert Badges */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text, marginBottom: 10 }]}>
                Scientific Accreditations
              </Text>
              <View style={styles.badgeList}>
                <View style={[styles.badgePill, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
                  <Text style={styles.badgeEmoji}>🎖️</Text>
                  <Text style={[styles.badgeText, { color: '#6d28d9' }]}>ICAR Certified Phytopathologist</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#f0fdfa', borderColor: '#99f6e4' }]}>
                  <Text style={styles.badgeEmoji}>🤖</Text>
                  <Text style={[styles.badgeText, { color: '#0f766e' }]}>CultivAI Model Calibration Lead</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#fefce8', borderColor: '#fef08a' }]}>
                  <Text style={styles.badgeEmoji}>📋</Text>
                  <Text style={[styles.badgeText, { color: '#a16207' }]}>State Safe IPM Advisory Author</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'Officer':
        return (
          <View style={styles.professionSection}>
            {/* Officer Jurisdiction */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderEmoji}>👮‍♂️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>
                    Agricultural Surveillance Jurisdiction
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: theme.colors.textMuted }]}>
                    Sub-Divisional Agricultural Office (SDAO)
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#fee2e2' }]}>
                  <Text style={[styles.statusPillText, { color: '#b91c1c' }]}>SURVEILLANCE</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>14</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Mandals Active</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: '#ef4444' }]}>139</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Threat Hotspots</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: '#10b981' }]}>78.4%</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Containment</Text>
                </View>
              </View>

              <View style={[styles.fieldDetailsRow, { borderTopColor: theme.colors.borderLight }]}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Jurisdiction Code:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>Khed-Manchar Sub-Division, Pune District</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Officer Gazetted ID:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>MH-AGRI-OFF-4491</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Active Quarantine:</Text>
                <Text style={[styles.detailValue, { color: '#ea580c', fontWeight: '700' }]}>4.2 km Buffer Enforced</Text>
              </View>
            </View>

            {/* Officer Authority Badges */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text, marginBottom: 10 }]}>
                Statutory Authority & Badges
              </Text>
              <View style={styles.badgeList}>
                <View style={[styles.badgePill, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                  <Text style={styles.badgeEmoji}>🛡️</Text>
                  <Text style={[styles.badgeText, { color: '#b91c1c' }]}>Authorized State Epidemic Officer (DIP Act)</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <Text style={styles.badgeEmoji}>🛰️</Text>
                  <Text style={[styles.badgeText, { color: '#1d4ed8' }]}>Geospatial Early Warning Directorate</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                  <Text style={styles.badgeEmoji}>📢</Text>
                  <Text style={[styles.badgeText, { color: '#15803d' }]}>MahaDBT Emergency Interventions Lead</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'Admin':
        return (
          <View style={styles.professionSection}>
            {/* Sysops Infrastructure */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderEmoji}>⚙️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardHeaderTitle, { color: theme.colors.text }]}>
                    CultivAI System Operations & Security
                  </Text>
                  <Text style={[styles.cardHeaderSub, { color: theme.colors.textMuted }]}>
                    State Agricultural Informatics Center (SAIC)
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: '#f1f5f9' }]}>
                  <Text style={[styles.statusPillText, { color: '#334155' }]}>ROOT</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: '#10b981' }]}>99.98%</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Uptime SLA</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>18.4k</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Users Synced</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.borderLight }]}>
                  <Text style={[styles.statNum, { color: theme.colors.primary }]}>128 ms</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Inference Latency</Text>
                </View>
              </View>

              <View style={[styles.fieldDetailsRow, { borderTopColor: theme.colors.borderLight }]}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Root Identity:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>admin@cultivai.gov.in (Rajesh Verma)</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>Distributed Gateways:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>8 Edge Clusters (Pune, Nashik, Nagpur, Guntur)</Text>
              </View>
              <View style={styles.fieldDetailsRow}>
                <Text style={[styles.detailKey, { color: theme.colors.textMuted }]}>RBAC Roles Active:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>Cultivator (18,400) · Expert (120) · Officer (45)</Text>
              </View>
            </View>

            {/* Admin Badges */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.cardHeaderTitle, { color: theme.colors.text, marginBottom: 10 }]}>
                Governance & Compliance Accreditations
              </Text>
              <View style={styles.badgeList}>
                <View style={[styles.badgePill, { backgroundColor: '#f8fafc', borderColor: '#cbd5e1' }]}>
                  <Text style={styles.badgeEmoji}>🔐</Text>
                  <Text style={[styles.badgeText, { color: '#0f172a' }]}>Level 4 Cryptographic Security Officer</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                  <Text style={styles.badgeEmoji}>📊</Text>
                  <Text style={[styles.badgeText, { color: '#15803d' }]}>ISO 27001 Agricultural Data Auditor</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <Text style={styles.badgeEmoji}>🧠</Text>
                  <Text style={[styles.badgeText, { color: '#1d4ed8' }]}>Fair Model Drift & Safety Auditor</Text>
                </View>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('profile_title')} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveWrapper}>
          
          {/* Main User Card */}
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
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: theme.colors.text }]}>
                  {user?.name || 'User'}
                </Text>
                <View style={[styles.roleTag, { backgroundColor: theme.colors.primaryBg }]}>
                  <Text style={[styles.roleTagText, { color: theme.colors.primaryDark }]}>
                    {role.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.userRole, { color: theme.colors.primary }]}>
                {user?.specialization || user?.jurisdiction || user?.fieldName || 'Registered Professional'}
              </Text>
              <Text style={[styles.userMeta, { color: theme.colors.textMuted }]}>
                {user?.email} · {user?.village || 'Maharashtra Regional Node'}
              </Text>
            </View>
          </View>

          {/* DYNAMIC PROFESSION-SPECIFIC PROFILE DETAILS */}
          {renderProfessionSpecificDetails()}

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
                    <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.activeIndicatorText}>ACTIVE</Text>
                    </View>
                  ) : (
                    <Text style={[styles.switchLink, { color: theme.colors.primary }]}>Switch →</Text>
                  )}
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

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: theme.colors.danger, backgroundColor: theme.colors.dangerBg }]}
            onPress={logout}
          >
            <Text style={[styles.logoutText, { color: theme.colors.danger }]}>{t('btn_logout')}</Text>
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
  responsiveWrapper: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userRole: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  userMeta: {
    fontSize: 11,
    marginTop: 3,
  },
  // Profession Section
  professionSection: {
    gap: 14,
    marginBottom: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  cardHeaderEmoji: {
    fontSize: 24,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardHeaderSub: {
    fontSize: 11,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 14,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  fieldDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  detailKey: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 11.5,
    fontWeight: '700',
    maxWidth: '65%',
    textAlign: 'right',
  },
  sachetInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  sachetScansText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  sachetValidityText: {
    fontSize: 10.5,
    marginTop: 2,
  },
  rechargeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  rechargeBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeList: {
    gap: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  personaTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  personaSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  activeIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  activeIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  switchLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  langButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
