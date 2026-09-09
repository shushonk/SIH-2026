import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import L from 'leaflet';
import { 
  ShieldAlert, 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  ListOrdered, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  HelpCircle,
  FileCheck2,
  Calendar
} from 'lucide-react';

export function OfficerView({ activeStoryStep, onStoryActionComplete }) {
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [clusterData, setClusterData] = useState(null);
  const [currentDayStep, setCurrentDayStep] = useState(14);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);

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

  // Leaflet map ref
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

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !mapData?.points?.length) return;

    if (!mapInstanceRef.current) {
      const points = mapData.points;
      const avgLat = points.reduce((s, p) => s + p.latitude, 0) / points.length;
      const avgLng = points.reduce((s, p) => s + p.longitude, 0) / points.length;

      const map = L.map(mapContainerRef.current).setView([avgLat, avgLng], 13);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);
    }

    const map = mapInstanceRef.current;

    // Clear old signals
    signalMarkersRef.current.forEach(m => map.removeLayer(m));
    signalMarkersRef.current = [];

    // Plot field points
    mapData.points.forEach((p) => {
      const isHigh = p.score >= 70;
      const isMed = p.score >= 40 && p.score < 70;
      const color = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';

      const circle = L.circleMarker([p.latitude, p.longitude], {
        radius: isHigh ? 12 : 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.75
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0f172a;">Field #${p.field_id}: ${p.owner_name}</strong><br/>
          <span>Crop: ${p.crop} (${p.variety})</span><br/>
          <span>Growth Stage: ${p.growth_stage}</span><br/>
          <strong style="color: ${color};">Risk Score: ${p.score}/100 (${p.level})</strong>
        </div>
      `);
      signalMarkersRef.current.push(circle);
    });

    // Draw active cluster perimeter circle
    if (clusterData?.center) {
      if (clusterCircleRef.current) {
        map.removeLayer(clusterCircleRef.current);
      }
      const cCircle = L.circle([clusterData.center.latitude, clusterData.center.longitude], {
        radius: clusterData.center.radius_km * 1000,
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '5, 5'
      }).addTo(map);
      cCircle.bindPopup(`<strong>${clusterData.cluster_name}</strong><br/>Active Spatiotemporal Cluster Radius: ${clusterData.center.radius_km} km`);
      clusterCircleRef.current = cCircle;
    }

  }, [mapData, clusterData]);

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

  // Handle Step 6 Action: Log Intervention
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

  const currentTimelineStep = clusterData?.timeline?.find(t => t.day_step === currentDayStep) || clusterData?.timeline?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Extension Officer Command Console
              </span>
              <span className="text-xs text-slate-400">Officer Deshmukh · Pune Agricultural Division</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Regional Outbreak Hotspots & Ranked Inspection Priorities
            </h1>
            <p className="text-xs text-slate-400">
              Aggregated spatiotemporal clusters, explainable priority queues, and field intervention dispatches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Priority #1: Field 104 (Risk 82)
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Hotspot Map & Spatiotemporal Replay Slider */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Geospatial Map Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <h2 className="text-sm font-bold text-white">Regional Disease Hotspot Map (OpenStreetMap)</h2>
              </div>
              <span className="text-[10px] text-slate-400">Pune-Khed Solanaceae Corridor</span>
            </div>

            {/* Map Container */}
            <div
              ref={mapContainerRef}
              className="w-full h-80 rounded-xl overflow-hidden border border-slate-800 z-10"
            />

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> High Risk (&gt;70)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Risk (40-69)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low Risk (&lt;40)
                </span>
              </div>
              <span className="italic text-[10px]">Dashed ring: Active cluster boundary (4.2 km)</span>
            </div>
          </div>

          {/* Spatiotemporal Cluster Time Slider */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Spatiotemporal Cluster Spread Replay</h3>
                  <p className="text-[11px] text-slate-400">
                    Observe how the Solanaceae blight emerged, spread along the corridor, and stabilized
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center gap-1 transition-colors"
                >
                  {isPlayingReplay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlayingReplay ? 'Pause' : 'Play Replay'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlayingReplay(false);
                    setCurrentDayStep(1);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
                  title="Reset to Day 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Slider control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">
                  Timeline Progression: Day {currentDayStep} of 14
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Date: {currentTimelineStep?.date || '2026-09-08'}
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
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Day 1 (Isolated Emergence)</span>
                <span>Day 7 (Corridor Expansion)</span>
                <span>Day 14 (Stabilized Containment)</span>
              </div>
            </div>

            {/* Stage Narrative Card based on slider position */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              {currentDayStep <= 3 ? (
                <div>
                  <span className="font-bold text-amber-400">Day 1–3 (Initial Outbreak): </span>
                  Isolated foliar symptoms detected on Field 104 and 301. Early Blight spore counts initiated in lower canopies.
                </div>
              ) : currentDayStep <= 8 ? (
                <div>
                  <span className="font-bold text-rose-400">Day 4–8 (Peak Corridor Spread): </span>
                  Microclimate humidity reached 82%. Lesions expanded north-east toward Field 218. Total active cluster cases peaked at 5.
                </div>
              ) : (
                <div>
                  <span className="font-bold text-emerald-400">Day 9–14 (Advisory Containment): </span>
                  Following officer extension visits and Trichoderma bio-barrier advisories, new lesion progression plateaued. Cluster stabilized.
                </div>
              )}
            </div>
          </div>

          {/* Intervention Logger */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Log Agricultural Extension Intervention</h3>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Logging an intervention issues official KVK guidance to the farmer and automatically schedules a 3-day post-treatment follow-up check:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Priority Field:</label>
                <select
                  value={selectedFieldForIntervention}
                  onChange={(e) => setSelectedFieldForIntervention(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="104">Priority #1: Field 104 (Ramesh Patil — Tomato Pusa Ruby)</option>
                  <option value="301">Priority #2: Field 301 (Lakshmi Bai — Tomato Pusa Ruby)</option>
                  <option value="218">Priority #3: Field 218 (Sunita Devi — Tomato Pusa Ruby)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Advisory Action (Safe Non-Prescriptive Guidance):</label>
                <textarea
                  rows={2}
                  value={interventionAction}
                  onChange={(e) => setInterventionAction(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <button
                onClick={handleLogIntervention}
                disabled={isLoggingIntervention}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md transition-all disabled:opacity-50"
              >
                {isLoggingIntervention ? 'Dispatching Advisory…' : 'Log Extension Intervention & Schedule Follow-Up'}
              </button>
            </div>

            {interventionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-slate-200 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Intervention #{interventionSuccess.intervention.intervention_id} Successfully Logged!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Follow-up inspection automatically scheduled for <strong>{interventionSuccess.followup.due_date}</strong>.
                  Farmer portal updated to receive post-treatment recovery scan.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right 5 Columns: Priority Queue & What-If Simulator */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ranked Inspection Priority Queue */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ranked Inspection Queue</h3>
              </div>
              <span className="text-[10px] text-slate-400">Sorted by Objective Risk</span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {priorityQueue.map((item, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={item.field_id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isTop
                        ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40 shadow-lg shadow-rose-950/50'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isTop ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{item.rank_order}
                        </span>
                        <span className="text-xs font-bold text-white">
                          Field {item.field_id} ({item.owner_name})
                        </span>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-rose-400">
                        Score: {item.priority_score}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1">
                      {item.crop} ({item.variety}) · Stage: {item.growth_stage}
                    </p>

                    {/* Driving Reasons Breakdown */}
                    <div className="mt-2 pt-2 border-t border-slate-800 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driving Factors:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.driving_reasons?.map((r, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {r.label || r.factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What-If Scenario Simulator */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-400" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">What-If Scenario Simulator</h3>
                  <p className="text-[10px] text-amber-400 italic font-medium">Simulation model — NOT a meteorological forecast</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              Test how hypothetical regional triggers alter the inspection priority ranking:
            </p>

            <div className="space-y-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Additional Verified Cases Nearby:</span>
                  <span className="font-mono text-teal-400 font-bold">+{simCases} cases</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simCases}
                  onChange={(e) => setSimCases(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Forecast Humidity Spike:</span>
                  <span className="font-mono text-teal-400 font-bold">+{simHumidity}% RH</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={simHumidity}
                  onChange={(e) => setSimHumidity(parseInt(e.target.value, 10))}
                  className="w-full accent-teal-500"
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full py-2 rounded-lg font-bold text-xs bg-teal-600 hover:bg-teal-500 text-slate-950 shadow-md transition-all disabled:opacity-50"
              >
                {isSimulating ? 'Computing Counterfactual Ranks…' : 'Simulate Priority Shift'}
              </button>
            </div>

            {/* Simulation Results Table */}
            {simResults && (
              <div className="space-y-2 animate-in fade-in">
                <p className="text-[10px] text-slate-400 italic">{simResults.simulation_disclaimer}</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                        <th className="py-1.5">Field</th>
                        <th className="py-1.5">Original</th>
                        <th className="py-1.5">Simulated</th>
                        <th className="py-1.5">Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {simResults.results.slice(0, 4).map((r) => (
                        <tr key={r.field_id}>
                          <td className="py-1.5 font-bold">#{r.field_id}</td>
                          <td className="py-1.5">{r.original_score}</td>
                          <td className="py-1.5 font-bold text-rose-400">{r.simulated_score}</td>
                          <td className="py-1.5 text-teal-400 font-mono">+{r.score_delta}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
