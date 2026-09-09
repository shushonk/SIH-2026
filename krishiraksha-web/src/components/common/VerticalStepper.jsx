import React from 'react';
import { Check, CircleDot, Circle } from 'lucide-react';

export function VerticalStepper({ steps = [], activeStep = 1, onStepClick, className = '' }) {
  return (
    <div className={`space-y-0 relative ${className}`}>
      {steps.map((step, idx) => {
        const stepNumber = idx + 1;
        const isCompleted = stepNumber < activeStep;
        const isCurrent = stepNumber === activeStep;
        const isPending = stepNumber > activeStep;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id || idx} className="relative flex items-start gap-4 pb-6 group">
            
            {/* Continuous Vertical Rail Line */}
            {!isLast && (
              <div
                className={`absolute left-[17px] top-[34px] w-[2px] bottom-0 transition-colors duration-300 ${
                  isCompleted ? 'bg-emerald-500/60' : 'bg-slate-800'
                }`}
              />
            )}

            {/* Stepper Node Indicator */}
            <div className="relative z-10 shrink-0">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(stepNumber)}
                disabled={!onStepClick}
                className={`w-[36px] h-[36px] rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-200 border ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-emerald-600 text-slate-950 border-emerald-400 shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-950 scale-105'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                } ${onStepClick ? 'cursor-pointer hover:border-slate-700' : 'cursor-default'}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </button>
            </div>

            {/* Step Card Container (Strictly Uniform Width & Alignment) */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div
                className={`rounded-2xl border transition-all duration-200 p-4 ${
                  isCurrent
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Step {stepNumber}
                    </span>
                    {step.role && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                        {step.role}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isCurrent
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Queued'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white tracking-tight">
                  {step.title}
                </h4>

                {step.description && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                )}

                {/* Optional Custom Slot Content within Step Card */}
                {step.content && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    {step.content}
                  </div>
                )}
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
