import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Share,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { StatusChip } from '../components/common/StatusChip';

const { width, height } = Dimensions.get('window');

const COTTON_HERO_IMAGE = require('../../assets/cotton_crop.jpg');

const SEEDED_FEED_ITEMS = [
  {
    id: 'feed_1',
    caseId: 'obs_seed_104_1',
    fieldId: '104',
    farmerName: 'Ramesh Patil',
    village: 'Khed Tehsil, Pune',
    crop: 'Tomato',
    variety: 'Pusa Ruby',
    disease: 'Early Blight (Alternaria solani)',
    confidence: 0.88,
    riskScore: 94,
    riskLevel: 'HIGH',
    status: 'reviewed',
    statusText: 'Expert Dr. Meera Nair confirmed Early Blight. Bio-fungicide spray prescribed.',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a93?w=600',
    timeAgo: '15m ago',
    verified: true,
  },
  {
    id: 'feed_2',
    caseId: 'obs_seed_218',
    fieldId: '218',
    farmerName: 'Sunita Devi',
    village: 'Manchar Valley, Pune',
    crop: 'Tomato',
    variety: 'Pusa Ruby',
    disease: 'Septoria Leaf Spot',
    confidence: 0.78,
    riskScore: 68,
    riskLevel: 'MEDIUM',
    status: 'under_expert_review',
    statusText: 'Under pathologist evaluation. Proximity warning issued to neighboring plots.',
    imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=600',
    timeAgo: '2h ago',
    verified: false,
  },
  {
    id: 'feed_3',
    caseId: 'obs_seed_077',
    fieldId: '077',
    farmerName: 'Arun Kumar',
    village: 'Junnar Slopes, Pune',
    crop: 'Tomato',
    variety: 'Arka Rakshak',
    disease: 'Healthy Crop Foliage',
    confidence: 0.94,
    riskScore: 22,
    riskLevel: 'LOW',
    status: 'resolved',
    statusText: 'Canopy clean. Scheduled 3-day follow-up completed with positive recovery.',
    imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600',
    timeAgo: '5h ago',
    verified: true,
  },
];

const STORIES_DATA = [
  {
    id: 'st_1',
    title: 'Live Weather',
    marathiTitle: 'थेट हवामान अंदाज',
    icon: '☀️',
    tag: 'AGRO-METEOROLOGY',
    author: 'KVK Weather Cell, Nashik',
    timeAgo: '12m ago',
    gradientBg: '#0f2b1d',
    cardTheme: '#00652c',
    temp: '29°C',
    feel: 'Feels like 32°C',
    condition: 'Partly Cloudy ⛅',
    location: 'Nashik Agro-Climatic Zone 7',
    metrics: [
      { label: 'Humidity', value: '78%', status: 'High', alert: true },
      { label: 'Wind Speed', value: '12 km/h NE', status: 'Safe', alert: false },
      { label: 'Rain Prob.', value: '65% (15mm)', status: 'Tomorrow 6 AM', alert: true },
      { label: 'UV Index', value: '6.2', status: 'Moderate', alert: false },
    ],
    advisoryHeading: '🚜 Field Spray Window Advisory',
    advisoryText: '🟢 OPTIMAL SPRAY WINDOW: Today 06:30 AM – 09:30 AM when wind velocity is under 12 km/h.\n🔴 RAIN WASHOUT RISK: Avoid all chemical foliar applications after 04:00 PM due to incoming rain showers.',
    ctaText: 'Ask Copilot for Custom Spray Time',
    ctaAction: 'copilot_weather',
  },
  {
    id: 'st_2',
    title: 'Cotton Alert',
    marathiTitle: 'कापूस कीड चेतावणी',
    icon: '⚠️',
    tag: 'OUTBREAK LEVEL 4',
    author: 'State Entomological Surveillance',
    timeAgo: '25m ago',
    gradientBg: '#2e0f11',
    cardTheme: '#b20010',
    temp: 'Risk 84/100',
    feel: 'Critical Perimeter Active',
    condition: 'Whitefly & Pink Bollworm Alert 🚨',
    location: 'Nashik, Jalgaon, Aurangabad & Wardha',
    metrics: [
      { label: 'Infestation', value: '84/100', status: 'Severe', alert: true },
      { label: 'Trap Count', value: '14 Moths/Night', status: 'ETL Exceeded', alert: true },
      { label: 'Quarantine', value: '15 km Buffer', status: 'Active', alert: true },
      { label: 'Foliar Damage', value: '18% Canopy', status: 'Spreading', alert: true },
    ],
    advisoryHeading: '🛡️ Emergency Containment Protocol',
    advisoryText: '1. Install 8 yellow sticky traps per acre immediately to disrupt whitefly vectors.\n2. Daily scouting: Check 20 random squares for pink bollworm rosette flowers.\n3. Spray Azadirachtin 10,000 ppm @ 2ml/L water during dawn hours.',
    ctaText: '📲 Share Warning to Village WhatsApp Group',
    ctaAction: 'share_cotton_alert',
  },
  {
    id: 'st_3',
    title: 'Organic IPM',
    marathiTitle: 'सेंद्रिय कीड नियंत्रण',
    icon: '🌿',
    tag: 'VERIFIED BIO-CONTROLS',
    author: 'ICAR Organic Farming Directorate',
    timeAgo: '1h ago',
    gradientBg: '#122b15',
    cardTheme: '#00652c',
    temp: '100% Bio',
    feel: 'Zero Chemical Residue',
    condition: 'Natural Predator Safe 🐝',
    location: 'All Agricultural Zones',
    metrics: [
      { label: 'Cost / Acre', value: '₹120', status: 'Low Cost', alert: false },
      { label: 'Bee Safety', value: '100% Safe', status: 'Pollinator Safe', alert: false },
      { label: 'Efficacy', value: '88% Kill Rate', status: 'Lab Verified', alert: false },
      { label: 'Soil Health', value: 'Enriching', status: 'Non-Toxic', alert: false },
    ],
    advisoryHeading: '🧪 Recommended Bio-Formulations',
    advisoryText: '• 5% NSKE (Neem Seed Kernel Extract): Soak 5kg crushed seeds in 10L water overnight. Dilute to 100L with 100g soap solution.\n• Dashaparni Ark (दशपर्णी अर्क): 10 native leaf extracts fermented with cow urine. Repels chewing pests naturally.\n• Beauveria Bassiana: Fungal biocontrol for whiteflies & thrips.',
    ctaText: '💾 Save Recipes to Offline Field Guide',
    ctaAction: 'save_ipm_recipe',
  },
  {
    id: 'st_4',
    title: 'Traps 🪤',
    marathiTitle: 'स्मार्ट सापळे नेटवर्क',
    icon: '🪤',
    tag: 'IOT SENSOR NETWORK',
    author: 'CultivAI Automated Telemetry Node',
    timeAgo: 'Just now',
    gradientBg: '#291e10',
    cardTheme: '#fe932c',
    temp: 'Node #104',
    feel: 'Battery 94% Solar Charged',
    condition: 'Pheromone Trap Active 📡',
    location: 'Plot 104 • Khed Tehsil',
    metrics: [
      { label: 'Catch Rate', value: '14 Moths', status: 'Exceeds ETL (8)', alert: true },
      { label: 'Lure Life', value: '18 Days Left', status: 'Active Septa', alert: false },
      { label: 'Solar Sensor', value: '100% Online', status: 'Night UV Ready', alert: false },
      { label: 'Signal Strength', value: '-68 dBm', status: 'Excellent', alert: false },
    ],
    advisoryHeading: '⚙️ Trap Maintenance Checklist',
    advisoryText: '• Pheromone Lure: Replace rubber septa every 21 days for maximum diffusion.\n• Catch Basin: Clean captured insects daily to avoid count saturation.\n• Solar Collector: Wipe morning dust off the solar mini-panel for uninterrupted night activation.',
    ctaText: '📊 Open Live Sensors Telemetry Tab',
    ctaAction: 'nav_sensors',
  },
  {
    id: 'st_5',
    title: 'Govt Subsidy',
    marathiTitle: 'शासकीय योजना व अनुदान',
    icon: '🏛️',
    tag: 'MAHADBT & PM-KISAN 2026',
    author: 'Department of Agriculture, GoM',
    timeAgo: '3h ago',
    gradientBg: '#1f2535',
    cardTheme: '#fe932c',
    temp: 'Up to 80%',
    feel: 'Direct Benefit Transfer (DBT)',
    condition: 'Active Subsidies 2026 📋',
    location: 'Maharashtra & Pan-India',
    metrics: [
      { label: 'Solar Trap', value: '50% Grant', status: 'Save ₹1,200', alert: false },
      { label: 'Drip Kit', value: '80% Subsidy', status: 'PMKSY Scheme', alert: false },
      { label: 'Organic PKVY', value: '₹50k / ha', status: '3-Year Support', alert: false },
      { label: 'Kisan Portal', value: 'Open', status: 'Apply Online', alert: false },
    ],
    advisoryHeading: '📝 Eligibility & Required Documents',
    advisoryText: '1. 7/12 Land Record (सातबारा) & 8-A Extract.\n2. Aadhaar-linked active DBT bank account.\n3. Caste certificate (if applying under SC/ST enhanced subsidy quota).\nSubmit online through MahaDBT Farmer Portal or at your nearest CSC Center.',
    ctaText: '🌐 Open MahaDBT Portal Application Link',
    ctaAction: 'open_mahadbt',
  },
];

export const FeedScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role } = useAuth();

  const [feedItems, setFeedItems] = useState(SEEDED_FEED_ITEMS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Interactive Story Viewer State
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);

  // Interactive Poll State
  const [pollVoted, setPollVoted] = useState(null);
  const [pollStats, setPollStats] = useState({ yes: 42, no: 58 });

  // Like & Sachet State
  const [likedAdvisory, setLikedAdvisory] = useState(false);
  const [likeCount, setLikeCount] = useState(1240);
  const [scansRemaining, setScansRemaining] = useState(4);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/observations?limit=10');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setFeedItems(res.data.concat(SEEDED_FEED_ITEMS));
      }
    } catch (e) {
      // Offline fallback preserves seeded items
    } finally {
      setRefreshing(false);
    }
  };

  const handleShareWhatsApp = async () => {
    const message = `🌱 CultivAI #CottonAdvisory:\nवातावरणातील उच्च आर्द्रतेमुळे (High Humidity) पांढरी माशी (Whitefly) प्रादुर्भाव वाढू शकतो.\n\nRecommended: Spray Neem oil (10ml/L) immediately.\nVerified by Dr. Ramesh Shinde (Senior Agronomist, KVK Nashik).`;
    try {
      await Share.share({ message });
    } catch (err) {
      Alert.alert('WhatsApp Share', message);
    }
  };

  const handleVotePoll = (option) => {
    if (pollVoted) return;
    setPollVoted(option);
    if (option === 'yes') {
      setPollStats({ yes: 43, no: 57 });
      Alert.alert('Survey Recorded', 'आपले मत नोंदवले गेले आहे: Yes, observed in lower canopy');
    } else {
      setPollStats({ yes: 41, no: 59 });
      Alert.alert('Survey Recorded', 'आपले मत नोंदवले गेले आहे: No, crop is completely safe');
    }
  };

  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ id: 'daily', name: 'Daily AI Pass', price: 15, scans: 5, tag: 'POPULAR' });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isRecharging, setIsRecharging] = useState(false);

  const toggleLanguage = () => {
    if (language === 'mr') setLanguage('en');
    else if (language === 'en') setLanguage('hi');
    else setLanguage('mr');
  };

  const handleRecharge = () => {
    setRechargeModalVisible(true);
  };

  const handleConfirmPayment = () => {
    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      setScansRemaining((prev) => prev + selectedPlan.scans);
      setRechargeModalVisible(false);
      Alert.alert(
        'Payment Successful! 🎉',
        `₹${selectedPlan.price} paid via ${paymentMethod.toUpperCase()}.\n${selectedPlan.scans} AI crop diagnostic scans added to your account!`
      );
    }, 600);
  };

  const handleStoryAction = (actionType) => {
    if (actionType === 'copilot_weather') {
      setActiveStoryIdx(null);
      navigation.navigate('Copilot', {
        initialPrompt: 'What is the best time for pesticide or foliar spray given today 78% humidity and expected rain tomorrow?',
      });
    } else if (actionType === 'share_cotton_alert') {
      Share.share({
        message: '🚨 CULTIVAI EMERGENCY ALERT: Whitefly & Pink Bollworm Level 4 Outbreak detected in Nashik/Jalgaon. Install yellow sticky traps and spray 5% NSKE immediately!',
      }).catch(() => { });
    } else if (actionType === 'save_ipm_recipe') {
      Alert.alert('Saved to Offline Notebook', 'Organic IPM recipes for 5% NSKE, Dashaparni Ark, and Beauveria Bassiana saved to your offline CultivAI handbook!');
    } else if (actionType === 'nav_sensors') {
      setActiveStoryIdx(null);
      navigation.navigate('Sensors');
    } else if (actionType === 'open_mahadbt') {
      Alert.alert(
        'MahaDBT Portal Link',
        'Official Portal: https://mahadbt.maharashtra.gov.in/Farmer/\n\nDocuments Needed:\n• 7/12 & 8-A Extract\n• Aadhaar Card\n• Bank Passbook\n\nApply before 31st October 2026 for solar light trap & drip subsidies.',
        [{ text: 'OK' }]
      );
    }
  };

  const filteredItems = feedItems.filter((item) => {
    if (activeFilter === 'verified') return item.verified || item.status === 'reviewed';
    if (activeFilter === 'high') return item.riskLevel === 'HIGH' || item.riskScore >= 75;
    return true;
  });

  const renderFeedCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('ScanResult', {
            scanId: item.caseId,
            analysis: {
              top_disease: item.disease,
              top_confidence: item.confidence,
              severity_estimate: item.riskLevel === 'HIGH' ? 'High' : 'Medium',
            },
            sampleItem: { imageUrl: item.imageUrl },
          })
        }
      >
        {/* Card Header: Farmer & Location */}
        <View style={styles.cardHeader}>
          <View style={styles.farmerAvatarCircle}>
            <Text style={styles.farmerAvatarEmoji}>👨‍🌾</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.farmerNameRow}>
              <Text style={[styles.farmerName, { color: theme.colors.text }]}>
                {item.farmerName}
              </Text>
              {item.verified ? (
                <Text style={styles.verifiedCheck} title="Verified by Agronomist">
                  ✓
                </Text>
              ) : null}
            </View>
            <Text style={[styles.villageText, { color: theme.colors.textMuted }]}>
              {item.village} · {item.crop} ({item.variety})
            </Text>
          </View>
          <Text style={[styles.timeAgoText, { color: theme.colors.textMuted }]}>
            {item.timeAgo}
          </Text>
        </View>

        {/* Glanceable Crop Photo */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />

          {/* Floating Risk Pill */}
          <View
            style={[
              styles.riskBadge,
              {
                backgroundColor:
                  item.riskLevel === 'HIGH'
                    ? 'rgba(178, 0, 16, 0.92)'
                    : item.riskLevel === 'LOW'
                      ? 'rgba(0, 101, 44, 0.92)'
                      : 'rgba(254, 147, 44, 0.92)',
              },
            ]}
          >
            <Text style={styles.riskBadgeText}>
              {item.riskScore}/100 {item.riskLevel}
            </Text>
          </View>
        </View>

        {/* Glanceable Details */}
        <View style={styles.cardFooter}>
          <View style={styles.footerTopRow}>
            <Text style={[styles.diseaseName, { color: theme.colors.text }]}>
              {item.disease}
            </Text>
            <StatusChip status={item.status} />
          </View>

          <Text style={[styles.statusSummary, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.statusText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const currentStory = activeStoryIdx !== null ? STORIES_DATA[activeStoryIdx] : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="CultivAI" />
      <OfflineBanner />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Top Secondary Bar: Language Toggle, Online Status, Notification Bell */}
            <View style={[styles.topSecondaryBar, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
              <View style={styles.barLeftGroup}>
                <TouchableOpacity style={styles.langPill} onPress={toggleLanguage}>
                  <Text style={styles.langIcon}>🌐</Text>
                  <Text style={styles.langText}>
                    {language === 'mr' ? 'मराठी ▼' : language === 'hi' ? 'हिंदी ▼' : 'English ▼'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bellButton}
                onPress={() => Alert.alert('CultivAI Notifications', '3 advisory alerts for your region: High humidity warning active.')}
              >
                <Text style={styles.bellIcon}>🔔</Text>
                <View style={styles.bellBadge} />
              </TouchableOpacity>
            </View>

            {/* Horizontal Story Carousel (NOW FULLY INTERACTIVE & CLICKABLE) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storyScroll}
            >
              {STORIES_DATA.map((st, idx) => (
                <TouchableOpacity
                  key={st.id}
                  style={styles.storyItem}
                  onPress={() => setActiveStoryIdx(idx)}
                >
                  <View
                    style={[
                      styles.storyRing,
                      { borderColor: st.id === 'st_2' ? '#b20010' : '#fe932c' },
                      st.id === 'st_2' && styles.alertStoryRing,
                    ]}
                  >
                    <View style={styles.storyInner}>
                      <Text style={styles.storyEmoji}>{st.icon}</Text>
                    </View>
                  </View>
                  <Text style={[styles.storyLabel, { color: theme.colors.text }]} numberOfLines={1}>
                    {language === 'mr' ? st.marathiTitle : st.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Micro-Sachet Status Widget (Reference Match) */}
            <View style={[styles.sachetWidget, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
              <View style={styles.sachetLeft}>
                <View style={[styles.sachetBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.sachetPrice}>₹15</Text>
                </View>
                <View>
                  <Text style={[styles.sachetTitle, { color: theme.colors.text }]}>
                    Micro-Sachet Status Active
                  </Text>
                  <View style={styles.sachetSubRow}>
                    <Text style={styles.boltIcon}>⚡</Text>
                    <Text style={[styles.sachetSubtitle, { color: theme.colors.textSecondary }]}>
                      {scansRemaining} AI Scans Remaining Today
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.rechargeBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleRecharge}
              >
                <Text style={styles.rechargeBtnText}>Recharge</Text>
                <Text style={styles.rechargeBtnPlus}>＋</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Reference Reel / Post Card: Dr. Ramesh Shinde */}
            <View style={[styles.heroPostCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {/* Author Header */}
              <View style={styles.authorHeader}>
                <View style={styles.authorInfoRow}>
                  <View style={styles.authorAvatar}>
                    <Text style={{ fontSize: 20 }}>👨‍🔬</Text>
                    <View style={styles.authorOnlineDot} />
                  </View>
                  <View>
                    <View style={styles.authorNameRow}>
                      <Text style={[styles.authorName, { color: theme.colors.text }]}>
                        Dr. Ramesh Shinde
                      </Text>
                      <Text style={styles.verifiedIcon}>✓</Text>
                    </View>
                    <Text style={[styles.authorSub, { color: theme.colors.textMuted }]}>
                      Nashik, Maharashtra • KVK Senior Agronomist
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('KVK Profile', 'Dr. Ramesh Shinde - Senior Agronomist at Krishi Vigyan Kendra Nashik.')}>
                  <Text style={[styles.moreDots, { color: theme.colors.textMuted }]}>•••</Text>
                </TouchableOpacity>
              </View>

              {/* Media Canvas with Floating Pills */}
              <View style={styles.heroMediaContainer}>
                <Image
                  source={COTTON_HERO_IMAGE}
                  style={styles.heroImage}
                  resizeMode="cover"
                />

                {/* Floating Grade A Badge */}
                <View style={styles.floatingGradeBadge}>
                  <Text style={styles.gradeBadgeIcon}>🌿</Text>
                  <Text style={styles.gradeBadgeText}>High Yield Grade A</Text>
                </View>

                {/* Floating Whitefly Alert Badge */}
                <View style={styles.floatingWhiteflyBadge}>
                  <Text style={styles.whiteflyIcon}>⚠️</Text>
                  <Text style={styles.whiteflyText}>Whitefly Alert</Text>
                </View>
              </View>

              {/* Engagement Bar & WhatsApp Share */}
              <View style={styles.engagementBar}>
                <View style={styles.engagementLeft}>
                  <TouchableOpacity
                    style={styles.actionCountBtn}
                    onPress={() => {
                      setLikedAdvisory(!likedAdvisory);
                      setLikeCount((c) => (likedAdvisory ? c - 1 : c + 1));
                    }}
                  >
                    <Text style={styles.actionEmoji}>{likedAdvisory ? '❤️' : '🤍'}</Text>
                    <Text style={[styles.actionCountText, { color: theme.colors.text }]}>
                      {(likeCount / 1000).toFixed(1)}k
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionCountBtn}
                    onPress={() => Alert.alert('Comments', '84 comments from local farmers and KVK extension specialists.')}
                  >
                    <Text style={styles.actionEmoji}>💬</Text>
                    <Text style={[styles.actionCountText, { color: theme.colors.text }]}>84</Text>
                  </TouchableOpacity>
                </View>

                {/* WhatsApp Share Button */}
                <TouchableOpacity style={styles.waShareBtn} onPress={handleShareWhatsApp}>
                  <Text style={styles.waShareIcon}>📲</Text>
                  <Text style={styles.waShareText}>WhatsApp Share</Text>
                </TouchableOpacity>
              </View>

              {/* Bilingual Advisory Caption */}
              <View style={styles.captionContainer}>
                <Text style={[styles.captionMarathi, { color: theme.colors.text }]}>
                  <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>#CottonAdvisory </Text>
                  वातावरणातील उच्च आर्द्रतेमुळे (High Humidity) पांढरी माशी (Whitefly) प्रादुर्भाव वाढू शकतो. कपाशीच्या पानांच्या खालील बाजूस तपासा.
                </Text>
                <Text style={[styles.captionEnglish, { color: theme.colors.textSecondary }]}>
                  Due to high humidity and cloudy weather this week, monitor your cotton fields closely for whitefly outbreaks. Spray Neem oil (10ml/L) immediately if early nymphs are spotted.
                </Text>

                <View style={styles.commentSummaryRow}>
                  <Text style={[styles.commentSummaryText, { color: theme.colors.textMuted }]}>
                    View all 84 farmer comments & expert replies
                  </Text>
                  <Text style={[styles.commentSummaryText, { color: theme.colors.textMuted }]}>
                    2 hours ago
                  </Text>
                </View>
              </View>
            </View>

            {/* Interactive Community Pest Survey Card */}
            <View style={[styles.surveyCard, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
              <View style={styles.surveyHeader}>
                <View style={styles.surveyTitleRow}>
                  <Text style={styles.surveyIcon}>📊</Text>
                  <Text style={[styles.surveyTitle, { color: theme.colors.text }]}>
                    Community Pest Survey
                  </Text>
                </View>
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              </View>

              <Text style={[styles.surveyQuestion, { color: theme.colors.text }]}>
                Have you noticed pink bollworm activity in your region this season?
              </Text>

              <View style={styles.pollOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.pollOptionBtn,
                    { backgroundColor: theme.colors.card },
                    pollVoted === 'yes' && { borderColor: theme.colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => handleVotePoll('yes')}
                >
                  <Text style={[styles.pollOptionText, { color: theme.colors.text }]}>
                    Yes, observed in lower canopy
                  </Text>
                  <Text style={[styles.pollPercentage, { color: theme.colors.textSecondary }]}>
                    {pollStats.yes}%
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pollOptionBtn,
                    { backgroundColor: theme.colors.card },
                    pollVoted === 'no' && { borderColor: theme.colors.primary, borderWidth: 2 },
                  ]}
                  onPress={() => handleVotePoll('no')}
                >
                  <Text style={[styles.pollOptionText, { color: theme.colors.text }]}>
                    No, crop is completely safe
                  </Text>
                  <Text style={[styles.pollPercentage, { color: theme.colors.textSecondary }]}>
                    {pollStats.no}%
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Tabs for Farmer Community Scans */}
            <View style={[styles.filterBar, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.recentScansHeader, { color: theme.colors.text }]}>
                Field Diagnostics Feed
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    activeFilter === 'all' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setActiveFilter('all')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: activeFilter === 'all' ? '#fff' : theme.colors.textSecondary },
                    ]}
                  >
                    {t('feed_filter_all')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    activeFilter === 'verified' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setActiveFilter('verified')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: activeFilter === 'verified' ? '#fff' : theme.colors.textSecondary },
                    ]}
                  >
                    ✓ {t('feed_filter_verified')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    activeFilter === 'high' && { backgroundColor: theme.colors.danger },
                  ]}
                  onPress={() => setActiveFilter('high')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: activeFilter === 'high' ? '#fff' : theme.colors.textSecondary },
                    ]}
                  >
                    ⚠️ {t('feed_risk_high')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        }
      />

      {/* FULLSCREEN INTERACTIVE STORY VIEWER MODAL */}
      <Modal
        visible={activeStoryIdx !== null}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setActiveStoryIdx(null)}
      >
        {currentStory ? (
          <View style={[styles.storyModalContainer, { backgroundColor: currentStory.gradientBg }]}>
            {/* Top Story Progress Bars */}
            <View style={styles.storyProgressRow}>
              {STORIES_DATA.map((_, i) => (
                <View key={i} style={styles.progressBarWrapper}>
                  <View
                    style={[
                      styles.progressBarActive,
                      {
                        width: i < activeStoryIdx ? '100%' : i === activeStoryIdx ? '100%' : '0%',
                        backgroundColor: i <= activeStoryIdx ? '#fff' : 'rgba(255,255,255,0.3)',
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Story Header (Author, Badge, Close Button) */}
            <View style={styles.storyModalHeader}>
              <View style={styles.storyHeaderLeft}>
                <View style={styles.storyModalIconCircle}>
                  <Text style={{ fontSize: 20 }}>{currentStory.icon}</Text>
                </View>
                <View>
                  <View style={styles.storyTitleRow}>
                    <Text style={styles.storyModalTitle}>{currentStory.title}</Text>
                    <View style={[styles.storyTagBadge, { backgroundColor: currentStory.cardTheme }]}>
                      <Text style={styles.storyTagText}>{currentStory.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.storyModalAuthor}>
                    {currentStory.author} • {currentStory.timeAgo}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.storyCloseBtn}
                onPress={() => setActiveStoryIdx(null)}
              >
                <Text style={styles.storyCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Story Scrollable Interactive Content Canvas */}
            <ScrollView style={styles.storyBodyScroll} contentContainerStyle={styles.storyBodyContent}>
              {/* Main Headline Metric Box */}
              <View style={styles.storyHeadlineCard}>
                <Text style={styles.storyHeroTemp}>{currentStory.temp}</Text>
                <Text style={styles.storyHeroCondition}>{currentStory.condition}</Text>
                <Text style={styles.storyHeroLocation}>📍 {currentStory.location}</Text>
                <Text style={styles.storyHeroFeel}>{currentStory.feel}</Text>
              </View>

              {/* 4 Telemetry Metrics Grid */}
              <View style={styles.storyMetricsGrid}>
                {currentStory.metrics.map((m, idx) => (
                  <View key={idx} style={styles.storyMetricTile}>
                    <Text style={styles.storyMetricLabel}>{m.label}</Text>
                    <Text
                      style={[
                        styles.storyMetricValue,
                        m.alert && { color: '#ff8a80' },
                      ]}
                    >
                      {m.value}
                    </Text>
                    <Text style={styles.storyMetricStatus}>{m.status}</Text>
                  </View>
                ))}
              </View>

              {/* Detailed Actionable Advisory Box */}
              <View style={styles.storyAdvisoryBox}>
                <Text style={styles.storyAdvisoryHeading}>{currentStory.advisoryHeading}</Text>
                <Text style={styles.storyAdvisoryBody}>{currentStory.advisoryText}</Text>
              </View>

              {/* Primary Interactive CTA Button */}
              <TouchableOpacity
                style={[styles.storyCtaButton, { backgroundColor: currentStory.cardTheme }]}
                onPress={() => handleStoryAction(currentStory.ctaAction)}
              >
                <Text style={styles.storyCtaText}>{currentStory.ctaText}</Text>
              </TouchableOpacity>

              {/* Navigation Controls */}
              <View style={styles.storyNavRow}>
                <TouchableOpacity
                  style={[styles.storyNavPill, activeStoryIdx === 0 && { opacity: 0.3 }]}
                  disabled={activeStoryIdx === 0}
                  onPress={() => setActiveStoryIdx(Math.max(0, activeStoryIdx - 1))}
                >
                  <Text style={styles.storyNavPillText}>◀ Previous Story</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.storyNavPill, activeStoryIdx === STORIES_DATA.length - 1 && { opacity: 0.3 }]}
                  disabled={activeStoryIdx === STORIES_DATA.length - 1}
                  onPress={() => setActiveStoryIdx(Math.min(STORIES_DATA.length - 1, activeStoryIdx + 1))}
                >
                  <Text style={styles.storyNavPillText}>Next Story ▶</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : null}
      </Modal>

      {/* Interactive Micro-Sachet Recharge Modal */}
      <Modal
        visible={rechargeModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRechargeModalVisible(false)}
      >
        <View style={styles.rechargeModalBackdrop}>
          <View style={[styles.rechargeModalSheet, { backgroundColor: theme.colors.card }]}>
            {/* Modal Header */}
            <View style={styles.rechargeModalHeader}>
              <View>
                <Text style={[styles.rechargeModalTitle, { color: theme.colors.text }]}>
                  Recharge Micro-Sachet
                </Text>
                <Text style={[styles.rechargeModalSubtitle, { color: theme.colors.textMuted }]}>
                  Affordable bite-sized AI crop diagnosis
                </Text>
              </View>
              <TouchableOpacity
                style={styles.rechargeCloseBtn}
                onPress={() => setRechargeModalVisible(false)}
              >
                <Text style={styles.rechargeCloseBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Plans List */}
            <Text style={[styles.rechargeSectionTitle, { color: theme.colors.textMuted }]}>
              SELECT DIAGNOSTIC PACK
            </Text>
            <View style={styles.plansContainer}>
              {[
                { id: 'daily', name: 'Daily AI Pass', price: 15, scans: 5, tag: 'POPULAR' },
                { id: 'weekly', name: 'Weekly Crop Protector', price: 49, scans: 25, tag: 'VALUE' },
                { id: 'season', name: 'Full Season Shield', price: 149, scans: 100, tag: 'BEST' },
              ].map((p) => {
                const isSelected = selectedPlan.id === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: isSelected ? theme.colors.primaryBg : theme.colors.borderLight,
                        borderColor: isSelected ? theme.colors.primary : 'transparent',
                      },
                    ]}
                    onPress={() => setSelectedPlan(p)}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.planName, { color: theme.colors.text }]}>{p.name}</Text>
                        <View style={[styles.planTag, { backgroundColor: theme.colors.primary }]}>
                          <Text style={styles.planTagText}>{p.tag}</Text>
                        </View>
                      </View>
                      <Text style={[styles.planScans, { color: theme.colors.textSecondary }]}>
                        {p.scans} Multi-Spectral AI Disease Scans
                      </Text>
                    </View>
                    <Text style={[styles.planPrice, { color: theme.colors.primary }]}>
                      ₹{p.price}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Payment Method Selector */}
            <Text style={[styles.rechargeSectionTitle, { color: theme.colors.textMuted }]}>
              PAYMENT METHOD
            </Text>
            <View style={styles.paymentMethodsRow}>
              {[
                { id: 'upi', label: 'UPI / GPay / PhonePe', icon: '📱' },
                { id: 'card', label: 'RuPay / Debit', icon: '💳' },
                { id: 'mahadbt', label: 'MahaDBT Wallet', icon: '🏛️' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.paymentMethodPill,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.borderLight,
                      },
                    ]}
                    onPress={() => setPaymentMethod(m.id)}
                  >
                    <Text style={{ fontSize: 13 }}>{m.icon}</Text>
                    <Text
                      style={[
                        styles.paymentMethodText,
                        { color: isSelected ? '#fff' : theme.colors.text },
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm Pay Button */}
            <TouchableOpacity
              style={[
                styles.confirmPayBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleConfirmPayment}
              disabled={isRecharging}
            >
              <Text style={styles.confirmPayBtnText}>
                {isRecharging ? 'Processing Payment...' : `Pay ₹${selectedPlan.price} & Activate Instantly →`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  // Top Secondary Bar
  topSecondaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 14,
  },
  barLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  langIcon: {
    fontSize: 12,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b1c30',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3ffd5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00652c',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00652c',
  },
  bellButton: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  bellBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#b20010',
  },
  // Story Carousel
  storyScroll: {
    paddingBottom: 14,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  alertStoryRing: {
    borderColor: '#b20010',
  },
  storyInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyEmoji: {
    fontSize: 24,
  },
  storyLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Sachet Widget
  sachetWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  sachetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sachetBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sachetPrice: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  sachetTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sachetSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  boltIcon: {
    fontSize: 12,
  },
  sachetSubtitle: {
    fontSize: 12,
  },
  rechargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  rechargeBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  rechargeBtnPlus: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  // Hero Post Card
  heroPostCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  authorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d3ffd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00652c',
    borderWidth: 2,
    borderColor: '#fff',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
  },
  verifiedIcon: {
    color: '#00652c',
    fontWeight: '900',
    fontSize: 13,
  },
  authorSub: {
    fontSize: 11,
    marginTop: 1,
  },
  moreDots: {
    fontSize: 16,
    letterSpacing: 2,
    paddingHorizontal: 8,
  },
  heroMediaContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingGradeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  gradeBadgeIcon: {
    fontSize: 12,
  },
  gradeBadgeText: {
    color: '#00652c',
    fontWeight: '800',
    fontSize: 11,
  },
  floatingWhiteflyBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(178, 0, 16, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  whiteflyIcon: {
    fontSize: 12,
  },
  whiteflyText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
  },
  engagementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionCountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  waShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  waShareIcon: {
    fontSize: 14,
  },
  waShareText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 6,
  },
  captionMarathi: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  captionEnglish: {
    fontSize: 12,
    lineHeight: 17,
  },
  commentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eff4ff',
  },
  commentSummaryText: {
    fontSize: 11,
  },
  // Survey Card
  surveyCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 18,
    gap: 10,
  },
  surveyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  surveyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  surveyIcon: {
    fontSize: 16,
  },
  surveyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  activePill: {
    backgroundColor: '#dce9ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00652c',
  },
  surveyQuestion: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  pollOptionsContainer: {
    gap: 8,
  },
  pollOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  pollOptionText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  pollPercentage: {
    fontSize: 12,
    fontWeight: '800',
  },
  // Filter Bar
  filterBar: {
    marginBottom: 12,
  },
  recentScansHeader: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  filterScroll: {
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Observation Cards
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  farmerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  farmerAvatarEmoji: {
    fontSize: 18,
  },
  farmerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedCheck: {
    color: '#00652c',
    fontWeight: '900',
    fontSize: 12,
    marginLeft: 6,
  },
  villageText: {
    fontSize: 11,
    marginTop: 1,
  },
  timeAgoText: {
    fontSize: 11,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  riskBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    padding: 14,
  },
  footerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  diseaseName: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  statusSummary: {
    fontSize: 12,
    lineHeight: 17,
  },
  // FULLSCREEN STORY VIEWER MODAL STYLES
  storyModalContainer: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  storyProgressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    marginTop: 8,
  },
  progressBarWrapper: {
    flex: 1,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    borderRadius: 2,
  },
  storyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  storyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyModalIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyModalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  storyTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  storyTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  storyModalAuthor: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  storyCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  storyBodyScroll: {
    flex: 1,
  },
  storyBodyContent: {
    gap: 16,
    paddingBottom: 20,
  },
  storyHeadlineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 4,
  },
  storyHeroTemp: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '900',
  },
  storyHeroCondition: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  storyHeroLocation: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    marginTop: 2,
  },
  storyHeroFeel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  storyMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  storyMetricTile: {
    width: (width - 42) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  storyMetricLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  storyMetricValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  storyMetricStatus: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
  },
  storyAdvisoryBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#fe932c',
    gap: 8,
  },
  storyAdvisoryHeading: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  storyAdvisoryBody: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  storyCtaButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  storyCtaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  storyNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  storyNavPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  storyNavPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  // RECHARGE MODAL STYLES
  rechargeModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  rechargeModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  rechargeModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rechargeModalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  rechargeModalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rechargeCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rechargeCloseBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  rechargeSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  plansContainer: {
    gap: 10,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  planName: {
    fontSize: 14,
    fontWeight: '800',
  },
  planTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  planScans: {
    fontSize: 11.5,
    marginTop: 3,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '900',
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5,
  },
  paymentMethodText: {
    fontSize: 11,
    fontWeight: '700',
  },
  confirmPayBtn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#00652c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmPayBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
