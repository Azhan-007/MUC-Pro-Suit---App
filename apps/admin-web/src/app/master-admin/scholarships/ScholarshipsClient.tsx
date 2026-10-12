"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Award, Search, Plus, CheckCircle2, XCircle, Clock,
  ArrowLeft, Check, X, ShieldAlert, GraduationCap
} from "lucide-react";
import {
  AcademicYear, Semester, Course, Student, Scholarship, StudentFeeAccount
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface ScholarshipsClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  students: Student[];
  initialScholarships: Scholarship[];
  initialFeeAccounts: StudentFeeAccount[];
}

type ViewMode = "list" | "grant";
type ScholarshipStatus = Scholarship["status"];

/* ======================== MAIN ======================== */
export function ScholarshipsClient({
  academicYears, semesters, courses, students,
  initialScholarships, initialFeeAccounts
}: ScholarshipsClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [localScholarships, setLocalScholarships] = useState<Scholarship[]>(initialScholarships);

  // List View State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ScholarshipStatus | "">("");

  // Grant View State
  const [selStudentId, setSelStudentId] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [grantReason, setGrantReason] = useState("");

  /* -------- RESOLVED DATA -------- */
  const activeAy = useMemo(() => academicYears.find(ay => ay.isActive) || academicYears[0], [academicYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive) || semesters[0], [semesters]);

  const filteredScholarships = useMemo(() => {
    let list = localScholarships.filter(s => s.academicYearId === activeAy?.id && s.semesterId === activeSem?.id);
    
    if (filterStatus) list = list.filter(s => s.status === filterStatus);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(sch => {
        const stu = students.find(s => s.id === sch.studentId);
        return stu?.firstName.toLowerCase().includes(q) ||
               stu?.lastName.toLowerCase().includes(q) ||
               stu?.registrationNumber.toLowerCase().includes(q) ||
               sch.reason.toLowerCase().includes(q);
      });
    }
    return list;
  }, [localScholarships, filterStatus, searchQuery, activeAy, activeSem, students]);

  const metrics = useMemo(() => {
    const active = localScholarships.filter(s => s.academicYearId === activeAy?.id && s.semesterId === activeSem?.id);
    return {
      totalAmount: active.filter(s => s.status === "APPROVED").reduce((sum, s) => sum + s.amount, 0),
      approved: active.filter(s => s.status === "APPROVED").length,
      pending: active.filter(s => s.status === "PENDING").length,
      rejected: active.filter(s => s.status === "REJECTED").length,
    };
  }, [localScholarships, activeAy, activeSem]);

  /* -------- ACTIONS -------- */
  const handleStatusUpdate = (id: string, newStatus: ScholarshipStatus) => {
    setLocalScholarships(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleGrantSubmit = () => {
    if (!selStudentId || !grantAmount || isNaN(Number(grantAmount)) || !grantReason || !activeAy || !activeSem) return;
    
    const account = initialFeeAccounts.find(a => a.studentId === selStudentId && a.academicYearId === activeAy.id && a.semesterId === activeSem.id);
    if (!account) {
      alert("No fee account found for this student in the current semester. Cannot grant scholarship.");
      return;
    }

    const newSch: Scholarship = {
      id: `sch-${Date.now()}`,
      studentId: selStudentId,
      studentFeeAccountId: account.id,
      academicYearId: activeAy.id,
      semesterId: activeSem.id,
      amount: Number(grantAmount),
      reason: grantReason,
      status: "APPROVED",
      grantedBy: "masteradmin"
    };

    setLocalScholarships(prev => [newSch, ...prev]);
    setSelStudentId("");
    setGrantAmount("");
    setGrantReason("");
    setViewMode("list");
  };

  /* ========================================================
     RENDER: LIST VIEW
     ======================================================== */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Scholarships & Grants</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage financial aid for {activeAy?.code || "Current Year"} · {activeSem?.term || "Current Sem"}</p>
          </div>
          <button
            onClick={() => setViewMode("grant")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Grant Scholarship
          </button>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Award className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Granted</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{metrics.totalAmount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500 mt-1">Approved only</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.approved}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.pending}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <XCircle className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student or reason..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
          <div className="flex gap-1.5">
            {(["", "APPROVED", "PENDING", "REJECTED"] as const).map(sf => (
              <button
                key={sf || "all"}
                onClick={() => setFilterStatus(sf as ScholarshipStatus | "")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === sf ? "bg-emerald-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
              >
                {sf || "All Statuses"}
              </button>
            ))}
          </div>
        </div>

        {/* Scholarship List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {filteredScholarships.length === 0 ? (
            <div className="p-12 text-center">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No scholarships found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredScholarships.map(sch => {
                const stu = students.find(s => s.id === sch.studentId);
                const crs = courses.find(c => c.id === stu?.courseId);
                
                return (
                  <div key={sch.id} className="w-full px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${sch.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : sch.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{stu?.firstName} {stu?.lastName}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sch.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : sch.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {sch.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{stu?.registrationNumber} · {crs?.code} (Sem {stu?.currentSemester})</p>
                        <p className="text-[11px] text-gray-400">Reason: {sch.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 md:ml-auto">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{sch.amount.toLocaleString("en-IN")}</p>
                      </div>
                      {sch.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusUpdate(sch.id, "APPROVED")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatusUpdate(sch.id, "REJECTED")} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: GRANT VIEW
     ======================================================== */
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => setViewMode("list")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Grant Scholarship</h2>
          <p className="text-xs text-gray-500">Add a financial aid entry to a student&apos;s fee account</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Select Student *</label>
          <select 
            value={selStudentId} 
            onChange={e => setSelStudentId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Search / Select Student...</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.registrationNumber} - {s.firstName} {s.lastName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Scholarship Amount (₹) *</label>
          <input
            type="number"
            min="1"
            value={grantAmount}
            onChange={e => setGrantAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Reason / Justification *</label>
          <textarea
            rows={3}
            value={grantReason}
            onChange={e => setGrantReason(e.target.value)}
            placeholder="e.g. Merit-based, sports quota, or management concession..."
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
          />
        </div>

        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-amber-200">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Granting a scholarship will automatically reduce the student&apos;s net payable fee amount in their fee account for the current semester.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleGrantSubmit}
            disabled={!selStudentId || !grantAmount || !grantReason}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm & Grant
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}



