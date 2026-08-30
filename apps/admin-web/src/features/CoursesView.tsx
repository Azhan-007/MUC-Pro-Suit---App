"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  BookOpen, Star, Plus, Trash2, Edit, Search, X, 
  Building2, GraduationCap, AlertTriangle, Info, Layers
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Course } from '../types';

interface CourseFormValues {
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
}

interface DeleteIntent {
  course: Course;
  enrolledStudents: number;
  assignedFaculty: number;
  hasDependent: boolean;
}

const SEMESTER_OPTIONS = [
  "Semester 1", "Semester 2", "Semester 3", "Semester 4", 
  "Semester 5", "Semester 6", "Semester 7", "Semester 8"
];

export default function CoursesView() {
  const store = useERPStore();

  // ── Filters & Search ───────────────────────────────────────────────────
  const [localSearch, setLocalSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedSemFilter, setSelectedSemFilter] = useState('All Semesters');

  // ── Modal State ────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);

  // TODO: Permission Integration
  // In the future, Course CUD access will depend on permissions assigned
  // by MASTER_ADMIN to a specific ADMIN account (e.g. COURSES_MANAGE).
  // For the current frontend-only mock phase, both ADMIN and MASTER_ADMIN
  // have full access.
  const canManageCourses = true;

  // ── React Hook Form ────────────────────────────────────────────────────
  const { register, handleSubmit, reset, setValue, control, formState: { errors, isSubmitting } } = useForm<CourseFormValues>({
    defaultValues: {
      semester: 'Semester 1',
      credits: 4,
    }
  });

  // ── Department options from store ──────────────────────────────────────
  const deptOptions = useMemo(
    () => store.departments.map(d => d.name),
    [store.departments]
  );

  // ── Derived: filtered course list ──────────────────────────────────────
  const filteredCourses = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return store.courses.filter(course => {
      const matchDept = selectedDeptFilter === 'All Departments' || course.department === selectedDeptFilter;
      const matchSem  = selectedSemFilter  === 'All Semesters'   || course.semester === selectedSemFilter;
      const matchSearch = !q ||
        course.name.toLowerCase().includes(q) ||
        course.code.toLowerCase().includes(q) ||
        course.department.toLowerCase().includes(q) ||
        course.semester.toLowerCase().includes(q);

      return matchDept && matchSem && matchSearch;
    });
  }, [store.courses, localSearch, selectedDeptFilter, selectedSemFilter]);

  // ── KPI Calculations ───────────────────────────────────────────────────
  const totalCourses = store.courses.length;
  const totalCredits = store.courses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const activeSemestersCount = useMemo(() => new Set(store.courses.map(c => c.semester)).size, [store.courses]);
  const totalStudentsEnrolled = useMemo(() => {
    // Sum activeStudents or live count from student store
    return store.courses.reduce((sum, c) => {
      const liveCount = store.students.filter(s => s.course === c.name || s.course === c.code).length;
      return sum + (liveCount || c.activeStudents || 0);
    }, 0);
  }, [store.courses, store.students]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingCourseId(null);
    setFormError(null);
    reset({
      name: '',
      code: '',
      department: deptOptions[0] || '',
      semester: 'Semester 1',
      credits: 4
    });
    setIsModalOpen(true);
  }, [reset, deptOptions]);

  const handleOpenEdit = useCallback((course: Course) => {
    setEditingCourseId(course.id);
    setFormError(null);
    setValue('name', course.name);
    setValue('code', course.code);
    setValue('department', course.department);
    setValue('semester', course.semester);
    setValue('credits', course.credits);
    setIsModalOpen(true);
  }, [setValue]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCourseId(null);
    setFormError(null);
    reset();
  }, [reset]);

  const onSubmit = useCallback((values: CourseFormValues) => {
    const trimmed: CourseFormValues = {
      ...values,
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      credits: Number(values.credits),
    };

    // Duplicate Course Code check (case-insensitive & whitespace trimmed)
    const codeConflict = store.courses.find(
      c => c.code.trim().toUpperCase() === trimmed.code && c.id !== editingCourseId
    );
    if (codeConflict) {
      setFormError(`Course code "${trimmed.code}" is already assigned to "${codeConflict.name}".`);
      return;
    }

    setFormError(null);

    if (editingCourseId) {
      // TODO: Backend Integration — call PATCH /api/courses/:id
      store.updateCourse(editingCourseId, trimmed);
    } else {
      // TODO: Backend Integration — call POST /api/courses
      store.addCourse(trimmed);
    }
    handleCloseModal();
  }, [store, editingCourseId, handleCloseModal]);

  // ── Delete flow ────────────────────────────────────────────────────────
  const handleDeleteIntent = useCallback((course: Course) => {
    const enrolledStudents = store.students.filter(s => s.course === course.name || s.course === course.code).length || course.activeStudents || 0;
    const assignedFaculty  = store.faculties.filter(f => f.course === course.name || f.course === course.code).length;
    setDeleteIntent({
      course,
      enrolledStudents,
      assignedFaculty,
      hasDependent: enrolledStudents > 0 || assignedFaculty > 0,
    });
  }, [store.students, store.faculties]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent) return;
    // TODO: Backend Integration — call DELETE /api/courses/:id
    store.deleteCourse(deleteIntent.course.id);
    setDeleteIntent(null);
  }, [deleteIntent, store]);

  return (
    <div className="space-y-8">

      {/* ── Breadcrumbs & Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Home</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Curriculum</span>
          </nav>
          <h2 className="font-bold text-3xl text-slate-900 tracking-tight">Academic Curriculum</h2>
          <p className="text-sm text-slate-500 mt-1">
            {totalCourses} course{totalCourses !== 1 ? 's' : ''} in institutional syllabus
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {canManageCourses && (
            <button 
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md active:scale-95 duration-150 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Course</span>
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Courses',
            value: totalCourses,
            icon: <BookOpen className="w-6 h-6" />,
            color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
            border: 'hover:border-primary/80 hover:shadow-primary/5',
            gradient: 'from-primary to-blue-500',
            onClick: () => { setSelectedDeptFilter('All Departments'); setSelectedSemFilter('All Semesters'); setLocalSearch(''); },
            title: 'Show all courses',
          },
          {
            label: 'Total Credits',
            value: `${totalCredits} Credits`,
            icon: <Star className="w-6 h-6 fill-amber-400 text-amber-500" />,
            color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
            border: 'hover:border-amber-500/80 hover:shadow-amber-500/5',
            gradient: 'from-amber-500 to-orange-400',
            onClick: () => {},
            title: 'Curriculum Credit Volume',
          },
          {
            label: 'Active Semesters',
            value: `${activeSemestersCount} Semesters`,
            icon: <Layers className="w-6 h-6" />,
            color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
            border: 'hover:border-blue-500/80 hover:shadow-blue-500/5',
            gradient: 'from-blue-500 to-sky-400',
            onClick: () => {},
            title: 'Active semester breakdown',
          },
          {
            label: 'Course Enrollments',
            value: totalStudentsEnrolled,
            icon: <GraduationCap className="w-6 h-6" />,
            color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
            border: 'hover:border-emerald-500/80 hover:shadow-emerald-500/5',
            gradient: 'from-emerald-500 to-teal-400',
            onClick: () => {},
            title: 'Students active across courses',
          },
        ].map(card => (
          <div
            key={card.label}
            onClick={card.onClick}
            title={card.title}
            className={`bg-white p-5 border border-slate-200 rounded-2xl flex items-center gap-4 shadow-xs ${card.border} hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group`}
          >
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
            <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0 ${card.color}`}>
              {card.icon}
            </div>
            <div className="relative z-10 min-w-0">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <h4 className="text-xl font-black text-slate-900 mt-0.5">{card.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Row Section ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Course
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Course name, code, department, semester…"
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Department Filter */}
          <div className="min-w-[180px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <CustomSelect
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              options={["All Departments", ...deptOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          {/* Semester Filter */}
          <div className="min-w-[160px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Semester</label>
            <CustomSelect
              value={selectedSemFilter}
              onChange={e => setSelectedSemFilter(e.target.value)}
              options={["All Semesters", ...SEMESTER_OPTIONS]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>

          <button
            onClick={() => { setSelectedDeptFilter('All Departments'); setSelectedSemFilter('All Semesters'); setLocalSearch(''); }}
            className="h-10 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
          >
            Clear Filters
          </button>
        </div>

        {(localSearch || selectedDeptFilter !== 'All Departments' || selectedSemFilter !== 'All Semesters') && (
          <p className="text-xs text-slate-500 mt-3">
            Showing <span className="font-bold text-slate-800">{filteredCourses.length}</span> of <span className="font-bold text-slate-800">{totalCourses}</span> courses
          </p>
        )}
      </div>

      {/* ── Curriculum Table ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Course Code</th>
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Course Title</th>
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Department</th>
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Semester</th>
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Credit Value</th>
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Students</th>
                <th className="py-3.5 px-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20">
                    {totalCourses === 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                          <BookOpen className="w-7 h-7 text-slate-400" />
                        </div>
                        <p className="font-bold text-slate-600">No Courses in Syllabus</p>
                        <p className="text-sm text-slate-400 max-w-xs">Add academic courses to define the institutional curriculum.</p>
                        {canManageCourses && (
                          <button
                            onClick={handleOpenCreate}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Add First Course
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                          <Search className="w-7 h-7 text-amber-400" />
                        </div>
                        <p className="font-bold text-slate-600">No Matching Courses</p>
                        <p className="text-sm text-slate-400">No courses match the selected search or filter options.</p>
                        <button
                          onClick={() => { setLocalSearch(''); setSelectedDeptFilter('All Departments'); setSelectedSemFilter('All Semesters'); }}
                          className="mt-1 text-sm font-bold text-primary hover:underline cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : filteredCourses.map(course => {
                const liveEnrolled = store.students.filter(s => s.course === course.name || s.course === course.code).length || course.activeStudents;
                return (
                  <tr key={course.id} className="hover:bg-slate-50/70 transition-all duration-150 group">
                    <td className="py-4 px-6 text-xs font-bold text-slate-500 font-mono group-hover:text-primary transition-colors">
                      {course.code}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                      {course.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{course.department}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium">{course.semester}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 font-bold text-xs rounded-lg border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{course.credits} Credits</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">
                      {liveEnrolled}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {canManageCourses && (
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(course)}
                            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                            title="Edit Course"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteIntent(course)}
                            className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Course Modal ────────────────────────────────────── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingCourseId ? "Modify Course Configurations" : "Add Course to Curriculum"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Course Name / Title <span className="text-rose-500">*</span>
            </label>
            <input 
              {...register('name', {
                required: 'Course name is required.',
                minLength: { value: 3, message: 'Must be at least 3 characters.' },
                validate: v => v.trim().length >= 3 || 'Must be at least 3 characters.',
              })}
              type="text" 
              placeholder="e.g. B.Tech Computer Science"
              className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 placeholder:text-slate-400"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('code', {
                  required: 'Course code is required.',
                  pattern: { value: /^[A-Z0-9-]{2,12}$/i, message: '2-12 alphanumeric characters.' },
                })}
                type="text" 
                placeholder="e.g. BTech-CS"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono uppercase text-slate-900 placeholder:normal-case placeholder:text-slate-400"
              />
              {errors.code && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Active Semester <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="semester"
                control={control}
                rules={{ required: 'Semester is required.' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={(e) => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    options={SEMESTER_OPTIONS}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                )}
              />
              {errors.semester && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.semester.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Credit Hours <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('credits', {
                  required: 'Credit hours required.',
                  min: { value: 1, message: 'Minimum 1 credit.' },
                  max: { value: 12, message: 'Maximum 12 credits.' },
                })}
                type="number" 
                min={1}
                max={12}
                placeholder="e.g. 4"
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900"
              />
              {errors.credits && <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.credits.message}</p>}
            </div>
          </div>

          {/* Duplicate Code Error */}
          {formError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Info note */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
            <Info className="w-4 h-4 shrink-0" />
            <span>Course ID is auto-assigned with a collision-safe institutional code.</span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
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
              {editingCourseId ? "Save Changes" : "Add Course"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ──────────────────────────────────── */}
      <Modal
        isOpen={deleteIntent !== null}
        onClose={() => setDeleteIntent(null)}
        title="Decommission Course"
      >
        {deleteIntent && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{deleteIntent.course.name}</p>
                <p className="text-xs text-slate-500 font-mono">{deleteIntent.course.code} · {deleteIntent.course.department}</p>
              </div>
            </div>

            {deleteIntent.hasDependent ? (
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-bold mb-1">Active Course Associations Found</p>
                  <ul className="space-y-0.5 font-semibold">
                    {deleteIntent.enrolledStudents > 0 && <li>{deleteIntent.enrolledStudents} active student enrollment{deleteIntent.enrolledStudents !== 1 ? 's' : ''}</li>}
                    {deleteIntent.assignedFaculty > 0 && <li>{deleteIntent.assignedFaculty} faculty assignment{deleteIntent.assignedFaculty !== 1 ? 's' : ''}</li>}
                  </ul>
                  <p className="mt-1.5 text-amber-700">Decommissioning will remove this course from the active curriculum catalogue while preserving historical transcripts.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">No active student or faculty assignments found for this course.</p>
              </div>
            )}

            <p className="text-sm text-slate-600">
              Are you sure you want to decommission <span className="font-bold text-slate-900">{deleteIntent.course.name}</span>? This action cannot be undone.
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
                Confirm Decommission
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
