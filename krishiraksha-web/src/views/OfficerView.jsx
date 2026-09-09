import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import L from 'leaflet';
import { 
  ShieldAlert, 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  FileCheck2,
  Search,
  Flame,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  ChevronRight,
  BarChart3,
  Compass,
  Maximize2
} from 'lucide-react';

const NATIONWIDE_CLUSTERS = [
  {
    cluster_id: 'cluster_pune_blight',
    state: 'Maharashtra',
    district: 'Pune-Khed',
    name: 'Pune-Khed Solanaceae Early Blight Cluster',
    crop: 'Tomato (Pusa Ruby)',
    disease: 'Early Blight (Alternaria solani)',
    lat: 18.522,
    lon: 73.858,
    radius_km: 4.2,
    cases: 5,
    riskScore: 84,
    containmentPct: 71,
    spread_velocity: '0.35 km/day',
    riskTier: 'Tier 2 Escalation',
    color: '#f97316',
    status: 'ACTIVE_OUTBREAK',
    telemetry: { alerts: 88, traps: 94, humid: 82, spores: 91 }
  },
  {
    cluster_id: 'cluster_kolar_tomato',
    state: 'Karnataka',
    district: 'Kolar-Chintamani',
    name: 'Kolar-Chintamani Tomato Blight Hotspot',
    crop: 'Tomato (Abhinav)',
    disease: 'Tomato Leaf Curl & Blight',
    lat: 13.1367,
    lon: 78.1291,
    radius_km: 8.5,
    cases: 14,
    riskScore: 92,
    containmentPct: 64,
    spread_velocity: '0.55 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#ef4444',
    status: 'CRITICAL',
    telemetry: { alerts: 96, traps: 89, humid: 85, spores: 98 }
  },
  {
    cluster_id: 'cluster_jalandhar_potato',
    state: 'Punjab',
    district: 'Jalandhar Doaba',
    name: 'Jalandhar Doaba Potato Late Blight Belt',
    crop: 'Potato (Kufri Jyoti)',
    disease: 'Potato Late Blight',
    lat: 31.326,
    lon: 75.5762,
    radius_km: 12.0,
    cases: 22,
    riskScore: 88,
    containmentPct: 58,
    spread_velocity: '0.80 km/day',
    riskTier: 'Tier 1 Critical',
    color: '#ef4444',
    status: 'CRITICAL',
    telemetry: { alerts: 92, traps: 95, humid: 90, spores: 96 }
  },
  {
    cluster_id: 'cluster_guntur_chili',
    state: 'Andhra Pradesh',
    district: 'Guntur-Tenali',
    name: 'Guntur-Tenali Chili Anthracnose Belt',
    crop: 'Chili (Guntur Sannam)',
    disease: 'Chili Anthracnose & Thrips',
    lat: 16.3067,
    lon: 80.4365,
    radius_km: 6.8,
    cases: 18,
    riskScore: 76,
    containmentPct: 78,
    spread_velocity: '0.42 km/day',
    riskTier: 'Tier 2 Escalation',
    color: '#f59e0b',
    status: 'ACTIVE_OUTBREAK',
    telemetry: { alerts: 74, traps: 82, humid: 79, spores: 84 }
  },
  {
    cluster_id: 'cluster_anand_tobacco',
    state: 'Gujarat',
    district: 'Anand-Kheda',
    name: 'Anand-Kheda Solanaceous Damping-off',
    crop: 'Tobacco / Solanaceae',
    disease: 'Solanaceous Blight',
    lat: 22.5645,
    lon: 72.9289,
    radius_km: 5.5,
    cases: 8,
    riskScore: 55,
    containmentPct: 86,
    spread_velocity: '0.28 km/day',
    riskTier: 'Tier 3 Monitored',
    color: '#10b981',
    status: 'CONTAINED',
    telemetry: { alerts: 45, traps: 52, humid: 60, spores: 48 }
  },
  {
    cluster_id: 'cluster_hooghly_potato',
    state: 'West Bengal',
    district: 'Hooghly-Arambagh',
    name: 'Hooghly-Arambagh Potato Blight Surge',
    crop: 'Potato (Kufri Pukhraj)',
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
    status: 'CRITICAL',
    telemetry: { alerts: 90, traps: 91, humid: 88, spores: 93 }
  }
];

// Speedometer Gauge Component
function SpeedometerGauge({ value = 84, max = 100 }) {
  const clamped = Math.max(0, Math.min(max, value));
  const angle = (clamped / max) * 180 - 180; // -180 to 0 degrees

  return (
    <div className="relative flex flex-col items-center justify-center pt-2">
      <svg className="w-44 h-24 overflow-visible" viewBox="0 0 160 90">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#84cc16" />
            <stop offset="65%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Outer Background Track */}
        <path
          d="M 15 85 A 65 65 0 0 1 145 85"
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Dynamic Glowing Colored Arc */}
        <path
          d="M 15 85 A 65 65 0 0 1 145 85"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="204.2"
          strokeDashoffset={204.2 * (1 - clamped / max)}
          filter="url(#gaugeGlow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Gauge Ticks */}
        <circle cx="15" cy="85" r="2.5" fill="#64748b" />
        <circle cx="80" cy="20" r="2.5" fill="#64748b" />
        <circle cx="145" cy="85" r="2.5" fill="#64748b" />

        {/* Needle Pointer */}
        <g transform={`rotate(${angle} 80 85)`} className="transition-transform duration-700 ease-out">
          <line x1="80" y1="85" x2="25" y2="85" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="85" r="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
        </g>
      </svg>

      {/* Numerical Display in Center */}
      <div className="text-center -mt-3">
        <div className="text-2xl font-black text-white tracking-tight font-mono">
          {clamped} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
        </div>
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 flex items-center justify-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          {clamped >= 80 ? 'Critical Risk' : clamped >= 60 ? 'Elevated Threat' : 'Monitored Area'}
        </div>
      </div>
    </div>
  );
}

// Circular District Containment Gauge
function ContainmentRing({ percentage = 71 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-32 h-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#1e293b"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#10b981"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-white font-mono">{percentage}%</span>
        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Tracked</span>
      </div>
    </div>
  );
}

export function OfficerView({ activeStoryStep, onStoryActionComplete }) {
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [currentDayStep, setCurrentDayStep] = useState(14);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState(NATIONWIDE_CLUSTERS[0]);
  const [viewScope, setViewScope] = useState('national'); // 'national' | 'district'

  // Intervention log state
  const [selectedFieldForIntervention, setSelectedFieldForIntervention] = useState('104');
  const [interventionAction, setInterventionAction] = useState('Field visit conducted: Prescribed Trichoderma bio-fungicide foliar spray, 25cm canopy lower leaf pruning, and morning drip irrigation adjustment.');
  const [isLoggingIntervention, setIsLoggingIntervention] = useState(false);
  const [interventionSuccess, setInterventionSuccess] = useState(null);

  // What-If Simulator state
  const [simCases, setSimCases] = useState(5);
  const [simHumidity, setSimHumidity] = useState(15);
  const [simResults, setSimResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const clusterCircleRef = useRef(null);
  const signalMarkersRef = useRef([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [queue, mapPoints, cluster] = await Promise.all([
        api.getPriorityQueue(),
        api.getHotspotMap(),
        api.getSpatiotemporalCluster()
      ]);
      setPriorityQueue(queue);
      setMapData(mapPoints);
      setClusterData(cluster);
    } catch (e) {
      console.error('Failed to load officer data:', e);
    }
  };

  // Initialize and update Leaflet Map with CartoDB Dark Matter
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20.5937, 78.9629], 5); // India center

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Ultra-dark CartoDB Dark Matter tiles matching the user blueprint
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old signals
    signalMarkersRef.current.forEach(m => map.removeLayer(m));
    signalMarkersRef.current = [];

    // Plot nationwide clusters
    NATIONWIDE_CLUSTERS.forEach(cluster => {
      const isSelected = cluster.cluster_id === selectedCluster.cluster_id;

      // Glow perimeter circle
      const perimeter = L.circle([cluster.lat, cluster.lon], {
        radius: cluster.radius_km * 1000,
        color: cluster.color,
        fillColor: cluster.color,
        fillOpacity: isSelected ? 0.22 : 0.1,
        weight: isSelected ? 2.5 : 1.2,
        dashArray: isSelected ? undefined : '4, 4'
      }).addTo(map);

      // Glowing epicenter pulse marker
      const markerIcon = L.divIcon({
        className: 'custom-radar-pulse',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${cluster.color}; opacity: 0.6; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 50%; background-color: ${cluster.color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${cluster.color}; z-index: 10;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([cluster.lat, cluster.lon], { icon: markerIcon }).addTo(map);

      marker.bindPopup(`
        <div style="background: #020617; color: #f8fafc; padding: 6px; border-radius: 8px; font-family: system-ui; font-size: 11px; min-width: 170px;">
          <div style="font-weight: 800; color: ${cluster.color}; text-transform: uppercase; font-size: 10px;">${cluster.riskTier}</div>
          <div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 2px;">${cluster.name}</div>
          <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">Crop: <strong>${cluster.crop}</strong></div>
          <div style="color: #f59e0b; font-size: 11px;">Pathogen: <strong>${cluster.disease}</strong></div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px solid #1e293b; font-weight: 700;">
            <span>Threat Score:</span>
            <span style="color: ${cluster.color};">${cluster.riskScore}/100</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedCluster(cluster);
        map.flyTo([cluster.lat, cluster.lon], 9, { duration: 1.2 });
      });

      signalMarkersRef.current.push(perimeter, marker);
    });

    // Also plot local field points from mapData if present
    if (mapData?.points?.length) {
      mapData.points.forEach((p) => {
        const isHigh = p.score >= 70;
        const color = isHigh ? '#ef4444' : '#f59e0b';

        const circle = L.circleMarker([p.latitude, p.longitude], {
          radius: isHigh ? 6 : 4,
          fillColor: color,
          color: '#ffffff',
          weight: 1,
          opacity: 0.9,
          fillOpacity: 0.8
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family: sans-serif; font-size: 11px; color: #020617;">
            <strong>Field #${p.field_id}: ${p.owner_name}</strong><br/>
            <span>Crop: ${p.crop} (${p.variety})</span><br/>
            <span style="color: ${color}; font-weight: bold;">Risk Score: ${p.score}/100</span>
          </div>
        `);
        signalMarkersRef.current.push(circle);
      });
    }

  }, [selectedCluster, mapData]);

  // Spatiotemporal slider playback timer
  useEffect(() => {
    let interval;
    if (isPlayingReplay) {
      interval = setInterval(() => {
        setCurrentDayStep(prev => {
          if (prev >= 14) {
            setIsPlayingReplay(false);
            return 14;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlayingReplay]);

  // Handle Intervention
  const handleLogIntervention = async () => {
    setIsLoggingIntervention(true);
    setInterventionSuccess(null);
    try {
      const res = await api.recordIntervention({
        field_id: selectedFieldForIntervention,
        action_taken: interventionAction,
        officer_name: 'Officer Deshmukh'
      });
      setInterventionSuccess(res);
      await loadData();
      if (onStoryActionComplete) onStoryActionComplete(6);
    } catch (e) {
      alert('Error recording intervention: ' + e.message);
    } finally {
      setIsLoggingIntervention(false);
    }
  };

  // Run What-If simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await api.runSimulation({
        additional_cases: simCases,
        humidity_spike_pct: simHumidity
      });
      setSimResults(res);
    } catch (e) {
      alert('Simulation error: ' + e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredClusters = NATIONWIDE_CLUSTERS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTimelineStep = clusterData?.timeline?.find(t => t.day_step === currentDayStep) || clusterData?.timeline?.[0];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      
      {/* Top Header Tactical HUD Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Region Search & Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-extrabold text-white tracking-wide uppercase font-sans">
              CultivAI GIS Outbreak Command
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Maharashtra or District…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
            />
          </div>
        </div>

        {/* Center: View Switcher Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setViewScope('national');
              mapInstanceRef.current?.flyTo([20.5937, 78.9629], 5, { duration: 1 });
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewScope === 'national' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇮🇳 India Heatmap
          </button>
          <button
            onClick={() => {
              setViewScope('district');
              mapInstanceRef.current?.flyTo([selectedCluster.lat, selectedCluster.lon], 9, { duration: 1 });
            }}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              viewScope === 'district' 
                ? 'bg-orange-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎯 District Corridor ({selectedCluster.district})
          </button>
        </div>

        {/* Right: Quick Story Action Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSimModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Microclimate</span>
          </button>
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>139 Live Outbreaks Active</span>
          </div>
        </div>
      </div>

      {/* 3-COLUMN MAIN GIS COMMAND LAYOUT (Blueprint Accurate) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* =========================================================
            LEFT COLUMN (3 Cols): Outbreaks Counter & District Cards
           ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 139 Outbreaks Counter Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-4 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  NATIONAL THREAT RADAR
                </span>
                <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight flex items-baseline gap-2">
                  139
                  <span className="text-xs font-semibold text-slate-400 font-sans">Active Outbreaks</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-inner">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Aggregated across Solanaceae, Cucurbit, and Malvaceae corridors nationwide.
            </p>
          </div>

          {/* District Outbreak List */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 px-1">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Ranked Hotspots ({filteredClusters.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">RISK SCORE</span>
            </div>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredClusters.map((cluster) => {
                const isSelected = selectedCluster.cluster_id === cluster.cluster_id;
                return (
                  <div
                    key={cluster.cluster_id}
                    onClick={() => {
                      setSelectedCluster(cluster);
                      mapInstanceRef.current?.flyTo([cluster.lat, cluster.lon], 9, { duration: 1 });
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {cluster.state}
                        </span>
                        <h4 className="text-xs font-bold text-white leading-tight mt-0.5">
                          {cluster.district}
                        </h4>
                        <p className="text-[10px] text-amber-400/90 mt-0.5">
                          {cluster.disease}
                        </p>
                      </div>

                      {/* Threat Score Badge */}
                      <div className="text-right shrink-0">
                        <span 
                          className="px-2 py-0.5 rounded-lg text-xs font-black font-mono shadow-sm"
                          style={{
                            backgroundColor: `${cluster.color}25`,
                            color: cluster.color,
                            border: `1px solid ${cluster.color}50`
                          }}
                        >
                          {cluster.riskScore}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-1 font-mono">
                          {cluster.cases} cases
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
                      <span>Radius: <strong className="text-slate-200">{cluster.radius_km} km</strong></span>
                      <span>Velocity: <strong className="text-slate-200">{cluster.spread_velocity}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* =========================================================
            CENTER COLUMN (6 Cols): Large Tactical GIS Map of India
           ========================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-slate-800 shadow-2xl space-y-3 relative">
            
            {/* Map Top Bar */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Topological GIS Vector Overlay
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  CartoDB Dark Matter
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Critical
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Escalation
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Contained
                </span>
              </div>
            </div>

            {/* Tactical Map Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-[470px] rounded-xl overflow-hidden border border-slate-800 z-10 relative bg-[#020617]"
            />

            {/* Timeline Replay Bar underneath Map */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1 shadow-md transition-all"
                  >
                    {isPlayingReplay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    <span>{isPlayingReplay ? 'Pause' : 'Spatiotemporal Replay'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsPlayingReplay(false);
                      setCurrentDayStep(1);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                    title="Reset to Day 1"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
                <span className="font-mono text-emerald-400 font-bold text-xs">
                  Day {currentDayStep} of 14 · {currentTimelineStep?.date || '2026-09-08'}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="14"
                value={currentDayStep}
                onChange={(e) => {
                  setIsPlayingReplay(false);
                  setCurrentDayStep(parseInt(e.target.value, 10));
                }}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Bottom Tactical Status Strip */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
              <span>Active Focal Point: <strong className="text-emerald-400">{selectedCluster.name}</strong></span>
              <span>Quarantine Radius: <strong className="text-white">{selectedCluster.radius_km} km</strong></span>
            </div>

          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN (3 Cols): Gauges, Telemetry & Interventions
           ========================================================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Priority by Risk Speedometer Gauge */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl space-y-1">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Priority by Risk
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedCluster.riskTier}
              </span>
            </div>

            <SpeedometerGauge value={selectedCluster.riskScore} max={100} />
          </div>

          {/* District Containment Circular Ring */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                District Containment
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                {selectedCluster.district}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <ContainmentRing percentage={selectedCluster.containmentPct} />
              <div className="space-y-1 text-right text-xs">
                <div className="text-[10px] text-slate-400 uppercase">Isolated Area</div>
                <div className="text-sm font-black text-white font-mono">{selectedCluster.radius_km * 2} km²</div>
                <div className="text-[10px] text-slate-400 uppercase mt-1">Velocity</div>
                <div className="text-xs font-bold text-amber-400 font-mono">{selectedCluster.spread_velocity}</div>
              </div>
            </div>
          </div>

          {/* Frequency & Telemetry Spikes Bar Chart */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Telemetry Spikes
              </span>
              <span className="text-[10px] text-slate-400 font-mono">LIVE SENSORS</span>
            </div>

            {/* Vertical Bar Chart matching user blueprint */}
            <div className="flex items-end justify-between h-20 px-2 pt-2 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div 
                  className="w-4 rounded-t bg-rose-500/80 hover:bg-rose-400 transition-all"
                  style={{ height: `${selectedCluster.telemetry.alerts * 0.7}px` }}
                />
                <span className="text-[8px] font-bold text-slate-400 uppercase">ALERTS</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div 
                  className="w-4 rounded-t bg-amber-500/80 hover:bg-amber-400 transition-all"
                  style={{ height: `${selectedCluster.telemetry.traps * 0.7}px` }}
                />
                <span className="text-[8px] font-bold text-slate-400 uppercase">TRAPS</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div 
                  className="w-4 rounded-t bg-sky-500/80 hover:bg-sky-400 transition-all"
                  style={{ height: `${selectedCluster.telemetry.humid * 0.7}px` }}
                />
                <span className="text-[8px] font-bold text-slate-400 uppercase">HUMID</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div 
                  className="w-4 rounded-t bg-emerald-500/80 hover:bg-emerald-400 transition-all"
                  style={{ height: `${selectedCluster.telemetry.spores * 0.7}px` }}
                />
                <span className="text-[8px] font-bold text-slate-400 uppercase">SPORES</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleLogIntervention}
              disabled={isLoggingIntervention}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isLoggingIntervention ? 'Issuing Advisory…' : 'Dispatch Bio-Barrier Advisory'}</span>
            </button>
            {interventionSuccess && (
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] text-emerald-300">
                ✓ Advisory dispatched to local KVK Extension officer.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Simulator Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">What-If Microclimate & Outbreak Simulator</h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Simulated Additional Cases in 48h: <strong>+{simCases}</strong></label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={simCases}
                  onChange={(e) => setSimCases(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Projected Humidity Spike: <strong>+{simHumidity}%</strong></label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={simHumidity}
                  onChange={(e) => setSimHumidity(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                {isSimulating ? 'Calculating Projections…' : 'Run Deterministic Projection'}
              </button>

              {simResults && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <div className="font-bold text-amber-400">Simulation Projections:</div>
                  <div>Projected Risk Score: <strong className="text-white">{simResults.projected_risk_score} / 100</strong></div>
                  <div>Recommended Barrier Radius: <strong className="text-white">{simResults.recommended_buffer_radius_km} km</strong></div>
                  <div className="text-[11px] text-slate-400">{simResults.advisory_summary}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
