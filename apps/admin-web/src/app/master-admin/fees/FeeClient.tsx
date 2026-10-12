"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Landmark, Search, Plus, Filter, FileText, CheckCircle2,
  XCircle, ArrowLeft, Layers, Percent, Settings, ShieldAlert
} from "lucide-react";
import {
  AcademicYear, Semester, Course, Student, FeeStructure,
  StudentFeeAccount, FeePayment
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface FeeClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  students: Student[];
  initialStructures: FeeStructure[];
  initialAccounts: StudentFeeAccount[];
  initialPayments: FeePayment[];
}

type ViewMode = "list" | "create_structure";

/* ======================== MAIN ======================== */
export function FeeClient({
  academicYears, semesters, courses, students,
  initialStructures, initialAccounts, initialPayments
}: FeeClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [localStructures, setLocalStructures] = useState<FeeStructure[]>(initialStructures);
  const [searchQuery, setSearchQuery] = useState("");

  /* -------- RESOLVED DATA -------- */
  const activeAy = useMemo(() => academicYears.find(ay => ay.isActive) || academicYears[0], [academicYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive) || semesters[0], [semesters]);

  const currentStructures = useMemo(() => {
    return localStructures.filter(s => s.academicYearId === activeAy?.id && s.semesterId === activeSem?.id);
  }, [localStructures, activeAy, activeSem]);

  const filteredStructures = useMemo(() => {
    let list = currentStructures;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => {
        const crs = courses.find(c => c.id === s.courseId);
        return crs?.code.toLowerCase().includes(q) || crs?.name.toLowerCase().includes(q) || s.studentCategory.toLowerCase().includes(q);
      });
    }
    return list;
  }, [currentStructures, searchQuery, courses]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const currentAccounts = initialAccounts.filter(a => a.academicYearId === activeAy?.id && a.semesterId === activeSem?.id);
    const totalAssessed = currentAccounts.reduce((sum, a) => sum + a.totalAssessed, 0);
    const totalCollected = currentAccounts.reduce((sum, a) => sum + a.paidAmount, 0);
    const totalOutstanding = currentAccounts.reduce((sum, a) => sum + a.outstandingAmount, 0);
    const collectionRate = totalAssessed > 0 ? (totalCollected / totalAssessed) * 100 : 0;
    
    return { totalAssessed, totalCollected, totalOutstanding, collectionRate, configCount: currentStructures.length };
  }, [initialAccounts, activeAy, activeSem, currentStructures.length]);

  /* ========================================================
     RENDER: LIST VIEW
     ======================================================== */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fee Administration</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage fee structures for {activeAy?.code || "Current Year"} · {activeSem?.term || "Current Sem"}</p>
          </div>
          <button
            onClick={() => setViewMode("create_structure")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Structure
          </button>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Layers className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Assessed</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{metrics.totalAssessed.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500 mt-1">Expected Revenue</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Landmark className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Collected</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">₹{metrics.totalCollected.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
              <Percent className="w-3 h-3" /> {metrics.collectionRate.toFixed(1)}% Realized
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <ShieldAlert className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-rose-700">₹{metrics.totalOutstanding.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-rose-600 mt-1 font-semibold">Requires follow-up</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Settings className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Configurations</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.configCount}</p>
            <p className="text-xs text-gray-500 mt-1">Active Fee Structures</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search structures by course code..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
        </div>

        {/* Structures List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {filteredStructures.length === 0 ? (
            <div className="p-12 text-center">
              <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No fee structures configured</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Course</th>
                    <th className="px-5 py-3 font-semibold">Shift</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold text-right">Total Amount (₹)</th>
                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStructures.map(str => {
                    const crs = courses.find(c => c.id === str.courseId);
                    return (
                      <tr key={str.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{crs?.code}</p>
                          <p className="text-[11px] text-gray-500">{crs?.name}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${str.shift === "SHIFT_I" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                            {str.shift.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-700">
                          {str.studentCategory.replace("_", " ")}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900">
                          ₹{str.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${str.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                            {str.status}
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
      </div>
    );
  }

  /* ========================================================
     RENDER: CREATE VIEW (Placeholder to return to list)
     ======================================================== */
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <Settings className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Structure Builder</h2>
      <p className="text-sm text-gray-500 mb-6">
        Creating dynamic fee structures with variable components (Tuition, Lab, Exam, Misc) is highly complex and typically done once per academic cycle.
      </p>
      <button
        onClick={() => setViewMode("list")}
        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 inline mr-2" /> Back to Administration
      </button>
    </div>
  );
}



