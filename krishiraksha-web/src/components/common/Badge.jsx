import React from 'react';

export function Badge({
  children,
  variant = 'default', // default | success | warning | danger | info | neutral
  size = 'md', // sm | md
  icon: Icon,
  className = ''
}) {
  const variantStyles = {
    default: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    info: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    neutral: "bg-slate-800 text-slate-300 border-slate-700"
  };

  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 font-semibold uppercase tracking-wider",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium"
  };

  return (
    <span className={`inline-flex items-center rounded-lg border leading-none shrink-0 ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
