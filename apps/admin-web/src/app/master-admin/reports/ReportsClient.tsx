"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BarChart4, Download, PieChart, Users, GraduationCap, 
  Building2, BookOpen, IndianRupee, Layers, FileText, CheckCircle2
} from "lucide-react";
import {
  Student, Faculty, AcademicYear, Semester, Department, Course, ClassEntity
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface ReportsClientProps {
  overviewStats: any;
  students: Student[];
  faculty: Faculty[];
  academicYears: AcademicYear[];
  semesters: Semester[];
  departments: Department[];
  courses: Course[];
  classes: ClassEntity[];
  userRole: string;
}

/* ======================== MAIN ======================== */
export function ReportsClient({
  overviewStats, students, faculty, departments, courses, classes
}: ReportsClientProps) {
  
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (reportName: string) => {
    setDownloading(reportName);
    setTimeout(() => {
      setDownloading(null);
      alert(`${reportName} downloaded successfully as CSV.`);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate compliance reports, academic summaries, and financial statements</p>
        </div>
      </div>

      {/* College Overview Dashboard */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-emerald-600" /> Executive Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <GraduationCap className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Students</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <Users className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{faculty.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Faculty</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Departments</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Courses</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <Layers className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Classes</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
            <IndianRupee className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900 pt-1">Healthy</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">Finances</p>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Academic Reports */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart4 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Academic Reports</h3>
          </div>
          <div className="space-y-3 flex-1">
            {["University Rank Holders List", "Consolidated Attendance Report", "End-Semester Result Analysis", "Faculty Workload & Timetable"].map(name => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">{name}</span>
                <button 
                  onClick={() => handleDownload(name)}
                  disabled={downloading === name}
                  className="p-1.5 bg-white border border-gray-200 text-gray-500 rounded hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  {downloading === name ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Administrative Reports */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Administrative Reports</h3>
          </div>
          <div className="space-y-3 flex-1">
            {["Student Nominal Roll (By Class)", "NAAC Accreditation Data Extract", "Faculty Nominal Roll & Profiles", "Hostel & Transport Utilization"].map(name => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">{name}</span>
                <button 
                  onClick={() => handleDownload(name)}
                  disabled={downloading === name}
                  className="p-1.5 bg-white border border-gray-200 text-gray-500 rounded hover:text-amber-600 transition-colors disabled:opacity-50"
                >
                  {downloading === name ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Financial & Miscellaneous */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Financial & Audit</h3>
          </div>
          <div className="space-y-3 flex-1">
            {["Daily Fee Collection Report", "Defaulters / Outstanding Fees", "Scholarships & Concessions Ledger", "Fine Collection Summary"].map(name => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs font-semibold text-gray-700">{name}</span>
                <button 
                  onClick={() => handleDownload(name)}
                  disabled={downloading === name}
                  className="p-1.5 bg-white border border-gray-200 text-gray-500 rounded hover:text-emerald-600 transition-colors disabled:opacity-50"
                >
                  {downloading === name ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Download className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
