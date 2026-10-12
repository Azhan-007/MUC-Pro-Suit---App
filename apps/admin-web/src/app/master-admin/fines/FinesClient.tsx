"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle, Search, Plus, Filter, AlertCircle, CheckCircle2,
  XCircle, Clock, ArrowLeft, ShieldAlert, GraduationCap, X
} from "lucide-react";
import {
  AcademicYear, Semester, Course, Student, Fine, StudentFeeAccount,
  AttendanceSummary
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface FinesClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  students: Student[];
  initialFines: Fine[];
  initialFeeAccounts: StudentFeeAccount[];
  attendanceSummaries: AttendanceSummary[];
}

type ViewMode = "list" | "apply";
type FineStatus = Fine["status"];
type FineSource = Fine["source"];

/* ======================== MAIN ======================== */
export function FinesClient({
  academicYears, semesters, courses, students,
  initialFines, initialFeeAccounts, attendanceSummaries
}: FinesClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [localFines, setLocalFines] = useState<Fine[]>(initialFines);

  // List View State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FineStatus | "">("");

  // Apply View State
  const [selStudentId, setSelStudentId] = useState("");
  const [fineAmount, setFineAmount] = useState("");
  const [fineSource, setFineSource] = useState<FineSource>("ATTENDANCE");
  const [fineReason, setFineReason] = useState("");

  /* -------- RESOLVED DATA -------- */
  const activeAy = useMemo(() => academicYears.find(ay => ay.isActive) || academicYears[0], [academicYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive) || semesters[0], [semesters]);

  const filteredFines = useMemo(() => {
    let list = localFines.filter(s => s.academicYearId === activeAy?.id && s.semesterId === activeSem?.id);
    
    if (filterStatus) list = list.filter(s => s.status === filterStatus);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => {
        const stu = students.find(s => s.id === f.studentId);
        return stu?.firstName.toLowerCase().includes(q) ||
               stu?.lastName.toLowerCase().includes(q) ||
               stu?.registrationNumber.toLowerCase().includes(q) ||
               f.reason.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [localFines, filterStatus, searchQuery, activeAy, activeSem, students]);

  const metrics = useMemo(() => {
    const active = localFines.filter(s => s.academicYearId === activeAy?.id && s.semesterId === activeSem?.id);
    return {
      totalAmount: active.filter(s => s.status === "APPLIED").reduce((sum, s) => sum + s.amount, 0),
      applied: active.filter(s => s.status === "APPLIED").length,
      waived: active.filter(s => s.status === "WAIVED").length,
    };
  }, [localFines, activeAy, activeSem]);

  // Condonation Detection
  const condonationCandidates = useMemo(() => {
    // Domain rule: 65-74.9% requires condonation
    const candidates = attendanceSummaries.filter(a => a.percentage >= 65 && a.percentage < 75);
    // Exclude those who already have an ATTENDANCE fine for this semester
    const result = candidates.filter(c => {
      const stu = students.find(s => s.id === c.studentId);
      if (!stu || stu.currentSemester !== c.semesterNumber) return false;
      const hasFine = localFines.find(f => 
        f.studentId === c.studentId && 
        f.academicYearId === activeAy?.id && 
        f.semesterId === activeSem?.id && 
        f.source === "ATTENDANCE" &&
        f.status === "APPLIED"
      );
      return !hasFine;
    });
    return result;
  }, [attendanceSummaries, students, localFines, activeAy, activeSem]);

  /* -------- ACTIONS -------- */
  const handleStatusUpdate = (id: string, newStatus: FineStatus) => {
    setLocalFines(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const handleApplyFine = () => {
    if (!selStudentId || !fineAmount || isNaN(Number(fineAmount)) || !fineReason || !activeAy || !activeSem) return;
    
    const account = initialFeeAccounts.find(a => a.studentId === selStudentId && a.academicYearId === activeAy.id && a.semesterId === activeSem.id);
    if (!account) {
      alert("No fee account found for this student in the current semester. Cannot apply fine.");
      return;
    }

    const newFine: Fine = {
      id: `fine-${Date.now()}`,
      studentId: selStudentId,
      studentFeeAccountId: account.id,
      academicYearId: activeAy.id,
      semesterId: activeSem.id,
      amount: Number(fineAmount),
      source: fineSource,
      reason: fineReason,
      status: "APPLIED",
      createdAt: new Date().toISOString()
    };

    setLocalFines(prev => [newFine, ...prev]);
    setSelStudentId("");
    setFineAmount("");
    setFineReason("");
    setFineSource("ATTENDANCE");
    setViewMode("list");
  };

  const applyCondonation = (studentId: string, percentage: number) => {
    setSelStudentId(studentId);
    setFineAmount("500"); // typical fixed condonation fee
    setFineSource("ATTENDANCE");
    setFineReason(`Condonation Fee for short attendance (${percentage.toFixed(1)}%)`);
    setViewMode("apply");
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
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fines & Penalties</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage student fines for {activeAy?.code || "Current Year"} · {activeSem?.term || "Current Sem"}</p>
          </div>
          <button
            onClick={() => setViewMode("apply")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Apply Fine
          </button>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Applied Fines</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{metrics.totalAmount.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Applied</p>
            <p className="text-3xl font-bold text-rose-700">{metrics.applied}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col justify-center text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Waived</p>
            <p className="text-3xl font-bold text-emerald-700">{metrics.waived}</p>
          </div>
        </div>

        {/* Condonation Alerts */}
        {condonationCandidates.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4" /> Action Required: Condonation
            </h3>
            <div className="space-y-2">
              {condonationCandidates.map(c => {
                const stu = students.find(s => s.id === c.studentId);
                return (
                  <div key={c.studentId} className="flex items-center justify-between bg-white border border-amber-100 p-3 rounded-lg text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">{stu?.firstName} {stu?.lastName}</span>
                      <span className="text-gray-500 ml-2">({stu?.registrationNumber})</span>
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full ml-3">
                        Attendance: {c.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <button
                      onClick={() => applyCondonation(c.studentId, c.percentage)}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700"
                    >
                      Apply Fine
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            {(["", "APPLIED", "WAIVED"] as const).map(sf => (
              <button
                key={sf || "all"}
                onClick={() => setFilterStatus(sf as FineStatus | "")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === sf ? "bg-emerald-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
              >
                {sf || "All Statuses"}
              </button>
            ))}
          </div>
        </div>

        {/* Fine List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {filteredFines.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No fines found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredFines.map(fine => {
                const stu = students.find(s => s.id === fine.studentId);
                const crs = courses.find(c => c.id === stu?.courseId);
                
                return (
                  <div key={fine.id} className="w-full px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${fine.status === 'APPLIED' ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500'}`}>
                        {fine.status === 'APPLIED' ? <AlertTriangle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-gray-900">{stu?.firstName} {stu?.lastName}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${fine.status === 'APPLIED' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-500'}`}>
                            {fine.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{stu?.registrationNumber} · {crs?.code} (Sem {stu?.currentSemester})</p>
                        <p className="text-[11px] font-medium text-gray-700">Source: {fine.source.replace("_", " ")}</p>
                        <p className="text-[11px] text-gray-400">Reason: {fine.reason}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 md:ml-auto">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${fine.status === 'APPLIED' ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                          ₹{fine.amount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[10px] text-gray-400">{new Date(fine.createdAt).toLocaleDateString("en-GB")}</p>
                      </div>
                      {fine.status === "APPLIED" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleStatusUpdate(fine.id, "WAIVED")} className="px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200">
                            Waive Fine
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
     RENDER: APPLY VIEW
     ======================================================== */
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => setViewMode("list")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Apply Fine</h2>
          <p className="text-xs text-gray-500">Add a fine to a student&apos;s fee account</p>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fine Amount (₹) *</label>
            <input
              type="number"
              min="1"
              value={fineAmount}
              onChange={e => setFineAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Fine Source *</label>
            <select 
              value={fineSource} 
              onChange={e => setFineSource(e.target.value as FineSource)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="ATTENDANCE">Attendance Condonation</option>
              <option value="LATE_PAYMENT">Late Payment Fee</option>
              <option value="OTHER">Other / Disciplinary</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Reason / Details *</label>
          <textarea
            rows={3}
            value={fineReason}
            onChange={e => setFineReason(e.target.value)}
            placeholder="Provide context for the fine..."
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
          />
        </div>

        <div className="bg-rose-50 text-rose-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-rose-200">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Applying a fine will immediately add this amount to the student&apos;s outstanding fee balance for the current semester.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleApplyFine}
            disabled={!selStudentId || !fineAmount || !fineReason}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" /> Apply Fine
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



