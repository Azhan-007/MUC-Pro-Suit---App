"use client";

import React from 'react';
import { useERPStore } from '../store';
import { Briefcase, Building2, TrendingUp, Sparkles, Star } from 'lucide-react';

export default function PlacementsView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Placements</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Placement Statistics</h2>
        </div>
      </div>

      {/* Stats and Placement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-outline tracking-wider">Placement Rate</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">94.8%</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 flex items-center justify-center rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-outline tracking-wider">Highest Package</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">$120,000</h3>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-amber-600 flex items-center justify-center rounded-xl">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-outline tracking-wider">Partner Companies</p>
            <h3 className="text-3xl font-extrabold text-on-surface mt-1">84+ Recruiters</h3>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-outline-variant/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student Name</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Hiring Partner</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Position Offer</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Package Offered</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Offer Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-sm">
            {store.placements.map(plc => (
              <tr key={plc.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 font-bold text-on-surface">{plc.studentName}</td>
                <td className="py-4 px-6 font-medium text-on-surface-variant flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-outline" />
                  <span>{plc.company}</span>
                </td>
                <td className="py-4 px-6 text-on-surface-variant">{plc.position}</td>
                <td className="py-4 px-6 font-bold text-on-surface">{plc.salaryPackage}</td>
                <td className="py-4 px-6 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-xs font-bold border border-emerald-500/20">
                    {plc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

