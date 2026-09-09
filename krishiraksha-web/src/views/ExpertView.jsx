import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Stethoscope, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Send,
  History,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

export function ExpertView({ activeStoryStep, onStoryActionComplete, onOpenCaseChat }) {
  const [pendingCases, setPendingCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(false);

  // Review form state
  const [confirmedDisease, setConfirmedDisease] = useState('Early Blight');
  const [severity, setSeverity] = useState('High');
  const [clinicalComments, setClinicalComments] = useState('Concentric bullseye rings verified on lower canopy; sporulation confirmed on underside evidence.');
  const [advisoryNotes, setAdvisoryNotes] = useState('Prune lower 25cm foliage, avoid overhead wetting, apply approved Trichoderma foliar bio-barrier.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState(null);

  // Review history
  const [reviewHistory, setReviewHistory] = useState([]);

  useEffect(() => {
    loadQueue();
    loadHistory();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const data = await api.getPendingCases();
      setPendingCases(data);
      if (data.length > 0 && !selectedCase) {
        setSelectedCase(data[0]);
        setConfirmedDisease(data[0].top_disease || 'Early Blight');
      }
    } catch (e) {
      console.error('Failed to load expert queue:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const history = await api.getExpertHistory();
      setReviewHistory(history);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectCase = (c) => {
    setSelectedCase(c);
    setConfirmedDisease(c.top_disease || 'Early Blight');
    setSeverity(c.severity_estimate === 'Medium' ? 'High' : (c.severity_estimate || 'High'));
    setVerificationFeedback(null);
  };

  const handleSubmitVerification = async (decision = 'confirmed') => {
    if (!selectedCase) return;
    setIsSubmitting(true);
    setVerificationFeedback(null);

    try {
      const payload = {
        observation_id: selectedCase.observation_id,
        confirmed_disease: confirmedDisease,
        severity: severity,
        comments: clinicalComments,
        advisory_notes: advisoryNotes,
        expert_name: 'Dr. Meera Nair',
        action_decision: decision
      };

      const res = await api.submitExpertReview(payload);
      setVerificationFeedback(res);

      await loadQueue();
      await loadHistory();

      if (onStoryActionComplete) onStoryActionComplete(3);
    } catch (e) {
      alert('Error submitting expert verification: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Command Toolbar & Header Banner (Matching Reference Design) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/expert_headshot.png"
              alt="Dr. Meera Nair"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10 shrink-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://ui-avatars.com/api/?name=Dr+Meera+Nair&background=059669&color=fff';
              }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                  CultivAI Expert Desk
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                  Level-3 Agronomist Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Central Agricultural University & Regional Epidemiology Validation Unit • Dr. Meera Nair (Lead Pathologist)
              </p>
            </div>
          </div>

          {/* Quick Status Badges and Counter */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{pendingCases.length > 0 ? pendingCases.length : 12} Pending Scans</span>
              <span className="font-normal text-rose-200">requiring validation</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SLA Target: &lt; 20m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Columns: Pending Cases List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-xl">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-400" />
              Prioritized by Diagnostic Uncertainty
            </h2>

            {loading ? (
              <p className="text-xs text-slate-400 italic py-4">Loading clinical triage queue…</p>
            ) : pendingCases.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-200">No Pending Triage Cases</p>
                <p className="mt-1">All ambiguous scans have been verified by expert plant pathologists.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
                {pendingCases.map((c) => {
                  const isSelected = selectedCase?.observation_id === c.observation_id;
                  return (
                    <div
                      key={c.observation_id}
                      onClick={() => handleSelectCase(c)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Field #{c.field_id} ({c.owner_name})
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Uncertainty: {Math.round((c.uncertainty_score || 0.45) * 100)}%
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 mt-1.5 flex items-center justify-between">
                        <span>AI Prediction: <strong className="text-emerald-400">{c.top_disease}</strong></span>
                        <span className="font-mono text-slate-400">{Math.round((c.top_confidence || 0.5) * 100)}%</span>
                      </div>

                      {/* Evidence tag */}
                      <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                        {c.inv_status === 'completed' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Underside Evidence Received
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Investigation Awaiting Evidence
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 7 Columns: Clinical Verification Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCase ? (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-5">
              
              {/* Workspace Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Clinical Case Examination</span>
                  <h2 className="text-base font-bold text-white">
                    Observation #{selectedCase.observation_id} — Field {selectedCase.field_id}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedCase.crop} ({selectedCase.variety}) · Growth Stage: {selectedCase.growth_stage}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenCaseChat && (
                    <button
                      onClick={() => onOpenCaseChat(selectedCase.observation_id, selectedCase.field_id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Direct message conversation with farmer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Message Farmer</span>
                    </button>
                  )}
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    Risk Score: {selectedCase.current_risk_score}/100
                  </span>
                </div>
              </div>

              {/* Side-by-Side: Initial AI vs Farmer Underside Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    AI Differential Hypothesis:
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {selectedCase.explanation || 'Concentric lesion morphology sharing margins with Septoria.'}
                  </p>
                  <div className="space-y-1 pt-1">
                    {selectedCase.differential?.map((d, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span className="text-slate-300">{d.disease}</span>
                        <span className="font-mono text-emerald-400 font-bold">{Math.round(d.confidence * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Farmer Investigation Evidence:
                  </p>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p><strong>Prompt:</strong> {selectedCase.question_prompt || 'Upload leaf underside close-up.'}</p>
                    <p><strong>Farmer Response:</strong> <span className="text-emerald-300 font-medium">{selectedCase.farmer_answer || 'Leaf underside close-up attached.'}</span></p>
                    {selectedCase.narrowed_disease && (
                      <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-[10px] text-emerald-300">
                        ✓ Differential Narrowed to: <strong>{selectedCase.narrowed_disease} ({Math.round(selectedCase.narrowed_confidence * 100)}%)</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expert Validation Form */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pathologist Final Diagnosis & Severity Assessment
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Confirmed Pathogen / Disease:</label>
                    <select
                      value={confirmedDisease}
                      onChange={(e) => setConfirmedDisease(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 font-medium focus:border-emerald-500"
                    >
                      <option>Early Blight</option>
                      <option>Septoria Leaf Spot</option>
                      <option>Nutrient Deficiency (Potassium)</option>
                      <option>Tomato Leaf Mold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Assessed Severity:</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 font-medium focus:border-emerald-500"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>Medium-High</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Clinical Diagnostic Comments:</label>
                  <textarea
                    rows={2}
                    value={clinicalComments}
                    onChange={(e) => setClinicalComments(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Extension Advisory (Safe Non-Prescriptive Guidance):</label>
                  <textarea
                    rows={2}
                    value={advisoryNotes}
                    onChange={(e) => setAdvisoryNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg p-2 focus:border-emerald-500"
                  />
                </div>

                {/* Submit Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleSubmitVerification('confirmed')}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Recording Verification…' : 'Confirm Pathology & Recalculate Risk'}</span>
                  </button>

                  <button
                    onClick={() => handleSubmitVerification('overruled')}
                    disabled={isSubmitting}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Overrule initial AI diagnosis"
                  >
                    Overrule AI Call
                  </button>
                </div>
              </div>

              {/* Real-time Verification Feedback Banner */}
              {verificationFeedback && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      AI–Expert Learning Pair Successfully Logged!
                    </span>
                    <span className="font-mono">Agreement: {verificationFeedback.agreement ? 'MATCH (100%)' : 'RECLASSIFIED'}</span>
                  </div>
                  <p className="text-slate-200">
                    Field #{selectedCase.field_id} risk score recalculated to <strong>{verificationFeedback.risk_assessment?.score}/100 ({verificationFeedback.risk_assessment?.level})</strong>.
                  </p>
                  <p className="text-amber-300">
                    ✓ Regional alerts dispatched to {verificationFeedback.alerts_broadcast?.length || 2} nearby farm(s).
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-xs text-slate-400">
              Select a pending case from the queue on the left to begin clinical verification.
            </div>
          )}

          {/* AI-Expert Learning Loop Registry */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI–Expert Learning Loop Registry</h3>
              </div>
              <span className="text-[10px] text-slate-400">{reviewHistory.length} verified pairs on file</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2">Field</th>
                    <th className="py-2">AI Initial Diagnosis</th>
                    <th className="py-2">Expert Confirmed</th>
                    <th className="py-2">Agreement</th>
                    <th className="py-2">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reviewHistory.map((r, i) => (
                    <tr key={i} className="text-slate-300">
                      <td className="py-2 font-bold text-white">#{r.field_id}</td>
                      <td className="py-2">{r.original_ai_disease} ({Math.round(r.original_ai_confidence * 100)}%)</td>
                      <td className="py-2 font-semibold text-emerald-400">{r.confirmed_disease}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.agreement ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {r.agreement ? 'Agreed' : 'Modified'}
                        </span>
                      </td>
                      <td className="py-2 font-mono">{r.severity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
