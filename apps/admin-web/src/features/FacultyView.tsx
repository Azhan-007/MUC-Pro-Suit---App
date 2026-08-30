"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  GraduationCap, Plus, Mail, BookOpen, Clock, 
  Trash2, Edit, Users, Search, AlertTriangle, X, Check,
  Building2, Info, LayoutGrid, List
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Faculty, FacultyStatus } from '../types';

interface FacultyFormValues {
  name: string;
  email: string;
  department: string;
  course: string;
  subject: string;
  time: string;
  status: FacultyStatus;
}

interface DeleteIntent {
  faculty: Faculty;
  timetableCount: number;
  hasDependent: boolean;
}

const STATUS_OPTIONS: FacultyStatus[] = ['Scheduled', 'Pending', 'Marked'];

const STATUS_STYLE: Record<FacultyStatus, string> = {
  'Marked': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  'Pending': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  'Scheduled': 'bg-primary/10 text-primary border-primary/20',
};

export default function FacultyView() {
  const store = useERPStore();

  // ── Filters & View Mode ────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // ── Modal State ────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);

  // TODO: Permission Integration
  // In the future, Faculty CUD access will depend on permissions assigned
  // by MASTER_ADMIN to a specific ADMIN account (e.g. FACULTY_MANAGE).
  const canManageFaculty = true;

  // ── React Hook Form ────────────────────────────────────────────────────
  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors, isSubmitting, isDirty } } = useForm<FacultyFormValues>({
    defaultValues: {
      status: 'Scheduled',
    }
  });

  const watchedDept = watch('department');

  // ── Department options from store ──────────────────────────────────────
  const deptOptions = useMemo(
    () => store.departments.map(d => d.name),
    [store.departments]
  );

  // ── Course options filtered by department ──────────────────────────────
  const courseOptions = useMemo(() => {
    if (!watchedDept) return store.courses.map(c => c.name);
    const filtered = store.courses.filter(c => c.department === watchedDept);
    return filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name);
  }, [watchedDept, store.courses]);

  // ── Filtered Faculties ─────────────────────────────────────────────────
  const filteredFaculties = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return store.faculties.filter(fac => {
      const matchSearch = !q ||
        fac.name.toLowerCase().includes(q) ||
        fac.id.toLowerCase().includes(q) ||
        fac.email.toLowerCase().includes(q) ||
        fac.subject.toLowerCase().includes(q) ||
        fac.department.toLowerCase().includes(q) ||
        fac.course.toLowerCase().includes(q);

      const matchDept = selectedDept === 'All Departments' || fac.department === selectedDept;
      const matchStatus = selectedStatus === 'All Statuses' || fac.status === selectedStatus;

      return matchSearch && matchDept && matchStatus;
    });
  }, [store.faculties, localSearch, selectedDept, selectedStatus]);

  // ── Metrics ────────────────────────────────────────────────────────────
  const totalFacultyCount = store.faculties.length;
  const markedCount = store.faculties.filter(f => f.status === 'Marked').length;
  const pendingCount = store.faculties.filter(f => f.status === 'Pending').length;
  const scheduledCount = store.faculties.filter(f => f.status === 'Scheduled').length;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingFacultyId(null);
    setFormError(null);
    reset({ name: '', email: '', department: '', course: '', subject: '', time: '', status: 'Scheduled' });
    setIsModalOpen(true);
  }, [reset]);

  const handleOpenEdit = useCallback((fac: Faculty) => {
    setEditingFacultyId(fac.id);
    setFormError(null);
    setValue('name', fac.name);
    setValue('email', fac.email);
    setValue('department', fac.department);
    setValue('course', fac.course);
    setValue('subject', fac.subject);
    setValue('time', fac.time);
    setValue('status', fac.status);
    setIsModalOpen(true);
  }, [setValue]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingFacultyId(null);
    setFormError(null);
    reset();
  }, [reset]);

  const onSubmitForm = useCallback((values: FacultyFormValues) => {
    const trimmed: FacultyFormValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      subject: values.subject.trim(),
      course: values.course.trim(),
      time: values.time.trim(),
    };

    // Duplicate email validation
    const emailConflict = store.faculties.find(
      f => f.email.toLowerCase() === trimmed.email && f.id !== editingFacultyId
    );
    if (emailConflict) {
      setFormError(`Faculty member with email "${trimmed.email}" already exists (${emailConflict.name}).`);
      return;
    }

    setFormError(null);

    if (editingFacultyId) {
      // TODO: Backend Integration — call PATCH /api/faculties/:id
      store.updateFaculty(editingFacultyId, trimmed);
    } else {
      // TODO: Backend Integration — call POST /api/faculties
      store.addFaculty(trimmed);
    }
    handleCloseModal();
  }, [store, editingFacultyId, handleCloseModal]);

  // ── Delete Intent & Confirmation ───────────────────────────────────────
  const handleDeleteIntent = useCallback((fac: Faculty) => {
    const timetableSlots = store.timetable.filter(t => t.facultyName === fac.name).length;
    setDeleteIntent({
      faculty: fac,
      timetableCount: timetableSlots,
      hasDependent: timetableSlots > 0,
    });
  }, [store.timetable]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent) return;
    // TODO: Backend Integration — call DELETE /api/faculties/:id
    store.deleteFaculty(deleteIntent.faculty.id);
    setDeleteIntent(null);
  }, [deleteIntent, store]);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Faculty Hub</span>
          </nav>
          <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">Faculty Directory</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {totalFacultyCount} faculty member{totalFacultyCount !== 1 ? 's' : ''} assigned to active departments
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
              aria-label="Switch to grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
              aria-label="Switch to table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {canManageFaculty && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs sm:text-sm shadow-md shadow-primary/10 active:scale-95 duration-150 cursor-pointer whitespace-nowrap"
              title="Register new faculty member"
              aria-label="Register new faculty member"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add New Faculty</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: 'Total Faculty',
            value: totalFacultyCount,
            icon: <GraduationCap className="w-5.5 h-5.5" />,
            color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
            border: 'hover:border-primary/80 hover:shadow-primary/5',
            gradient: 'from-primary to-blue-500',
            onClick: () => { setSelectedDept('All Departments'); setSelectedStatus('All Statuses'); setLocalSearch(''); },
            title: 'Show all faculty',
          },
          {
            label: 'Scheduled',
            value: scheduledCount,
            icon: <Clock className="w-5.5 h-5.5" />,
            color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
            border: 'hover:border-blue-500/80 hover:shadow-blue-500/5',
            gradient: 'from-blue-500 to-sky-400',
            onClick: () => setSelectedStatus('Scheduled'),
            title: 'Filter: Scheduled status',
          },
          {
            label: 'Pending',
            value: pendingCount,
            icon: <AlertTriangle className="w-5.5 h-5.5" />,
            color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
            border: 'hover:border-amber-500/80 hover:shadow-amber-500/5',
            gradient: 'from-amber-500 to-orange-400',
            onClick: () => setSelectedStatus('Pending'),
            title: 'Filter: Pending status',
          },
          {
            label: 'Marked Present',
            value: markedCount,
            icon: <Check className="w-5.5 h-5.5" />,
            color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
            border: 'hover:border-emerald-500/80 hover:shadow-emerald-500/5',
            gradient: 'from-emerald-500 to-teal-400',
            onClick: () => setSelectedStatus('Marked'),
            title: 'Filter: Marked status',
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

      {/* Filter Row Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Search Faculty
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Name, ID, email, subject, course…"
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors" aria-label="Clear search">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-auto min-w-[160px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Department</label>
            <CustomSelect
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              options={['All Departments', ...deptOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-auto min-w-[140px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <CustomSelect
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              options={['All Statuses', ...STATUS_OPTIONS]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={() => { setSelectedDept('All Departments'); setSelectedStatus('All Statuses'); setLocalSearch(''); }}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Clear Filters
          </button>
        </div>

        {(localSearch || selectedDept !== 'All Departments' || selectedStatus !== 'All Statuses') && (
          <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            Showing <span className="font-bold text-slate-800">{filteredFaculties.length}</span> of <span className="font-bold text-slate-800">{totalFacultyCount}</span> faculty members
          </p>
        )}
      </div>

      {/* Faculty Display Area */}
      {store.faculties.length === 0 ? (
        /* Empty State: No faculty records */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <GraduationCap className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">No Faculty Members Registered</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Start building your academic staff directory by adding faculty profiles.
          </p>
          {canManageFaculty && (
            <button
              onClick={handleOpenCreate}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add First Faculty
            </button>
          )}
        </div>
      ) : filteredFaculties.length === 0 ? (
        /* Empty State: Search returned no results */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Search className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">No Faculty Match Criteria</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Try adjusting your search query or filters.
          </p>
          <button
            onClick={() => { setLocalSearch(''); setSelectedDept('All Departments'); setSelectedStatus('All Statuses'); }}
            className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Clear all active filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid of Profile Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculties.map((fac) => (
            <div 
              key={fac.id} 
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div>
                {/* Header Profile details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {fac.avatarUrl ? (
                      <img 
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs shrink-0" 
                        src={fac.avatarUrl} 
                        alt={fac.name} 
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shadow-xs shrink-0">
                        {fac.initials ?? fac.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">{fac.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">{fac.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 ${STATUS_STYLE[fac.status]}`}>
                    {fac.status}
                  </span>
                </div>

                {/* Metadata */}
                <div className="space-y-2.5 mt-5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{fac.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{fac.subject}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{fac.time} <span className="text-slate-400">({fac.course})</span></span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-bold uppercase flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{fac.department}</span>
                </span>
                {canManageFaculty && (
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button 
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                      title="Edit Faculty Profile"
                      aria-label={`Edit ${fac.name}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteIntent(fac)}
                      className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Faculty Profile"
                      aria-label={`Delete ${fac.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-5">Faculty ID</th>
                  <th className="py-3.5 px-5">Name & Email</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Subject / Course</th>
                  <th className="py-3.5 px-5">Time Slot</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaculties.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/70 transition-all duration-150 group">
                    <td className="py-3.5 px-5 text-xs font-bold text-slate-500 font-mono group-hover:text-primary transition-colors whitespace-nowrap">
                      {fac.id}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {fac.avatarUrl ? (
                          <img className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs shrink-0" src={fac.avatarUrl} alt={fac.name} />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
                            {fac.initials ?? fac.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight group-hover:text-primary transition-colors">{fac.name}</p>
                          <p className="text-xs text-slate-400 font-mono truncate mt-0.5">{fac.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 truncate max-w-[140px]">{fac.department}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      <span className="font-bold text-slate-800">{fac.subject}</span>
                      <span className="text-[11px] text-slate-400 block font-sans">{fac.course}</span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-semibold text-slate-600 whitespace-nowrap">{fac.time}</td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_STYLE[fac.status]}`}>
                        {fac.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {canManageFaculty && (
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(fac)}
                            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                            title="Edit Record"
                            aria-label={`Edit ${fac.name}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIntent(fac)}
                            className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                            title="Delete Record"
                            aria-label={`Delete ${fac.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingFacultyId ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
        isDirty={isDirty}
        onDiscard={() => reset()}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" noValidate>
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
              placeholder="e.g. Dr. Maria Garcia"
              className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
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
              placeholder="e.g. maria.g@muc.edu"
              className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono text-slate-900 placeholder:text-slate-400"
            />
            {errors.email && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.email.message}</p>}
          </div>

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
                Course Assigned <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="course"
                control={control}
                rules={{ required: 'Course assignment is required.' }}
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
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Primary Subject <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('subject', { required: 'Primary subject is required.' })}
                type="text"
                placeholder="e.g. Machine Learning"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
              />
              {errors.subject && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Lecture Time Slot <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('time', { required: 'Lecture time slot is required.' })}
                type="text"
                placeholder="e.g. 11:00 AM - 12:30 PM"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
              />
              {errors.time && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.time.message}</p>}
            </div>
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

          {/* Form validation error */}
          {formError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Info note */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
            <Info className="w-4 h-4 shrink-0" />
            <span>Faculty ID is generated automatically with a unique institutional prefix.</span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={handleCloseModal}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer active:scale-[0.98]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {editingFacultyId ? 'Save Changes' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteIntent !== null}
        onClose={() => setDeleteIntent(null)}
        title="Remove Faculty Member"
      >
        {deleteIntent && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                {deleteIntent.faculty.initials ?? deleteIntent.faculty.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{deleteIntent.faculty.name}</p>
                <p className="text-xs text-slate-500 font-mono">{deleteIntent.faculty.id} · {deleteIntent.faculty.email}</p>
              </div>
            </div>

            {deleteIntent.hasDependent ? (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">Active Timetable Assignments Found</p>
                  <p>This faculty member is assigned to {deleteIntent.timetableCount} timetable slot{deleteIntent.timetableCount !== 1 ? 's' : ''}.</p>
                  <p className="mt-1 text-amber-700">Deleting will leave those timetable slots unassigned. Please reassign their classes if needed.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">No active timetable assignments found for this faculty member.</p>
              </div>
            )}

            <p className="text-sm text-slate-600">
              Are you sure you want to remove <span className="font-bold text-slate-900">{deleteIntent.faculty.name}</span>? This action cannot be undone.
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
    </div>
  );
}
