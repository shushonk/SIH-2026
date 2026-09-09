import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Text as SvgText,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
} from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Header } from '../components/common/Header';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { StatusChip } from '../components/common/StatusChip';

const { width } = Dimensions.get('window');

const NATIONWIDE_CLUSTERS = [
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
    riskScore: 92,
    containmentPct: 58,
    spread_velocity: '0.80 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#ef4444',
    mapX: 105,
    mapY: 110,
    regionCode: 'NORTH (PB)',
  },
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
    riskScore: 84,
    containmentPct: 71,
    spread_velocity: '0.35 km/day',
    riskTier: 'Tier 2 Escalation',
    color: '#fe932c',
    mapX: 105,
    mapY: 280,
    regionCode: 'PUNE (MH)',
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
    riskScore: 88,
    containmentPct: 65,
    spread_velocity: '0.55 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#ef4444',
    mapX: 150,
    mapY: 360,
    regionCode: 'KOLAR (KA)',
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
    riskScore: 76,
    containmentPct: 78,
    spread_velocity: '0.42 km/day',
    riskTier: 'Tier 2 Escalation',
    color: '#fe932c',
    mapX: 185,
    mapY: 310,
    regionCode: 'SOUTH (AP)',
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
    riskScore: 55,
    containmentPct: 86,
    spread_velocity: '0.28 km/day',
    riskTier: 'Tier 3 Monitored',
    color: '#00652c',
    mapX: 75,
    mapY: 220,
    regionCode: 'WEST (GJ)',
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
    riskScore: 89,
    containmentPct: 62,
    spread_velocity: '0.65 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#ef4444',
    mapX: 255,
    mapY: 225,
    regionCode: 'EAST (WB)',
  },
];

// Authentic Vector SVG Silhouette of the Republic of India
const INDIA_COASTLINE_PATH =
  'M 155,25 ' +
  'L 165,30 L 175,20 L 190,32 L 182,50 L 195,65 L 180,80 L 195,95 ' +
  'L 210,90 L 225,100 L 215,115 L 245,125 L 260,118 L 275,125 ' +
  'L 310,115 L 330,120 L 335,135 L 320,150 L 330,165 L 315,185 ' +
  'L 300,195 L 305,215 L 290,215 L 285,195 L 270,185 L 260,195 ' +
  'L 265,220 L 255,235 L 240,240 L 230,265 L 210,285 L 195,315 ' +
  'L 185,345 L 175,375 L 165,405 L 150,425 L 140,435 L 135,420 ' +
  'L 125,395 L 115,365 L 105,335 L 95,295 L 88,270 L 75,260 ' +
  'L 55,265 L 45,250 L 40,235 L 55,225 L 75,225 L 80,215 ' +
  'L 45,215 L 35,200 L 45,185 L 70,185 L 85,165 L 75,145 ' +
  'L 90,120 L 115,100 L 130,75 L 140,45 Z';

// Internal regional state partition lines for visual orientation
const INDIA_INTERNAL_RIVERS_AND_BORDERS = [
  'M 115,100 Q 145,115 195,95',    // Punjab / Himachal border
  'M 85,165 Q 135,170 215,115',     // Rajasthan / Haryana / UP border
  'M 45,215 Q 115,220 240,240',     // Tropic of Cancer / MP divide
  'M 88,270 Q 140,270 210,285',     // Maharashtra / MP / Odisha divide
  'M 105,335 Q 150,330 195,315',    // Karnataka / Andhra Pradesh divide
  'M 125,395 Q 140,390 165,405',    // Kerala / Tamil Nadu divide
  'M 245,125 Q 240,180 255,235',    // Bengal / Eastern wing divide
];

export const OfficerMapScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [clusters, setClusters] = useState(NATIONWIDE_CLUSTERS);
  const [selectedCluster, setSelectedCluster] = useState(NATIONWIDE_CLUSTERS[1]); // Default Pune-Khed
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredClusters = clusters.filter((c) => {
    if (activeFilter === 'critical') return c.riskTier.includes('Critical');
    if (activeFilter === 'escalation') return c.riskTier.includes('Escalation');
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: '#020617' }]}>
      <Header title="CultivAI" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.responsiveWrapper}>
          {/* Command Header Bar */}
        <View style={styles.commandHeaderBar}>
          <View>
            <Text style={styles.commandHeaderRegion}>National Agricultural Outbreak Command</Text>
            <Text style={styles.commandHeaderSub}>Epidemiological GIS Radar • CartoDB Topology</Text>
          </View>
          <View style={styles.outbreakCountBadge}>
            <Text style={styles.outbreakCountNumber}>139</Text>
            <Text style={styles.outbreakCountLabel}>Outbreaks</Text>
          </View>
        </View>

        {/* Dashboard Analytics Gauges Row */}
        <View style={styles.dashboardGaugesRow}>
          {/* Gauge 1: Priority Risk Speedometer */}
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeTitle}>Priority Risk Index</Text>
            <View style={styles.speedometerContainer}>
              <View style={styles.speedometerArc}>
                <View
                  style={[
                    styles.needlePointer,
                    {
                      transform: [
                        {
                          rotate: `${(selectedCluster.riskScore / 100) * 180 - 135}deg`,
                        },
                      ],
                    },
                  ]}
                />
              </View>
              <Text style={styles.gaugeScore}>
                {selectedCluster.riskScore}
                <Text style={styles.gaugeMax}>/100</Text>
              </Text>
              <Text style={[styles.gaugeStatusAlert, { color: selectedCluster.color }]}>
                {selectedCluster.riskTier.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Gauge 2: District Containment Ring */}
          <View style={styles.gaugeCard}>
            <Text style={styles.gaugeTitle}>District Containment</Text>
            <View style={styles.circularGaugeContainer}>
              <View
                style={[
                  styles.circularGaugeRing,
                  { borderColor: selectedCluster.containmentPct >= 70 ? '#10b981' : '#fe932c' },
                ]}
              >
                <Text style={styles.circularPercent}>{selectedCluster.containmentPct}%</Text>
                <Text style={styles.circularSub}>Under Triage</Text>
              </View>
            </View>
            <Text style={styles.gaugeSubtext}>{selectedCluster.state}</Text>
          </View>
        </View>

        {/* Filter Chips Bar */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'all' && { backgroundColor: '#1e293b', borderColor: '#38bdf8' },
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={styles.filterPillText}>All India (139)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'critical' && { backgroundColor: '#450a0a', borderColor: '#ef4444' },
            ]}
            onPress={() => setActiveFilter('critical')}
          >
            <Text style={[styles.filterPillText, { color: '#ef4444' }]}>🚨 Critical Tier 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'escalation' && { backgroundColor: '#451a03', borderColor: '#fe932c' },
            ]}
            onPress={() => setActiveFilter('escalation')}
          >
            <Text style={[styles.filterPillText, { color: '#fe932c' }]}>⚠️ Escalation Tier 2</Text>
          </TouchableOpacity>
        </View>

        {/* FULL AUTHENTIC GEOGRAPHIC INDIA MAP CANVAS */}
        <View style={styles.mapCanvasWrapper}>
          <Svg
            width="100%"
            height={420}
            viewBox="0 0 360 460"
            style={styles.svgMap}
          >
            <Defs>
              <LinearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#0d1b2a" stopOpacity="0.95" />
                <Stop offset="50%" stopColor="#0a192f" stopOpacity="0.95" />
                <Stop offset="100%" stopColor="#071520" stopOpacity="0.95" />
              </LinearGradient>

              <LinearGradient id="borderGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <Stop offset="50%" stopColor="#00652c" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </LinearGradient>

              <RadialGradient id="pulseRed" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <Stop offset="60%" stopColor="#ef4444" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </RadialGradient>

              <RadialGradient id="pulseAmber" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#fe932c" stopOpacity="0.6" />
                <Stop offset="60%" stopColor="#fe932c" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#fe932c" stopOpacity="0" />
              </RadialGradient>

              <RadialGradient id="pulseGreen" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <Stop offset="60%" stopColor="#10b981" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Ocean / Coordinate Grid Background */}
            <Rect x="0" y="0" width="360" height="460" fill="#030712" />

            {/* Latitude and Longitude Grid Lines */}
            <Path d="M 0,100 L 360,100" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M 0,200 L 360,200" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M 0,300 L 360,300" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M 0,400 L 360,400" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M 100,0 L 100,460" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M 200,0 L 200,460" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />
            <Path d="M 300,0 L 300,460" stroke="#0f172a" strokeWidth="1" strokeDasharray="3,3" />

            {/* Ocean Watermark Labels */}
            <SvgText x="35" y="320" fill="#1e293b" fontSize="10" fontWeight="bold" letterSpacing="1">
              ARABIAN SEA
            </SvgText>
            <SvgText x="230" y="340" fill="#1e293b" fontSize="10" fontWeight="bold" letterSpacing="1">
              BAY OF BENGAL
            </SvgText>
            <SvgText x="130" y="450" fill="#1e293b" fontSize="9" fontWeight="bold" letterSpacing="1">
              INDIAN OCEAN
            </SvgText>

            {/* Sri Lanka Silhouette */}
            <Path
              d="M 175,442 Q 185,450 178,460 Q 170,455 175,442 Z"
              fill="#0d1b2a"
              stroke="#1e293b"
              strokeWidth="1"
            />

            {/* Andaman & Nicobar */}
            <Circle cx="330" cy="350" r="3" fill="#1e3a5f" />
            <Circle cx="332" cy="365" r="3" fill="#1e3a5f" />
            <Circle cx="334" cy="380" r="2.5" fill="#1e3a5f" />

            {/* Lakshadweep */}
            <Circle cx="85" cy="390" r="2" fill="#1e3a5f" />
            <Circle cx="88" cy="405" r="2" fill="#1e3a5f" />

            {/* MAIN GEOGRAPHICAL INDIA LANDMASS SHADOW & GLOW */}
            <Path
              d={INDIA_COASTLINE_PATH}
              fill="none"
              stroke="#0284c7"
              strokeWidth="5"
              strokeOpacity="0.25"
            />

            {/* MAIN GEOGRAPHICAL INDIA LANDMASS */}
            <Path
              d={INDIA_COASTLINE_PATH}
              fill="url(#landGradient)"
              stroke="url(#borderGlow)"
              strokeWidth="1.8"
            />

            {/* Internal State Partition Lines */}
            {INDIA_INTERNAL_RIVERS_AND_BORDERS.map((d, i) => (
              <Path
                key={i}
                d={d}
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.75"
              />
            ))}

            {/* Geographic Region Watermarks */}
            <SvgText x="135" y="65" fill="#334155" fontSize="9" fontWeight="800" textAnchor="middle">
              LADAKH / J&K
            </SvgText>
            <SvgText x="70" y="160" fill="#334155" fontSize="9" fontWeight="800" textAnchor="middle">
              RAJASTHAN
            </SvgText>
            <SvgText x="160" y="210" fill="#334155" fontSize="9" fontWeight="800" textAnchor="middle">
              MADHYA PRADESH
            </SvgText>
            <SvgText x="140" y="320" fill="#334155" fontSize="8" fontWeight="800" textAnchor="middle">
              DECCAN PLATEAU
            </SvgText>
            <SvgText x="300" y="150" fill="#334155" fontSize="8" fontWeight="800" textAnchor="middle">
              NORTHEAST
            </SvgText>

            {/* RENDER OUTBREAK RISK ALERTS WITH PULSING RADAR ON INDIA MAP */}
            {filteredClusters.map((c) => {
              const isSelected = selectedCluster.cluster_id === c.cluster_id;
              const pulseGrad =
                c.color === '#ef4444'
                  ? 'url(#pulseRed)'
                  : c.color === '#fe932c'
                  ? 'url(#pulseAmber)'
                  : 'url(#pulseGreen)';

              return (
                <G key={c.cluster_id} onPress={() => setSelectedCluster(c)} style={{ cursor: 'pointer' }}>
                  {/* Outer Radar Pulse Ripple */}
                  <Circle
                    cx={c.mapX}
                    cy={c.mapY}
                    r={isSelected ? 32 : 22}
                    fill={pulseGrad}
                  />
                  <Circle
                    cx={c.mapX}
                    cy={c.mapY}
                    r={isSelected ? 22 : 15}
                    stroke={c.color}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    fill="none"
                    opacity="0.7"
                  />

                  {/* Inner Outbreak Pin */}
                  <Circle
                    cx={c.mapX}
                    cy={c.mapY}
                    r={isSelected ? 14 : 11}
                    fill={c.color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />

                  {/* Case Count Number inside Pin */}
                  <SvgText
                    x={c.mapX}
                    y={c.mapY + 4}
                    fill="#ffffff"
                    fontSize={isSelected ? 11 : 9}
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {c.cases}
                  </SvgText>

                  {/* Region Callout Tag Badge */}
                  <Rect
                    x={c.mapX - 35}
                    y={c.mapY - 26}
                    width={70}
                    height={14}
                    rx="7"
                    fill={isSelected ? '#0f172a' : 'rgba(15, 23, 42, 0.8)'}
                    stroke={c.color}
                    strokeWidth="1"
                  />
                  <SvgText
                    x={c.mapX}
                    y={c.mapY - 16}
                    fill="#ffffff"
                    fontSize="8"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {c.regionCode}
                  </SvgText>
                </G>
              );
            })}
          </Svg>

          {/* Map Footer Telemetry Bar */}
          <View style={styles.mapOverlayFooter}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>Critical Blight (&gt;15)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#fe932c' }]} />
                <Text style={styles.legendText}>Escalation (5-15)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Contained (&lt;5)</Text>
              </View>
            </View>
            <Text style={styles.tapTipText}>Tap any pin to inspect district dossier</Text>
          </View>
        </View>

        {/* Horizontal Quick District Cluster Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.clusterSelectorScroll}
        >
          {clusters.map((c) => {
            const isSelected = selectedCluster.cluster_id === c.cluster_id;
            return (
              <TouchableOpacity
                key={c.cluster_id}
                style={[
                  styles.clusterSelectorPill,
                  {
                    backgroundColor: isSelected ? `${c.color}25` : '#0f172a',
                    borderColor: isSelected ? c.color : '#1e293b',
                  },
                ]}
                onPress={() => setSelectedCluster(c)}
              >
                <View style={[styles.clusterPillDot, { backgroundColor: c.color }]} />
                <Text
                  style={[
                    styles.clusterPillText,
                    { color: isSelected ? '#ffffff' : '#94a3b8' },
                  ]}
                >
                  {c.district} ({c.cases})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected Cluster Detailed Dossier Card */}
        {selectedCluster ? (
          <View style={[styles.dossierCard, { borderColor: selectedCluster.color }]}>
            <View style={styles.dossierHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dossierState, { color: selectedCluster.color }]}>
                  {selectedCluster.state} · {selectedCluster.district}
                </Text>
                <Text style={styles.dossierTitle}>
                  {selectedCluster.name}
                </Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: selectedCluster.color }]}>
                <Text style={styles.tierBadgeText}>{selectedCluster.riskTier}</Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{selectedCluster.cases}</Text>
                <Text style={styles.metricLabel}>Active Cases</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{selectedCluster.radius_km} km</Text>
                <Text style={styles.metricLabel}>Corridor Radius</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{selectedCluster.spread_velocity}</Text>
                <Text style={styles.metricLabel}>Spread Velocity</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: selectedCluster.color }]}
                onPress={() =>
                  Alert.alert(
                    'Epidemiological Quarantine Issued',
                    `15km Containment Perimeter locked for ${selectedCluster.district}. Extension officers alerted.`,
                    [{ text: 'OK' }]
                  )
                }
              >
                <Text style={styles.actionBtnText}>Enforce {selectedCluster.radius_km}km Quarantine Buffer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  clusterSelectorScroll: {
    gap: 8,
    marginBottom: 16,
    paddingVertical: 2,
  },
  clusterSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  clusterPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clusterPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  commandHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 14,
  },
  commandHeaderRegion: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  commandHeaderSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  outbreakCountBadge: {
    backgroundColor: '#b20010',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  outbreakCountNumber: {
    color: '#ffffff',
    fontSize: 16,
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
    marginBottom: 14,
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  filterPillText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  // Map Canvas
  mapCanvasWrapper: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#1e293b',
    backgroundColor: '#020617',
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  svgMap: {
    alignSelf: 'center',
  },
  invisiblePinTarget: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  mapOverlayFooter: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  tapTipText: {
    color: '#64748b',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  // Dossier Card
  dossierCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 18,
    gap: 12,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dossierState: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dossierTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  actionRow: {
    marginTop: 4,
  },
  actionBtn: {
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
