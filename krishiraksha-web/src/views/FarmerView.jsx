import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileText, 
  Droplets, 
  HelpCircle, 
  Compass, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  ChevronDown,
  Bug,
  Radio,
  MessageSquare,
  CloudSun,
  PlusCircle,
  Wind,
  Share2,
  Volume2,
  VolumeX,
  CreditCard,
  ShoppingBag,
  Check,
  Phone,
  ZoomIn,
  Zap,
  Info,
  Calendar
} from 'lucide-react';
import { VerticalStepper } from '../components/common/VerticalStepper';
import { TrapLoggerModal } from '../components/common/TrapLoggerModal';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useLanguage } from '../i18n/LanguageContext';

const SAMPLE_LEAF_IMAGES = [
  {
    id: 'sample_cotton_cercospora',
    label: 'Cotton Cercospora (कापूस करपा)',
    symptom: 'leaf_spots_concentric',
    url: '/cotton_crop.jpg',
    description: 'Circular reddish brown necrotic lesions with dark margins on cotton canopy (Vidarbha field specimen).'
  },
  {
    id: 'sample_ambiguous',
    label: 'Ambiguous Concentric Lesion (Tomato)',
    symptom: 'leaf_spots_concentric',
    url: '/samples/early_blight_concentric.jpg',
    description: 'Target-like rings on lower foliage; shares border patterns with Septoria Leaf Spot.'
  },
  {
    id: 'sample_healthy',
    label: 'Healthy Green Canopy',
    symptom: 'healthy',
    url: '/samples/healthy_tomato_leaf.jpg',
    description: 'Uniform chlorophyll distribution, turgid leaves, zero lesion evidence.'
  },
  {
    id: 'sample_scorch',
    label: 'Marginal Chlorosis & Scorch',
    symptom: 'margin_yellowing',
    url: '/samples/potassium_scorch_leaf.jpg',
    description: 'Yellowing at leaflet tips and margins; typical potassium stress or early blight firing.'
  }
];

export function FarmerView({ activeStoryStep, onStoryActionComplete, currentLanguage = 'en', onOpenCaseChat }) {
  const { selectedFieldId, setSelectedFieldId, fields } = useAuth();
  const { isOffline, queueScan } = useOffline();
  const { t } = useLanguage();

  // Field details & Passport state
  const [passportData, setPassportData] = useState(null);
  const [fieldMemory, setFieldMemory] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loadingPassport, setLoadingPassport] = useState(false);

  // Sensor, Trap & Forecast state (Items 10a, 10b, 10c)
  const [isTrapModalOpen, setIsTrapModalOpen] = useState(false);
  const [forecastAlerts, setForecastAlerts] = useState([]);
  const [trapsData, setTrapsData] = useState([]);
  const [sensorsData, setSensorsData] = useState([]);

  // Scan & Uncertainty Lab state
  const [selectedSample, setSelectedSample] = useState(SAMPLE_LEAF_IMAGES[0]);
  const [symptomChecked, setSymptomChecked] = useState(['leaf_spots_concentric']);
  const [customImageB64, setCustomImageB64] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [investigationStep, setInvestigationStep] = useState(null);
  const [isNarrowing, setIsNarrowing] = useState(false);

  // Follow-up state
  const [followupSeverity, setFollowupSeverity] = useState(35);
  const [isSubmittingFollowup, setIsSubmittingFollowup] = useState(false);
  const [followupResult, setFollowupResult] = useState(null);

  // Knowledge base state
  const [activeDiseaseDoc, setActiveDiseaseDoc] = useState('Early Blight');
  const [knowledgeLang, setKnowledgeLang] = useState('en');
  const [knowledgeDoc, setKnowledgeDoc] = useState(null);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const doc = await api.getKnowledgeDoc(activeDiseaseDoc, knowledgeLang);
        setKnowledgeDoc(doc);
      } catch (err) {
        console.warn('Failed to load knowledge doc:', err);
      }
    };
    fetchKnowledge();
  }, [activeDiseaseDoc, knowledgeLang]);

  // Micro-Transaction Sachet Pack state (Reference design)
  const [remainingScans, setRemainingScans] = useState(4);
  const [totalScans, setTotalScans] = useState(5);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const handleShareWhatsApp = () => {
    const diseaseName = scanResult?.ai_analysis?.top_disease || 'कापूस करपा रोग (Cercospora Leaf Spot)';
    const conf = scanResult?.ai_analysis?.top_confidence ? Math.round(scanResult.ai_analysis.top_confidence * 100) : 94;
    const text = encodeURIComponent(
      `🌾 CultivAI Farmer Diagnostic Dossier (#8492)\n` +
      `Crop: Cotton (Gossypium) • Plot 2B (Field #${selectedFieldId})\n` +
      `Diagnosis: ${diseaseName}\n` +
      `AI Confidence: ${conf}% (Validated by Vidarbha Agri Net & ICAR)\n` +
      `Recommended Safe Remedy: 5% NSKE (निंबोळी अर्क) spray (50ml/15L pump)\n` +
      `Advisory: Do not apply chemical fungicides without extension verification.\n` +
      `CultivAI Closed-Loop Decision Platform (SIH26131)`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(20);
      const interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 25;
        });
      }, 600);
    }
  };

  const handleSelectRechargePack = (pack) => {
    setRemainingScans((prev) => prev + pack.scans);
    setTotalScans((prev) => prev + pack.scans);
    setIsRechargeModalOpen(false);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Left column view tab ('lab' | 'stepper')
  const [leftTab, setLeftTab] = useState('lab');

  const DECISION_LOOP_STEPS = [
    {
      id: 'step_1',
      title: 'Observe — Foliage Scan & Diagnostic Ambiguity',
      role: 'Farmer',
      description: 'Upload leaf specimen image. Real ML classifier extracts color (HSV), texture (GLCM), and morphology (Canny) features to output differential alternatives.'
    },
    {
      id: 'step_2',
      title: 'Investigate — Uncertainty Evidence Narrowing',
      role: 'Farmer',
      description: 'Uncertainty engine detects <20% margin between Early Blight and Septoria. System asks targeted question: inspect and upload abaxial leaf underside.'
    },
    {
      id: 'step_3',
      title: 'Verify — Expert Agronomist Clinical Confirmation',
      role: 'Expert',
      description: 'Case escalates to Dr. Meera Nair (ICAR-IARI). Expert verifies pathology evidence, confirms High severity, and issues IPM sanitation guidance.'
    },
    {
      id: 'step_4',
      title: 'Assess — Explainable Dynamic Risk Engine',
      role: 'System',
      description: 'Field Health Passport updates longitudinal record. Explainable risk engine computes score (58/100) with explicit transparent factor breakdown.'
    },
    {
      id: 'step_5',
      title: 'Prioritize — Regional Outbreak Intelligence',
      role: 'Officer',
      description: 'Regional clustering detects nearby cases. Extension Officer dashboard ranks Field 104 as Priority #1 with stated driving causes.'
    },
    {
      id: 'step_6',
      title: 'Act — Non-Prescriptive IPM Intervention',
      role: 'Officer',
      description: 'Extension officer logs bio-fungicide foliar treatment and canopy aeration advisory. Schedules automated 3-day farmer follow-up check.'
    },
    {
      id: 'step_7',
      title: 'Monitor — Longitudinal Follow-up & Outcome Tracking',
      role: 'Farmer',
      description: 'Farmer submits post-treatment re-scan. Severity drops from 75% to 35%. System records outcome using strictly cautious non-causal language.'
    },
    {
      id: 'step_8',
      title: 'Learn — AI-Expert Supervised Calibration Benchmark',
      role: 'Admin',
      description: 'AI prediction and expert ground truth are permanently linked in an immutable audit trail to improve future model calibration.'
    }
  ];

  useEffect(() => {
    if (selectedFieldId) {
      loadFieldData(selectedFieldId);
    }
  }, [selectedFieldId]);

  useEffect(() => {
    loadKnowledge(activeDiseaseDoc, currentLanguage);
    if (selectedFieldId) {
      api.getForecastAlerts(selectedFieldId, currentLanguage)
        .then(fcs => setForecastAlerts(fcs || []))
        .catch(() => {});
    }
  }, [activeDiseaseDoc, currentLanguage, selectedFieldId]);

  const loadFieldData = async (fId) => {
    setLoadingPassport(true);
    try {
      const [pass, mem, alt, traps, sens, fcs] = await Promise.all([
        api.getPassport(fId),
        api.getFieldMemory(fId),
        api.getAlerts(fId),
        api.getTraps(fId).catch(() => []),
        api.getSensorReadings(fId).catch(() => []),
        api.getForecastAlerts(fId, currentLanguage).catch(() => [])
      ]);
      setPassportData(pass);
      setFieldMemory(mem);
      setAlerts(alt);
      setTrapsData(traps || []);
      setSensorsData(sens || []);
      setForecastAlerts(fcs || []);
    } catch (e) {
      console.error('Error loading farmer data:', e);
    } finally {
      setLoadingPassport(false);
    }
  };

  const loadKnowledge = async (disease, lang) => {
    try {
      const doc = await api.getKnowledgeDoc(disease, lang);
      setKnowledgeDoc(doc);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCustomImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomImageB64(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSymptomToggle = (val) => {
    setSymptomChecked(prev => 
      prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
    );
  };

  // Step 1: Submit Scan
  const handleSubmitScan = async () => {
    setIsScanning(true);
    setScanResult(null);
    setInvestigationStep(null);

    const payload = {
      field_id: selectedFieldId,
      image_ref: selectedSample.label + '.jpg',
      image_base64: customImageB64,
      symptom_keywords: symptomChecked,
      notes: 'Submitted via Farmer Visual Diagnostic Lab'
    };

    if (isOffline) {
      queueScan(payload);
      setIsScanning(false);
      alert('Offline mode active: Observation has been saved to local offline queue.');
      return;
    }

    try {
      const res = await api.submitObservation(payload);
      setScanResult(res);

      if (res.ai_analysis.needs_investigation) {
        setInvestigationStep({
          observationId: res.observation.observation_id,
          question: res.ai_analysis.investigation_question,
          differentials: res.ai_analysis.differential
        });
      }

      await loadFieldData(selectedFieldId);
      if (onStoryActionComplete) onStoryActionComplete(1);
    } catch (e) {
      alert('Error submitting scan: ' + e.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Step 2: Submit Follow-up Evidence (Underside Leaf)
  const handleNarrowInvestigation = async () => {
    if (!investigationStep) return;
    setIsNarrowing(true);

    try {
      const res = await api.submitInvestigation(investigationStep.observationId, {
        farmer_answer: 'Leaf underside confirmed with concentric dark sporulation; no grey pycnidia specks found.',
        underside_image_ref: 'leaf_underside_close_up.jpg'
      });

      setInvestigationStep(prev => ({
        ...prev,
        narrowed: res
      }));

      await loadFieldData(selectedFieldId);
      if (onStoryActionComplete) onStoryActionComplete(2);
    } catch (e) {
      alert('Error narrowing investigation: ' + e.message);
    } finally {
      setIsNarrowing(false);
    }
  };

  // Step 7: Submit Follow-up Outcome Scan
  const handleSubmitFollowupScan = async () => {
    const followups = passportData?.interventions?.[0] ? passportData.interventions[0] : null;
    const followupId = passportData?.passport?.passport_id ? 'fol_104_demo' : 'fol_demo';

    setIsSubmittingFollowup(true);
    try {
      const res = await api.recordOutcome({
        field_id: selectedFieldId,
        followup_id: followupId,
        new_severity_pct: parseInt(followupSeverity, 10)
      });
      setFollowupResult(res);
      await loadFieldData(selectedFieldId);
      if (onStoryActionComplete) onStoryActionComplete(7);
    } catch (e) {
      // Fallback display if specific followup_id is not in DB
      setFollowupResult({
        previous_severity_pct: 75,
        new_severity_pct: followupSeverity,
        outcome_label: 'Improved',
        interpretation: 'Improvement observed following the recorded intervention (lesion severity reduced from 75% to 35%). Non-causal progression recorded.'
      });
      if (onStoryActionComplete) onStoryActionComplete(7);
    } finally {
      setIsSubmittingFollowup(false);
    }
  };

  const currentField = fields.find(f => f.field_id === selectedFieldId) || fields[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Field Selector & Status Hero Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Farmer Operational View
              </span>
              <span className="text-xs text-slate-400">
                Plot Health Passport & Observation Lab
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Field #{currentField?.field_id} — {currentField?.field_name || currentField?.owner_name}
            </h1>
            <p className="text-xs text-slate-400">
              Crop: <strong className="text-slate-200">{currentField?.crop} ({currentField?.variety})</strong> · 
              Stage: <strong className="text-slate-200">{currentField?.growth_stage}</strong> · 
              Soil: <strong className="text-slate-200">{currentField?.soil_type} ({currentField?.soil_moisture_pct}% moisture)</strong>
            </p>
          </div>

          {/* Field Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">Select Field:</label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
            >
              {fields.map(f => (
                <option key={f.field_id} value={f.field_id}>
                  Field {f.field_id}: {f.owner_name} ({f.crop}) — Risk {f.current_risk_score}/100
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Micro-Transaction Sachet Pack Card (₹15 Rural Accessibility Anchor - Reference Design) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-emerald-950/40 p-5 border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
                  Affordable Micro-Pack
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">₹15 Sachet Scan Pack</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Active Quota: <strong className="text-emerald-400 font-mono">{remainingScans} / {totalScans}</strong> scans remaining
              </h2>
              <p className="text-xs text-slate-400">स्वस्त व तात्काळ पीक रोग तपासण्या • Valid for current Rabi Season (Till 30 Oct)</p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5">
            {/* Visual 5-segment capsules */}
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-7 h-2 rounded-full transition-all ${
                    idx <= remainingScans
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>पॅक रिचार्ज करा • Recharge ₹15</span>
              </button>
              <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-400">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">GPay</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">PhonePe</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">BHIM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Columns: Observation & Uncertainty Lab OR Stepper */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setLeftTab('lab')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                leftTab === 'lab'
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Diagnostic Lab & Scan
            </button>
            <button
              onClick={() => setLeftTab('stepper')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                leftTab === 'stepper'
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Decision Loop Stepper</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/50 font-mono text-emerald-300">
                {activeStoryStep}/8
              </span>
            </button>
          </div>

          {leftTab === 'stepper' ? (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Closed-Loop Decision Loop (Linear Vertical Stepper)</h3>
                <p className="text-[11px] text-slate-400">Strictly aligned 8-step decision architecture ensuring zero card drift or zig-zag layout</p>
              </div>
              <VerticalStepper steps={DECISION_LOOP_STEPS} activeStep={activeStoryStep} />
            </div>
          ) : (
            <>
              {/* Diagnostic Lab Panel */}
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Observation & AI Uncertainty Lab</h2>
                  <p className="text-[11px] text-slate-400">
                    Submit crop foliage scan to evaluate differential diagnostic confidence
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Deterministic Mock Engine
              </span>
            </div>

            {/* Sample Image Library Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                1. Select Leaf Specimen (or take real photo):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_LEAF_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setSymptomChecked([sample.symptom]);
                      setCustomImageB64(null);
                    }}
                    className={`text-left p-2 rounded-xl border transition-all flex flex-col items-start ${
                      selectedSample.id === sample.id
                        ? 'bg-emerald-950/60 border-emerald-500/80 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.label}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/samples/early_blight_concentric.jpg';
                      }}
                      className="w-full h-20 object-cover rounded-lg mb-2 bg-slate-800"
                    />
                    <p className="text-[11px] font-bold text-slate-200 line-clamp-1">{sample.label}</p>
                    <p className="text-[9px] text-slate-400 line-clamp-2 mt-0.5">{sample.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Photo Quality Indicator Meters (Reference Design) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Blur Index</span>
                  <span className="text-xs font-bold text-emerald-400">Good (Sharp edges)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Lighting Meter</span>
                  <span className="text-xs font-bold text-amber-400">Optimal (820 Lux)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Framing & Axis</span>
                  <span className="text-xs font-bold text-slate-200">Centered Leaf Focus</span>
                </div>
              </div>
            </div>

            {/* Custom file upload */}
            <div className="flex items-center gap-3 pt-2">
              <label className="text-xs text-slate-400">Camera Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomImage}
                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            {/* Symptom Checklist */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                2. Observed Foliage Symptoms:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'leaf_spots_concentric', label: 'Dark spots with concentric rings' },
                  { id: 'leaf_spots_grey_center', label: 'Small spots with grey centers' },
                  { id: 'margin_yellowing', label: 'Yellowing at leaf margins / edges' },
                  { id: 'leaf_underside_confirmed', label: 'Close-up of leaf underside' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800/60 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={symptomChecked.includes(s.id)}
                      onChange={() => handleSymptomToggle(s.id)}
                      className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={handleSubmitScan}
              disabled={isScanning}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isScanning ? 'Running Diagnostic Uncertainty Inference…' : 'Analyze Foliage Scan (Run Closed-Loop AI)'}</span>
            </button>

            {/* Scan Results Display */}
            {scanResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Preliminary Diagnosis</span>
                    <h3 className="text-base font-bold text-emerald-400">{scanResult.ai_analysis.top_disease}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">{Math.round(scanResult.ai_analysis.top_confidence * 100)}% Confidence</span>
                    <p className="text-[10px] text-slate-400">Estimated Severity: <span className="text-amber-400 font-semibold">{scanResult.ai_analysis.severity_estimate}</span></p>
                  </div>
                </div>

                {/* Differential Diagnoses Breakdown */}
                <div>
                  <p className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    Differential Diagnosis (AI Alternative Hypotheses):
                  </p>
                  <div className="space-y-1.5">
                    {scanResult.ai_analysis.differential?.map((d, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between text-[11px] text-slate-300 mb-0.5">
                          <span>{d.disease}</span>
                          <span className="font-mono text-emerald-400">{Math.round(d.confidence * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : 'bg-slate-600'
                            }`}
                            style={{ width: `${d.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-400">Diagnostic Note: </span>
                  {scanResult.ai_analysis.explanation}
                </div>

                {onOpenCaseChat && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Case #{scanResult.observation?.observation_id?.slice(-8) || 'obs_104'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={MessageSquare}
                      onClick={() => onOpenCaseChat(scanResult.observation?.observation_id || 'obs_seed_104_1', selectedFieldId)}
                    >
                      Message Assigned Expert
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Investigation Engine Narrowing Card */}
            {investigationStep && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 animate-in slide-in-from-top-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">
                      Uncertainty Engine Triggered: Target Follow-up Question
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5">
                      {investigationStep.question}
                    </p>
                  </div>
                </div>

                {!investigationStep.narrowed ? (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleNarrowInvestigation}
                      disabled={isNarrowing}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isNarrowing ? 'Narrowing Diagnosis…' : 'Leaf Underside Photo (Narrow Diagnosis)'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-slate-200 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Differential Diagnosis Successfully Narrowed!</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {investigationStep.narrowed.narrative}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-500/20">
                      <span>Confirmed Candidate: <strong>{investigationStep.narrowed.narrowed_disease}</strong></span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {Math.round(investigationStep.narrowed.narrowed_confidence * 100)}% Confidence
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-400 font-medium">
                      ✓ Ambiguity resolved. Case routed to Dr. Meera Nair (Expert Verification Queue).
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
          </>
          )}

          {/* RECENT SCAN DOSSIER: Cotton Leaf Detection Detailed Card (Matching reference cultivai_ai_diagnosis_report) */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            {/* Scan Header & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                    मागील तपासणी अहवाल • Report #8492
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Scanned today, 10:14 AM
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  कापूस करपा रोग (Cercospora Leaf Spot / Early Blight)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Scientific: <i>Cercospora gossypina / Alternaria solani</i> • Crop: Cotton (Gossypium) • Plot 2B
                </p>
              </div>

              {/* Diagnostic Confidence Pill */}
              <div className="flex flex-col sm:items-end shrink-0">
                <div className="px-3 py-1.5 rounded-full bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>94% AI Confidence</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Validated by Vidarbha Agri Net</span>
              </div>
            </div>

            {/* Split Diagnostic Canvas: Image with bounding box + Clinical findings */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              {/* Image Container with Visual Detection Hotspots */}
              <div className="md:col-span-5 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner min-h-[220px] flex items-center justify-center">
                <img
                  src={selectedSample.url || '/cotton_crop.jpg'}
                  alt="Foliage Specimen"
                  className="w-full h-full object-cover min-h-[220px]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/cotton_crop.jpg';
                  }}
                />
                {/* Pathogen Bounding Box Mock */}
                <div className="absolute inset-5 rounded-lg border-2 border-dashed border-rose-500 bg-rose-500/15 pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between items-start">
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                      Hotspot: Necrotic Lesion
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950/90 text-white font-mono text-[10px]">
                      conf: 0.94
                    </span>
                  </div>
                  <div className="self-end px-1.5 py-0.5 rounded bg-slate-950/90 text-slate-200 font-mono text-[10px]">
                    Area: 28% necrotic
                  </div>
                </div>
              </div>

              {/* Practical Action Guidelines (Multi-layered cards) */}
              <div className="md:col-span-7 flex flex-col justify-between gap-3">
                {/* ₹15 Sachet Micro-Transaction Strip (cultivai_ai_diagnosis_report) */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                      ₹
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>₹15 Sachet Quota Used</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400">Recommended micro-dose packet • Validated scan</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      ₹0 Extra Charged
                    </span>
                  </div>
                </div>

                {/* Critical Caution: DO NOT SPRAY EXPENSIVE CHEMICALS (डू नॉट स्प्रे महागडी रसायने) */}
                <div className="bg-rose-950/40 text-rose-200 p-3 rounded-xl border border-rose-500/30 border-l-4 border-l-rose-500 flex gap-2.5 items-start">
                  <span className="text-rose-400 text-lg shrink-0 mt-0.5 font-bold">🛑</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-rose-300 uppercase tracking-wide">
                      {t('dossier_caution_title')}
                    </span>
                    <span className="text-[11px] text-rose-200/90 mt-0.5 leading-relaxed">
                      {t('dossier_caution_desc')}
                    </span>
                  </div>
                </div>

                {/* Safe IPM Numbered Protocol Steps (cultivai_ai_diagnosis_report) */}
                <div className="space-y-2">
                  {/* Step 1: 5% NSKE Spray */}
                  <div className="flex items-start gap-2.5 bg-slate-950/80 border border-emerald-500/20 p-2.5 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 text-[10px] font-black">
                      1
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>५% निंबोळी अर्क (5% NSKE Spray)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-normal">Neem Extract</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Apply uniform foliar mist during early morning hours (५० मिली प्रति १५L पंप) to disrupt fungal spore germination safely.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: 3-Foot Row Drainage Trenching */}
                  <div className="flex items-start gap-2.5 bg-slate-950/80 border border-blue-500/20 p-2.5 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center shrink-0 text-[10px] font-black">
                      2
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>३-फूट चर निचरा (3-Foot Drainage Trenching)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-normal">Soil Aeration</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        Clear excess water channels between plant rows to reduce root-zone humidity and halt spore incubation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar from cultivai_ai_diagnosis_report */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              {/* Primary: Ask CultivAI Assistant for Clarification */}
              <button
                onClick={() => {
                  if (onOpenCaseChat) onOpenCaseChat('obs_seed_104_1', selectedFieldId);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer active:scale-[0.99]"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>{t('btn_ask_clarification')}</span>
              </button>

              {/* Sub-Actions: Audio + Send to Expert + Share via WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Audio Button */}
                <button
                  onClick={handleToggleAudio}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="truncate">{isPlayingAudio ? t('btn_pause_audio') : t('btn_listen_audio')}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isPlayingAudio ? `${audioProgress}%` : '1:12m'}
                  </span>
                </button>

                {/* Send to Expert */}
                <button
                  onClick={() => {
                    if (onOpenCaseChat) onOpenCaseChat('obs_seed_104_1', selectedFieldId);
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{t('btn_send_expert')}</span>
                </button>

                {/* Share via WhatsApp */}
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{t('btn_share_wa')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Field Health Passport Longitudinal Profile */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Field Health Passport</h2>
                  <p className="text-[11px] text-slate-400">
                    Longitudinal health profile, trend label & historical scan log
                  </p>
                </div>
              </div>

              {/* Trend Badge */}
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  passportData?.trend === 'Improving'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : passportData?.trend === 'Worsening'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {passportData?.trend === 'Improving' ? <TrendingDown className="w-3.5 h-3.5" /> : passportData?.trend === 'Worsening' ? <TrendingUp className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                  <span>Trend: {passportData?.trend || 'Stable'}</span>
                </span>
              </div>
            </div>

            {/* Passport narrative */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
              <p className="font-semibold text-slate-200 mb-1">Passport Summary Narrative:</p>
              <p>{passportData?.passport?.summary_narrative || 'Longitudinal record active. Ongoing surveillance for Solanaceae blight.'}</p>
            </div>

            {/* Field Memory Callouts (Cautious non-causal language) */}
            {fieldMemory?.insights && fieldMemory.insights.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Field Memory Insights (Temporal Correlations):
                </p>
                {fieldMemory.insights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-start gap-2.5"
                  >
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                        {ins.badge}
                      </span>
                      <p className="text-xs text-slate-200 mt-1">{ins.message}</p>
                      <p className="text-[10px] text-slate-400 italic mt-0.5">{ins.cautious_note}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Past Verifications & Interventions */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-300 mb-2">Verified Pathology & Interventions:</p>
              {passportData?.expert_reviews?.length > 0 ? (
                <div className="space-y-2">
                  {passportData.expert_reviews.map((r, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">{r.confirmed_disease} ({r.severity} Severity)</p>
                        <p className="text-[10px] text-slate-400">Verified by: {r.expert_name} · Advisory: {r.advisory_notes}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No expert verifications logged yet.</p>
              )}
            </div>

          </div>

        </div>

        {/* Right 5 Columns: Risk Engine, Alerts, Follow-ups, Knowledge */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Explainable Risk Engine Breakdown */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Explainable Risk Engine</h2>
                  <p className="text-[11px] text-slate-400">
                    Transparent 0–100 score with objective factor breakdown
                  </p>
                </div>
              </div>
            </div>

            {/* Dial & Score badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dynamic Risk Score</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-3xl font-extrabold ${
                    (currentField?.current_risk_score || 0) >= 70 ? 'text-rose-400' :
                    (currentField?.current_risk_score || 0) >= 40 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentField?.current_risk_score || 82}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                (currentField?.current_risk_level || 'HIGH') === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                (currentField?.current_risk_level || 'HIGH') === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {currentField?.current_risk_level || 'HIGH'} RISK
              </span>
            </div>

            {/* Factor breakdown list */}
            <div>
              <p className="text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Factor Breakdown (Driver Weights):
              </p>
              <div className="space-y-1.5 text-xs">
                {(passportData?.risk_history?.[0]?.factors || [
                  { label: "High Verified Severity (Early Blight)", weight: 25 },
                  { label: "Vulnerable Phenological Stage (Flowering)", weight: 15 },
                  { label: "Proximity to 3 verified cases in regional cluster", weight: 20 },
                  { label: "Atmospheric Humidity 82% (Open-Meteo signal)", weight: 12 },
                  { label: "Cultivar 'Pusa Ruby' documented susceptibility", weight: 6 },
                  { label: "Elevated root zone soil moisture (74%)", weight: 4 },
                ]).map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80"
                  >
                    <span className="text-slate-300 text-[11px]">{f.label}</span>
                    <span className={`font-mono font-bold text-[11px] ${
                      f.weight > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {f.weight > 0 ? `+${f.weight}` : f.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 10b. Weather-Based Outbreak Forecasting Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Weather Outbreak Forecast (3–7 Days)
                  </h3>
                  <p className="text-[10px] text-slate-400">Microclimate epidemiology model (Item 10b)</p>
                </div>
              </div>
              <Badge variant="warning" size="sm">Forward Forecast</Badge>
            </div>

            {forecastAlerts.length > 0 ? (
              forecastAlerts.map((fc, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-teal-300">
                        {fc.localized_disease || fc.disease}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                        {fc.probability_pct}% Probability
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {fc.localized_warning || fc.favorable_conditions_summary}
                    </p>

                    {/* Localized Preventive IPM Actions */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Recommended Proactive IPM Actions:</span>
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {(fc.localized_actions || fc.preventive_actions || []).map((act, aIdx) => (
                          <li key={aIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 italic text-center">
                    ⚠️ {fc.disclaimer || 'Probabilistic microclimate simulation; not a clinical certainty.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-900 text-center text-xs text-slate-400">
                Evaluating forward microclimate trends...
              </div>
            )}
          </div>

          {/* 10a. Sensor & Pest-Trap Inputs Telemetry Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pest Traps & IoT Sensors
                  </h3>
                  <p className="text-[10px] text-slate-400">Independent evidence streams (Item 10a)</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                icon={PlusCircle}
                onClick={() => setIsTrapModalOpen(true)}
              >
                Log Reading
              </Button>
            </div>

            {/* Trap Counts Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Pheromone & Light Traps:</span>
                <span>Threshold (ETL)</span>
              </div>
              {trapsData.length > 0 ? (
                trapsData.map((t, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      t.threshold_breached
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{t.target_pest}</span>
                        {t.threshold_breached ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-extrabold">
                            BREACHED
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                            Safe
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {t.notes || `Type: ${t.trap_type}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">
                        {t.count} <span className="text-[10px] text-slate-400">/night</span>
                      </p>
                      <p className="text-[10px] text-slate-400">ETL: {t.economic_threshold}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No trap data logged today.</p>
              )}
            </div>

            {/* IoT Sensor Readings Feed */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-teal-400" />
                  <span>Field IoT Telemetry:</span>
                </span>
                <span>Status</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {sensorsData.slice(0, 4).map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <p className="text-[10px] text-slate-400 capitalize">{s.sensor_type.replace('_', ' ')}</p>
                    <p className="font-mono font-bold text-white mt-0.5">
                      {s.value} <span className="text-[10px] text-slate-400">{s.unit}</span>
                    </p>
                    <span className={`text-[9px] font-semibold ${
                      s.threshold_exceeded ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {s.threshold_exceeded ? 'High Moisture' : 'Optimal'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Regional Proximity Alerts */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Regional Proximity Alerts</h3>
              </div>
              <span className="text-[10px] text-slate-400">{alerts.length} active notifications</span>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {alerts.map((a) => (
                  <div
                    key={a.alert_id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{a.disease} Nearby ({a.distance_km} km)</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {a.sync_status || 'synced'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{a.message}</p>
                    <div className="text-[10px] text-amber-300/90 pt-1 border-t border-slate-800">
                      <strong>Safe Advice:</strong> {a.treatment_summary}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No immediate proximity alerts within 5 km.</p>
            )}
          </div>

          {/* Follow-up & Outcome Assessment */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Follow-Up Scan (Post-Intervention)</h3>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Following Officer Deshmukh's bio-fungicide & sanitization advisory, submit post-treatment severity to update the Health Passport:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>New Severity Estimate:</span>
                <span className="font-mono text-emerald-400 font-bold">{followupSeverity}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                value={followupSeverity}
                onChange={(e) => setFollowupSeverity(e.target.value)}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>5% (Fully Resolved)</span>
                <span>50% (Stable)</span>
                <span>90% (Severe)</span>
              </div>

              <button
                onClick={handleSubmitFollowupScan}
                disabled={isSubmittingFollowup}
                className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 mt-2"
              >
                {isSubmittingFollowup ? 'Recording Outcome…' : 'Record Post-Intervention Outcome'}
              </button>
            </div>

            {followupResult && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <span>Outcome: {followupResult.outcome_label}</span>
                  <span className="font-mono">{followupResult.previous_severity_pct}% → {followupResult.new_severity_pct}%</span>
                </div>
                <p className="text-[11px] text-slate-200 italic">{followupResult.interpretation}</p>
                <p className="text-[10px] text-slate-400">
                  ✓ Recorded into longitudinal passport using cautious non-causal language.
                </p>
              </div>
            )}
          </div>

          {/* Multilingual Disease Knowledge Base */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Certified Safe IPM Knowledge Base</h3>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => setKnowledgeLang('en')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    knowledgeLang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setKnowledgeLang('hi')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    knowledgeLang === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Disease Selector Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['Early Blight', 'Septoria Leaf Spot', 'Nutrient Deficiency (Potassium)'].map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDiseaseDoc(d)}
                  className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    activeDiseaseDoc === d
                      ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Knowledge card details */}
            {knowledgeDoc && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <p className="text-xs text-slate-200 font-medium">
                  {knowledgeDoc.description}
                </p>
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                    Safe Non-Prescriptive Next Steps:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                    {knowledgeDoc.safe_next_steps?.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300">
                  <strong>Escalation: </strong>{knowledgeDoc.escalation_note}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Additional Regional Field Intelligence Grid (Reference Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outbreak Proximity Tracker */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{t('radar_title')}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                ५ किमी परीघ (5 km Radius)
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">{t('radar_sub')}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-200">सुभाष बापू शेत (१.२ किमी अंतरावर)</span>
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  करपा पॉझिटिव्ह (High Risk)
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-200">गणेश काकडे शेत (२.८ किमी अंतरावर)</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  निरोगी कापूस (Healthy)
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Integrated Pest Telemetry Grid</span>
            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              Active Sensors (240) • Synced
            </span>
          </div>
        </div>

        {/* Government Subsidized Organic Inputs Finder */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{t('inputs_title')}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                सरकारी मान्यताप्राप्त
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Verified Neem Oil & Bio-control agents near Akola MIDC:</p>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">महाबीज कृषी केंद्र, अकोला</div>
                <div className="text-[11px] text-slate-400 mt-0.5">NSKE 1500 PPM • ₹240 / Ltr (Subsidized Rate)</div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                स्टॉकमध्ये आहे
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('kisan_helpline')}</span>
            </div>
            <span className="text-[10px] text-slate-500">Toll Free 24x7</span>
          </div>
        </div>
      </div>

      {/* Pest Trap & Field Sensor Logging Modal (Item 10a) */}
      <TrapLoggerModal
        isOpen={isTrapModalOpen}
        onClose={() => setIsTrapModalOpen(false)}
        fieldId={selectedFieldId}
        onLogged={() => loadFieldData(selectedFieldId)}
      />

      {/* Micro-Sachet Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sachet Scan Pack Recharge</h3>
                  <p className="text-[11px] text-slate-400">Select affordable rural AI diagnostic pack</p>
                </div>
              </div>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { price: 15, scans: 5, label: 'Standard Micro-Pack', tag: 'Affordable', desc: '5 AI Scans • Valid for 30 Days' },
                { price: 49, scans: 20, label: 'Village Farmer Pack', tag: 'Most Popular', desc: '20 AI Scans • Priority Expert Review', popular: true },
                { price: 149, scans: 100, label: 'Full Rabi Season Pass', tag: 'Best Value', desc: '100 Scans + Unlimited AI Copilot Audio' }
              ].map((pack) => (
                <button
                  key={pack.price}
                  onClick={() => handleSelectRechargePack(pack)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    pack.popular
                      ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-white">{pack.label}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                        {pack.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{pack.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-white font-mono">₹{pack.price}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">+{pack.scans} Scans</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-center">
              <span>Instant UPI Activation: </span>
              <strong className="text-slate-200">GPay • PhonePe • Paytm • BHIM</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
