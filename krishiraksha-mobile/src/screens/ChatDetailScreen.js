import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { wsService } from '../services/WebSocketClient';

export const ChatDetailScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user, role } = useAuth();

  const {
    caseId = 'obs_seed_104_1',
    participantName = 'Dr. Meera Nair',
    participantRole = 'Plant Pathologist',
    crop = 'Tomato (Pusa Ruby)',
    disease = 'Early Blight',
  } = route.params || {};

  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      text: 'Dr. Meera Nair, I noticed dark concentric spots spreading on the lower foliage of my Pusa Ruby tomatoes. Should I spray immediately or prune first?',
      sender_id: 'usr_farmer_1',
      sender_name: 'Ramesh Patil',
      sender_role: 'Farmer',
      timestamp: '09:30 AM',
      delivery_status: 'read',
    },
    {
      id: 'msg_2',
      text: 'Namaste Ramesh ji. Do NOT spray heavy chemical fungicides yet. Please prune the bottom 3 affected leaves to halt ground-splash, and ensure canopy ventilation.',
      sender_id: 'usr_expert_1',
      sender_name: 'Dr. Meera Nair',
      sender_role: 'Expert',
      timestamp: '09:35 AM',
      delivery_status: 'delivered',
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket chat for this case
    const disconnect = wsService.connectChat(caseId, (incoming) => {
      if (incoming.type === 'chat_message') {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_ws_${Date.now()}`,
            text: incoming.text,
            sender_id: incoming.sender_id,
            sender_name: incoming.sender_name,
            sender_role: incoming.sender_role,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            delivery_status: 'delivered',
          },
        ]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    });

    return () => disconnect();
  }, [caseId]);

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const textToSend = inputMsg.trim();
    setInputMsg('');

    const newMsg = {
      id: `msg_local_${Date.now()}`,
      text: textToSend,
      sender_id: user?.email || 'usr_farmer_1',
      sender_name: user?.name || 'Ramesh Patil',
      sender_role: role,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      delivery_status: 'sent',
    };

    setMessages((prev) => [...prev, newMsg]);

    // Send via WebSocket
    const sentViaWs = wsService.sendChatMessage(caseId, {
      text: textToSend,
      sender_id: user?.email || 'usr_farmer_1',
      sender_name: user?.name || 'Ramesh Patil',
      sender_role: role,
    });

    // Also persist via HTTP API
    try {
      await api.post('/messages', {
        case_id: caseId,
        field_id: user?.fieldId || '104',
        receiver_id: 'usr_expert_1',
        text: textToSend,
      });
      // Mark as delivered
      setMessages((prev) =>
        prev.map((m) => (m.id === newMsg.id ? { ...m, delivery_status: 'delivered' } : m))
      );
    } catch (e) {
      // Offline fallback: stays marked as sent
    }
  };

  const isMe = (item) => item.sender_role === role || item.sender_name === user?.name;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.colors.primary }]}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.topInfo}>
          <Text style={[styles.participantTitle, { color: theme.colors.text }]}>
            {participantName}
          </Text>
          <Text style={[styles.caseSubtitle, { color: theme.colors.textMuted }]}>
            Case #{String(caseId).substring(0, 10)} · {crop}
          </Text>
        </View>
        <View style={[styles.roleTag, { backgroundColor: theme.colors.primaryBg }]}>
          <Text style={[styles.roleTagText, { color: theme.colors.primaryDark }]}>
            {participantRole}
          </Text>
        </View>
      </View>

      {/* Messages Stream */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const mine = isMe(item);
          return (
            <View
              style={[
                styles.messageBubble,
                mine
                  ? [styles.myBubble, { backgroundColor: theme.colors.primary }]
                  : [styles.theirBubble, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }],
              ]}
            >
              <Text
                style={[
                  styles.senderLabel,
                  { color: mine ? 'rgba(255,255,255,0.85)' : theme.colors.primaryDark },
                ]}
              >
                {item.sender_name} ({item.sender_role})
              </Text>
              <Text
                style={[
                  styles.messageText,
                  { color: mine ? '#ffffff' : theme.colors.text },
                ]}
              >
                {item.text}
              </Text>
              <View style={styles.metaRow}>
                <Text
                  style={[
                    styles.metaTime,
                    { color: mine ? 'rgba(255,255,255,0.7)' : theme.colors.textMuted },
                  ]}
                >
                  {item.timestamp}
                </Text>
                {mine ? (
                  <Text style={styles.deliveryCheck}>
                    {item.delivery_status === 'read' ? '✓✓' : '✓'}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      {/* Input Bar */}
      <View style={[styles.inputBar, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <TextInput
          style={[
            styles.inputField,
            { backgroundColor: theme.colors.borderLight, color: theme.colors.text },
          ]}
          placeholder={t('chat_type_message')}
          placeholderTextColor={theme.colors.textMuted}
          value={inputMsg}
          onChangeText={setInputMsg}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendBtnText}>{t('btn_send')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingRight: 10,
  },
  backText: {
    fontSize: 17,
    fontWeight: '700',
  },
  topInfo: {
    flex: 1,
  },
  participantTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  caseSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  metaTime: {
    fontSize: 10,
  },
  deliveryCheck: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '800',
  },
  inputBar: {
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
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
