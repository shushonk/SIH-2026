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
});
