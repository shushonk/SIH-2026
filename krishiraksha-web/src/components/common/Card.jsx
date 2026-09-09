import React from 'react';

export function Card({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  badge, 
  action, 
  className = '',
  headerClassName = '',
  bodyClassName = ''
}) {
  return (
    <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl transition-all duration-200 ${className}`}>
      {(title || subtitle || Icon || badge || action) && (
        <div className={`px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && <div>{badge}</div>}
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}
