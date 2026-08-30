"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import {
  Users, UserCheck, AlertTriangle, GraduationCap,
  Search, Trash2, Edit, Plus, FileSpreadsheet,
  Download, ChevronLeft, ChevronRight, X,
  CheckCircle, Info, UserX, Check
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Student, StudentStatus } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface StudentFormValues {
  name: string;
  email: string;
  department: string;
  course: string;
  year: string;
  status: StudentStatus;
  attendancePercentage: number;
}

interface DeleteIntent {
  student: Student;
  feeCount: number;
  attendanceCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — Preserving exact color definitions
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_OPTIONS: StudentStatus[] = ['Active', 'Inactive', 'On Probation'];

const STATUS_STYLE: Record<StudentStatus, string> = {
  'Active':       'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  'Inactive':     'bg-slate-100 text-slate-500 border-slate-200',
  'On Probation': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
};

const STATUS_DOT: Record<StudentStatus, string> = {
  'Active':       'bg-emerald-600',
  'Inactive':     'bg-slate-400',
  'On Probation': 'bg-amber-600',
};

const ITEMS_PER_PAGE = 8;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentView() {
  const store = useERPStore();

  // ── Filters ───────────────────────────────────────────────────────────
  const [localSearch,    setLocalSearch]    = useState('');
  const [selectedDept,   setSelectedDept]   = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [selectedYear,   setSelectedYear]   = useState('All Years');
  const [currentPage,    setCurrentPage]    = useState(1);

  // ── Modal state ────────────────────────────────────────────────────────
  const [isFormOpen,     setIsFormOpen]     = useState(false);
  const [editingId,      setEditingId]      = useState<string | null>(null);
  const [formError,      setFormError]      = useState<string | null>(null);
  const [deleteIntent,   setDeleteIntent]   = useState<DeleteIntent | null>(null);

  // ── Bulk selection ─────────────────────────────────────────────────────
  const [selectedIds,    setSelectedIds]    = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // ── Form ───────────────────────────────────────────────────────────────
  const {
    register, handleSubmit, reset, setValue, watch, control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StudentFormValues>({
    defaultValues: { status: 'Active', attendancePercentage: 85 },
  });

  const watchedDept = watch('department');

  // ── Derived: department options from store ─────────────────────────────
  const deptOptions = useMemo(
    () => store.departments.map(d => d.name),
    [store.departments]
  );

  // ── Derived: courses filtered by selected department ───────────────────
  const courseOptions = useMemo(() => {
    if (!watchedDept) return store.courses.map(c => c.name);
    const filtered = store.courses.filter(c => c.department === watchedDept);
    return filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name);
  }, [watchedDept, store.courses]);

  // ── Derived: unique admission years from actual student data ───────────
  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(store.students.map(s => s.year))).sort((a, b) => b.localeCompare(a));
    return years;
  }, [store.students]);

  // ── Derived: filtered + paginated students ─────────────────────────────
  const filteredStudents = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return store.students.filter(s => {
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q);
      const matchDept   = selectedDept   === 'All Departments' || s.department === selectedDept;
      const matchStatus = selectedStatus === 'All Statuses'    || s.status === selectedStatus;
      const matchYear   = selectedYear   === 'All Years'       || s.year === selectedYear;
      return matchSearch && matchDept && matchStatus && matchYear;
    });
  }, [store.students, localSearch, selectedDept, selectedStatus, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [localSearch, selectedDept, selectedStatus, selectedYear]);

  // ── KPI counts ─────────────────────────────────────────────────────────
  const totalCount      = store.students.length;
  const activeCount     = store.students.filter(s => s.status === 'Active').length;
  const probationCount  = store.students.filter(s => s.status === 'On Probation').length;
  const newAdmissions   = useMemo(() => {
    if (yearOptions.length === 0) return 0;
    const latestYear = yearOptions[0];
    return store.students.filter(s => s.year === latestYear).length;
  }, [store.students, yearOptions]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFormError(null);
    reset({ status: 'Active', attendancePercentage: 85, name: '', email: '', department: '', course: '', year: '' });
    setIsFormOpen(true);
  }, [reset]);

  const handleOpenEdit = useCallback((student: Student) => {
    setEditingId(student.id);
    setFormError(null);
    setValue('name',               student.name);
    setValue('email',              student.email);
    setValue('department',         student.department);
    setValue('course',             student.course);
    setValue('year',               student.year);
    setValue('status',             student.status);
    setValue('attendancePercentage', student.attendancePercentage);
    setIsFormOpen(true);
  }, [setValue]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
    reset();
  }, [reset]);

  const onSubmit = useCallback((values: StudentFormValues) => {
    const trimmed: StudentFormValues = {
      ...values,
      name:  values.name.trim(),
      email: values.email.trim().toLowerCase(),
      attendancePercentage: Number(values.attendancePercentage),
    };

    // Duplicate email check
    const emailConflict = store.students.find(
      s => s.email.toLowerCase() === trimmed.email && s.id !== editingId
    );
    if (emailConflict) {
      setFormError(`Email "${trimmed.email}" is already registered to ${emailConflict.name}.`);
      return;
    }

    setFormError(null);

    if (editingId) {
      // TODO: Backend Integration — call PATCH /api/students/:id
      store.updateStudent(editingId, trimmed);
    } else {
      // TODO: Backend Integration — call POST /api/students
      store.addStudent(trimmed);
    }
    handleCloseForm();
  }, [store, editingId, handleCloseForm]);

  // ── Delete intent ──────────────────────────────────────────────────────
  const handleDeleteIntent = useCallback((student: Student) => {
    const feeCount        = store.feeRecords.filter(f => f.studentId === student.id).length;
    const attendanceCount = store.attendanceRecords.filter(a => a.studentId === student.id).length;
    setDeleteIntent({ student, feeCount, attendanceCount });
  }, [store.feeRecords, store.attendanceRecords]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent) return;
    // TODO: Backend Integration — call DELETE /api/students/:id
    store.deleteStudent(deleteIntent.student.id);
    setSelectedIds(prev => prev.filter(id => id !== deleteIntent.student.id));
    setDeleteIntent(null);
  }, [deleteIntent, store]);

  // ── Bulk selection ─────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    const pageIds = paginatedStudents.map(s => s.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev =>
      allSelected ? prev.filter(id => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]
    );
  }, [paginatedStudents, selectedIds]);

  const confirmBulkDelete = useCallback(() => {
    // TODO: Backend Integration — batch DELETE /api/students
    selectedIds.forEach(id => store.deleteStudent(id));
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  }, [selectedIds, store]);

  const handleBulkStatus = useCallback((status: StudentStatus) => {
    selectedIds.forEach(id => store.updateStudent(id, { status }));
    setSelectedIds([]);
  }, [selectedIds, store]);

  // ── Export CSV ─────────────────────────────────────────────────────────
  const handleExportCSV = useCallback(() => {
    const rows = [
      'Student ID,Name,Email,Department,Course,Year,Status,Attendance',
      ...filteredStudents.map(s =>
        `${s.id},"${s.name}",${s.email},"${s.department}","${s.course}",${s.year},${s.status},${s.attendancePercentage}%`
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'MUC_Students.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }, [filteredStudents]);

  const allOnPageSelected = paginatedStudents.length > 0 &&
    paginatedStudents.every(s => selectedIds.includes(s.id));

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── Page Header & Action Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Student Management</span>
          </nav>
          <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{totalCount} student{totalCount !== 1 ? 's' : ''} enrolled in active sessions</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Download CSV export"
            aria-label="Download CSV export"
          >
            <Download className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => alert('Bulk Import: CSV upload will be available in a future release.\n\nTODO: Backend Integration')}
            className="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Bulk import students"
            aria-label="Bulk import students"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs sm:text-sm shadow-md shadow-primary/10 cursor-pointer active:scale-95"
            title="Register new student"
            aria-label="Register new student"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Students', value: totalCount, icon: <Users className="w-5.5 h-5.5" />,
            color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
            border: 'hover:border-primary/80 hover:shadow-primary/5',
            gradient: 'from-primary to-blue-500',
            onClick: () => { setSelectedDept('All Departments'); setSelectedStatus('All Statuses'); setSelectedYear('All Years'); setLocalSearch(''); },
            title: 'Show all students',
          },
          {
            label: 'Active', value: activeCount, icon: <UserCheck className="w-5.5 h-5.5" />,
            color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
            border: 'hover:border-emerald-500/80 hover:shadow-emerald-500/5',
            gradient: 'from-emerald-500 to-teal-400',
            onClick: () => setSelectedStatus('Active'),
            title: 'Filter: Active students',
          },
          {
            label: 'On Probation', value: probationCount, icon: <AlertTriangle className="w-5.5 h-5.5" />,
            color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
            border: 'hover:border-amber-500/80 hover:shadow-amber-500/5',
            gradient: 'from-amber-500 to-orange-400',
            onClick: () => setSelectedStatus('On Probation'),
            title: 'Filter: On Probation students',
          },
          {
            label: 'New Admissions', value: newAdmissions, icon: <GraduationCap className="w-5.5 h-5.5" />,
            color: 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white',
            border: 'hover:border-secondary/80 hover:shadow-secondary/5',
            gradient: 'from-secondary to-sky-400',
            onClick: () => yearOptions[0] && setSelectedYear(yearOptions[0]),
            title: `Filter: ${yearOptions[0] ?? 'Latest'} admissions`,
          },
        ].map(card => (
          <div
            key={card.label}
            role="button"
            tabIndex={0}
            onClick={card.onClick}
            onKeyDown={e => e.key === 'Enter' && card.onClick()}
            title={card.title}
            aria-label={`${card.label}: ${card.value}`}
            className={`bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl flex items-center gap-3.5 shadow-xs ${card.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
            <div className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 shrink-0 ${card.color}`}>
              {card.icon}
            </div>
            <div className="relative z-10 min-w-0">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">{card.label}</p>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-tight">{card.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Toolbar ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-end gap-3 sm:gap-4">
          {/* Search input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Search Student Records
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Name, Student ID, email, course…"
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Department dropdown */}
          <div className="w-full sm:w-auto min-w-[160px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Department</label>
            <CustomSelect
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              options={['All Departments', ...deptOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          {/* Year dropdown */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Admission Year</label>
            <CustomSelect
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              options={['All Years', ...yearOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          {/* Status dropdown */}
          <div className="w-full sm:w-auto min-w-[130px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <CustomSelect
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              options={['All Statuses', ...STATUS_OPTIONS]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={() => { setSelectedDept('All Departments'); setSelectedYear('All Years'); setSelectedStatus('All Statuses'); setLocalSearch(''); }}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Clear Filters
          </button>
        </div>

        {/* Filter Summary */}
        {(localSearch || selectedDept !== 'All Departments' || selectedStatus !== 'All Statuses' || selectedYear !== 'All Years') && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <p>
              Showing <span className="font-bold text-slate-800">{filteredStudents.length}</span> of <span className="font-bold text-slate-800">{totalCount}</span> student records
            </p>
          </div>
        )}
      </div>

      {/* ── Bulk Action Bar (when rows are checked) ────────────────────── */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-5 shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white font-mono font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs sm:text-sm font-bold">Students Selected</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 mr-1 hidden sm:inline">Set Status:</span>
            <button
              onClick={() => handleBulkStatus('Active')}
              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Active
            </button>
            <button
              onClick={() => handleBulkStatus('On Probation')}
              className="px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              Probation
            </button>
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Deselect all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Student Data Table ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-5 w-12">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    aria-label="Select all students on page"
                  />
                </th>
                <th className="py-3.5 px-5">Student ID</th>
                <th className="py-3.5 px-5">Name & Email</th>
                <th className="py-3.5 px-5 hidden md:table-cell">Department</th>
                <th className="py-3.5 px-5 hidden lg:table-cell">Course / Program</th>
                <th className="py-3.5 px-5 hidden lg:table-cell">Admission Year</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    {totalCount === 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <Users className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="font-bold text-slate-700">No Students Registered Yet</p>
                        <p className="text-xs text-slate-400 max-w-xs">Get started by enrolling the first student profile into the system.</p>
                        <button
                          onClick={handleOpenCreate}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary/95 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4" /> Add First Student
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                          <Search className="w-7 h-7 text-amber-400" />
                        </div>
                        <p className="font-bold text-slate-700">No Matching Students Found</p>
                        <p className="text-xs text-slate-400">
                          Try refining your search text or clearing the active filters.
                        </p>
                        <button
                          onClick={() => { setLocalSearch(''); setSelectedDept('All Departments'); setSelectedStatus('All Statuses'); setSelectedYear('All Years'); }}
                          className="mt-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          Clear all active filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : paginatedStudents.map(student => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/70 transition-all duration-150 group"
                >
                  <td className="py-3.5 px-5 border-l-2 border-l-transparent group-hover:border-l-primary transition-all duration-150">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student.id)}
                      onChange={() => toggleSelect(student.id)}
                      className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      aria-label={`Select ${student.name}`}
                    />
                  </td>
                  <td className="py-3.5 px-5 text-xs font-bold text-slate-500 font-mono group-hover:text-primary transition-colors whitespace-nowrap">
                    {student.id}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                          src={student.avatarUrl}
                          alt={student.name}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                          {student.initials ?? student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight group-hover:text-primary transition-colors">{student.name}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-600 hidden md:table-cell truncate max-w-[140px]">
                    {student.department}
                  </td>
                  <td className="py-3.5 px-5 hidden lg:table-cell">
                    <span className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs font-bold border border-primary/10 whitespace-nowrap">
                      {student.course}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-600 font-mono hidden lg:table-cell">
                    {student.year}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[student.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[student.status]}`} />
                      {student.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                        title="Edit Student Record"
                        aria-label={`Edit ${student.name}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIntent(student)}
                        className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                        title="Delete Student Record"
                        aria-label={`Delete ${student.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredStudents.length > ITEMS_PER_PAGE && (
          <div className="border-t border-slate-100 px-5 py-3.5 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">
              Showing <span className="font-extrabold text-slate-800">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}
              </span> of <span className="font-extrabold text-slate-800">{filteredStudents.length}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-xs text-slate-400 px-1">…</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === p ? 'bg-primary text-white shadow-xs' : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))
              }
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Next page"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal 1: Register / Edit Student Modal ────────────────────── */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Edit Student Profile' : 'Register New Student'}
        isDirty={isDirty}
        onDiscard={() => reset()}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('name', {
                  required: 'Full name is required.',
                  minLength: { value: 2, message: 'Name must be at least 2 characters.' },
                  validate: v => v.trim().length >= 2 || 'Name must be at least 2 characters.',
                })}
                type="text"
                placeholder="e.g. Rahul Sharma"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400"
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Institutional Email <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email is required.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
                })}
                type="email"
                placeholder="e.g. rahul.s@muc.edu"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400 font-mono"
              />
              {errors.email && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.email.message}</p>}
            </div>
          </div>

          {/* Department + Course */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="department"
                control={control}
                rules={{ required: 'Department is required.' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(e) => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={deptOptions.length > 0 ? deptOptions : ['No departments available']}
                    placeholder="Select Department"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                )}
              />
              {errors.department && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.department.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Course / Program <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="course"
                control={control}
                rules={{ required: 'Course is required.' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(e) => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={courseOptions.length > 0 ? courseOptions : ['No courses available']}
                    placeholder="Select Course"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                )}
              />
              {errors.course && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.course.message}</p>}
              {watchedDept && courseOptions.length < store.courses.length && (
                <p className="text-[11px] text-blue-600 mt-1 font-semibold">Filtered courses for {watchedDept}</p>
              )}
            </div>
          </div>

          {/* Year + Status + Attendance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Admission Year <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('year', {
                  required: 'Admission year is required.',
                  pattern: { value: /^\d{4}$/, message: 'Enter a 4-digit year (e.g. 2024).' },
                })}
                type="text"
                maxLength={4}
                placeholder="e.g. 2024"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-sans"
              />
              {errors.year && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.year.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(e) => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={STATUS_OPTIONS}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Attendance % <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('attendancePercentage', {
                  required: 'Required.',
                  min: { value: 0, message: '≥ 0' },
                  max: { value: 100, message: '≤ 100' },
                })}
                type="number"
                min={0}
                max={100}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono text-slate-900"
              />
              {errors.attendancePercentage && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.attendancePercentage.message}</p>}
            </div>
          </div>

          {/* Duplicate email error */}
          {formError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Info note */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
            <Info className="w-4 h-4 shrink-0" />
            <span>Student ID is generated automatically. Enrollment date will be logged upon submission.</span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseForm}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {editingId ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Delete Single Confirmation Modal ───────────────────── */}
      <Modal
        isOpen={deleteIntent !== null}
        onClose={() => setDeleteIntent(null)}
        title="Remove Student Record"
      >
        {deleteIntent && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                {deleteIntent.student.initials ?? deleteIntent.student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{deleteIntent.student.name}</p>
                <p className="text-xs text-slate-500 font-mono">{deleteIntent.student.id} · {deleteIntent.student.email}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to remove <span className="font-bold text-slate-900">{deleteIntent.student.name}</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteIntent(null)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs active:scale-[0.98] cursor-pointer"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Bulk Delete Confirmation Modal ────────────────────── */}
      <Modal
        isOpen={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete Selected Students"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-bold text-rose-600">{selectedIds.length}</span> selected student records? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setBulkDeleteOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={confirmBulkDelete}
              className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs active:scale-[0.98] cursor-pointer"
            >
              Confirm Bulk Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
