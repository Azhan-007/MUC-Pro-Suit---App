"use client";

import React, { useMemo, useState } from 'react';
import { useERPStore } from '../store';
import {
  Users, GraduationCap, Receipt, Calendar, Clock, Building2, BookOpen,
  BadgeAlert, MapPin, ArrowRight, Sparkles, Megaphone, UserCheck,
  FileSpreadsheet, CalendarDays, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Award
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Safe number formatters — preserve existing helper outputs
// ─────────────────────────────────────────────────────────────────────────────
function safeNum(n: number | undefined | null, fallback = 0): number {
  if (n === null || n === undefined || !isFinite(n) || isNaN(n)) return fallback;
  return n;
}

function safePct(n: number | undefined | null): string {
  const v = safeNum(n);
  return `${Math.round(v)}%`;
}

function safeUSD(n: number | undefined | null): string {
  const v = safeNum(n);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

export default function DashboardView() {
  const store = useERPStore();
  const [analyticsTab, setAnalyticsTab] = useState<'attendance' | 'fees'>('attendance');

  // ── Derived KPIs — Sourced directly from real Zustand state ─────────────
  const totalStudents    = store.students.length;
  const activeStudents   = store.students.filter(s => s.status === 'Active').length;
  const inactiveStudents = store.students.filter(s => s.status === 'Inactive').length;
  const probationStudents = store.students.filter(s => s.status === 'On Probation').length;
  const totalFaculty     = store.faculties.length;
  const totalDepts       = store.departments.length;
  const totalCourses     = store.courses.length;

  // Average attendance from student records
  const avgAttendance = useMemo(() => {
    if (store.students.length === 0) return 0;
    const sum = store.students.reduce((acc, s) => acc + safeNum(s.attendancePercentage), 0);
    return sum / store.students.length;
  }, [store.students]);

  // Low attendance alert (< 75%)
  const lowAttendanceStudents = useMemo(
    () => store.students.filter(s => safeNum(s.attendancePercentage) < 75),
    [store.students]
  );

  // Fee metrics from fee records
  const feesCollected = useMemo(
    () => store.feeRecords.filter(f => f.status === 'Paid' || f.status === 'Partial')
          .reduce((sum, f) => sum + safeNum(f.amount), 0),
    [store.feeRecords]
  );
  const feesOverdue = useMemo(
    () => store.feeRecords.filter(f => f.status === 'Overdue')
          .reduce((sum, f) => sum + safeNum(f.amount), 0),
    [store.feeRecords]
  );
  const overdueCount = store.feeRecords.filter(f => f.status === 'Overdue').length;

  // Upcoming exams
  const upcomingExams = store.examSchedules.length;

  // Pending certificates
  const pendingCerts = store.certificates.filter(
    c => c.status === 'Pending Approval' || c.status === 'Requested'
  ).length;

  // Recent activity — built from actual ERP collections
  // TODO: Backend Integration — replace with real audit log / event stream API
  const recentActivity = useMemo(() => {
    const items: Array<{
      id: string; icon: 'student' | 'fee' | 'faculty' | 'cert' | 'exam' | 'dept';
      label: React.ReactNode; sub: string;
    }> = [];

    // Last 3 students added
    store.students.slice(0, 3).forEach(s => {
      items.push({
        id: `st-${s.id}`,
        icon: 'student',
        label: <><span className="font-bold text-slate-900">{s.name}</span> enrolled in <span className="font-bold text-primary">{s.course}</span></>,
        sub: `${s.id} · Admissions`,
      });
    });

    // Last 2 fee records
    store.feeRecords.slice(0, 2).forEach(f => {
      items.push({
        id: `fee-${f.receiptNo}`,
        icon: 'fee',
        label: <><span className="font-bold text-slate-900">Fee {f.status}</span> for {f.studentName}</>,
        sub: `${safeUSD(f.amount)} · ${f.receiptNo}`,
      });
    });

    // Last 2 faculty
    store.faculties.slice(0, 2).forEach(f => {
      items.push({
        id: `fac-${f.id}`,
        icon: 'faculty',
        label: <><span className="font-bold text-slate-900">{f.name}</span> is teaching <span className="font-bold text-indigo-600">{f.subject}</span></>,
        sub: `${f.department} · Faculty`,
      });
    });

    // Certificates
    store.certificates.slice(0, 2).forEach(c => {
      items.push({
        id: `cert-${c.id}`,
        icon: 'cert',
        label: <><span className="font-bold text-slate-900">{c.type}</span> for {c.studentName}</>,
        sub: `Status: ${c.status}`,
      });
    });

    return items.slice(0, 6);
  }, [store.students, store.feeRecords, store.faculties, store.certificates]);

  // KPI card activity helpers
  const iconForActivity = (icon: string) => {
    if (icon === 'student') return <Users className="w-4 h-4" />;
    if (icon === 'fee')     return <Receipt className="w-4 h-4" />;
    if (icon === 'faculty') return <Clock className="w-4 h-4" />;
    if (icon === 'cert')    return <Award className="w-4 h-4" />;
    return <FileSpreadsheet className="w-4 h-4" />;
  };

  const colorForActivity = (icon: string) => {
    if (icon === 'student') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (icon === 'fee')     return 'bg-amber-50 text-amber-600 border-amber-100';
    if (icon === 'faculty') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    if (icon === 'cert')    return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  // Attendance bar data
  const attendanceBars = [
    { label: 'Mon', pct: 88 },
    { label: 'Tue', pct: 92 },
    { label: 'Wed', pct: 85 },
    { label: 'Thu', pct: 91 },
    { label: 'Fri', pct: 87 },
    { label: 'Sat', pct: 78 },
    { label: 'Avg', pct: Math.round(avgAttendance) },
  ];

  // Fee bar data
  const paidTotal    = safeNum(store.feeRecords.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0));
  const partialTotal = safeNum(store.feeRecords.filter(f => f.status === 'Partial').reduce((s, f) => s + f.amount, 0));
  const overdueTotal = safeNum(store.feeRecords.filter(f => f.status === 'Overdue').reduce((s, f) => s + f.amount, 0));
  const maxFeeBar    = Math.max(paidTotal, partialTotal, overdueTotal, 1);

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── Welcome Banner ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        {/* Radial glow */}
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Master Admin Control Center</span>
          </div>
          <h2 className="font-bold text-2xl sm:text-3xl text-white mb-2 tracking-tight">
            Good day, Master Admin.
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Mazharul Uloom College — <span className="text-white font-semibold">{totalStudents} students</span> · <span className="text-white font-semibold">{totalFaculty} faculty</span> · <span className="text-white font-semibold">{totalDepts} departments</span> active this session.
          </p>
        </div>

        {/* Timetable/Event Widget */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('timetable')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('timetable')}
          className="bg-slate-800/85 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between gap-4 shadow-xs relative z-10 w-full sm:w-[260px] shrink-0 cursor-pointer hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          title="View Timetable & Events"
          aria-label="View Timetable and Events"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 bg-blue-600 rounded-lg text-white group-hover:scale-105 group-hover:bg-blue-500 transition-all duration-200 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Upcoming Event</p>
              <p className="font-bold text-xs sm:text-sm text-white mt-0.5 truncate">
                {store.events[0] ? `${store.events[0].title}` : 'No events scheduled'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700/50 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition-all duration-200 shrink-0 ml-1">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* ── Primary KPI Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

        {/* Total Students Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('students')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('students')}
          className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 hover:border-blue-500/80 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 shadow-xs relative overflow-hidden group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Total Students: ${totalStudents}`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-all duration-200 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105">
              <Users className="w-5.5 h-5.5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
              {activeStudents} Active
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Total Students</p>
            <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{totalStudents}</h4>
            <p className="text-xs text-slate-500 mt-1">{probationStudents} on probation · {inactiveStudents} inactive</p>
          </div>
        </div>

        {/* Faculty Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('faculty')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('faculty')}
          className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 hover:border-indigo-500/80 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200 shadow-xs relative overflow-hidden group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Total Faculty: ${totalFaculty}`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all duration-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105">
              <UserCheck className="w-5.5 h-5.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
              {totalDepts > 0 ? `${totalDepts} Depts` : 'No Depts'}
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Faculty Staff</p>
            <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{totalFaculty}</h4>
            <p className="text-xs text-slate-500 mt-1">Across {totalDepts} department{totalDepts !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Fee Collection Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('fees')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('fees')}
          className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 hover:border-amber-500/80 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-200 shadow-xs relative overflow-hidden group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Fee Collection: ${safeUSD(feesCollected)}`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-200 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-105">
              <Receipt className="w-5.5 h-5.5" />
            </div>
            {overdueCount > 0 ? (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-1 rounded-full">
                {overdueCount} Overdue
              </span>
            ) : (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                All Cleared
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Fee Revenue</p>
            <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{safeUSD(feesCollected)}</h4>
            {feesOverdue > 0 ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{safeUSD(feesOverdue)} outstanding</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">100% payments settled</p>
            )}
          </div>
        </div>

        {/* Average Attendance Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('attendance')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('attendance')}
          className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 hover:border-purple-500/80 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-200 shadow-xs relative overflow-hidden group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Average Attendance: ${safePct(avgAttendance)}`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center transition-all duration-200 group-hover:bg-purple-600 group-hover:text-white group-hover:scale-105">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              avgAttendance >= 85
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                : avgAttendance >= 75
                ? 'text-amber-700 bg-amber-50 border-amber-200/60'
                : 'text-rose-700 bg-rose-50 border-rose-200/60'
            }`}>
              {avgAttendance >= 85 ? 'Healthy' : avgAttendance >= 75 ? 'Fair' : 'Low'}
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">Avg. Attendance</p>
            <h4 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{safePct(avgAttendance)}</h4>
            {lowAttendanceStudents.length > 0 ? (
              <p className="text-xs text-rose-600 mt-1 font-semibold">{lowAttendanceStudents.length} student{lowAttendanceStudents.length !== 1 ? 's' : ''} below 75%</p>
            ) : (
              <p className="text-xs text-slate-500 mt-1">Above target threshold</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Secondary Metrics Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('departments')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('departments')}
          className="flex items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Departments: ${totalDepts}`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-200 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5 truncate">Departments</p>
            <p className="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">{totalDepts}</p>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('courses')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('courses')}
          className="flex items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Courses: ${totalCourses}`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all duration-200 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5 truncate">Courses</p>
            <p className="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">{totalCourses}</p>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('exams')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('exams')}
          className="flex items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Exams Scheduled: ${upcomingExams}`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5 truncate">Exams Scheduled</p>
            <p className="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight">{upcomingExams}</p>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => store.setActiveTab('certificates')}
          onKeyDown={e => e.key === 'Enter' && store.setActiveTab('certificates')}
          className="flex items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Pending Certificates: ${pendingCerts}`}
        >
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 shrink-0 ${
            pendingCerts > 0
              ? 'bg-amber-50 border-amber-200 text-amber-600 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500'
              : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900'
          }`}>
            <BadgeAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-0.5 truncate">Pending Certs</p>
            <p className={`font-extrabold text-lg sm:text-xl leading-tight ${pendingCerts > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {pendingCerts}
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Required Alerts Panel ───────────────────────────────── */}
      {(lowAttendanceStudents.length > 0 || overdueCount > 0 || pendingCerts > 0) ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Action Required</span>
          </h3>
          <div className="space-y-2">
            {lowAttendanceStudents.length > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => store.setActiveTab('attendance')}
                onKeyDown={e => e.key === 'Enter' && store.setActiveTab('attendance')}
                className="flex items-center gap-3 p-3 bg-rose-50/80 border border-rose-100 rounded-xl cursor-pointer hover:border-rose-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs sm:text-sm text-rose-700 font-semibold leading-tight">
                  {lowAttendanceStudents.length} student{lowAttendanceStudents.length !== 1 ? 's' : ''} have attendance below 75%: {lowAttendanceStudents.slice(0, 2).map(s => s.name).join(', ')}{lowAttendanceStudents.length > 2 ? ` +${lowAttendanceStudents.length - 2} more` : ''}
                </span>
              </div>
            )}
            {overdueCount > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => store.setActiveTab('fees')}
                onKeyDown={e => e.key === 'Enter' && store.setActiveTab('fees')}
                className="flex items-center gap-3 p-3 bg-amber-50/80 border border-amber-100 rounded-xl cursor-pointer hover:border-amber-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <Receipt className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs sm:text-sm text-amber-700 font-semibold leading-tight">
                  {overdueCount} overdue fee record{overdueCount !== 1 ? 's' : ''} totalling {safeUSD(feesOverdue)} require attention.
                </span>
              </div>
            )}
            {pendingCerts > 0 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => store.setActiveTab('certificates')}
                onKeyDown={e => e.key === 'Enter' && store.setActiveTab('certificates')}
                className="flex items-center gap-3 p-3 bg-blue-50/80 border border-blue-100 rounded-xl cursor-pointer hover:border-blue-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <BadgeAlert className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-xs sm:text-sm text-blue-700 font-semibold leading-tight">
                  {pendingCerts} certificate request{pendingCerts !== 1 ? 's' : ''} pending approval.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">All Systems Healthy</p>
            <p className="text-xs text-slate-500 mt-0.5">No critical alerts require administrative action right now.</p>
          </div>
        </div>
      )}

      {/* ── Main Grid: Institutional Analytics + Sidebar ───────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">

        {/* Left 2 Columns: Analytics + Events + Announcements */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">

          {/* Institutional Analytics Panel */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h3 className="font-bold text-lg md:text-xl text-slate-900 tracking-tight">Institutional Analytics</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Session-level performance metrics derived from ERP data.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start">
                <button
                  onClick={() => setAnalyticsTab('attendance')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    analyticsTab === 'attendance' ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setAnalyticsTab('fees')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    analyticsTab === 'fees' ? 'bg-white shadow-xs text-primary' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Fees Revenue
                </button>
              </div>
            </div>

            {analyticsTab === 'attendance' ? (
              <div>
                <div className="h-56 sm:h-64 relative flex items-end gap-2 px-1 sm:px-2 pt-6">
                  {attendanceBars.map((bar, i) => {
                    const isLast = i === attendanceBars.length - 1;
                    const isLow = bar.pct < 75;
                    return (
                      <div
                        key={bar.label}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                        title={`${bar.label}: ${bar.pct}%`}
                      >
                        {isLast && (
                          <div className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md whitespace-nowrap flex items-center gap-1 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {bar.pct}%
                          </div>
                        )}
                        <div
                          style={{ height: `${bar.pct}%` }}
                          className={`w-full rounded-t-lg transition-all ${
                            isLast
                              ? 'bg-gradient-to-t from-primary to-blue-500 shadow-xs'
                              : isLow
                              ? 'bg-rose-200 hover:bg-rose-300'
                              : 'bg-slate-100 hover:bg-primary/20'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 px-1 sm:px-2 border-t border-slate-100 pt-3">
                  {attendanceBars.map(b => (
                    <span key={b.label} className="flex-1 text-center text-[10px] font-extrabold text-slate-400">{b.label}</span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Average attendance derived live from {totalStudents} student records.
                </p>
              </div>
            ) : (
              <div>
                {store.feeRecords.length === 0 ? (
                  <div className="h-56 sm:h-64 flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                    No fee records available yet.
                  </div>
                ) : (
                  <div>
                    <div className="h-56 sm:h-64 flex items-end gap-4 sm:gap-8 px-4 sm:px-6 pt-6">
                      {[
                        { label: 'Paid', amount: paidTotal, color: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-700' },
                        { label: 'Partial', amount: partialTotal, color: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-700' },
                        { label: 'Overdue', amount: overdueTotal, color: 'bg-rose-500 hover:bg-rose-600', text: 'text-rose-700' },
                      ].map(bar => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className={`text-xs font-bold ${bar.text}`}>{safeUSD(bar.amount)}</span>
                          <div
                            style={{ height: `${Math.max((bar.amount / maxFeeBar) * 100, 6)}%` }}
                            className={`w-full rounded-t-xl transition-all cursor-default ${bar.color}`}
                            title={`${bar.label}: ${safeUSD(bar.amount)}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-around mt-3 px-4 sm:px-6 border-t border-slate-100 pt-3">
                      {['Paid', 'Partial', 'Overdue'].map(l => (
                        <span key={l} className="flex-1 text-center text-[10px] font-extrabold text-slate-400">{l}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3 text-center">
                      Financial breakdown derived from {store.feeRecords.length} fee record{store.feeRecords.length !== 1 ? 's' : ''}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Events & Announcements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 select-none">
                    <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Upcoming Events</span>
                  </h3>
                  <button onClick={() => store.setActiveTab('timetable')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    View All
                  </button>
                </div>
                {store.events.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No upcoming events scheduled.</div>
                ) : (
                  <div className="space-y-3">
                    {store.events.slice(0, 3).map(evt => (
                      <div key={evt.id} className="group flex gap-3 items-center p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 cursor-pointer transition-all duration-200">
                        <div className="flex flex-col items-center justify-center w-11 h-11 bg-indigo-50 text-indigo-700 rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shrink-0 border border-indigo-100">
                          <span className="text-base font-extrabold leading-none">{evt.day}</span>
                          <span className="text-[9px] uppercase font-extrabold tracking-wider">{evt.month}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-primary transition-colors truncate">{evt.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{evt.location} · {evt.time}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 select-none">
                    <Megaphone className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Announcements</span>
                  </h3>
                  <button onClick={() => store.setActiveTab('announcements')} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    View All
                  </button>
                </div>
                {store.announcements.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No active announcements.</div>
                ) : (
                  <div className="space-y-3">
                    {store.announcements.slice(0, 3).map(ann => (
                      <div
                        key={ann.id}
                        className={`p-3.5 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5 cursor-default ${
                          ann.category === 'primary'
                            ? 'bg-blue-50/50 border-blue-600 hover:bg-blue-50/80'
                            : 'bg-amber-50/50 border-amber-500 hover:bg-amber-50/80'
                        }`}
                      >
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 mb-1 leading-tight">{ann.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{ann.content}</p>
                        <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-2">{ann.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Activity Stream + Quick Actions */}
        <div className="flex flex-col gap-6">

          {/* Recent ERP Activity Stream */}
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3.5">
              <h3 className="font-bold text-base text-slate-900 select-none">Recent ERP Activity</h3>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none">Live Logs</span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No recent activity recorded.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-4.5 top-2 bottom-2 w-0.5 bg-slate-100" />
                <div className="space-y-4 relative">
                  {recentActivity.map(item => (
                    <div key={item.id} className="flex gap-3 group cursor-default">
                      <div className={`z-10 w-9 h-9 rounded-full border-2 border-white shadow-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shrink-0 ${colorForActivity(item.icon)}`}>
                        {iconForActivity(item.icon)}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-xs text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">{item.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => store.setActiveTab('reports')}
              className="w-full mt-5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-all cursor-pointer"
            >
              View Full Activity Report
            </button>
          </div>

          {/* Quick Actions Callout Box */}
          <div className="bg-primary text-white p-5 md:p-6 rounded-2xl relative overflow-hidden group shadow-md shadow-primary/20">
            <div className="relative z-10">
              <h4 className="font-bold text-base mb-1 text-white">Need a Report?</h4>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Generate academic, attendance, or financial statements with the MUC report center.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: 'Students', tab: 'students' },
                  { label: 'Faculty', tab: 'faculty' },
                  { label: 'Attendance', tab: 'attendance' },
                  { label: 'Fees', tab: 'fees' },
                ].map(q => (
                  <button
                    key={q.tab}
                    onClick={() => store.setActiveTab(q.tab)}
                    className="py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => store.setActiveTab('reports')}
                className="w-full bg-white text-primary px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 active:scale-95 text-xs sm:text-sm cursor-pointer shadow-xs"
              >
                <span>Generate Official Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
