import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { StatusChip } from '../components/common/StatusChip';
import { LivePulse } from '../components/common/LivePulse';
import { ActionCard } from '../components/common/ActionCard';

const { width } = Dimensions.get('window');

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
  {
    id: 'feed_4',
    caseId: 'obs_seed_405',
    fieldId: '405',
    farmerName: 'Vilas Shinde',
    village: 'Alandi Basin, Pune',
    crop: 'Potato',
    variety: 'Kufri Jyoti',
    disease: 'Potato Late Blight',
    confidence: 0.86,
    riskScore: 82,
    riskLevel: 'HIGH',
    status: 'followup_scheduled',
    statusText: 'District Extension Officer scheduled on-site inspection for tomorrow morning.',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600',
    timeAgo: '8h ago',
    verified: true,
  },
];

export const FeedScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { role } = useAuth();

  const [feedItems, setFeedItems] = useState(SEEDED_FEED_ITEMS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/observations?limit=10');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge with seed items
        setFeedItems(res.data.concat(SEEDED_FEED_ITEMS));
      }
    } catch (e) {
      // Offline fallback preserves seeded items
    } finally {
      setRefreshing(false);
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
                    ? 'rgba(220, 38, 38, 0.9)'
                    : item.riskLevel === 'LOW'
                    ? 'rgba(22, 163, 74, 0.9)'
                    : 'rgba(217, 119, 6, 0.9)',
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('feed_title')} />
      <OfflineBanner />

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
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

      {/* Feed List */}
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
          role === 'Farmer' ? (
            <View style={{ marginBottom: 12 }}>
              <ActionCard />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
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
    backgroundColor: '#f1f5f9',
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
    color: '#0284c7',
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
    height: 220,
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
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  statusSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
});
