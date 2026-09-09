import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';

const SEED_THREADS = [
  {
    caseId: 'obs_seed_104_1',
    participantName: 'Dr. Meera Nair',
    participantRole: 'Plant Pathologist',
    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
    lastMessage: 'Namaste Ramesh ji. Do NOT spray heavy chemicals yet. Please prune the bottom 3 leaves...',
    timestamp: '2h ago',
    unreadCount: 1,
    crop: 'Tomato (Pusa Ruby)',
    disease: 'Early Blight',
  },
  {
    caseId: 'obs_seed_218',
    participantName: 'Officer Deshmukh',
    participantRole: 'Extension Officer',
    participantAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120',
    lastMessage: 'Field inspection scheduled for your block tomorrow morning at 09:30 AM.',
    timestamp: 'Yesterday',
    unreadCount: 0,
    crop: 'Tomato (Pusa Ruby)',
    disease: 'Septoria Watch',
  },
];

export const ChatThreadsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { role } = useAuth();
  const [threads, setThreads] = useState(SEED_THREADS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter(
    (th) =>
      th.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      th.disease.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('chat_title')} />
      <OfflineBanner />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder={t('chat_search')}
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* CultivAI Assistant 24/7 AI Chatbot Entry */}
      <TouchableOpacity
        style={[
          styles.copilotBanner,
          { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff', borderColor: theme.colors.primaryLight || '#15803d' },
        ]}
        onPress={() => navigation.navigate('Copilot')}
      >
        <View style={styles.copilotAvatar}>
          <Text style={{ fontSize: 24 }}>🤖</Text>
          <View style={styles.copilotOnlineDot} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.copilotTitleRow}>
            <Text style={[styles.copilotTitle, { color: theme.colors.text }]}>
              CultivAI Assistant (कृषी मित्र)
            </Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>24/7 AI</Text>
            </View>
          </View>
          <Text style={[styles.copilotSub, { color: theme.colors.textSecondary }]}>
            Bilingual Voice & Text • Instant Disease & Dosage Advice
          </Text>
        </View>
        <Text style={{ fontSize: 18, color: theme.colors.primary }}>➔</Text>
      </TouchableOpacity>

      {/* Threads List */}
      <FlatList
        data={filteredThreads}
        keyExtractor={(item) => item.caseId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.threadCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
            onPress={() =>
              navigation.navigate('ChatDetail', {
                caseId: item.caseId,
                participantName: item.participantName,
                participantRole: item.participantRole,
                crop: item.crop,
                disease: item.disease,
              })
            }
          >
            <Image source={{ uri: item.participantAvatar }} style={styles.avatar} />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.nameRow}>
                <Text style={[styles.nameText, { color: theme.colors.text }]}>
                  {item.participantName}
                </Text>
                <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
                  {item.timestamp}
                </Text>
              </View>

              <Text style={[styles.roleBadge, { color: theme.colors.primary }]}>
                {item.participantRole} · {item.disease}
              </Text>

              <Text
                style={[
                  styles.lastMsgText,
                  {
                    color: item.unreadCount > 0 ? theme.colors.text : theme.colors.textSecondary,
                    fontWeight: item.unreadCount > 0 ? '700' : '400',
                  },
                ]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {item.unreadCount > 0 ? (
              <View style={[styles.unreadBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  threadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 11,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  lastMsgText: {
    fontSize: 13,
    lineHeight: 17,
  },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  copilotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  copilotAvatar: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#d3ffd5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copilotOnlineDot: {
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
  copilotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copilotTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  aiBadge: {
    backgroundColor: '#00652c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  copilotSub: {
    fontSize: 11,
    marginTop: 2,
  },
});
