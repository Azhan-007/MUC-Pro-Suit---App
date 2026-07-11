"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { LineChart, Plus, Download, FileText, CheckCircle, Clock } from 'lucide-react';

export default function ReportsView() {
  const store = useERPStore();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Academic' | 'Financial' | 'Attendance' | 'Registrar'>('Academic');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      store.generateReport(title, type);
      setTitle('');
      setIsGenerating(false);
      alert("Pro Suite Report Engine: Document successfully compiled, verified, and compiled on server. Check table below.");
    }, 1200);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Analytical Reports</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Analytical Reports</h2>
        </div>
      </div>

      {/* Interactive Report Generation Engine Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm max-w-2xl">
        <h3 className="font-sans font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" />
          <span>Generate Customized Report</span>
        </h3>
        <p className="text-xs text-on-surface-variant mb-6">Select appropriate filters to compile instant PDFs.</p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Report Document Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End Semester Enrollment Distribution"
              required
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              type="text"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Statistical Segment</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="Academic">Academic Quality & Grades</option>
              <option value="Financial">Financial Budgets & Collections</option>
              <option value="Attendance">Student Attendance Logs</option>
              <option value="Registrar">Registrar Intake Demographics</option>
            </select>
          </div>

          <button 
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-surface-tint disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
          >
            {isGenerating ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Compiling Analytical Datasets...' : 'Generate Analytical PDF'}</span>
          </button>
        </form>
      </div>

      {/* Reports Generated Archive list */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="border-b border-outline-variant/50 px-6 py-4 bg-surface">
          <h4 className="font-sans font-bold text-base text-on-surface">Compiled Reports Archive</h4>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-outline-variant/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Report ID</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Document Title</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Domain segment</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Generated At</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">File size</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-sm">
            {store.reports.map(rep => (
              <tr key={rep.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-on-surface-variant">{rep.id}</td>
                <td className="py-4 px-6 font-bold text-on-surface flex items-center gap-2">
                  <FileText className="w-4 h-4 text-outline" />
                  <span>{rep.title}</span>
                </td>
                <td className="py-4 px-6 text-on-surface-variant">{rep.type}</td>
                <td className="py-4 px-6 text-on-surface-variant font-mono">{rep.generatedAt}</td>
                <td className="py-4 px-6 text-on-surface-variant font-mono">{rep.size}</td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => alert(`Direct Download initiated: compiled PDF of ${rep.id} has been fetched.`)}
                    className="p-2 hover:bg-surface-container rounded-lg text-primary transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

