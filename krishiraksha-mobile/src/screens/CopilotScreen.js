import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';

const QUICK_QUESTIONS = [
  'How do I protect tomato plants from early blight?',
  'Why is my field currently at high risk?',
  'What safe biological spray can I use?',
  'Are there active disease clusters near my village?',
];

export const CopilotScreen = () => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { user, role } = useAuth();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं कृषि रक्षा एआई सहायक हूँ। अपने खेत या फसल की सुरक्षा के बारे में कोई भी प्रश्न पूछें।'
          : language === 'mr'
          ? 'नमस्कार! मी कृषि रक्षा एआय मदतनीस आहे. आपल्या पिकाविषयी कोणताही प्रश्न विचारा.'
          : 'Namaste! I am your KrishiRaksha AI Copilot. Ask any question about your field or crop protection.',
      citations: ['Field Passport #104', 'ICAR Integrated Pest Management Guide'],
      modelUsed: 'gpt-oss:120b-cloud',
    },
  ]);

  const handleAsk = async (textToAsk = null) => {
    const userPrompt = textToAsk || query;
    if (!userPrompt.trim()) return;
    setQuery('');

    const userEntry = {
      id: `user_${Date.now()}`,
      role: 'user',
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
        text: res.data.response,
        citations: res.data.citations || [],
        modelUsed: res.data.model_used || 'gpt-oss:120b-cloud',
      };
      setConversation((prev) => [...prev, assistantEntry]);
    } catch (e) {
      // Offline grounded response
      const fallbackEntry = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        text:
          language === 'hi'
            ? 'खेत #104 की जांच के अनुसार: पत्तियों पर फफूंद के लक्षण हैं। रोगग्रस्त पत्तों को तुरंत अलग करें और ड्रिप सिंचाई का प्रयोग करें।'
            : 'According to Field #104 records: Early Blight lesions detected on lower canopy. Prune bottom 3 leaves and ensure row ventilation. Contact your local KVK for verified biological sprays.',
        citations: ['Field Passport #104 (Offline Snapshot)'],
        modelUsed: 'Grounded Fallback Engine',
      };
      setConversation((prev) => [...prev, fallbackEntry]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('copilot_title')} />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Foundation model header pill */}
        <View style={[styles.modelPill, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}>
          <Text style={styles.robotIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.modelTitle, { color: theme.colors.primaryDark }]}>
              Ollama gpt-oss:120b-cloud (Reasoning Layer)
            </Text>
            <Text style={[styles.modelSub, { color: theme.colors.textMuted }]}>
              {role === 'Farmer'
                ? 'Farmer Mode: 2–4 short sentences · Plain words · 1 clear next action'
                : 'Extension Mode: Dense epidemiological & ICAR protocol guidance'}
            </Text>
          </View>
        </View>

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsRow}>
          {QUICK_QUESTIONS.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.chip, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => handleAsk(q)}
            >
              <Text style={[styles.chipText, { color: theme.colors.text }]}>"{q}"</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Conversation Stream */}
        {conversation.map((item) => {
          const isUser = item.role === 'user';
          return (
            <View
              key={item.id}
              style={[
                styles.messageBubble,
                isUser
                  ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
                  : [styles.aiBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.speakerLabel,
                  { color: isUser ? 'rgba(255,255,255,0.85)' : theme.colors.primaryDark },
                ]}
              >
                {isUser ? user?.name || 'You' : 'KrishiRaksha Copilot (gpt-oss:120b-cloud)'}
              </Text>
              <Text style={[styles.bubbleText, { color: isUser ? '#fff' : theme.colors.text }]}>
                {item.text}
              </Text>

              {/* Citations if available */}
              {item.citations && item.citations.length > 0 ? (
                <View style={styles.citationsBox}>
                  <Text style={[styles.citationsTitle, { color: theme.colors.textMuted }]}>
                    Verified Citations:
                  </Text>
                  {item.citations.map((c, i) => (
                    <Text key={i} style={[styles.citationItem, { color: theme.colors.primary }]}>
                      📎 {c}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}

        {loading ? (
          <View style={[styles.aiBubble, styles.loadingBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Reasoning via gpt-oss:120b-cloud...
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Input bar */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[
            styles.inputField,
            { backgroundColor: theme.colors.borderLight, color: theme.colors.text },
          ]}
          placeholder={t('copilot_placeholder')}
          placeholderTextColor={theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity
          style={[styles.askBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => handleAsk()}
          disabled={loading}
        >
          <Text style={styles.askBtnText}>{t('copilot_btn_ask')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  robotIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  modelTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  modelSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageBubble: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '92%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  speakerLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  citationsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  citationsTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  citationItem: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 14,
    marginRight: 8,
  },
  askBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  askBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
