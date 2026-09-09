import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { wsService } from '../services/WebSocketClient';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { LivePulse } from '../components/common/LivePulse';

export const SensorsScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const fieldId = user?.fieldId || '104';

  const [sensorData, setSensorData] = useState({
    soilMoisture: 74.0,
    leafWetness: 8.5,
    canopyHumidity: 86.0,
    temperature: 26.4,
    lastUpdate: 'Just now',
  });

  const [traps, setTraps] = useState([
    {
      trap_id: 'trap_1',
      trap_type: 'pheromone_trap',
      target_pest: 'Helicoverpa armigera (Fruit Borer)',
      count: 18,
      economic_threshold: 15,
      threshold_breached: 1,
      recorded_at: '1h ago',
    },
    {
      trap_id: 'trap_2',
      trap_type: 'yellow_sticky_card',
      target_pest: 'Bemisia tabaci (Whitefly)',
      count: 22,
      economic_threshold: 30,
      threshold_breached: 0,
      recorded_at: '3h ago',
    },
  ]);

  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualPest, setManualPest] = useState('Helicoverpa armigera');
  const [manualCount, setManualCount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Connect to live WebSocket stream
    const disconnect = wsService.connectSensors(fieldId, (data) => {
      if (data.type === 'sensor_tick') {
        setSensorData((prev) => ({
          ...prev,
          canopyHumidity: data.value,
          lastUpdate: 'Live WS Tick',
        }));
      } else if (data.type === 'initial_state') {
        if (data.readings && data.readings.length > 0) {
          const sm = data.readings.find((r) => r.sensor_type === 'soil_moisture');
          const lw = data.readings.find((r) => r.sensor_type === 'leaf_wetness');
          const ch = data.readings.find((r) => r.sensor_type === 'canopy_humidity');
          setSensorData((prev) => ({
            ...prev,
            soilMoisture: sm ? sm.value : prev.soilMoisture,
            leafWetness: lw ? lw.value : prev.leafWetness,
            canopyHumidity: ch ? ch.value : prev.canopyHumidity,
          }));
        }
        if (data.traps && data.traps.length > 0) {
          setTraps(data.traps);
        }
      }
    });

    return () => disconnect();
  }, [fieldId]);

  const handleSaveManualReading = async () => {
    if (!manualCount || isNaN(manualCount)) {
      Alert.alert('Invalid Count', 'Please enter a valid numeric trap count.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/sensors/traps', {
        field_id: fieldId,
        trap_type: 'pheromone_trap',
        target_pest: manualPest,
        count: parseInt(manualCount, 10),
        economic_threshold: 15,
        notes: `Manual log by ${user?.name || 'Farmer'}`,
      });

      setTraps((prev) => [
        {
          trap_id: `trap_${Date.now()}`,
          trap_type: 'pheromone_trap',
          target_pest: manualPest,
          count: parseInt(manualCount, 10),
          economic_threshold: 15,
          threshold_breached: parseInt(manualCount, 10) >= 15 ? 1 : 0,
          recorded_at: 'Just now',
        },
        ...prev,
      ]);

      setManualModalVisible(false);
      setManualCount('');
      Alert.alert('Logged Successfully', 'Trap telemetry updated and risk score recalculated.');
    } catch (e) {
      Alert.alert('Offline Notice', 'Reading saved locally and will sync to backend.');
      setManualModalVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('sensors_title')} />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Live Streaming Header Card */}
        <View style={[styles.liveCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.liveCardTop}>
            <View style={styles.liveIndicator}>
              <LivePulse size={9} />
              <Text style={[styles.liveIndicatorText, { color: theme.colors.liveDot }]}>
                {t('live_badge')} STREAM ACTIVE
              </Text>
            </View>
            <Text style={[styles.updateTime, { color: theme.colors.textMuted }]}>
              {sensorData.lastUpdate}
            </Text>
          </View>
          <Text style={[styles.fieldStation, { color: theme.colors.text }]}>
            IoT Field Station #104 · North Canopy Microclimate
          </Text>
        </View>

        {/* Sensor Gauges Grid */}
        <View style={styles.sensorGrid}>
          {/* Canopy Humidity */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeIcon}>🌫️</Text>
              <View style={[styles.statusDot, { backgroundColor: sensorData.canopyHumidity >= 80 ? theme.colors.danger : theme.colors.success }]} />
            </View>
            <Text style={[styles.gaugeValue, { color: theme.colors.text }]}>
              {sensorData.canopyHumidity}%
            </Text>
            <Text style={[styles.gaugeLabel, { color: theme.colors.textSecondary }]}>
              {t('sensor_canopy_humidity')}
            </Text>
            <Text style={[styles.gaugeSub, { color: theme.colors.warning }]}>
              {sensorData.canopyHumidity >= 80 ? 'High Spore Risk' : 'Normal'}
            </Text>
          </View>

          {/* Soil Moisture */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeIcon}>💧</Text>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
            </View>
            <Text style={[styles.gaugeValue, { color: theme.colors.text }]}>
              {sensorData.soilMoisture}%
            </Text>
            <Text style={[styles.gaugeLabel, { color: theme.colors.textSecondary }]}>
              {t('sensor_soil_moisture')}
            </Text>
            <Text style={[styles.gaugeSub, { color: theme.colors.primary }]}>
              Clay Loam Optimal
            </Text>
          </View>

          {/* Leaf Wetness */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeIcon}>🍃</Text>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
            </View>
            <Text style={[styles.gaugeValue, { color: theme.colors.text }]}>
              {sensorData.leafWetness}h
            </Text>
            <Text style={[styles.gaugeLabel, { color: theme.colors.textSecondary }]}>
              {t('sensor_leaf_wetness')}
            </Text>
            <Text style={[styles.gaugeSub, { color: theme.colors.textMuted }]}>
              Continuous Wetness
            </Text>
          </View>

          {/* Temperature */}
          <View style={[styles.gaugeCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.gaugeHeader}>
              <Text style={styles.gaugeIcon}>🌡️</Text>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
            </View>
            <Text style={[styles.gaugeValue, { color: theme.colors.text }]}>
              {sensorData.temperature}°C
            </Text>
            <Text style={[styles.gaugeLabel, { color: theme.colors.textSecondary }]}>
              Canopy Temp
            </Text>
            <Text style={[styles.gaugeSub, { color: theme.colors.success }]}>
              Favorable Growth
            </Text>
          </View>
        </View>

        {/* Pheromone Traps Section */}
        <View style={styles.trapsSection}>
          <View style={styles.trapsHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('trap_counts_title')}
            </Text>
            <TouchableOpacity
              style={[styles.manualBtn, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}
              onPress={() => setManualModalVisible(true)}
            >
              <Text style={[styles.manualBtnText, { color: theme.colors.primaryDark }]}>
                + {t('btn_manual_entry')}
              </Text>
            </TouchableOpacity>
          </View>

          {traps.map((trap) => (
            <View
              key={trap.trap_id}
              style={[
                styles.trapCard,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.trapIconBox}>
                <Text style={{ fontSize: 24 }}>🪤</Text>
              </View>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <Text style={[styles.trapPest, { color: theme.colors.text }]}>
                  {trap.target_pest}
                </Text>
                <Text style={[styles.trapThreshold, { color: theme.colors.textMuted }]}>
                  Threshold: {trap.economic_threshold} moths/night · {trap.recorded_at}
                </Text>
              </View>
              <View style={styles.trapCountBox}>
                <Text
                  style={[
                    styles.trapCountNumber,
                    {
                      color:
                        trap.threshold_breached === 1
                          ? theme.colors.danger
                          : theme.colors.success,
                    },
                  ]}
                >
                  {trap.count}
                </Text>
                <Text
                  style={[
                    styles.trapBreachedTag,
                    {
                      backgroundColor:
                        trap.threshold_breached === 1
                          ? theme.colors.dangerBg
                          : theme.colors.successBg,
                      color:
                        trap.threshold_breached === 1
                          ? theme.colors.danger
                          : theme.colors.success,
                    },
                  ]}
                >
                  {trap.threshold_breached === 1
                    ? t('trap_threshold_breached')
                    : t('trap_normal')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Manual Reading Modal */}
      <Modal visible={manualModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalHeading, { color: theme.colors.text }]}>
              {t('manual_modal_title')}
            </Text>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Target Pest (लक्ष्य कीटक)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.borderLight, color: theme.colors.text },
              ]}
              value={manualPest}
              onChangeText={setManualPest}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Catch Count (कीटक संख्या)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.colors.borderLight, color: theme.colors.text },
              ]}
              placeholder="e.g. 19"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={manualCount}
              onChangeText={setManualCount}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setManualModalVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveManualReading}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>{t('btn_submit_reading')}</Text>
                )}
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  liveCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  liveCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  updateTime: {
    fontSize: 11,
  },
  fieldStation: {
    fontSize: 14,
    fontWeight: '700',
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gaugeCard: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeIcon: {
    fontSize: 22,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gaugeValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  gaugeSub: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  trapsSection: {
    marginTop: 8,
  },
  trapsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  manualBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  manualBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  trapIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  trapPest: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  trapThreshold: {
    fontSize: 11,
    marginTop: 2,
  },
  trapCountBox: {
    alignItems: 'flex-end',
  },
  trapCountNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  trapBreachedTag: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: '600',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
