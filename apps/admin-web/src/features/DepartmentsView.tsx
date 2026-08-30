"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import {
  Building2, Users, GraduationCap, MapPin, Plus, Trash2, Edit,
  Search, AlertTriangle, BookOpen, X, Info
} from 'lucide-react';
import Modal from '../components/Modal';
import type { Department } from '../types';

// ---------------------------------------------------------------------------
// Form value type — mirrors the Department fields that are user-editable.
// countStudents / countFaculty are derived, not entered manually.
// ---------------------------------------------------------------------------
interface DeptFormValues {
  name: string;
  code: string;
  head: string;
  block: string;
}

// ---------------------------------------------------------------------------
// Delete confirmation state
// ---------------------------------------------------------------------------
interface DeleteIntent {
  dept: Department;
  studentCount: number;
  facultyCount: number;
  courseCount: number;
  hasDependent: boolean;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function DepartmentsView() {
  // ── Store ──────────────────────────────────────────────────────────────
  const departments   = useERPStore((s) => s.departments);
  const students      = useERPStore((s) => s.students);
  const faculties     = useERPStore((s) => s.faculties);
  const courses       = useERPStore((s) => s.courses);
  const addDepartment    = useERPStore((s) => s.addDepartment);
  const updateDepartment = useERPStore((s) => s.updateDepartment);
  const deleteDepartment = useERPStore((s) => s.deleteDepartment);

  // TODO: Permission Integration
  // In the future, Department CUD access will depend on permissions assigned
  // by MASTER_ADMIN to a specific ADMIN account (e.g. DEPARTMENTS_MANAGE).
  const canManageDepartments = true;

  // ── Local UI state ─────────────────────────────────────────────────────
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deleteIntent,  setDeleteIntent]  = useState<DeleteIntent | null>(null);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [formError,     setFormError]     = useState<string | null>(null);

  // ── React Hook Form ────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DeptFormValues>();

  // ── Derived: live student/faculty counts from the store ────────────────
  const liveCounts = useMemo(() => {
    const map: Record<string, { students: number; faculty: number; courses: number }> = {};
    departments.forEach((d) => {
      const s = students.filter((st) => st.department === d.name).length;
      const f = faculties.filter((fc) => fc.department === d.name).length;
      const c = courses.filter((co) => co.department === d.name).length;
      map[d.id] = {
        students: s || d.countStudents,
        faculty:  f || d.countFaculty,
        courses:  c,
      };
    });
    return map;
  }, [departments, students, faculties, courses]);

  // ── Derived: filtered department list ──────────────────────────────────
  const filteredDepts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.head.toLowerCase().includes(q) ||
        d.block.toLowerCase().includes(q)
    );
  }, [departments, searchQuery]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingDeptId(null);
    setFormError(null);
    reset({ name: '', code: '', head: '', block: '' });
    setIsModalOpen(true);
  }, [reset]);

  const handleOpenEdit = useCallback((dept: Department) => {
    setEditingDeptId(dept.id);
    setFormError(null);
    setValue('name',  dept.name);
    setValue('code',  dept.code.toUpperCase());
    setValue('head',  dept.head);
    setValue('block', dept.block);
    setIsModalOpen(true);
  }, [setValue]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingDeptId(null);
    setFormError(null);
    reset();
  }, [reset]);

  // ── Delete flow: show confirmation, check dependencies ─────────────────
  const handleDeleteIntent = useCallback((dept: Department) => {
    const counts = liveCounts[dept.id] ?? { students: 0, faculty: 0, courses: 0 };
    const hasDependent = counts.students > 0 || counts.faculty > 0 || counts.courses > 0;
    setDeleteIntent({
      dept,
      studentCount: counts.students,
      facultyCount: counts.faculty,
      courseCount:  counts.courses,
      hasDependent,
    });
  }, [liveCounts]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent || deleteIntent.hasDependent) return;
    // TODO: Backend Integration — call DELETE /api/departments/:id
    deleteDepartment(deleteIntent.dept.id);
    setDeleteIntent(null);
  }, [deleteIntent, deleteDepartment]);

  // ── Form submit: create or update ─────────────────────────────────────
  const onSubmit = useCallback((values: DeptFormValues) => {
    const trimmed: DeptFormValues = {
      name:  values.name.trim(),
      code:  values.code.trim().toUpperCase(),
      head:  values.head.trim(),
      block: values.block.trim(),
    };

    // ── Duplicate guards ──────────────────────────────────────────────
    const nameConflict = departments.find(
      (d) =>
        d.name.toLowerCase() === trimmed.name.toLowerCase() &&
        d.id !== editingDeptId
    );
    if (nameConflict) {
      setFormError(`A department named "${nameConflict.name}" already exists.`);
      return;
    }

    const codeConflict = departments.find(
      (d) =>
        d.code.toLowerCase() === trimmed.code.toLowerCase() &&
        d.id !== editingDeptId
    );
    if (codeConflict) {
      setFormError(`Department code "${codeConflict.code}" is already assigned to "${codeConflict.name}".`);
      return;
    }

    setFormError(null);

    if (editingDeptId) {
      // TODO: Backend Integration — call PATCH /api/departments/:id
      updateDepartment(editingDeptId, trimmed);
    } else {
      // TODO: Backend Integration — call POST /api/departments
      addDepartment(trimmed);
    }

    handleCloseModal();
  }, [departments, editingDeptId, addDepartment, updateDepartment, handleCloseModal]);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── Breadcrumbs & Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Departments</span>
          </nav>
          <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Institutional Departments
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {departments.length} department{departments.length !== 1 ? 's' : ''} provisioned
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments…"
              className="pl-9 pr-9 h-10 w-full sm:w-60 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Provision button */}
          {canManageDepartments && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs sm:text-sm shadow-md shadow-primary/10 active:scale-95 duration-150 cursor-pointer whitespace-nowrap"
              title="Provision new department"
              aria-label="Provision new department"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Provision Department</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Department Cards Grid ─────────────────────────────────────── */}
      {departments.length === 0 ? (
        /* Empty state: no departments at all */
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Building2 className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">No Departments Provisioned</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Begin by provisioning your first institutional department to link students, faculty, and courses.
          </p>
          {canManageDepartments && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Provision First Department
            </button>
          )}
        </div>
      ) : filteredDepts.length === 0 ? (
        /* Empty state: search returned no results */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
            <Search className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">No Matching Departments Found</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            No departments match <span className="font-semibold text-slate-700">"{searchQuery}"</span>. Try adjusting your search term.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDepts.map((dept) => {
            const counts = liveCounts[dept.id] ?? { students: dept.countStudents, faculty: dept.countFaculty, courses: 0 };
            return (
              <div
                key={dept.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-primary/80 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
              >
                {/* Slide-in top border accent */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <div className="relative z-10">
                  {/* Card header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl text-primary flex items-center justify-center transition-all duration-200 group-hover:bg-primary group-hover:text-white group-hover:scale-105 shrink-0">
                      <Building2 className="w-5.5 h-5.5" />
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-slate-600 uppercase font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
                        {dept.code}
                      </span>
                      {canManageDepartments && (
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity duration-150 gap-1">
                          <button
                            onClick={() => handleOpenEdit(dept)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded-lg transition-colors cursor-pointer"
                            title="Edit Department"
                            aria-label={`Edit ${dept.name}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIntent(dept)}
                            className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Delete Department"
                            aria-label={`Delete ${dept.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Department name & location */}
                  <h4 className="font-bold text-base text-slate-900 mb-1 leading-tight group-hover:text-primary transition-colors duration-200 truncate">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{dept.block}</span>
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 pt-3.5 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        Head of Department
                      </span>
                      <span className="font-bold text-slate-800 text-right max-w-[130px] truncate" title={dept.head}>
                        {dept.head}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Active Students
                      </span>
                      <span className="font-bold text-slate-800 font-mono">{counts.students.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        Enrolled Faculty
                      </span>
                      <span className="font-bold text-slate-800 font-mono">{counts.faculty.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        Courses
                      </span>
                      <span className="font-bold text-slate-800 font-mono">{counts.courses}</span>
                    </div>
                  </div>

                  {/* Dept ID badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      ID: {dept.id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingDeptId ? 'Update Department Configuration' : 'Provision New Department'}
        isDirty={isDirty}
        onDiscard={() => reset()}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* Department Name */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 select-none">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('name', {
                required: 'Department name is required.',
                minLength: { value: 3, message: 'Name must be at least 3 characters.' },
                validate: (v) => v.trim().length >= 3 || 'Name must be at least 3 characters.',
              })}
              type="text"
              placeholder="e.g. Computer Science"
              className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
            />
            {errors.name && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Code + Block row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 select-none">
                Dept Code <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('code', {
                  required: 'Code is required.',
                  pattern: {
                    value: /^[A-Za-z0-9\-]{2,8}$/,
                    message: '2–8 alphanumeric characters only.',
                  },
                })}
                type="text"
                placeholder="e.g. CSE"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono text-slate-900 uppercase placeholder:normal-case placeholder:text-slate-400"
              />
              {errors.code && (
                <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 select-none">
                Block / Location <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('block', { required: 'Block/Location is required.' })}
                type="text"
                placeholder="e.g. Block A"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
              />
              {errors.block && (
                <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {errors.block.message}
                </p>
              )}
            </div>
          </div>

          {/* Head of Department */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 select-none">
              Head of Department (HOD) <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('head', { required: 'HOD name is required.' })}
              type="text"
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
            />
            {errors.head && (
              <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {errors.head.message}
              </p>
            )}
          </div>

          {/* Cross-field duplicate error */}
          {formError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Student and faculty counts are derived automatically from enrolled records.
              They cannot be set manually.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all active:scale-[0.98] duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {editingDeptId ? 'Save Changes' : 'Provision Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      <Modal
        isOpen={deleteIntent !== null}
        onClose={() => setDeleteIntent(null)}
        title="Decommission Department"
      >
        {deleteIntent && (
          <div className="space-y-4">

            {/* Department identity */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{deleteIntent.dept.name}</p>
                <p className="text-xs text-slate-500 font-mono">{deleteIntent.dept.code} · {deleteIntent.dept.block}</p>
              </div>
            </div>

            {/* Dependency warning */}
            {deleteIntent.hasDependent ? (
              <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-700">
                  <p className="font-bold mb-1">Cannot Decommission Department</p>
                  <p className="leading-relaxed">
                    This department has active associations that must be reassigned before deletion:
                  </p>
                  <ul className="mt-2 space-y-1 font-semibold">
                    {deleteIntent.studentCount > 0 && (
                      <li className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {deleteIntent.studentCount} enrolled student{deleteIntent.studentCount !== 1 ? 's' : ''}
                      </li>
                    )}
                    {deleteIntent.facultyCount > 0 && (
                      <li className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {deleteIntent.facultyCount} faculty member{deleteIntent.facultyCount !== 1 ? 's' : ''}
                      </li>
                    )}
                    {deleteIntent.courseCount > 0 && (
                      <li className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {deleteIntent.courseCount} assigned course{deleteIntent.courseCount !== 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                  <p className="mt-2 text-rose-600">
                    Reassign or remove these records first, then retry deletion.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">Confirm Decommission</p>
                  <p className="leading-relaxed">
                    This department has no dependent records and can be safely removed. This action cannot be undone.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteIntent(null)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteIntent.hasDependent}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs shadow-sm active:scale-[0.98] duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteIntent.hasDependent ? 'Cannot Delete' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
