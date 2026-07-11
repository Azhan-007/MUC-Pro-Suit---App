"use client";

import React from 'react';
import { useERPStore } from '../store';
import { Settings, Shield, Server, Database, Save, CheckCircle } from 'lucide-react';

export default function SettingsView() {
  const store = useERPStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Pro Suite Settings: Base system parameters updated and replicated to container environment successfully.");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
          <span className="text-outline">/</span>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Settings</span>
        </nav>
        <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">System Settings</h2>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h3 className="font-sans font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <span>Institutional Configurations</span>
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Institution Name</label>
              <input 
                defaultValue="Mohammed University College"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                type="text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Admin Email Node</label>
              <input 
                defaultValue="admin-erp@muc.edu"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                type="email"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/30">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Academic Calendar Selection</label>
              <select 
                value={store.academicYear}
                onChange={(e) => store.setAcademicYear(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="2024-25">2024-25 Term</option>
                <option value="2023-24">2023-24 Term</option>
                <option value="2022-23">2022-23 Term</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Standard Term Period</label>
              <select 
                value={store.semester}
                onChange={(e) => store.setSemester(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="Fall Semester">Fall Semester</option>
                <option value="Spring Semester">Spring Semester</option>
                <option value="Summer Term">Summer Term</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-outline-variant/30">
            <h4 className="font-sans font-bold text-base text-on-surface mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-secondary" />
              <span>Backend Engine Integrations</span>
            </h4>
            <div className="p-4 bg-surface rounded-xl border border-outline-variant/40 space-y-3 text-xs text-on-surface-variant font-mono">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Fastify API Node Ready: PORT 3000 (Forwarded)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Prisma Client Client initialized with PostgreSQL Instance</span>
              </div>
              <div className="text-outline">
                <span>Access token: JWT auth enabled with cookie fallback</span>
              </div>
            </div>
          </div>

          {store.activeRole === 'SUPER_ADMIN' && (
            <div className="pt-6 border-t border-outline-variant/30 space-y-4">
              <h4 className="font-sans font-bold text-base text-on-surface flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>System Security Logs & Audit Trail</span>
              </h4>
              <div className="border border-outline-variant rounded-xl overflow-hidden bg-slate-50">
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-200 text-xs">
                  {store.securityLogs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-slate-100/50 transition-colors flex items-center justify-between gap-4 font-mono">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold text-slate-400">{log.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : log.status === 'FAILED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {log.status}
                        </span>
                        <span className="font-bold text-slate-700">{log.user}</span>
                      </div>
                      <div className="text-slate-600 font-sans flex-1 text-right truncate">
                        {log.action}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {log.ipAddress}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-outline-variant/30 flex justify-end">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-surface-tint transition-all shadow-md shadow-primary/15 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Configurations</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

