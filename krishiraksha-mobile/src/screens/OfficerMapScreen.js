import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { StatusChip } from '../components/common/StatusChip';

const { width } = Dimensions.get('window');

const NATIONWIDE_CLUSTERS = [
  {
    cluster_id: 'cluster_pune_blight',
    state: 'Maharashtra',
    district: 'Pune-Khed',
    name: 'Pune-Khed Solanaceae Early Blight Cluster',
    disease: 'Early Blight',
    lat: 18.522,
    lon: 73.858,
    radius_km: 4.2,
    cases: 5,
    spread_velocity: '0.35 km/day',
    riskTier: 'Tier 2 Escalation',
    color: '#d97706',
    xPct: 38,
    yPct: 62,
  },
  {
    cluster_id: 'cluster_kolar_tomato',
    state: 'Karnataka',
    district: 'Kolar-Chintamani',
    name: 'Kolar-Chintamani Tomato Blight Hotspot',
    disease: 'Tomato Leaf Curl & Blight',
    lat: 13.1367,
    lon: 78.1291,
    radius_km: 8.5,
    cases: 14,
    spread_velocity: '0.55 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#dc2626',
    xPct: 45,
    yPct: 78,
  },
  {
    cluster_id: 'cluster_jalandhar_potato',
    state: 'Punjab',
    district: 'Jalandhar Doaba',
    name: 'Jalandhar Doaba Potato Late Blight Belt',
    disease: 'Potato Late Blight',
    lat: 31.326,
    lon: 75.5762,
    radius_km: 12.0,
    cases: 22,
    spread_velocity: '0.80 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#dc2626',
    xPct: 35,
    yPct: 24,
  },
  {
    cluster_id: 'cluster_guntur_chili',
    state: 'Andhra Pradesh',
    district: 'Guntur-Tenali',
    name: 'Guntur-Tenali Chili Anthracnose Belt',
    disease: 'Chili Anthracnose & Thrips',
    lat: 16.3067,
    lon: 80.4365,
    radius_km: 6.8,
    cases: 18,
    spread_velocity: '0.42 km/day',
    riskTier: 'Tier 2 Escalation',
    color: '#d97706',
    xPct: 53,
    yPct: 68,
  },
  {
    cluster_id: 'cluster_anand_tobacco',
    state: 'Gujarat',
    district: 'Anand-Kheda',
    name: 'Anand-Kheda Solanaceous Damping-off',
    disease: 'Solanaceous Blight',
    lat: 22.5645,
    lon: 72.9289,
    radius_km: 5.5,
    cases: 8,
    spread_velocity: '0.28 km/day',
    riskTier: 'Tier 3 Monitored',
    color: '#0284c7',
    xPct: 28,
    yPct: 52,
  },
  {
    cluster_id: 'cluster_hooghly_potato',
    state: 'West Bengal',
    district: 'Hooghly-Arambagh',
    name: 'Hooghly-Arambagh Potato Blight Surge',
    disease: 'Potato Late Blight',
    lat: 22.8895,
    lon: 87.7844,
    radius_km: 9.2,
    cases: 16,
    spread_velocity: '0.65 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#dc2626',
    xPct: 76,
    yPct: 50,
  },
];

export const OfficerMapScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [clusters, setClusters] = useState(NATIONWIDE_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState(NATIONWIDE_CLUSTERS[0]);

  useEffect(() => {
    fetchLiveClusters();
  }, []);

  const fetchLiveClusters = async () => {
    try {
      const res = await api.get('/officer/clusters');
      if (res.data && Array.isArray(res.data) && res.data.length >= 5) {
        // Enrich coordinates
      }
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title={t('map_title')} />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Reference Image 1 Command Header */}
        <View style={styles.commandHeaderBar}>
          <View>
            <Text style={styles.commandHeaderRegion}>Maharashtra & All-India</Text>
            <Text style={styles.commandHeaderSub}>Epidemiological GIS Outbreak Command</Text>
          </View>
          <View style={styles.outbreakCountBadge}>
            <Text style={styles.outbreakCountNumber}>139</Text>
            <Text style={styles.outbreakCountLabel}>Active Outbreaks</Text>
          </View>
        </View>

        {/* Reference Image 1: Top Dashboard Analytics Gauges */}
        <View style={styles.dashboardGaugesRow}>
          {/* Gauge 1: Priority Risk Speedometer */}
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeTitle}>Priority Risk Index</Text>
            <View style={styles.speedometerContainer}>
              <View style={styles.speedometerArc}>
                <View style={styles.needlePointer} />
              </View>
              <Text style={styles.gaugeScore}>84<Text style={styles.gaugeMax}>/100</Text></Text>
              <Text style={styles.gaugeStatusAlert}>HIGH EPIDEMIC RISK</Text>
            </View>
          </View>

          {/* Gauge 2: District Containment Ring */}
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeTitle}>District Containment</Text>
            <View style={styles.circularGaugeContainer}>
              <View style={styles.circularGaugeRing}>
                <Text style={styles.circularPercent}>71%</Text>
                <Text style={styles.circularSub}>Under Triage</Text>
              </View>
            </View>
            <Text style={styles.gaugeSubtext}>6 States Monitored</Text>
          </View>
        </View>

        {/* Interactive India Map Canvas */}
        <View style={[styles.mapCanvas, { backgroundColor: '#020617', borderColor: '#1e293b' }]}>
          {/* Schematic India Map Outline Backdrop with Chloropleth Zones */}
          <View style={styles.indiaSilhouette}>
            {/* Heatmap intensity zones */}
            <View style={[styles.heatZone, { top: '20%', left: '30%', backgroundColor: 'rgba(239, 68, 68, 0.25)', width: 80, height: 60 }]} />
            <View style={[styles.heatZone, { top: '50%', left: '32%', backgroundColor: 'rgba(245, 158, 11, 0.25)', width: 90, height: 70 }]} />
            <View style={[styles.heatZone, { top: '65%', left: '42%', backgroundColor: 'rgba(239, 68, 68, 0.3)', width: 70, height: 60 }]} />
            <View style={[styles.heatZone, { top: '44%', right: '18%', backgroundColor: 'rgba(239, 68, 68, 0.25)', width: 65, height: 55 }]} />
            <View style={[styles.heatZone, { top: '48%', left: '22%', backgroundColor: 'rgba(16, 185, 129, 0.2)', width: 60, height: 50 }]} />

            <Text style={[styles.mapRegionTag, { top: '15%', left: '30%', color: '#94a3b8' }]}>NORTH (PB/HR)</Text>
            <Text style={[styles.mapRegionTag, { top: '48%', left: '16%', color: '#94a3b8' }]}>WEST (GJ/MH)</Text>
            <Text style={[styles.mapRegionTag, { top: '42%', right: '12%', color: '#94a3b8' }]}>EAST (WB/BR)</Text>
            <Text style={[styles.mapRegionTag, { bottom: '15%', left: '38%', color: '#94a3b8' }]}>SOUTH (KA/AP)</Text>
          </View>

          {/* Render Cluster Hotspots across India Coordinates */}
          {clusters.map((c) => {
            const isSelected = selectedCluster.cluster_id === c.cluster_id;
            return (
              <TouchableOpacity
                key={c.cluster_id}
                style={[
                  styles.mapPin,
                  {
                    left: `${c.xPct}%`,
                    top: `${c.yPct}%`,
                    borderColor: isSelected ? '#ffffff' : c.color,
                    backgroundColor: c.color,
                    transform: [{ scale: isSelected ? 1.35 : 1.0 }],
                  },
                ]}
                onPress={() => setSelectedCluster(c)}
              >
                <Text style={styles.pinText}>{c.cases}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Cluster Dossier Card */}
        {selectedCluster ? (
          <View style={[styles.dossierCard, { backgroundColor: '#0f172a', borderColor: '#334155' }]}>
            <View style={styles.dossierHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dossierState, { color: '#10b981' }]}>
                  {selectedCluster.state} · {selectedCluster.district}
                </Text>
                <Text style={[styles.dossierTitle, { color: '#f8fafc' }]}>
                  {selectedCluster.name}
                </Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: selectedCluster.color }]}>
                <Text style={styles.tierBadgeText}>{selectedCluster.riskTier}</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={[styles.metricBox, { backgroundColor: '#1e293b' }]}>
                <Text style={[styles.metricValue, { color: '#f8fafc' }]}>
                  {selectedCluster.cases}
                </Text>
                <Text style={[styles.metricLabel, { color: '#94a3b8' }]}>
                  Active Cases
                </Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: '#1e293b' }]}>
                <Text style={[styles.metricValue, { color: '#f8fafc' }]}>
                  {selectedCluster.radius_km} km
                </Text>
                <Text style={[styles.metricLabel, { color: '#94a3b8' }]}>
                  Corridor Radius
                </Text>
              </View>

              <View style={[styles.metricBox, { backgroundColor: '#1e293b' }]}>
                <Text style={[styles.metricValue, { color: '#f8fafc' }]}>
                  {selectedCluster.spread_velocity}
                </Text>
                <Text style={[styles.metricLabel, { color: '#94a3b8' }]}>
                  Spread Rate
                </Text>
              </View>
            </View>

            <Text style={[styles.coordinatesText, { color: '#64748b' }]}>
              📍 GPS Coordinates: {selectedCluster.lat.toFixed(4)}° N, {selectedCluster.lon.toFixed(4)}° E
            </Text>
          </View>
        ) : null}

        {/* Outbreak Hotspots List matching Image 1 */}
        <Text style={[styles.listHeading, { color: '#f8fafc' }]}>
          Regional Outbreak Triage List ({clusters.length})
        </Text>
        {clusters.map((item) => (
          <TouchableOpacity
            key={item.cluster_id}
            style={[
              styles.clusterListItem,
              {
                backgroundColor: '#0f172a',
                borderColor: selectedCluster.cluster_id === item.cluster_id ? '#10b981' : '#1e293b',
              },
            ]}
            onPress={() => setSelectedCluster(item)}
          >
            <View style={[styles.stateDot, { backgroundColor: item.color }]} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.itemTitle, { color: '#f8fafc' }]}>
                {item.state}: {item.disease}
              </Text>
              <Text style={[styles.itemSub, { color: '#94a3b8' }]}>
                {item.district} · {item.cases} active plots · {item.radius_km}km radius
              </Text>
            </View>
            <View style={[styles.pillBadge, { backgroundColor: item.color }]}>
              <Text style={styles.pillBadgeText}>{item.riskTier.split(' ')[1] || 'Alert'}</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  commandHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 14,
  },
  commandHeaderRegion: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  commandHeaderSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  outbreakCountBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  outbreakCountNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  outbreakCountLabel: {
    color: '#fecaca',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dashboardGaugesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gaugeCard: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    alignItems: 'center',
  },
  gaugeTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  speedometerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedometerArc: {
    width: 90,
    height: 45,
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    borderWidth: 8,
    borderBottomWidth: 0,
    borderColor: '#ef4444',
    borderLeftColor: '#10b981',
    borderRightColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  needlePointer: {
    width: 4,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  gaugeScore: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  gaugeMax: {
    fontSize: 11,
    color: '#64748b',
  },
  gaugeStatusAlert: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  circularGaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularGaugeRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularPercent: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  circularSub: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '600',
  },
  gaugeSubtext: {
    color: '#64748b',
    fontSize: 9,
    marginTop: 6,
  },
  heatZone: {
    position: 'absolute',
    borderRadius: 40,
    filter: 'blur(10px)',
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  mapCanvas: {
    height: 320,
    borderRadius: 18,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indiaSilhouette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 150, 105, 0.04)',
  },
  mapRegionTag: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  mapPin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  dossierCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dossierState: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dossierTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 10.5,
    marginTop: 2,
  },
  coordinatesText: {
    fontSize: 11,
    marginTop: 4,
  },
  listHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  clusterListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  stateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  itemArrow: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 6,
  },
});
