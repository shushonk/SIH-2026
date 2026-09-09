import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  SlidersHorizontal, 
  Activity, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Clock, 
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';

export function AdminView({ activeStoryStep, onStoryActionComplete }) {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [roleFilter]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, lData, uData] = await Promise.all([
        api.getAdminStats(),
        api.getAuditLogs(roleFilter),
        api.getUsers()
      ]);
      setStats(sData);
      setAuditLogs(lData);
      setUsers(uData);

      if (activeStoryStep === 8 && onStoryActionComplete) {
        onStoryActionComplete(8);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                System Administration & Learning Loop Monitor
              </span>
              <span className="text-xs text-slate-400">Rajesh Verma · System & Model Operations</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Model Calibration, Agreement Metrics & Audit Logs
            </h1>
            <p className="text-xs text-slate-400">
              Tracking closed-loop AI-to-expert feedback, operational health, and immutable audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Calibration Agreement: {stats?.ai_expert_agreement_rate_pct || 85.7}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>AI–Expert Agreement Rate</span>
            <GraduationCap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-emerald-400">
              {stats?.ai_expert_agreement_rate_pct || 85.7}%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {stats?.agreement_count || 6} matches out of {stats?.total_expert_verifications || 7} expert ground-truth calls
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Field Scans</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white">
              {stats?.total_observations || 8}
            </span>
            <span className="text-xs text-slate-400">scans</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Across 6 monitored agricultural plots
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>High Risk Plots</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-rose-400">
              {stats?.high_risk_fields_count || 2}
            </span>
            <span className="text-xs text-slate-400">plots</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Ranked Priority #1 & #2 in inspection queue
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Mean Verification Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-amber-400">
              {stats?.mean_verification_latency_hrs || 3.4}
            </span>
            <span className="text-xs text-slate-400">hours</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            From farmer submission to pathologist sign-off
          </p>
        </div>

      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Columns: Learning Loop Pairs & User Directory */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* AI-Expert Learning Pairs */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  AI–Expert Learning Loop Calibration Pairs
                </h3>
              </div>
            </div>

            <p className="text-[11px] text-slate-300">
              Every pathologist sign-off is paired with the initial AI hypothesis to calibrate model weights:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {stats?.learning_loop_pairs?.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Obs #{p.observation_id}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        p.agreement ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {p.agreement ? 'Agreement Match' : 'Reclassified by Expert'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      AI Hypothesis: <span className="text-slate-200">{p.original_ai_disease} ({Math.round(p.original_ai_confidence * 100)}%)</span> → 
                      Verified: <span className="text-emerald-400 font-semibold">{p.confirmed_disease}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Evaluated by {p.expert_name} · Severity: {p.severity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Directory */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Role-Based User Directory (RBAC)
                </h3>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((u) => (
                <div
                  key={u.user_id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar_url}
                      alt={u.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=059669&color=fff`;
                      }}
                      className="w-8 h-8 rounded-full border border-slate-700 object-cover bg-slate-800"
                    />
                    <div>
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email} · {u.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {u.role_name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 6 Columns: Immutable Audit Log Viewer */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Immutable Platform Audit Log
                </h3>
              </div>

              {/* Role filter dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="">All Actors</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Expert">Expert</option>
                  <option value="Officer">Officer</option>
                  <option value="AI">AI Engine</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Every action taken across the 8-stage decision loop produces an append-only audit record:
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.log_id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">
                      {log.action_type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Actor: <strong className="text-emerald-300">{log.actor_name}</strong> ({log.actor_role}) · 
                    Target: <span className="font-mono text-slate-300">{log.entity_type} #{log.entity_id}</span>
                  </p>

                  {log.details && (
                    <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-slate-400 break-all">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
