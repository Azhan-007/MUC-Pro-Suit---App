"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FileBadge, Search, CheckCircle2, XCircle, Clock, FileText,
  AlertTriangle, ArrowLeft, Check, X, Printer, ShieldAlert
} from "lucide-react";
import {
  CertificateType, CertificateRequest, CertificateRecord, Student
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface CertificateClientProps {
  initialTypes: CertificateType[];
  initialRequests: CertificateRequest[];
  initialRecords: CertificateRecord[];
  initialHistory: any[];
  students: Student[];
}

type ViewMode = "requests" | "issued";
type RequestStatus = CertificateRequest["status"];

/* ======================== MAIN ======================== */
export function CertificateClient({
  initialTypes, initialRequests, initialRecords, students
}: CertificateClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("requests");
  const router = useRouter();
  const [localRequests, setLocalRequests] = useState<CertificateRequest[]>(initialRequests);
  const [localRecords, setLocalRecords] = useState<CertificateRecord[]>(initialRecords);

  React.useEffect(() => { setLocalRequests(initialRequests); }, [initialRequests]);
  React.useEffect(() => { setLocalRecords(initialRecords); }, [initialRecords]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");

  /* -------- METRICS -------- */
  const metrics = useMemo(() => {
    return {
      pendingRequests: localRequests.filter(r => r.status === "REQUESTED").length,
      approvedRequests: localRequests.filter(r => r.status === "APPROVED").length,
      rejectedRequests: localRequests.filter(r => r.status === "REJECTED").length,
      totalIssued: localRecords.filter(r => r.status === "ISSUED").length,
    };
  }, [localRequests, localRecords]);

  /* -------- FILTERED DATA -------- */
  const filteredRequests = useMemo(() => {
    let list = localRequests.filter(r => r.status === "REQUESTED");
    if (filterType) list = list.filter(r => r.certificateTypeId === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => {
        const s = students.find(x => x.id === r.requesterId);
        return s?.firstName.toLowerCase().includes(q) || 
               s?.lastName.toLowerCase().includes(q) || 
               s?.registrationNumber.toLowerCase().includes(q) ||
               r.purpose.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => new Date(a.requestedDate).getTime() - new Date(b.requestedDate).getTime());
  }, [localRequests, filterType, searchQuery, students]);

  const filteredRecords = useMemo(() => {
    let list = localRecords;
    if (filterType) list = list.filter(r => r.certificateTypeId === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => {
        const s = students.find(x => x.id === r.requesterId);
        return s?.firstName.toLowerCase().includes(q) || 
               s?.lastName.toLowerCase().includes(q) || 
               s?.registrationNumber.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime());
  }, [localRecords, filterType, searchQuery, students]);

  /* -------- ACTIONS -------- */
  const approveMutation = useMutation({
    mutationFn: async (reqId: string) => {
      const res = await apiClient.post(`/certificates/${reqId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (err: any) => {
      alert("Failed to approve certificate: " + (err.response?.data?.error || err.message));
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ reqId, reason }: { reqId: string, reason: string }) => {
      const res = await apiClient.post(`/certificates/${reqId}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (err: any) => {
      alert("Failed to reject certificate: " + (err.response?.data?.error || err.message));
    }
  });

  const handleApprove = (req: CertificateRequest) => {
    approveMutation.mutate(req.id);
  };

  const handleReject = (req: CertificateRequest) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    rejectMutation.mutate({ reqId: req.id, reason });
  };

  /* ========================================================
     RENDER
     ======================================================== */
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Certificate Desk</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and issue official institutional certificates</p>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Requests</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.pendingRequests}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.approvedRequests}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
              <XCircle className="w-4.5 h-4.5 text-rose-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{metrics.rejectedRequests}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileBadge className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Issued</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{metrics.totalIssued}</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
        <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setViewMode("requests")}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === "requests" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setViewMode("issued")}
            className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-md transition-all ${viewMode === "issued" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Issued Certificates
          </button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">All Types</option>
            {initialTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {viewMode === "requests" ? (
          <div>
            {filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No pending certificate requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Requester</th>
                      <th className="px-5 py-3 font-semibold">Certificate Type</th>
                      <th className="px-5 py-3 font-semibold">Purpose</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRequests.map(req => {
                      const type = initialTypes.find(t => t.id === req.certificateTypeId);
                      const stu = students.find(s => s.id === req.requesterId);
                      return (
                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{stu?.firstName} {stu?.lastName}</p>
                            <p className="text-[11px] text-gray-500">{stu?.registrationNumber}</p>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">{type?.name}</p>
                            {type?.requiresFee && <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">₹{type.feeAmount} Fee</span>}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-xs text-gray-600 line-clamp-2">{req.purpose}</p>
                            <p className="text-[10px] text-gray-400 mt-1">Requested: {new Date(req.requestedDate).toLocaleDateString("en-GB")}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleApprove(req)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors tooltip-trigger" title="Approve & Issue">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleReject(req)} className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors tooltip-trigger" title="Reject">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {filteredRecords.length === 0 ? (
              <div className="p-12 text-center">
                <FileBadge className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No issued certificates found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Certificate ID</th>
                      <th className="px-5 py-3 font-semibold">Requester</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Issued Date</th>
                      <th className="px-5 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRecords.map(rec => {
                      const type = initialTypes.find(t => t.id === rec.certificateTypeId);
                      const stu = students.find(s => s.id === rec.requesterId);
                      return (
                        <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-gray-500">{rec.id}</td>
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{stu?.firstName} {stu?.lastName}</p>
                            <p className="text-[11px] text-gray-500">{stu?.registrationNumber}</p>
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-900">{type?.name}</td>
                          <td className="px-5 py-4 text-gray-600">{new Date(rec.issuedDate).toLocaleDateString("en-GB")}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${rec.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
