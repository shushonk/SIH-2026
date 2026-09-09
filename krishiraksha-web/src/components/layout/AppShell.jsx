import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { api } from '../../services/api';
import { 
  Sprout, 
  Stethoscope, 
  ShieldAlert, 
  SlidersHorizontal, 
  Bot, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Menu, 
  X, 
  CloudSun, 
  Bell, 
  Compass, 
  RefreshCw,
  Sparkles,
  MessageSquare,
  Languages
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export function AppShell({ 
  children, 
  activeViewTitle = 'Dashboard',
  activeViewSubtitle = '',
  onOpenCopilot, 
  onOpenStoryline, 
  onOpenCaseChat,
  currentLanguage = 'en',
  onLanguageChange,
  activeStoryStep = 1 
}) {
  const { user, role, switchRole, logout } = useAuth();
  const { isOffline, setIsOffline, queue, setShowSyncModal } = useOffline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.getUnreadMessageCount();
        if (res?.unread_count !== undefined) {
          setUnreadCount(res.unread_count);
        }
      } catch (e) {
        // silently ignore if unauthenticated or network error
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 6000);
    return () => clearInterval(interval);
  }, []);

  const roleNavItems = [
    { id: 'Farmer', label: 'Farmer Portal', icon: Sprout, description: 'Plot Passport & Scan Lab' },
    { id: 'Expert', label: 'Expert Verification', icon: Stethoscope, description: 'Uncertainty Triage & Ground Truth' },
    { id: 'Officer', label: 'Officer Hotspot Map', icon: ShieldAlert, description: 'Clusters & Inspection Queue' },
    { id: 'Admin', label: 'Admin Console', icon: SlidersHorizontal, description: 'Model Metrics & Audit Trail' },
  ];

  const handleNavClick = (r) => {
    switchRole(r);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      
      {/* 1. PERSISTENT LEFT SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-slate-900/95 border-r border-slate-800 flex-col shrink-0 fixed inset-y-0 left-0 z-30 backdrop-blur-xl">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/cultivai_logo.png" 
              alt="CultivAI Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-emerald-950/40 p-1 border border-emerald-500/30 shadow-lg shadow-emerald-500/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white font-sans">
                  Cultiv<span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SIH26131
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Closed-Loop Decision Platform</p>
            </div>
          </div>
        </div>

        {/* Active Role Card */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Role</span>
            <Badge variant="success" size="sm">{role}</Badge>
          </div>
          <p className="text-xs font-bold text-white mt-1">{user?.name || 'Authorized User'}</p>
          <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Authenticated Session'}</p>
        </div>

        {/* Role Navigation Links */}
        <div className="px-3 py-4 flex-1 space-y-1">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Role Workspaces (RBAC)
            </span>
          </div>

          {roleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = role === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-600/20'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-none truncate">{item.label}</p>
                  <p className={`text-[10px] leading-tight mt-1 truncate ${
                    isActive ? 'text-emerald-950 font-medium' : 'text-slate-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Storyline & Copilot Sidebar Buttons */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {onOpenStoryline && (
            <button
              onClick={onOpenStoryline}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Judge Storyline Bar</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                {activeStoryStep}/8
              </span>
            </button>
          )}

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Copilot (gpt-oss)</span>
              </div>
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            </button>
          )}

          {/* User Account & Logout */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=059669&color=fff`}
                alt={user?.name || 'User'}
                className="w-7 h-7 rounded-full border border-emerald-500/40 object-cover bg-slate-800 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate">{user?.name || 'User'}</p>
                <p className="text-[9px] text-emerald-400 font-mono leading-none">{role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout Session"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* 2. MAIN LAYOUT WRAPPER (Offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Hamburger & Current Page Header */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                  {activeViewTitle}
                </h1>
                <Badge variant="default" size="sm" className="hidden sm:inline-flex">
                  {role} View
                </Badge>
              </div>
              {activeViewSubtitle && (
                <p className="text-[11px] text-slate-400 truncate hidden md:block">{activeViewSubtitle}</p>
              )}
            </div>
          </div>

          {/* Center: Top Quick Role Navigation Pills (Matching Reference Design) */}
          <nav className="hidden xl:flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {roleNavItems.map((item) => {
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-600/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Live Weather Widget */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>Pune: <strong className="text-white">28°C</strong> · 80% RH</span>
            </div>

            {/* Offline Mode Toggle */}
            <button
              onClick={() => {
                if (isOffline && queue.length > 0) {
                  setShowSyncModal(true);
                } else {
                  setIsOffline(!isOffline);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
              {queue.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Multilingual Selector (Item 10c) */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
              <Languages className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                title="Select Interface Language"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
                <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Direct Case Chat Launcher with Unread Badge (Item 10d) */}
            {onOpenCaseChat && (
              <button
                onClick={onOpenCaseChat}
                className="relative p-2 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-800 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                title="Case Consultation Messages"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold hidden md:inline">Case Chat</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* AI Copilot Launcher */}
            {onOpenCopilot && (
              <Button
                size="sm"
                variant="primary"
                icon={Bot}
                onClick={onOpenCopilot}
                className="hidden sm:inline-flex"
              >
                Copilot
              </Button>
            )}

            {/* Logout Mobile/Header Button */}
            <button
              onClick={logout}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </header>

        {/* MOBILE SLIDEOUT DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-slate-950/95 backdrop-blur-xl z-30 p-4 border-t border-slate-800 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Workspace</p>
              {roleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = role === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer ${
                      isActive ? 'bg-emerald-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] opacity-70">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-300">{user?.name} ({role})</span>
              <Button variant="danger" size="sm" icon={LogOut} onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Top Regional Agromet Alert Ticker (Matching Reference Design) */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-b border-amber-500/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="font-bold text-amber-300 truncate">
              अकोला विभाग: कापूस करपा सतर्कता
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[10px] shrink-0">
              उच्च जोखीम (High Risk)
            </span>
            <span className="text-slate-300 hidden md:inline text-[11px] truncate">
              Akola Agromet Advisory: High relative humidity (84%) triggering fungal incubation in Gossypium hirsutum.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300 ml-auto shrink-0">
            <span className="hidden sm:inline">
              स्थानिक हवामान: <strong className="text-white">28°C</strong> • आर्द्रता <strong className="text-white">84%</strong> • वारा <strong className="text-white">12 km/h</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px]">
              Radar Live
            </span>
          </div>
        </div>

        {/* 3. UNIFORM MAIN CONTENT CONTAINER */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

      </div>

    </div>
  );
}
