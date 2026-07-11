"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useERPStore } from '@/store';
import { ShieldAlert, LogIn, Key, Mail } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setActiveRole = useERPStore((state) => state.setActiveRole);
  const setActiveTab = useERPStore((state) => state.setActiveTab);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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

    if ((user === 'superadmin' || user === 'superadmin@muc.edu') && pass === 'super123') {
      setActiveRole('SUPER_ADMIN');
      setActiveTab('dashboard');
      router.push('/admin');
    } else if ((user === 'masteradmin' || user === 'masteradmin@muc.edu') && pass === 'master123') {
      setActiveRole('MASTER_ADMIN');
      setActiveTab('dashboard');
      router.push('/admin');
    } else if ((user === 'admin' || user === 'admin@muc.edu') && pass === 'admin123') {
      setActiveRole('ADMIN');
      setActiveTab('dashboard');
      router.push('/admin');
    } else {
      setAuthError('Invalid username or password. Please verify the credentials card below.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Real College Logo & Name */}
        <div className="mx-auto h-20 w-20 bg-white border border-slate-200 rounded-full flex items-center justify-center p-1 shadow-md">
          <img 
            src="/logo.png" 
            alt="Mazharul Uloom College Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="mt-4 text-center text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
          Mazharul Uloom College (Autonomous)
        </h2>
        <p className="text-center text-xs text-slate-500 font-semibold tracking-wider uppercase mt-1">
          Ambur, Tamil Nadu
        </p>
        <p className="mt-2 text-center text-xs text-primary font-bold">
          ERP ADMINISTRATIVE CONSOLE
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200/60 rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Username / Email Node
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  {...register('username')}
                  type="text"
                  placeholder="e.g. superadmin"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
              )}
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex gap-2 text-xs text-rose-700 font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-container transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Console'}</span>
            </button>
          </form>

          {/* Test Credentials Helper Card */}
          <div className="mt-8 pt-6 border-t border-slate-200/80">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              Reviewer Test Credentials Card
            </h4>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] space-y-2">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold text-slate-800">Super Administrator:</span>
                <span className="font-mono bg-white px-2 py-0.5 border rounded">superadmin</span>
                <span className="font-mono bg-white px-2 py-0.5 border rounded">super123</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold text-slate-800">Master Manager:</span>
                <span className="font-mono bg-white px-2 py-0.5 border rounded">masteradmin</span>
                <span className="font-mono bg-white px-2 py-0.5 border rounded">master123</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-bold text-slate-800">Operational Officer:</span>
                <span className="font-mono bg-white px-2 py-0.5 border rounded">admin</span>
                <span className="font-mono bg-white px-2 py-0.5 border rounded">admin123</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
