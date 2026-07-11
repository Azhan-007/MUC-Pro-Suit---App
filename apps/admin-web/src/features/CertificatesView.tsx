"use client";

import React from 'react';
import { useERPStore } from '../store';
import { FolderLock, Award, CheckCircle, Download, FileText, Plus } from 'lucide-react';

export default function CertificatesView() {
  const store = useERPStore();

  const handleGenerateCert = (cert: typeof store.certificates[0]) => {
    alert(`Certificate generated: Document verified and compiled as PDF for ${cert.studentName}. Direct download initialized.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Certificates</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Student Credentials & Certificates</h2>
        </div>
        <button 
          onClick={() => {
            store.addCertificate({
              studentName: prompt("Enter student name for degree clearance:") || "Jane Doe",
              type: "Academic Clearance Letter",
              issueDate: new Date().toISOString().split('T')[0],
              status: "Generated"
            });
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Provision Certificate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {store.certificates.map(cert => (
          <div key={cert.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <FolderLock className="w-5 h-5" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  cert.status === 'Generated' 
                    ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                }`}>
                  {cert.status}
                </span>
              </div>

              <h4 className="font-bold text-lg text-on-surface mb-1">{cert.type}</h4>
              <p className="text-sm text-on-surface-variant mb-2">Student Name: {cert.studentName}</p>
              <p className="text-xs text-outline font-mono">Date Assigned: {cert.issueDate}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/30 flex justify-between items-center gap-2">
              <div className="text-xs">
                {cert.status === 'Pending Approval' && (
                  store.activeRole === 'ADMIN' ? (
                    <span className="text-slate-400 font-semibold italic">Requires managerial review</span>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => store.updateCertificateStatus(cert.id, 'Generated')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => store.updateCertificateStatus(cert.id, 'Requested')}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )
                )}
              </div>
              <button 
                onClick={() => handleGenerateCert(cert)}
                disabled={cert.status === 'Pending Approval'}
                className={`flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:bg-surface-tint transition-all shadow-sm ${
                  cert.status === 'Pending Approval' ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Verify & Export</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

