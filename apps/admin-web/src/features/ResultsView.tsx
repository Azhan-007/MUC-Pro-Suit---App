"use client";

import React from 'react';
import { useERPStore } from '../store';
import { Award, CheckCircle, Search, Trophy, Sparkles } from 'lucide-react';

export default function ResultsView() {
  const store = useERPStore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Academic</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Grades</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Student Academic Results</h2>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-outline-variant/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student ID</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student Name</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Course Program</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Score Marks</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Letter Grade</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Academic Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-sm">
            {store.results.map(res => (
              <tr key={res.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-on-surface-variant">{res.studentId}</td>
                <td className="py-4 px-6 font-bold text-on-surface">{res.studentName}</td>
                <td className="py-4 px-6 text-on-surface-variant">{res.courseName}</td>
                <td className="py-4 px-6 text-on-surface-variant font-mono">{res.marks} / {res.maxMarks}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs border border-primary/20">
                    <Award className="w-3.5 h-3.5" />
                    <span>{res.grade}</span>
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    res.status === 'Pass' 
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                      : 'bg-error/10 text-error border-error/20'
                  }`}>
                    {res.status}
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

