"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  FileText, Calendar, Clock, MapPin, Plus, Trash2, Edit, 
  Search, Filter, AlertTriangle, Eye, CheckCircle2, X, SlidersHorizontal,
  Layers, School
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { ExamSchedule } from '../types';

interface ExamFormValues {
  department: string;
  course: string;
  subject: string;
  examType: string;
  date: string;
  time: string;
  duration: string;
  room: string;
  section: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export default function ExamsView() {
  const store = useERPStore();

  // ── Filters & View State ───────────────────────────────────────────────
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [localSearch, setLocalSearch] = useState('');

  // ── Modal States ───────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingExam, setDeletingExam] = useState<ExamSchedule | null>(null);

  // Exam Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingExam, setViewingExam] = useState<ExamSchedule | null>(null);

  // ── Form State ─────────────────────────────────────────────────────────
  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExamFormValues>({
    defaultValues: {
      examType: 'Midterm',
      time: '10:00 AM',
      duration: '3 Hours',
      section: 'Sec A',
      status: 'Scheduled',
    }
  });

  const watchDept = watch('department');
  const watchCourse = watch('course');
  const watchDate = watch('date');
  const watchTime = watch('time');
  const watchRoom = watch('room');
  const watchSection = watch('section');

  // ── Options from Store ─────────────────────────────────────────────────
  const deptOptions = useMemo(
    () => ["All Departments", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  const courseFilterOptions = useMemo(() => {
    if (selectedDeptFilter === 'All Departments') {
      return ["All Courses", ...store.courses.map(c => c.name)];
    }
    const filtered = store.courses.filter(c => c.department === selectedDeptFilter);
    return ["All Courses", ...(filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name))];
  }, [selectedDeptFilter, store.courses]);

  const modalCourseOptions = useMemo(() => {
    if (!watchDept) return store.courses.map(c => c.name);
    const filtered = store.courses.filter(c => c.department === watchDept);
    return filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name);
  }, [watchDept, store.courses]);

  const examTypeOptions = ['Internal', 'Midterm', 'Semester', 'Practical', 'Viva', 'Final'];

  // ── Realtime Conflict Detection in Form Modal ─────────────────────────
  const conflictWarning = useMemo(() => {
    if (!isModalOpen || !watchDate || !watchTime) return null;

    const otherExams = store.examSchedules.filter(e => e.id !== editingExamId);

    // Room Conflict
    if (watchRoom) {
      const roomConflict = otherExams.find(e => 
        e.date === watchDate && e.time === watchTime && e.room.toLowerCase() === watchRoom.toLowerCase()
      );
      if (roomConflict) {
        return `Room Conflict: ${watchRoom} is already booked for ${roomConflict.subject} (${roomConflict.course}) on ${watchDate} at ${watchTime}.`;
      }
    }

    // Section / Course Conflict
    if (watchCourse && watchSection) {
      const secConflict = otherExams.find(e => 
        e.date === watchDate && e.time === watchTime && e.course === watchCourse && (e.section || 'Sec A') === watchSection
      );
      if (secConflict) {
        return `Schedule Conflict: ${watchCourse} (${watchSection}) already has an exam (${secConflict.subject}) scheduled on ${watchDate} at ${watchTime}.`;
      }
    }

    return null;
  }, [isModalOpen, watchDate, watchTime, watchRoom, watchCourse, watchSection, store.examSchedules, editingExamId]);

  // ── Live KPI Metrics ───────────────────────────────────────────────────
  const totalExamsCount = store.examSchedules.length;
  const scheduledCount = store.examSchedules.filter(e => !e.status || e.status === 'Scheduled').length;
  const ongoingCount = store.examSchedules.filter(e => e.status === 'Ongoing').length;
  const completedCount = store.examSchedules.filter(e => e.status === 'Completed').length;
  const cancelledCount = store.examSchedules.filter(e => e.status === 'Cancelled').length;

  // ── Filtered Exams ────────────────────────────────────────────────────
  const filteredExams = useMemo(() => {
    const q = (localSearch || store.searchQuery).trim().toLowerCase();

    return store.examSchedules.filter(exam => {
      const matchDept = selectedDeptFilter === 'All Departments' || 
        (exam.department && exam.department === selectedDeptFilter) ||
        store.courses.find(c => c.name === exam.course)?.department === selectedDeptFilter;

      const matchCourse = selectedCourseFilter === 'All Courses' || exam.course === selectedCourseFilter;
      const matchType = selectedTypeFilter === 'All Types' || (exam.examType || 'Midterm') === selectedTypeFilter;
      const matchStatus = selectedStatusFilter === 'All Statuses' || (exam.status || 'Scheduled') === selectedStatusFilter;

      const matchSearch = !q ||
        exam.subject.toLowerCase().includes(q) ||
        exam.course.toLowerCase().includes(q) ||
        exam.room.toLowerCase().includes(q) ||
        exam.id.toLowerCase().includes(q);

      return matchDept && matchCourse && matchType && matchStatus && matchSearch;
    });
  }, [store.examSchedules, selectedDeptFilter, selectedCourseFilter, selectedTypeFilter, selectedStatusFilter, localSearch, store.searchQuery, store.courses]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingExamId(null);
    const defaultDept = store.departments[0]?.name || 'Computer Science';
    const defaultCourse = store.courses.find(c => c.department === defaultDept)?.name || store.courses[0]?.name || 'B.Tech CS';

    reset({
      department: defaultDept,
      course: defaultCourse,
      subject: '',
      examType: 'Midterm',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      duration: '3 Hours',
      room: 'Block A, Hall 1',
      section: 'Sec A',
      status: 'Scheduled',
    });
    setIsModalOpen(true);
  }, [store.departments, store.courses, reset]);

  const handleOpenEdit = useCallback((exam: ExamSchedule) => {
    setEditingExamId(exam.id);
    setValue('department', exam.department || store.courses.find(c => c.name === exam.course)?.department || 'Computer Science');
    setValue('course', exam.course);
    setValue('subject', exam.subject);
    setValue('examType', exam.examType || 'Midterm');
    setValue('date', exam.date);
    setValue('time', exam.time);
    setValue('duration', exam.duration);
    setValue('room', exam.room);
    setValue('section', exam.section || 'Sec A');
    setValue('status', exam.status || 'Scheduled');
    setIsModalOpen(true);
  }, [store.courses, setValue]);

  const handleOpenDelete = useCallback((exam: ExamSchedule) => {
    setDeletingExam(exam);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingExam) return;
    store.deleteExamSchedule(deletingExam.id);
    setIsDeleteModalOpen(false);
    setDeletingExam(null);
  }, [deletingExam, store]);

  const onSubmit = useCallback((values: ExamFormValues) => {
    if (editingExamId) {
      store.updateExamSchedule(editingExamId, values);
    } else {
      store.addExamSchedule(values);
    }
    setIsModalOpen(false);
    reset();
  }, [editingExamId, store, reset]);

  return (
    <div className="space-y-8">
      {/* ── Breadcrumbs & Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Academic</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Examinations</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">Examination Schedule</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional examination timetable, hall allocation & session management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-sm shadow-md cursor-pointer active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam Session</span>
          </button>
        </div>
      </div>

      {/* ── Live KPI Summary Metric Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Scheduled</p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">{totalExamsCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Upcoming Sessions</p>
          <h4 className="text-2xl font-black text-amber-700 mt-1">{scheduledCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Ongoing Exams</p>
          <h4 className="text-2xl font-black text-blue-700 mt-1">{ongoingCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Completed</p>
          <h4 className="text-2xl font-black text-emerald-700 mt-1">{completedCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Cancelled</p>
          <h4 className="text-2xl font-black text-rose-700 mt-1">{cancelledCount}</h4>
        </div>
      </div>

      {/* ── Filter Row Section ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Examinations
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Subject title, course, hall, ID..."
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Exam Type</label>
            <CustomSelect
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              options={["All Types", ...examTypeOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <CustomSelect
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              options={deptOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Course Program</label>
            <CustomSelect
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              options={courseFilterOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[140px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
            <CustomSelect
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              options={["All Statuses", "Scheduled", "Ongoing", "Completed", "Cancelled"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {(selectedDeptFilter !== 'All Departments' || selectedCourseFilter !== 'All Courses' || selectedTypeFilter !== 'All Types' || selectedStatusFilter !== 'All Statuses' || localSearch) && (
            <button
              onClick={() => {
                setSelectedDeptFilter('All Departments');
                setSelectedCourseFilter('All Courses');
                setSelectedTypeFilter('All Types');
                setSelectedStatusFilter('All Statuses');
                setLocalSearch('');
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Grid of Scheduled Exams ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.map(exam => (
          <div key={exam.id} className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden group transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-15 transition-opacity">
              <FileText className="w-24 h-24 text-primary" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-extrabold border border-amber-200 uppercase tracking-wider">
                  {exam.examType || 'Midterm'} Exam
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 border rounded px-2 py-0.5">{exam.id}</span>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                    <button 
                      onClick={() => { setViewingExam(exam); setIsDetailsModalOpen(true); }}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition-colors cursor-pointer"
                      title="View Exam Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                      title="Edit Exam Session"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(exam)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                      title="Cancel Exam Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-primary transition-colors">{exam.subject}</h4>
              <p className="text-xs text-slate-500 font-medium mb-4">Course: <strong className="text-slate-700">{exam.course}</strong> · Section: <strong className="text-slate-700">{exam.section || 'Sec A'}</strong></p>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>Exam Date: <strong className="text-slate-900 font-mono">{exam.date}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{exam.time} • Duration: <strong className="text-slate-800">{exam.duration}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Room Allocation: <strong className="text-slate-800">{exam.room}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                exam.status === 'Ongoing' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : exam.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : exam.status === 'Cancelled'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Status: {exam.status || 'Scheduled'}
              </span>
            </div>
          </div>
        ))}
        {filteredExams.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-xs">
            No scheduled examinations match your search or filter criteria.
          </div>
        )}
      </div>

      {/* ── Modal 1: Schedule / Edit Exam Modal ───────────────────────── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExamId ? "Reschedule Examination Session" : "Schedule New Examination Session"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Conflict Warning Banner */}
          {conflictWarning && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Subject / Paper Title <span className="text-rose-500">*</span>
            </label>
            <input 
              {...register('subject', { required: 'Subject title is required', minLength: { value: 3, message: 'Must be at least 3 characters' } })}
              type="text" 
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs focus:outline-none focus:border-primary transition-all text-slate-900"
            />
            {errors.subject && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.subject.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="department"
                control={control}
                rules={{ required: 'Department is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={store.departments.map(d => d.name)}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Target Course Program <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="course"
                control={control}
                rules={{ required: 'Course allocation is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={modalCourseOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Exam Type <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="examType"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={examTypeOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Exam Date <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('date', { required: 'Date is required', pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Use YYYY-MM-DD format' } })}
                type="text" 
                placeholder="2026-11-20"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.date && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('time', { required: 'Time is required' })}
                type="text" 
                placeholder="10:00 AM"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.time && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Duration <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["3 Hours", "2.5 Hours", "2 Hours", "1.5 Hours"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Room / Hall Allocation <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('room', { required: 'Room allocation is required' })}
                type="text" 
                placeholder="e.g. Block A, Hall 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl h-10 px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.room && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.room.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Section
              </label>
              <Controller
                name="section"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={['Sec A', 'Sec B', 'Sec C']}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Exam Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                  options={['Scheduled', 'Ongoing', 'Completed', 'Cancelled']}
                  className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingExamId ? "Confirm Reschedule" : "Schedule Exam"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: View Exam Details Modal ──────────────────────────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Examination Session Details"
      >
        {viewingExam && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded text-[10px] uppercase border border-amber-200">
                  {viewingExam.examType || 'Midterm'} Exam
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingExam.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingExam.subject}</h4>
              <p className="text-slate-500 font-medium">Course: {viewingExam.course} · Section: {viewingExam.section || 'Sec A'}</p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Exam Date:</span>
                <span className="font-bold font-mono text-slate-900">{viewingExam.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Start Time & Duration:</span>
                <span className="font-bold text-slate-800">{viewingExam.time} ({viewingExam.duration})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Room / Hall Allocation:</span>
                <span className="font-bold text-emerald-700">{viewingExam.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Session Status:</span>
                <span className="font-bold text-slate-800">{viewingExam.status || 'Scheduled'}</span>
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

      {/* ── Modal 3: Custom Delete Exam Session Modal ─────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Exam Cancellation"
      >
        {deletingExam && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Cancel Scheduled Examination Session?</p>
                <p>You are about to cancel <strong>{deletingExam.subject}</strong> ({deletingExam.course}) scheduled on {deletingExam.date} at {deletingExam.time}.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p><strong>Course:</strong> {deletingExam.course}</p>
              <p><strong>Hall:</strong> {deletingExam.room}</p>
              <p><strong>Date & Time:</strong> {deletingExam.date} @ {deletingExam.time}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Keep Scheduled
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
