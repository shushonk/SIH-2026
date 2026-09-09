import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';

const QUICK_CHIPS = [
  '🌱 फवारणीचे प्रमाण किती? (Dosage?)',
  '💧 सिंचन वेळापत्रक (Irrigation)',
  '🌦️ हवामान अंदाज (Weather)',
  '🛡️ मधमाश्यांसाठी सुरक्षित आहे का? (Bee Safe?)',
];

export const CopilotScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { user, role } = useAuth();
  const scrollViewRef = useRef();

  const { initialPrompt, diseaseContext } = route?.params || {};

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Initial Seeded Conversation matching cultivai_ai_assistant reference
  const [conversation, setConversation] = useState([
    {
      id: 'bot_init_1',
      role: 'assistant',
      time: '10:42 AM',
      marathiText: 'नमस्ते रमेशजी! तुमच्या कापसाच्या पानांवर करपा (Cercospora) आढळला आहे...',
      englishText: 'Hello Ramesh ji! Cercospora leaf spot has been detected on your cotton leaves. Immediate action is recommended to prevent spreading.',
      hasVoiceNote: true,
      audioDuration: '0:24',
    },
    {
      id: 'user_init_1',
      role: 'user',
      time: '10:43 AM',
      text: 'यावर कोणते औषध फवारावे? (Which medicine should I spray for this?)',
    },
    {
      id: 'bot_init_2',
      role: 'assistant',
      time: '10:44 AM',
      isIpmAction: true,
      ipmTitle: 'शिफारस केलेले उपाय (Recommended IPM Action):',
      ipmText: 'Propiconazole 25% EC - २ मिलि प्रति लिटर पाण्यात मिसळून फवारावे किंवा ५% निंबोळी अर्क (NSKE) फवारावे.',
      badges: [
        { label: 'Severity: Moderate', type: 'error' },
        { label: 'Safe for Bees', type: 'info' },
      ],
    },
  ]);

  useEffect(() => {
    if (initialPrompt) {
      handleAsk(initialPrompt);
    }
  }, [initialPrompt]);

  // Simulated Voice Note Playback
  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 10) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const toggleVoiceNote = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      Alert.alert('CultivAI Voice Note', 'Playing spoken audio advisory in Marathi: "नमस्ते रमेशजी! कापसाच्या पानांवर करपा..."');
    }
  };

  const handleAsk = async (textToAsk = null) => {
    const userPrompt = textToAsk || query;
    if (!userPrompt.trim()) return;
    setQuery('');

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

    const userEntry = {
      id: `user_${Date.now()}`,
      role: 'user',
      time: timeStr,
      text: userPrompt,
    };
    setConversation((prev) => [...prev, userEntry]);
    setLoading(true);

    try {
      const res = await api.post('/copilot/chat', {
        query: userPrompt,
        role,
        field_id: user?.fieldId || '104',
        language,
      });

      const assistantEntry = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        time: timeStr,
        englishText: res.data.response,
        marathiText: language === 'mr' ? res.data.response : null,
        citations: res.data.citations || [],
        modelUsed: res.data.model_used || 'gpt-oss:120b-cloud',
      };
      setConversation((prev) => [...prev, assistantEntry]);
    } catch (e) {
      // Offline fallback grounded response
      const fallbackEntry = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        time: timeStr,
        marathiText: 'खेत #104 च्या तपासणीनुसार: ५% NSKE फवारणी सकाळी करा. जास्त ओलसरपणा टाळा.',
        englishText: 'According to Field #104 records: Apply 5% NSKE foliar spray early in the morning. Avoid water logging and prune infected lower leaves.',
        citations: ['Field Passport #104 (Offline Snapshot)'],
        modelUsed: 'Grounded Fallback Engine',
      };
      setConversation((prev) => [...prev, fallbackEntry]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="CultivAI" />
      <OfflineBanner />

      {/* Chat Header Status Bar (Reference Match) */}
      <View style={[styles.headerStatusBar, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
        <View style={styles.assistantProfileRow}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: '#d3ffd5' }]}>
              <Text style={styles.avatarEmoji}>🤖</Text>
            </View>
            <View style={styles.onlineStatusDot} />
          </View>
          <View>
            <Text style={[styles.assistantName, { color: theme.colors.text }]}>
              CultivAI Assistant (कृषी मित्र)
            </Text>
            <View style={styles.languagePillRow}>
              <View style={styles.greenPulseDot} />
              <Text style={[styles.languagePillText, { color: theme.colors.textSecondary }]}>
                Online • Speaks Marathi, Hindi, English
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.speakerBtn, { backgroundColor: theme.colors.card }]}
          onPress={() => Alert.alert('Audio Narration', 'Speech output enabled. Tapping any message will read it aloud.')}
        >
          <Text style={styles.speakerIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Message Stream */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollStream}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {conversation.map((item) => {
          const isUser = item.role === 'user';

          if (isUser) {
            return (
              <View key={item.id} style={styles.userMessageRow}>
                <View style={[styles.userBubble, { backgroundColor: theme.colors.primaryLight || '#15803d' }]}>
                  <Text style={styles.userBubbleText}>{item.text}</Text>
                </View>
                <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}>{item.time}</Text>
              </View>
            );
          }

          // Bot Message with IPM Action
          if (item.isIpmAction) {
            return (
              <View key={item.id} style={styles.botMessageRow}>
                <View style={styles.botAvatarCircle}>
                  <Text style={styles.botAvatarEmoji}>🤖</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={[styles.ipmActionCard, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
                    <Text style={styles.ipmTitle}>{item.ipmTitle}</Text>
                    <Text style={[styles.ipmText, { color: theme.colors.text }]}>{item.ipmText}</Text>

                    <View style={styles.ipmBadgesRow}>
                      {item.badges.map((b, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.ipmBadge,
                            b.type === 'error'
                              ? { backgroundColor: '#ffdad6' }
                              : { backgroundColor: '#dce9ff' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.ipmBadgeText,
                              b.type === 'error' ? { color: '#b20010' } : { color: '#0b1c30' },
                            ]}
                          >
                            {b.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}>{item.time}</Text>
                </View>
              </View>
            );
          }

          // Standard Bot Message with Marathi/English & Voice Note
          return (
            <View key={item.id} style={styles.botMessageRow}>
              <View style={styles.botAvatarCircle}>
                <Text style={styles.botAvatarEmoji}>🤖</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[styles.botBubble, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}>
                  {item.marathiText ? (
                    <Text style={[styles.botMarathiText, { color: theme.colors.text }]}>
                      {item.marathiText}
                    </Text>
                  ) : null}
                  {item.englishText ? (
                    <Text style={[styles.botEnglishText, { color: theme.colors.textSecondary }]}>
                      {item.englishText}
                    </Text>
                  ) : null}

                  {/* Voice Note Waveform Widget (Reference Match) */}
                  {item.hasVoiceNote ? (
                    <View style={[styles.voiceNoteContainer, { backgroundColor: theme.colors.card }]}>
                      <TouchableOpacity
                        style={[styles.voicePlayButton, { backgroundColor: theme.colors.primary }]}
                        onPress={toggleVoiceNote}
                      >
                        <Text style={styles.playIcon}>{isPlayingAudio ? '⏸' : '▶'}</Text>
                      </TouchableOpacity>

                      <View style={styles.waveformBars}>
                        {[12, 22, 14, 28, 18, 12, 24, 16, 8, 8].map((h, i) => (
                          <View
                            key={i}
                            style={[
                              styles.waveformBar,
                              {
                                height: h,
                                backgroundColor:
                                  i <= audioProgress
                                    ? theme.colors.primary
                                    : '#becabc',
                              },
                            ]}
                          />
                        ))}
                      </View>

                      <Text style={[styles.voiceDurationText, { color: theme.colors.textMuted }]}>
                        {item.audioDuration || '0:24'}
                      </Text>
                    </View>
                  ) : null}

                  {/* Citations if any */}
                  {item.citations && item.citations.length > 0 ? (
                    <View style={styles.citationBox}>
                      {item.citations.map((c, i) => (
                        <Text key={i} style={[styles.citationItem, { color: theme.colors.primary }]}>
                          📎 {c}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}>{item.time}</Text>
              </View>
            </View>
          );
        })}

        {loading ? (
          <View style={styles.botMessageRow}>
            <View style={styles.botAvatarCircle}>
              <Text style={styles.botAvatarEmoji}>🤖</Text>
            </View>
            <View style={[styles.botBubble, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff', flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
                Reasoning via gpt-oss:120b-cloud...
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Horizontal Quick Suggestion Chips */}
      <View style={styles.chipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {QUICK_CHIPS.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.quickChip, { backgroundColor: theme.colors.surfaceContainerHigh || '#dce9ff' }]}
              onPress={() => handleAsk(chip)}
            >
              <Text style={[styles.chipText, { color: theme.colors.text }]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sticky Bottom Input Bar (Reference Match) */}
      <View style={[styles.inputBarWrapper, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.inputBarInner, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.cameraInputBtn, { backgroundColor: theme.colors.surfaceContainerLow || '#eff4ff' }]}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.textInputField, { color: theme.colors.text }]}
            placeholder="तुमचा प्रश्न येथे विचारा..."
            placeholderTextColor={theme.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleAsk()}
          />

          <TouchableOpacity
            style={[styles.micInputBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              Alert.alert(
                'Voice Recognition Active',
                'Listening for Marathi / Hindi speech...\n\nSay: "पानांवरील किडीसाठी काय करावे?"',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Insert Voice Query',
                    onPress: () => handleAsk('पानांवरील किडीसाठी काय करावे? (What to do for leaf pests?)'),
                  },
                ]
              );
            }}
          >
            <Text style={styles.micIcon}>🎙️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
  },
  assistantProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#00652c',
    borderWidth: 2,
    borderColor: '#fff',
  },
  assistantName: {
    fontSize: 14,
    fontWeight: '800',
  },
  languagePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00652c',
  },
  languagePillText: {
    fontSize: 11,
  },
  speakerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerIcon: {
    fontSize: 18,
  },
  scrollStream: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  userMessageRow: {
    alignItems: 'flex-end',
    marginLeft: 40,
    gap: 4,
  },
  userBubble: {
    padding: 14,
    borderRadius: 18,
    borderTopRightRadius: 4,
  },
  userBubbleText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  botMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 40,
    gap: 10,
  },
  botAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d3ffd5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  botAvatarEmoji: {
    fontSize: 16,
  },
  botBubble: {
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    gap: 8,
  },
  botMarathiText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  botEnglishText: {
    fontSize: 13,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    paddingHorizontal: 4,
  },
  // Voice note widget
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 10,
    marginTop: 4,
  },
  voicePlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 14,
  },
  waveformBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  voiceDurationText: {
    fontSize: 12,
    fontWeight: '800',
  },
  // IPM Action Card
  ipmActionCard: {
    padding: 14,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#b20010',
    gap: 8,
  },
  ipmTitle: {
    color: '#b20010',
    fontSize: 13,
    fontWeight: '800',
  },
  ipmText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  ipmBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ipmBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ipmBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  citationBox: {
    marginTop: 4,
    gap: 2,
  },
  citationItem: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Quick Chips
  chipsContainer: {
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // Input Bar
  inputBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  inputBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
    gap: 8,
  },
  cameraInputBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 18,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  micInputBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 18,
  },
});
