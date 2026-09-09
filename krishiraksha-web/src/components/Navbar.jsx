import React from 'react';
import { useAuth, ROLE_DETAILS } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import { 
  Sprout, 
  Stethoscope, 
  ShieldAlert, 
  SlidersHorizontal, 
  Wifi, 
  WifiOff, 
  Bot, 
  Layers, 
  RefreshCw 
} from 'lucide-react';

export function Navbar({ onOpenCopilot, onOpenStoryline, activeStoryStep }) {
  const { role, switchRole, roleDetails, backendConnected, checkConnection } = useAuth();
  const { isOffline, setIsOffline, queue, setShowSyncModal } = useOffline();

  const roleIcons = {
    Farmer: Sprout,
    Expert: Stethoscope,
    Officer: ShieldAlert,
    Admin: SlidersHorizontal
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Cultiv<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SIH26131
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Closed-Loop Agricultural Decision-Support Platform
              </p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="hidden md:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            {Object.keys(ROLE_DETAILS).map((r) => {
              const Icon = roleIcons[r];
              const isActive = role === r;
              return (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{r}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* 1-Click Interactive Demo Tour Launcher */}
            <button
              onClick={onOpenStoryline}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors shadow-sm"
              title="Open the step-by-step SIH Hackathon Demo Tour"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Demo Tour</span>
              {activeStoryStep > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                  {activeStoryStep}
                </span>
              )}
            </button>

            {/* Grounded Copilot Launcher */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-sm group"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={() => {
                const next = !isOffline;
                setIsOffline(next);
                if (!next && queue.length > 0) {
                  setShowSyncModal(true);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                isOffline
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={isOffline ? "Currently in Simulated Offline Mode" : "Click to simulate offline field connectivity"}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
              {queue.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Backend connection indicator */}
            <div
              onClick={checkConnection}
              className="cursor-pointer flex items-center"
              title={backendConnected ? "Connected to FastAPI backend (localhost:8000)" : "Backend connection error"}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  backendConnected === true
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500'
                    : backendConnected === false
                    ? 'bg-rose-500 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
            </div>

            {/* Active User Avatar Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={roleDetails?.avatar}
                alt={roleDetails?.name || 'User'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(roleDetails?.name || 'User')}&background=059669&color=fff`;
                }}
                className="w-8 h-8 rounded-full border border-emerald-500/40 object-cover bg-slate-800"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-none">{roleDetails?.name}</p>
                <p className="text-[10px] text-emerald-400 font-medium leading-none mt-1">{role}</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile role switcher bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 px-2 py-2 border-t border-slate-800">
        {Object.keys(ROLE_DETAILS).map((r) => {
          const Icon = roleIcons[r];
          const isActive = role === r;
          return (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs ${
                isActive ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{r}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
