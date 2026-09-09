import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary', // primary | secondary | outline | danger | warning | ghost
  size = 'md', // sm | md | lg
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-600/20 focus:ring-emerald-500",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 focus:ring-slate-500",
    outline: "bg-transparent hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 focus:ring-slate-500",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 focus:ring-rose-500",
    warning: "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 focus:ring-amber-400",
    ghost: "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white"
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-xs px-4 py-2.5 gap-2",
    lg: "text-sm px-5 py-3 gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-3.5 h-3.5 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-3.5 h-3.5 shrink-0" />}
        </>
      )}
    </button>
  );
}
