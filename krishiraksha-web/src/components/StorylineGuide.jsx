import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  Search, 
  CheckCircle2, 
  Calculator, 
  ListOrdered, 
  FileCheck2, 
  Activity, 
  GraduationCap, 
  ChevronRight, 
  RotateCcw, 
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const STORY_STEPS = [
  {
    id: 1,
    loopStage: 'Observe',
    role: 'Farmer',
    title: 'Farmer Submits Ambiguous Scan',
    description: 'Farmer uploads concentric spotted leaf. AI returns 54% Early Blight vs 38% Septoria with uncertainty flag.',
    icon: Eye,
    color: 'emerald'
  },
  {
    id: 2,
    loopStage: 'Investigate',
    role: 'Farmer',
    title: 'Uncertainty Engine Narrows Diagnosis',
    description: 'System requests leaf-underside evidence. Farmer uploads underside; AI narrows diagnosis to 88% Early Blight and escalates.',
    icon: Search,
    color: 'teal'
  },
  {
    id: 3,
    loopStage: 'Verify',
    role: 'Expert',
    title: 'Expert Reviews & Confirms Ground Truth',
    description: 'Dr. Meera Nair reviews differential evidence, confirms Early Blight (High severity), and adds IPM advisory.',
    icon: CheckCircle2,
    color: 'blue'
  },
  {
    id: 4,
    loopStage: 'Assess',
    role: 'Farmer',
    title: 'Field Health Passport & Risk Recalculation',
    description: 'Field 104 Passport updates with worsening trend. Risk Engine computes 82/100 score with explainable factor breakdown.',
    icon: Calculator,
    color: 'amber'
  },
  {
    id: 5,
    loopStage: 'Prioritize',
    role: 'Officer',
    title: 'Officer Queue Ranks Field #1',
    description: 'Extension Officer dashboard ranks Field 104 as Priority #1 with clear driver breakdown and regional cluster map.',
    icon: ListOrdered,
    color: 'orange'
  },
  {
    id: 6,
    loopStage: 'Act',
    role: 'Officer',
    title: 'Officer Logs Intervention',
    description: 'Officer issues bio-fungicide & pruning advisory. System automatically schedules 3-day farmer follow-up.',
    icon: FileCheck2,
    color: 'rose'
  },
  {
    id: 7,
    loopStage: 'Monitor',
    role: 'Farmer',
    title: 'Follow-up Scan Confirms Recovery',
    description: 'Farmer submits post-treatment scan (severity drops 75% -> 35%). Non-causal outcome recorded: "Improvement observed".',
    icon: Activity,
    color: 'purple'
  },
  {
    id: 8,
    loopStage: 'Learn',
    role: 'Admin',
    title: 'AI-Expert Learning Pair Recorded',
    description: 'Verified case is archived into the AI-Expert calibration dataset. Agreement metrics and audit logs update.',
    icon: GraduationCap,
    color: 'emerald'
  }
];

export function StorylineGuide({ isOpen, onClose, currentStep, onSelectStep, onTriggerStepAction, isActionRunning }) {
  const { switchRole } = useAuth();

  if (!isOpen) return null;

  const handleStepClick = (step) => {
    onSelectStep(step.id);
    switchRole(step.role);
  };

  const handleRunCurrentAction = async () => {
    await onTriggerStepAction(currentStep);
    if (currentStep === 8) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const active = STORY_STEPS.find(s => s.id === currentStep) || STORY_STEPS[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 pointer-events-none">
      <div className="max-w-5xl mx-auto glass-panel-glow rounded-2xl p-4 text-slate-100 shadow-2xl pointer-events-auto border border-emerald-500/40 animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Closed-Loop Decision Tour (SIH26131 Core Innovation)
                <span className="text-[10px] font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  Step {currentStep} of 8: {active.loopStage}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Observe → Investigate → Verify → Assess → Prioritize → Act → Monitor → Learn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 8 Step Progress Pipeline */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-4">
          {STORY_STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(s)}
                className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-600/30 border-2 border-emerald-400 text-emerald-200 scale-105 shadow-md shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-slate-800/80 border border-emerald-500/30 text-slate-300'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500 hover:bg-slate-800/40'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  isCurrent ? 'bg-emerald-500 text-slate-950 font-bold' : isCompleted ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold leading-tight">{s.loopStage}</span>
                <span className="text-[9px] text-slate-400 leading-none mt-0.5">{s.role}</span>
              </button>
            );
          })}
        </div>

        {/* Current Active Step Banner & Trigger Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <active.icon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{active.title}</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  Role: {active.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{active.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              onClick={() => {
                const nextStep = currentStep === 8 ? 1 : currentStep + 1;
                handleStepClick(STORY_STEPS.find(s => s.id === nextStep));
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              Skip to Next
            </button>
            <button
              disabled={isActionRunning}
              onClick={handleRunCurrentAction}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30 transition-all disabled:opacity-50"
            >
              {isActionRunning ? (
                <span>Executing live…</span>
              ) : (
                <>
                  <span>Execute Step {currentStep} Live</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
