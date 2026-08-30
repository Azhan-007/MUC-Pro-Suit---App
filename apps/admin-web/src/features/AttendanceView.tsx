"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { 
  Calendar, Check, X, Search, ChevronLeft, ChevronRight, 
  BarChart3, UserCheck, UserX, SlidersHorizontal, ArrowUpRight, 
  Settings, Sparkles, Download, Info, ShieldCheck, Lock, Unlock,
  AlertTriangle, Eye, RefreshCw, Layers, Users, FileText, ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { AttendanceRecord } from '../types';

export default function AttendanceView() {
  const store = useERPStore();

  // ── View Mode: 'overview' vs 'take-attendance' (Full Page Workspace) ────
  const [viewMode, setViewMode] = useState<'overview' | 'take-attendance'>('overview');

  // ── Page Overview Filters & View State ─────────────────────────────────
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSubj, setSelectedSubj] = useState('All');
  const [selectedTab, setSelectedTab] = useState<'all' | 'present' | 'absent'>('all');
  const [currentDate, setCurrentDate] = useState('2026-07-10');
  const [filterByDate, setFilterByDate] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  // ── Modal States ───────────────────────────────────────────────────────
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  
  // Selected record for details modal
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<AttendanceRecord | null>(null);

  // ── Full-Page Attendance Workspace State ──────────────────────────────
  const [sessionDate, setSessionDate] = useState('2026-07-10');
  const [sessionDept, setSessionDept] = useState('Computer Science');
  const [sessionCourse, setSessionCourse] = useState('B.Tech CS');
  const [sessionSection, setSessionSection] = useState('Sec A');
  const [sessionScope, setSessionScope] = useState<'all' | 'registered'>('all');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusMap, setRosterStatusMap] = useState<Record<string, 'Present' | 'Absent' | 'Unmarked'>>({});
  const [sessionStatus, setSessionStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'LOCKED' | 'CORRECTION'>('OPEN');
  const [unlockReason, setUnlockReason] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Heatmap calendar mock data (interactive)
  const weeks = Array.from({ length: 4 });
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cellIntensities = [
    [92, 94, 88, 91, 95, 78, 60],
    [95, 93, 89, 92, 96, 80, 50],
    [91, 94, 95, 87, 94, 75, 55],
    [93, 91, 90, 94, 95, 82, 60]
  ];

  // ── Derived Date Month ──────────────────────────────────────────────────
  const sessionMonthText = useMemo(() => {
    try {
      const d = new Date(sessionDate);
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'July 2026';
    }
  }, [sessionDate]);

  // ── Dynamic Department Options ─────────────────────────────────────────
  const deptOptions = useMemo(
    () => ["All", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  // ── Dynamic Course Options (filtered by department) ───────────────────
  const courseOptions = useMemo(() => {
    if (selectedDept === 'All') {
      return ["All", ...store.courses.map(c => c.name)];
    }
    const filtered = store.courses.filter(c => c.department === selectedDept);
    return ["All", ...(filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name))];
  }, [selectedDept, store.courses]);

  // Workspace course options
  const sessionCourseOptions = useMemo(() => {
    if (!sessionDept) return store.courses.map(c => c.name);
    const filtered = store.courses.filter(c => c.department === sessionDept);
    return filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name);
  }, [sessionDept, store.courses]);

  // Class Faculty assigned
  const classFaculty = useMemo(() => {
    const fac = store.faculties.find(f => f.department === sessionDept);
    return fac ? fac.name : (store.faculties[0]?.name || 'Dr. Sarah Jenkins');
  }, [store.faculties, sessionDept]);

  // ── Dynamic Subject Options ────────────────────────────────────────────
  const subjectOptions = useMemo(() => {
    const subjects = Array.from(new Set(store.faculties.map(f => f.subject)));
    return ["All", ...subjects];
  }, [store.faculties]);

  // ── Dynamic Departmental Attendance Breakdown ─────────────────────────
  const departmentalBreakdown = useMemo(() => {
    return store.departments.map(dept => {
      const deptStudents = store.students.filter(s => s.department === dept.name);
      if (deptStudents.length === 0) {
        return { name: dept.name, code: dept.code, rate: 90 };
      }
      const avg = Math.round(
        deptStudents.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / deptStudents.length
      );
      return { name: dept.name, code: dept.code, rate: avg };
    });
  }, [store.departments, store.students]);

  // ── Dynamic Average Attendance Rate ───────────────────────────────────
  const overallAvgRate = useMemo(() => {
    if (store.students.length === 0) return 92.4;
    const total = store.students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0);
    return (total / store.students.length).toFixed(1);
  }, [store.students]);

  // ── Filtered Attendance Records ──────────────────────────────────────
  const filteredRecords = useMemo(() => {
    const q = (localSearch || store.searchQuery).trim().toLowerCase();

    return store.attendanceRecords.filter(rec => {
      // Tab filter
      const matchesTab = selectedTab === 'all' || 
        (selectedTab === 'present' && rec.status === 'Present') ||
        (selectedTab === 'absent' && rec.status === 'Absent');

      // Department filter
      const matchesDept = selectedDept === 'All' || 
        rec.courseSection.toLowerCase().includes(selectedDept.toLowerCase()) ||
        store.students.find(s => s.id === rec.studentId)?.department === selectedDept;

      // Course filter
      const matchesCourse = selectedCourse === 'All' || 
        rec.courseSection.toLowerCase().includes(selectedCourse.toLowerCase());

      // Subject filter
      const matchesSubj = selectedSubj === 'All' || 
        rec.courseSection.toLowerCase().includes(selectedSubj.toLowerCase());

      // Date filter
      const matchesDate = !filterByDate || rec.date === currentDate;

      // Search filter
      const matchesSearch = !q ||
        rec.studentName.toLowerCase().includes(q) ||
        rec.studentId.toLowerCase().includes(q) ||
        rec.courseSection.toLowerCase().includes(q);

      return matchesTab && matchesDept && matchesCourse && matchesSubj && matchesDate && matchesSearch;
    });
  }, [store.attendanceRecords, selectedTab, selectedDept, selectedCourse, selectedSubj, filterByDate, currentDate, localSearch, store.searchQuery, store.students]);

  // ── Roster Students for Workspace ──────────────────────────────────────
  const markRosterStudents = useMemo(() => {
    return store.students.filter(s => {
      const matchDept = !sessionDept || s.department === sessionDept;
      const matchCourse = !sessionCourse || s.course === sessionCourse;
      const matchScope = sessionScope === 'all' || true;
      const q = rosterSearch.trim().toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);

      return matchDept && matchCourse && matchScope && matchSearch;
    });
  }, [store.students, sessionDept, sessionCourse, sessionScope, rosterSearch]);

  // ── Live Roster Summary Metrics ────────────────────────────────────────
  const rosterMetrics = useMemo(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    markRosterStudents.forEach(student => {
      const st = rosterStatusMap[student.id] || 'Present';
      if (st === 'Present') present++;
      else if (st === 'Absent') absent++;
      else unmarked++;
    });

    return {
      total: markRosterStudents.length,
      present,
      absent,
      unmarked,
    };
  }, [markRosterStudents, rosterStatusMap]);

  // ── Toggle Attendance Status in Overview Table ─────────────────────────
  const toggleStatus = useCallback((id: string) => {
    const target = store.attendanceRecords.find(r => r.id === id);
    if (!target) return;
    const newStatus: 'Present' | 'Absent' = target.status === 'Present' ? 'Absent' : 'Present';

    store.markAttendance({
      ...target,
      status: newStatus,
      attendancePercentage: newStatus === 'Present'
        ? Math.min(100, Math.round(target.attendancePercentage + 1))
        : Math.max(0, Math.round(target.attendancePercentage - 1))
    });
  }, [store]);

  // ── Handlers: Open Full Page Workspace Mode ────────────────────────────
  const handleOpenWorkspace = useCallback(() => {
    const defaultDept = store.departments[0]?.name || 'Computer Science';
    const defaultCourse = store.courses.find(c => c.department === defaultDept)?.name || store.courses[0]?.name || 'B.Tech CS';
    
    setSessionDate(currentDate);
    setSessionDept(defaultDept);
    setSessionCourse(defaultCourse);
    setSessionSection('Sec A');
    setSessionScope('all');
    setRosterSearch('');
    setValidationError('');
    setSuccessBanner('');
    setIsConfirmStep(false);

    // Initial roster status mapping
    const matching = store.students.filter(s => s.department === defaultDept);
    const initialMap: Record<string, 'Present' | 'Absent' | 'Unmarked'> = {};
    matching.forEach(s => { initialMap[s.id] = 'Present'; });
    setRosterStatusMap(initialMap);

    // Duplicate session check
    const existingRec = store.attendanceRecords.find(r => 
      r.date === currentDate && r.courseSection.includes(defaultCourse)
    );
    if (existingRec) {
      setSessionStatus('SUBMITTED');
    } else {
      setSessionStatus('OPEN');
    }

    setViewMode('take-attendance');
  }, [store.departments, store.courses, store.students, store.attendanceRecords, currentDate]);

  const toggleRosterStudentStatus = useCallback((studentId: string) => {
    if (sessionStatus === 'LOCKED' && store.activeRole !== 'MASTER_ADMIN') return;
    setValidationError('');
    setRosterStatusMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
    setSessionStatus('IN_PROGRESS');
  }, [sessionStatus, store.activeRole]);

  const handleBulkMark = useCallback((status: 'Present' | 'Absent' | 'Unmarked') => {
    if (sessionStatus === 'LOCKED' && store.activeRole !== 'MASTER_ADMIN') return;
    setValidationError('');
    const newMap: Record<string, 'Present' | 'Absent' | 'Unmarked'> = {};
    markRosterStudents.forEach(s => { newMap[s.id] = status; });
    setRosterStatusMap(newMap);
    setSessionStatus('IN_PROGRESS');
  }, [sessionStatus, store.activeRole, markRosterStudents]);

  // Proceed to Submit Confirmation step with validation check
  const handleProceedToSubmit = useCallback(() => {
    setValidationError('');
    
    if (markRosterStudents.length === 0) {
      setValidationError("No students found in the roster for the selected Department and Course.");
      return;
    }

    if (rosterMetrics.unmarked > 0) {
      setValidationError(`${rosterMetrics.unmarked} student(s) are still unmarked. Please complete marking all students before submitting.`);
      return;
    }

    setIsConfirmStep(true);
  }, [markRosterStudents.length, rosterMetrics.unmarked]);

  // Final submit session attendance
  const handleFinalSubmitAttendance = useCallback(() => {
    // Update store attendance records
    markRosterStudents.forEach(student => {
      const status = rosterStatusMap[student.id] === 'Absent' ? 'Absent' : 'Present';
      const recordId = `ATT-${student.id}-${sessionDate}`;
      const initials = student.initials || student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

      store.markAttendance({
        id: recordId,
        studentId: student.id,
        studentName: student.name,
        initials,
        courseSection: `${sessionCourse} - ${sessionSection}`,
        status,
        attendancePercentage: status === 'Present'
          ? Math.min(100, Math.round((student.attendancePercentage || 85) + 0.5))
          : Math.max(0, Math.round((student.attendancePercentage || 85) - 1.2)),
        date: sessionDate,
      });
    });

    setSessionStatus('LOCKED');
    setIsConfirmStep(false);
    setSuccessBanner(`Attendance Session submitted & locked for ${sessionCourse} (${sessionDate}).`);

    // Return to overview after short delay
    setTimeout(() => {
      setViewMode('overview');
    }, 1200);
  }, [markRosterStudents, rosterStatusMap, sessionDate, sessionCourse, sessionSection, store]);

  // ── Master Admin Correction Unlock Flow ───────────────────────────────
  const handleUnlockForCorrection = useCallback(() => {
    if (store.activeRole !== 'MASTER_ADMIN') {
      alert("Only Master Admin can unlock locked attendance for correction.");
      return;
    }
    setUnlockReason('');
    setIsCorrectionModalOpen(true);
  }, [store.activeRole]);

  const confirmUnlock = useCallback(() => {
    if (!unlockReason.trim()) return;
    // TODO: Backend Audit Integration — audit log unlock reason
    setSessionStatus('CORRECTION');
    setIsCorrectionModalOpen(false);
  }, [unlockReason]);

  // ── CSV Export Log ─────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Record ID,Student ID,Student Name,Course Section,Status,Attendance Rate,Date"].join(",") + "\n"
      + filteredRecords.map(r => `${r.id},${r.studentId},"${r.studentName.replace(/,/g, '')}","${r.courseSection}",${r.status},${r.attendancePercentage}%,${r.date}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MUC_Attendance_Log_${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredRecords, currentDate]);

  // ───────────────────────────────────────────────────────────────────────
  // VIEW MODE 2: FULL-PAGE MASTER ADMIN OFFICE ATTENDANCE WORKSPACE
  // ───────────────────────────────────────────────────────────────────────
  if (viewMode === 'take-attendance') {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('overview')}
              className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all flex items-center gap-2 text-xs shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Overview</span>
            </button>
            <div>
              <h2 className="font-bold text-2xl text-slate-900 tracking-tight">Take Attendance — Office Roster Session</h2>
              <p className="text-xs text-slate-500 mt-0.5">Master Admin College Office Attendance Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Operator: Master Admin ({store.activeRole})</span>
            </div>

            <span className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase border ${
              sessionStatus === 'LOCKED' 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : sessionStatus === 'SUBMITTED'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              Session Status: {sessionStatus}
            </span>
          </div>
        </div>

        {/* Success Banner Notification */}
        {successBanner && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Card 1: Academic Context & Date Selection Workspace */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Academic Session ({sessionMonthText})</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Realtime Roster Synchronization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Attendance Date
              </label>
              <input 
                type="date"
                value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
                className="w-full h-10 text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl px-3 font-bold text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <CustomSelect
                value={sessionDept}
                onChange={e => setSessionDept(e.target.value)}
                options={store.departments.map(d => d.name)}
                className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Course
              </label>
              <CustomSelect
                value={sessionCourse}
                onChange={e => setSessionCourse(e.target.value)}
                options={sessionCourseOptions}
                className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Section
              </label>
              <CustomSelect
                value={sessionSection}
                onChange={e => setSessionSection(e.target.value)}
                options={['Sec A', 'Sec B', 'Sec C']}
                className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Faculty & Operator Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Class Assigned Faculty</p>
              <p className="font-bold text-sm text-amber-900 mt-0.5">{classFaculty}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200/80 rounded-2xl text-blue-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Attendance Operator</p>
                <p className="font-bold text-sm text-blue-950 mt-0.5">Master Admin ({store.activeRole})</p>
              </div>
            </div>
            <span className="text-xs bg-blue-100 px-3 py-1 rounded-lg font-bold text-blue-700">
              No Student Login Required
            </span>
          </div>
        </div>

        {/* Locked Banner & Unlock Flow */}
        {sessionStatus === 'LOCKED' && (
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>🔒 Attendance Session Locked for {sessionDate}</span>
            </div>
            {store.activeRole === 'MASTER_ADMIN' && (
              <button
                type="button"
                onClick={handleUnlockForCorrection}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Unlock for Correction
              </button>
            )}
          </div>
        )}

        {/* Card 3: Roster Toolbar & Live Metrics Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Roster Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSessionScope('all')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sessionScope === 'all' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({store.students.filter(s => s.department === sessionDept).length})
                </button>
                <button
                  type="button"
                  onClick={() => setSessionScope('registered')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sessionScope === 'registered' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Registered
                </button>
              </div>

              {/* Roster Search */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={rosterSearch}
                  onChange={e => setRosterSearch(e.target.value)}
                  placeholder="Search student name or ID..."
                  className="w-full pl-9 pr-3 h-10 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900"
                />
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkMark('Present')}
                  className="px-3.5 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('Absent')}
                  className="px-3.5 h-10 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkMark('Unmarked')}
                  className="px-3.5 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Live Roster KPI Metric Cards */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center min-w-[320px]">
              <div>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase">Total</p>
                <p className="text-base font-black text-slate-900">{rosterMetrics.total}</p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-emerald-600 uppercase">Present</p>
                <p className="text-base font-black text-emerald-700">{rosterMetrics.present}</p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-rose-600 uppercase">Absent</p>
                <p className="text-base font-black text-rose-700">{rosterMetrics.absent}</p>
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-amber-600 uppercase">Unmarked</p>
                <p className={`text-base font-black ${rosterMetrics.unmarked > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {rosterMetrics.unmarked}
                </p>
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Card 4: Full Page Roster Student List / Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h4 className="font-bold text-sm text-slate-900">
              Student Roster ({markRosterStudents.length} Enrolled)
            </h4>
            <span className="text-xs text-slate-500 font-mono">Section: {sessionSection}</span>
          </div>

          <div className="divide-y divide-slate-100 p-2">
            {markRosterStudents.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No students enrolled under {sessionDept} / {sessionCourse}.
              </div>
            ) : markRosterStudents.map(student => {
              const currentStatus = rosterStatusMap[student.id] || 'Present';
              return (
                <div 
                  key={student.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
                      {student.initials || student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{student.name}</h5>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono">{student.id}</span>
                        <span>•</span>
                        <span>{student.department}</span>
                        <span>•</span>
                        <span>Avg Attendance: <strong className="text-slate-700">{student.attendancePercentage || 85}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={sessionStatus === 'LOCKED'}
                      onClick={() => toggleRosterStudentStatus(student.id)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        currentStatus === 'Present'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      disabled={sessionStatus === 'LOCKED'}
                      onClick={() => toggleRosterStudentStatus(student.id)}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        currentStatus === 'Absent'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm scale-105'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pre-submit confirmation view if triggered */}
        {isConfirmStep && (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-2xl space-y-4 text-xs text-blue-950 shadow-sm">
            <h4 className="font-bold text-base text-blue-900">Confirm Attendance Session Submission</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/70 p-4 rounded-xl border border-blue-100 text-slate-800">
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">Date</p><p className="font-bold">{sessionDate}</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">Department</p><p className="font-bold">{sessionDept}</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">Course / Section</p><p className="font-bold">{sessionCourse} ({sessionSection})</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">Roster Summary</p><p className="font-bold text-emerald-700">{rosterMetrics.present} Present / {rosterMetrics.absent} Absent</p></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmStep(false)}
                className="px-5 h-11 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                Back to Roster
              </button>
              <button
                type="button"
                onClick={handleFinalSubmitAttendance}
                className="px-6 h-11 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:bg-primary/95 cursor-pointer"
              >
                Confirm & Submit Attendance Log
              </button>
            </div>
          </div>
        )}

        {/* Bottom Workspace Action Bar */}
        {!isConfirmStep && (
          <div className="flex justify-end gap-4 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setViewMode('overview')}
              className="px-6 h-11 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel & Return
            </button>
            <button
              type="button"
              onClick={handleProceedToSubmit}
              disabled={markRosterStudents.length === 0 || sessionStatus === 'LOCKED'}
              className="px-8 h-11 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-50"
            >
              Submit Session Attendance
            </button>
          </div>
        )}

        {/* Unlock Correction Reason Modal */}
        <Modal
          isOpen={isCorrectionModalOpen}
          onClose={() => setIsCorrectionModalOpen(false)}
          title="Master Admin Session Correction"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Administrative Correction Audit</p>
                <p>Enter a required justification to unlock this attendance session for correction. All corrections are logged in the audit history.</p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Unlock Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={unlockReason}
                onChange={e => setUnlockReason(e.target.value)}
                placeholder="e.g. Student was present in lab session but accidentally logged absent."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!unlockReason.trim()}
                onClick={confirmUnlock}
                className="px-5 h-10 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all text-xs cursor-pointer disabled:opacity-50"
              >
                Unlock Roster
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // VIEW MODE 1: ATTENDANCE OVERVIEW PAGE
  // ───────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* ── Header and Page Title ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Dashboard</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Attendance Management</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Attendance Overview</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Operator Identity Badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Operator: {store.activeRole === 'MASTER_ADMIN' ? 'Master Admin' : 'Office Admin'}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-white rounded-xl text-sm font-bold text-on-surface-variant">
            <Calendar className="w-4 h-4 text-outline" />
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => { setCurrentDate(e.target.value); setFilterByDate(true); }} 
              className="border-none p-0 bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
            />
          </div>

          {/* TODO: Permission Integration — check ATTENDANCE_MARK permission */}
          <button 
            onClick={handleOpenWorkspace}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md cursor-pointer active:scale-95 duration-150"
          >
            Mark Attendance
          </button>
        </div>
      </div>

      {/* ── Filter Row Section ─────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Department</label>
            <CustomSelect 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={deptOptions}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Course</label>
            <CustomSelect 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              options={courseOptions}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Subject</label>
            <CustomSelect 
              value={selectedSubj}
              onChange={(e) => setSelectedSubj(e.target.value)}
              options={subjectOptions}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setFilterByDate(prev => !prev); }}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-all cursor-pointer ${
                filterByDate ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{filterByDate ? `Date: ${currentDate}` : 'All Dates'}</span>
            </button>

            {(selectedDept !== 'All' || selectedCourse !== 'All' || selectedSubj !== 'All' || filterByDate) && (
              <button
                onClick={() => { setSelectedDept('All'); setSelectedCourse('All'); setSelectedSubj('All'); setFilterByDate(false); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bento Row: Metrics breakdown ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Average Attendance Rate */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-outline tracking-wider">Average Attendance</p>
              <h3 className="text-4xl font-extrabold text-on-surface mt-1 tracking-tight">{overallAvgRate}%</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Live Session Aggregate
            </span>
          </div>

          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" className="stroke-outline-variant fill-none" strokeWidth="6" />
              <circle 
                cx="40" cy="40" r="32" 
                className="stroke-primary fill-none transition-all duration-700" 
                strokeWidth="6" 
                strokeDasharray="200" 
                strokeDashoffset={200 - (200 * Number(overallAvgRate)) / 100} 
                strokeLinecap="round" 
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary font-mono">{Math.round(Number(overallAvgRate))}%</span>
          </div>
        </div>

        {/* Card 2: Departmental breakdown */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h5 className="text-xs font-bold uppercase text-outline tracking-wider mb-4">Departmental Breakdown</h5>
            <div className="space-y-3">
              {departmentalBreakdown.slice(0, 3).map((dept, i) => (
                <div key={dept.name}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-on-surface">{dept.name}</span>
                    <span className={i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-tertiary'}>{dept.rate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-primary' : i === 1 ? 'bg-secondary' : 'bg-tertiary'}`} 
                      style={{ width: `${dept.rate}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: October Peak insight */}
        <div 
          onClick={handleOpenWorkspace}
          className="bg-gradient-to-br from-secondary to-on-secondary-container p-6 rounded-2xl text-white flex flex-col justify-between shadow-md relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">Institutional Session</span>
            <h4 className="text-xl font-bold mt-3 leading-snug">{overallAvgRate}% Attendance Rate achieved across active sessions.</h4>
            <p className="text-xs text-white/70 mt-1">Managed via Office Administrative ERP controls.</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold mt-4 hover:underline group-hover:translate-x-1 transition-transform">
            <span>Take Session Attendance</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Bento Layout: Heatmap & Faculty status list ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Heatmap calendar view */}
        <div className="xl:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-sans font-bold text-lg text-on-surface">Attendance Intensity Heatmap</h3>
              <p className="text-xs text-on-surface-variant">Grid represents relative lecture room fill-rates this month.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-outline font-bold">
              <span>Low</span>
              <div className="w-3.5 h-3.5 bg-primary/10 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-primary/35 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-primary/70 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-primary rounded-sm" />
              <span>High</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-bold text-outline py-1">{day}</div>
            ))}
            {weeks.map((_, weekIdx) => (
              cellIntensities[weekIdx].map((intensity, dayIdx) => (
                <div 
                  key={`${weekIdx}-${dayIdx}`}
                  onClick={() => {
                    const dayNum = String(weekIdx * 7 + dayIdx + 1).padStart(2, '0');
                    setCurrentDate(`2026-07-${dayNum}`);
                    setFilterByDate(true);
                  }}
                  className={`aspect-video rounded-md flex flex-col justify-between p-2 cursor-pointer border hover:scale-105 hover:border-primary transition-all relative group ${
                    intensity >= 94 
                      ? 'bg-primary text-on-primary border-primary/20' 
                      : intensity >= 88 
                      ? 'bg-primary/70 text-on-primary border-primary/10'
                      : intensity >= 70 
                      ? 'bg-primary/35 text-on-surface border-outline-variant/35'
                      : 'bg-primary/10 text-on-surface-variant border-outline-variant/20'
                  }`}
                  title={`Day ${weekIdx * 7 + dayIdx + 1}: ${intensity}% rate. Click to filter.`}
                >
                  <span className="text-[9px] font-bold opacity-60">Day {weekIdx * 7 + dayIdx + 1}</span>
                  <span className="text-xs font-extrabold self-end">{intensity}%</span>
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Faculty Logs Status List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-bold text-lg text-on-surface">Faculty Status Logs</h3>
              <span className="text-[10px] bg-surface p-1 rounded font-bold text-outline uppercase">Live Sync</span>
            </div>

            <div className="divide-y divide-outline-variant/30 space-y-4">
              {store.faculties.map((fac) => (
                <div key={fac.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                      {fac.initials || fac.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{fac.name}</h5>
                      <p className="text-xs text-on-surface-variant mt-0.5">{fac.subject} • {fac.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fac.status === 'Marked' 
                      ? 'bg-emerald-500/10 text-emerald-700' 
                      : fac.status === 'Pending'
                      ? 'bg-amber-500/10 text-amber-700'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {fac.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-2 text-xs text-on-surface-variant leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Biometric logs are updated instantly when lecturers access designated smart lecture rooms.</span>
          </div>
        </div>
      </div>

      {/* ── Student Attendance Detailed Log Data Table ──────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {/* Table Control Header Tabs */}
        <div className="border-b border-outline-variant/50 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface">
          <div className="flex bg-surface-container p-1 rounded-lg">
            <button 
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'all' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              All Records ({store.attendanceRecords.length})
            </button>
            <button 
              onClick={() => setSelectedTab('present')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'present' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Present ({store.attendanceRecords.filter(r => r.status === 'Present').length})
            </button>
            <button 
              onClick={() => setSelectedTab('absent')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedTab === 'absent' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Absent ({store.attendanceRecords.filter(r => r.status === 'Absent').length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search student, ID, section…"
                className="pl-8 pr-7 h-9 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant bg-white hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-outline" />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant/60">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student ID</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student Name</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Course Section</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Overall Rate</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Date</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="py-4 px-6 text-sm font-bold text-on-surface-variant font-mono">{rec.studentId}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                        {rec.initials}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{rec.studentName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-variant">{rec.courseSection}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      rec.status === 'Present' 
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                        : 'bg-error/10 text-error border-error/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rec.status === 'Present' ? 'bg-emerald-600' : 'bg-error'}`} />
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-on-surface">{rec.attendancePercentage}%</td>
                  <td className="py-4 px-6 text-xs text-slate-500 font-mono">{rec.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedRecordDetails(rec);
                          setIsDetailsModalOpen(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="View Record Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(rec.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          rec.status === 'Present'
                            ? 'bg-error/5 hover:bg-error/15 text-error border-error/10'
                            : 'bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-700 border-emerald-500/10'
                        }`}
                      >
                        {rec.status === 'Present' ? 'Set Absent' : 'Set Present'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant text-sm">
                    No attendance records match your active search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal 2: View Record Details Modal ──────────────────────────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Attendance Record Details"
      >
        {selectedRecordDetails && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {selectedRecordDetails.initials}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{selectedRecordDetails.studentName}</p>
                <p className="text-xs text-slate-500 font-mono">{selectedRecordDetails.studentId}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Course Section:</span>
                <span className="font-bold text-slate-800">{selectedRecordDetails.courseSection}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Status:</span>
                <span className={`font-bold ${selectedRecordDetails.status === 'Present' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedRecordDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Attendance Rate:</span>
                <span className="font-bold text-slate-800">{selectedRecordDetails.attendancePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Date Logged:</span>
                <span className="font-mono text-slate-800">{selectedRecordDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Taken By:</span>
                <span className="font-bold text-blue-600">Master Admin ({store.activeRole})</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
