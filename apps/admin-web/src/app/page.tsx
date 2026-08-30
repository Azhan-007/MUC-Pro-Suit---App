"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useERPStore } from '@/store';
import { ShieldAlert, LogIn, Key, Mail, Eye, EyeOff, Copy, Check, Lock, Sparkles, Building2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or Email is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setActiveRole = useERPStore((state) => state.setActiveRole);
  const setActiveTab  = useERPStore((state) => state.setActiveTab);
  
  const [authError, setAuthError]       = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField]   = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    setAuthError(null);
    const user = data.username.toLowerCase().trim();
    const pass = data.password;

    if ((user === 'masteradmin' || user === 'masteradmin@muc.edu') && pass === 'master123') {
      setActiveRole('MASTER_ADMIN');
      setActiveTab('dashboard');
      router.push('/admin');
    } else if ((user === 'superadmin' || user === 'superadmin@muc.edu') && pass === 'super123') {
      setActiveRole('SUPER_ADMIN');
      setActiveTab('dashboard');
      router.push('/admin');
    } else if ((user === 'admin' || user === 'admin@muc.edu') && pass === 'admin123') {
      setActiveRole('ADMIN');
      setActiveTab('dashboard');
      router.push('/admin');
    } else {
      setAuthError('Invalid credentials. Please use Quick Fill to load Master Admin test details.');
    }
  };

  const handleFillMasterAdmin = () => {
    setValue('username', 'masteradmin', { shouldValidate: true });
    setValue('password', 'master123',   { shouldValidate: true });
    setAuthError(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-50 overflow-hidden relative font-sans selection:bg-primary/20 flex flex-col justify-between">
      
      {/* ── Keyframe Animations for Modern Grid & Floating Particles ──────── */}
      <style jsx global>{`
        @keyframes modernGridMotion {
          0%   { background-position: 0px 0px; }
          100% { background-position: 48px 48px; }
        }
        @keyframes softAmbientPulse {
          0%   { transform: translate3d(0px, 0px, 0px) scale(1); opacity: 0.5; }
          50%  { transform: translate3d(30px, -20px, 0px) scale(1.05); opacity: 0.8; }
          100% { transform: translate3d(0px, 0px, 0px) scale(1); opacity: 0.5; }
        }
        @keyframes particleFloat1 {
          0%   { transform: translate3d(0px, 0px, 0px); opacity: 0.2; }
          50%  { transform: translate3d(25px, -45px, 0px); opacity: 0.7; }
          100% { transform: translate3d(0px, 0px, 0px); opacity: 0.2; }
        }
        @keyframes particleFloat2 {
          0%   { transform: translate3d(0px, 0px, 0px); opacity: 0.3; }
          50%  { transform: translate3d(-30px, -60px, 0px); opacity: 0.8; }
          100% { transform: translate3d(0px, 0px, 0px); opacity: 0.3; }
        }
        .bg-animate-modern-grid {
          animation: modernGridMotion 30s linear infinite;
        }
        .bg-animate-soft-orb {
          animation: softAmbientPulse 22s ease-in-out infinite;
        }
        .bg-animate-particle-1 {
          animation: particleFloat1 16s ease-in-out infinite;
        }
        .bg-animate-particle-2 {
          animation: particleFloat2 22s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .bg-animate-modern-grid, .bg-animate-soft-orb, .bg-animate-particle-1, .bg-animate-particle-2 {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Layer 1: Crisp Clean White Base Surface ────────────────────── */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />

      {/* ── Layer 2: Modern Shifting Grid Lines (Light Slate Tones) ────── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e135_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e135_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none opacity-80 bg-animate-modern-grid" />

      {/* ── Layer 3: Soft Floating Light Gradient Orbs ─────────────────── */}
      <div className="absolute top-[10%] left-[8%] w-[480px] h-[480px] bg-primary/8 rounded-full blur-[110px] pointer-events-none bg-animate-soft-orb" />
      <div className="absolute bottom-[10%] right-[8%] w-[520px] h-[520px] bg-sky-400/8 rounded-full blur-[130px] pointer-events-none bg-animate-soft-orb" style={{ animationDelay: '-11s' }} />

      {/* ── Layer 4: Ambient Animated Particles & Circles ───────────────── */}
      <div className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-primary/30 blur-xs pointer-events-none bg-animate-particle-1" />
      <div className="absolute top-[65%] left-[25%] w-2.5 h-2.5 rounded-full bg-sky-500/40 blur-xs pointer-events-none bg-animate-particle-2" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-[35%] right-[20%] w-3.5 h-3.5 rounded-full bg-blue-600/30 blur-xs pointer-events-none bg-animate-particle-1" style={{ animationDelay: '-8s' }} />
      <div className="absolute top-[75%] right-[35%] w-2 h-2 rounded-full bg-primary/40 blur-xs pointer-events-none bg-animate-particle-2" style={{ animationDelay: '-12s' }} />
      <div className="absolute top-[15%] right-[40%] w-2.5 h-2.5 rounded-full bg-indigo-500/30 blur-xs pointer-events-none bg-animate-particle-1" style={{ animationDelay: '-6s' }} />
      <div className="absolute bottom-[20%] left-[45%] w-3 h-3 rounded-full bg-sky-400/35 blur-xs pointer-events-none bg-animate-particle-2" style={{ animationDelay: '-10s' }} />

      {/* ── Main Viewport Content Container ───────────────────────────── */}
      <main className="relative z-10 flex-1 h-full w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between p-4 sm:p-6 lg:p-10 gap-6 lg:gap-12 min-h-0 overflow-hidden">
        
        {/* ── LEFT COLUMN: Institutional Hero Branding (~54% Desktop) ──── */}
        <div className="w-full lg:w-[54%] flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-4 lg:space-y-6 motion-reduce:animate-none animate-in fade-in-0 slide-in-from-left-6 duration-700 shrink">
          
          {/* College Seal Logo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 p-2.5 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300">
            <img 
              src="/logo.png" 
              alt="Mazharul Uloom College Seal" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Primary Hero Typography */}
          <div className="space-y-1 max-w-xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Mazharul Uloom College
            </h1>
            <p className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-500 tracking-wide">
              (Autonomous)
            </p>
          </div>

          {/* Institutional Metadata: Location & NAAC Accreditation */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Re-accredited by NAAC
            </p>
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Ambur, Tamil Nadu · Est. 1969
            </p>
          </div>

          {/* Subtle Institutional Features Divider */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-200/80 w-full max-w-md">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold text-slate-700">Unified Academic ERP</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="font-semibold text-slate-700">Master Admin Control</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Refined Authentication Workspace (~46% Desktop) */}
        <div className="w-full lg:w-[46%] max-w-md mx-auto lg:mx-0 flex flex-col justify-center min-h-0 motion-reduce:animate-none animate-in fade-in-0 slide-in-from-right-6 duration-700 delay-100 shrink">
          
          <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-200/70 space-y-4">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider leading-tight">
                    Secure Sign-In
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold">Protected Institutional Session</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                System Active
              </span>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
              
              {/* Username Field */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 select-none">
                  Username / Email Node <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    {...register('username')}
                    type="text"
                    autoComplete="username"
                    placeholder="e.g. masteradmin"
                    className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 select-none">
                  Secure Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-9 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Auth Error Banner */}
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 font-semibold animate-in fade-in-0 duration-150">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10.5 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-primary/95 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10 active:scale-[0.99] duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Console'}</span>
              </button>
            </form>

            {/* ── Compact Master Admin Test Access Strip ────────────────── */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Master Admin Test Access
                </span>
                <button
                  type="button"
                  onClick={handleFillMasterAdmin}
                  className="px-2.5 py-0.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md text-[10px] font-bold transition-all cursor-pointer active:scale-95 whitespace-nowrap shadow-3xs"
                  title="Auto-fill Master Admin credentials"
                  aria-label="Auto-fill Master Admin credentials"
                >
                  Quick Fill
                </button>
              </div>

              <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/90 text-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-800 truncate text-xs">Master Manager</p>
                  <p className="text-[9px] text-slate-500 font-mono">MASTER_ADMIN</p>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] shrink-0">
                  <div className="bg-white px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                    <span className="text-slate-700 font-semibold">masteradmin</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('masteradmin', 'user')}
                      className="text-slate-400 hover:text-slate-700 ml-0.5 cursor-pointer"
                      title="Copy username"
                      aria-label="Copy username"
                    >
                      {copiedField === 'user' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="bg-white px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                    <span className="text-slate-700 font-semibold">master123</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('master123', 'pass')}
                      className="text-slate-400 hover:text-slate-700 ml-0.5 cursor-pointer"
                      title="Copy password"
                      aria-label="Copy password"
                    >
                      {copiedField === 'pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* ── Footer Bar ────────────────────────────────────────────────── */}
      <footer className="relative z-10 py-2.5 px-4 text-center border-t border-slate-200/60 bg-white/50 backdrop-blur-xs">
        <p className="text-[10px] text-slate-400 font-semibold">
          Mazharul Uloom College (Autonomous) · ERP Administrative Console © 2026
        </p>
      </footer>

    </div>
  );
}
