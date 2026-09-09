import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, 
  Stethoscope, 
  ShieldAlert, 
  SlidersHorizontal, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export function AuthView() {
  const { login, signup, demoLogin, forgotPassword, loading } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [identifier, setIdentifier] = useState('farmer@krishiraksha.org');
  const [password, setPassword] = useState('Farmer@123');

  // Signup fields
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('Farmer');

  // Feedback states
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup({
        name,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        role: signupRole
      });
    } catch (err) {
      setError(err.message || 'Signup failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await forgotPassword(identifier);
      setSuccessMessage(res.message || 'Reset instructions dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to process request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoQuickLogin = async (roleName, demoEmail, demoPass) => {
    setError('');
    setSubmitting(true);
    try {
      await demoLogin(roleName);
    } catch (err) {
      // Fallback to standard login
      try {
        await login(demoEmail, demoPass);
      } catch (e2) {
        setError(e2.message || 'Demo login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const DEMO_PRESETS = [
    {
      role: 'Farmer',
      name: 'Ramesh Patil',
      email: 'farmer@krishiraksha.org',
      pass: 'Farmer@123',
      icon: Sprout,
      color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400',
      badge: 'Cultivator',
      desc: 'Plot Health Passport, Ambiguity Engine & Spraying Follow-up'
    },
    {
      role: 'Expert',
      name: 'Dr. Meera Nair',
      email: 'expert@krishiraksha.org',
      pass: 'Expert@123',
      icon: Stethoscope,
      color: 'from-sky-600/20 to-blue-600/20 border-sky-500/30 text-sky-400',
      badge: 'ICAR Agronomist',
      desc: 'Uncertainty Triage Queue, Differential Verification & AI Feedback'
    },
    {
      role: 'Officer',
      name: 'Officer Deshmukh',
      email: 'officer@krishiraksha.org',
      pass: 'Officer@123',
      icon: ShieldAlert,
      color: 'from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400',
      badge: 'District Officer',
      desc: 'Spatial Outbreak Clusters, Time Slider Replay & Inspection Queue'
    },
    {
      role: 'Admin',
      name: 'Rajesh Verma',
      email: 'admin@krishiraksha.gov.in',
      pass: 'Admin@123',
      icon: SlidersHorizontal,
      color: 'from-rose-600/20 to-red-600/20 border-rose-500/30 text-rose-400',
      badge: 'SysOps Admin',
      desc: 'AI-Expert Agreement Matrix, Model Calibration & Audit Logs'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 px-4">
        
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-400/40 mb-4">
          <Sprout className="w-8 h-8 text-slate-950" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Krishi<span className="text-emerald-400">Raksha</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          AI-Powered Closed-Loop Agricultural Decision-Support Platform · <strong className="text-emerald-400">SIH26131</strong>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        
        {/* Main Auth Card */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl">
          
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'login'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'signup'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                mode === 'forgot'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Reset Password
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email or Registered Phone:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="farmer@krishiraksha.org or +91..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Account Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                className="w-full mt-2"
                icon={ArrowRight}
                iconPosition="right"
              >
                Authenticate & Enter Workspace
              </Button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email:</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="name@domain.org"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Phone:</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Role (RBAC):</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Farmer">Farmer (Cultivator)</option>
                  <option value="Expert">Agricultural Expert (ICAR / Agronomist)</option>
                  <option value="Officer">District Extension Officer</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Admin accounts are provisioned via system operations.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Create Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                className="w-full mt-2"
              >
                Register & Issue JWT Token
              </Button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-slate-300">
                Enter your registered email address or phone number. We will dispatch a secure token to reset your credentials.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Identifier:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="user@krishiraksha.org"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setMode('login')}
                  className="flex-1"
                >
                  Back to Sign In
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={submitting}
                  className="flex-1"
                >
                  Dispatch Link
                </Button>
              </div>
            </form>
          )}

        </Card>

        {/* 1-CLICK DEMO LOGIN FOR JUDGES */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Judge 1-Click Evaluation Credentials
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Authenticates Real Bcrypt + JWT</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleDemoQuickLogin(p.role, p.email, p.pass)}
                  disabled={submitting}
                  className={`p-3 rounded-xl border text-left bg-gradient-to-br ${p.color} hover:brightness-110 transition-all cursor-pointer group flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold text-white group-hover:underline">{p.role}</span>
                    </div>
                    <Badge variant="neutral" size="sm">{p.badge}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium line-clamp-2 leading-relaxed">
                    {p.desc}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{p.email}</span>
                    <span className="text-emerald-400 font-sans font-bold flex items-center gap-1">
                      Login <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
