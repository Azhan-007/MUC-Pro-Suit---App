"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  Award, CheckCircle, Search, Trophy, Sparkles, Plus, 
  Download, Filter, Edit, Trash2, Eye, Send, AlertTriangle, 
  X, Check, FileCheck, HelpCircle, Layers, GraduationCap
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { ResultRecord } from '../types';

interface ResultFormValues {
  studentId: string;
  department: string;
  courseName: string;
  subject: string;
  examId: string;
  examType: string;
  marks: number;
  maxMarks: number;
  resultStatus: 'Draft' | 'Published' | 'Withheld' | 'Pending';
  academicYear: string;
  semester: string;
}

// Grade calculation helper strictly based on % threshold
function calculateGradeAndPass(marks: number, maxMarks: number): { grade: string; status: 'Pass' | 'Fail' } {
  if (!maxMarks || maxMarks <= 0) return { grade: 'F', status: 'Fail' };
  const percentage = (marks / maxMarks) * 100;
  
  if (percentage >= 90) return { grade: 'A+', status: 'Pass' };
  if (percentage >= 80) return { grade: 'A', status: 'Pass' };
  if (percentage >= 70) return { grade: 'B+', status: 'Pass' };
  if (percentage >= 60) return { grade: 'B', status: 'Pass' };
  if (percentage >= 50) return { grade: 'C', status: 'Pass' };
  if (percentage >= 40) return { grade: 'D', status: 'Pass' };
  return { grade: 'F', status: 'Fail' };
}

export default function ResultsView() {
  const store = useERPStore();

  // ── Filters & Search State ─────────────────────────────────────────────
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');
  const [selectedPassStatusFilter, setSelectedPassStatusFilter] = useState('All Results');
  const [selectedPublishStatusFilter, setSelectedPublishStatusFilter] = useState('All States');
  const [localSearch, setLocalSearch] = useState('');

  // ── Modal States ───────────────────────────────────────────────────────
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);

  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingResult, setDeletingResult] = useState<ResultRecord | null>(null);

  // Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<ResultRecord | null>(null);

  // ── Form State ─────────────────────────────────────────────────────────
  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ResultFormValues>({
    defaultValues: {
      maxMarks: 100,
      resultStatus: 'Draft',
      academicYear: '2024-25',
      semester: 'Fall Semester',
    }
  });

  const watchStudentId = watch('studentId');
  const watchDept = watch('department');
  const watchCourse = watch('courseName');
  const watchExamId = watch('examId');
  const watchMarks = watch('marks');
  const watchMaxMarks = watch('maxMarks');

  // Dynamic calculation preview in form modal
  const formGradePreview = useMemo(() => {
    const m = Number(watchMarks);
    const mm = Number(watchMaxMarks);
    if (isNaN(m) || isNaN(mm) || mm <= 0) return null;
    return calculateGradeAndPass(m, mm);
  }, [watchMarks, watchMaxMarks]);

  // Options from store
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

  const modalStudentOptions = useMemo(() => {
    if (!watchDept && !watchCourse) return store.students;
    return store.students.filter(s => {
      const matchDept = !watchDept || s.department === watchDept;
      const matchCourse = !watchCourse || s.course === watchCourse;
      return matchDept && matchCourse;
    });
  }, [watchDept, watchCourse, store.students]);

  const modalExamOptions = useMemo(() => {
    if (!watchCourse) return store.examSchedules;
    const filtered = store.examSchedules.filter(e => e.course === watchCourse);
    return filtered.length > 0 ? filtered : store.examSchedules;
  }, [watchCourse, store.examSchedules]);

  // Duplicate Result Protection Check
  const duplicateWarning = useMemo(() => {
    if (!isFormModalOpen || !watchStudentId || !watchCourse) return null;
    const watchSubject = watch('subject');
    
    const existing = store.results.find(r => 
      r.id !== editingResultId &&
      r.studentId === watchStudentId && 
      r.courseName === watchCourse &&
      (watchSubject ? r.subject === watchSubject : true)
    );

    if (existing) {
      return `Duplicate Warning: Result record (${existing.id}) already exists for Student ${existing.studentName} (${watchCourse}). Editing this record is recommended instead of duplicate entry.`;
    }
    return null;
  }, [isFormModalOpen, watchStudentId, watchCourse, watch, store.results, editingResultId]);

  // ── Live KPI Metrics ───────────────────────────────────────────────────
  const totalResultsCount = store.results.length;
  const publishedCount = store.results.filter(r => r.resultStatus === 'Published').length;
  const pendingCount = store.results.filter(r => !r.resultStatus || r.resultStatus === 'Draft' || r.resultStatus === 'Pending').length;
  const passedCount = store.results.filter(r => r.status === 'Pass').length;
  const failedCount = store.results.filter(r => r.status === 'Fail').length;

  // ── Filtered Results List ──────────────────────────────────────────────
  const filteredResults = useMemo(() => {
    const q = (localSearch || store.searchQuery).trim().toLowerCase();

    return store.results.filter(res => {
      const matchDept = selectedDeptFilter === 'All Departments' || 
        res.department === selectedDeptFilter ||
        store.courses.find(c => c.name === res.courseName)?.department === selectedDeptFilter;

      const matchCourse = selectedCourseFilter === 'All Courses' || res.courseName === selectedCourseFilter;
      const matchPassStatus = selectedPassStatusFilter === 'All Results' || res.status === selectedPassStatusFilter;
      const matchPublishStatus = selectedPublishStatusFilter === 'All States' || (res.resultStatus || 'Draft') === selectedPublishStatusFilter;

      const matchSearch = !q ||
        res.studentName.toLowerCase().includes(q) ||
        res.studentId.toLowerCase().includes(q) ||
        res.courseName.toLowerCase().includes(q) ||
        (res.subject && res.subject.toLowerCase().includes(q)) ||
        res.id.toLowerCase().includes(q) ||
        res.grade.toLowerCase().includes(q);

      return matchDept && matchCourse && matchPassStatus && matchPublishStatus && matchSearch;
    });
  }, [store.results, selectedDeptFilter, selectedCourseFilter, selectedPassStatusFilter, selectedPublishStatusFilter, localSearch, store.searchQuery, store.courses]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingResultId(null);
    const defaultStudent = store.students[0];
    const defaultDept = defaultStudent?.department || store.departments[0]?.name || 'Computer Science';
    const defaultCourse = defaultStudent?.course || store.courses[0]?.name || 'B.Tech CS';

    reset({
      studentId: defaultStudent?.id || 'S10245',
      department: defaultDept,
      courseName: defaultCourse,
      subject: 'Data Structures',
      examId: store.examSchedules[0]?.id || '',
      examType: 'Midterm',
      marks: 85,
      maxMarks: 100,
      resultStatus: 'Draft',
      academicYear: '2024-25',
      semester: 'Fall Semester',
    });
    setIsFormModalOpen(true);
  }, [store.students, store.departments, store.courses, store.examSchedules, reset]);

  const handleOpenEdit = useCallback((res: ResultRecord) => {
    setEditingResultId(res.id);
    setValue('studentId', res.studentId);
    setValue('department', res.department || store.courses.find(c => c.name === res.courseName)?.department || 'Computer Science');
    setValue('courseName', res.courseName);
    setValue('subject', res.subject || res.courseName);
    setValue('examId', res.examId || '');
    setValue('examType', res.examType || 'Midterm');
    setValue('marks', res.marks);
    setValue('maxMarks', res.maxMarks);
    setValue('resultStatus', res.resultStatus || 'Draft');
    setValue('academicYear', res.academicYear || '2024-25');
    setValue('semester', res.semester || 'Fall Semester');
    setIsFormModalOpen(true);
  }, [store.courses, setValue]);

  const handleOpenDelete = useCallback((res: ResultRecord) => {
    setDeletingResult(res);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingResult) return;
    store.deleteResult(deletingResult.id);
    setIsDeleteModalOpen(false);
    setDeletingResult(null);
  }, [deletingResult, store]);

  const handlePublish = useCallback((id: string) => {
    store.publishResult(id);
  }, [store]);

  const onSubmit = useCallback((values: ResultFormValues) => {
    const studentObj = store.students.find(s => s.id === values.studentId);
    const marksNum = Number(values.marks);
    const maxMarksNum = Number(values.maxMarks);
    const { grade, status } = calculateGradeAndPass(marksNum, maxMarksNum);

    const payload = {
      studentId: values.studentId,
      studentName: studentObj ? studentObj.name : 'Unknown Student',
      courseName: values.courseName,
      subject: values.subject,
      department: values.department,
      examId: values.examId,
      examType: values.examType,
      marks: marksNum,
      maxMarks: maxMarksNum,
      grade,
      status,
      resultStatus: values.resultStatus,
      academicYear: values.academicYear,
      semester: values.semester,
    };

    if (editingResultId) {
      store.updateResult(editingResultId, payload);
    } else {
      store.addResult(payload);
    }
    setIsFormModalOpen(false);
    reset();
  }, [editingResultId, store, reset]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["Result ID", "Student ID", "Student Name", "Course", "Subject", "Marks", "Max Marks", "Grade", "Status", "Publication Status"];
    const rows = filteredResults.map(r => [
      r.id,
      r.studentId,
      `"${r.studentName}"`,
      `"${r.courseName}"`,
      `"${r.subject || r.courseName}"`,
      r.marks,
      r.maxMarks,
      r.grade,
      r.status,
      r.resultStatus || 'Draft'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MUC_Academic_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredResults]);

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Academic</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Results</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Academic Results Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Official student score evaluation, letter grade generation & result publication
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 h-10 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Record Academic Result</span>
          </button>
        </div>
      </div>

      {/* ── KPI Metrics Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Evaluations</p>
          <h4 className="text-2xl font-black text-slate-900 mt-1">{totalResultsCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Published Results</p>
          <h4 className="text-2xl font-black text-emerald-700 mt-1">{publishedCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Pending / Draft</p>
          <h4 className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Passed Students</p>
          <h4 className="text-2xl font-black text-blue-700 mt-1">{passedCount}</h4>
        </div>
        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Failed / Retake</p>
          <h4 className="text-2xl font-black text-rose-700 mt-1">{failedCount}</h4>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Results
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Student name, ID, course, grade..."
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

          <div className="min-w-[130px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Pass / Fail</label>
            <CustomSelect
              value={selectedPassStatusFilter}
              onChange={e => setSelectedPassStatusFilter(e.target.value)}
              options={["All Results", "Pass", "Fail"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[140px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Publication</label>
            <CustomSelect
              value={selectedPublishStatusFilter}
              onChange={e => setSelectedPublishStatusFilter(e.target.value)}
              options={["All States", "Draft", "Published", "Withheld", "Pending"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {(selectedDeptFilter !== 'All Departments' || selectedCourseFilter !== 'All Courses' || selectedPassStatusFilter !== 'All Results' || selectedPublishStatusFilter !== 'All States' || localSearch) && (
            <button
              onClick={() => {
                setSelectedDeptFilter('All Departments');
                setSelectedCourseFilter('All Courses');
                setSelectedPassStatusFilter('All Results');
                setSelectedPublishStatusFilter('All States');
                setLocalSearch('');
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Results Table ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Result ID</th>
                <th className="py-4 px-6">Student Information</th>
                <th className="py-4 px-6">Course & Subject</th>
                <th className="py-4 px-6">Score / Marks</th>
                <th className="py-4 px-6">Letter Grade</th>
                <th className="py-4 px-6">Evaluation Status</th>
                <th className="py-4 px-6">Publication State</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredResults.map(res => (
                <tr key={res.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-4 px-6 font-mono font-bold text-slate-500">{res.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{res.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{res.studentId}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-800">{res.courseName}</p>
                    <p className="text-[10px] text-slate-400">{res.subject || res.courseName}</p>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-slate-800">
                    {res.marks} / {res.maxMarks} 
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      ({((res.marks / res.maxMarks) * 100).toFixed(1)}%)
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs border border-primary/20">
                      <Award className="w-3.5 h-3.5" />
                      <span>{res.grade}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      res.status === 'Pass' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      res.resultStatus === 'Published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : res.resultStatus === 'Withheld'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {res.resultStatus || 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {res.resultStatus !== 'Published' && (
                        <button
                          onClick={() => handlePublish(res.id)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg cursor-pointer"
                          title="Publish Result"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => { setViewingResult(res); setIsDetailsModalOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer"
                        title="View Transcript Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(res)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                        title="Edit Result"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(res)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                        title="Delete Result"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 font-medium">
                    No academic results match the selected search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal 1: Create / Edit Result Modal ───────────────────────── */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingResultId ? "Modify Academic Result" : "Record Academic Evaluation Result"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Duplicate Warning Banner */}
          {duplicateWarning && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Section 1: Student & Academic Context */}
          <div className="space-y-3">
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              1. Student & Academic Program
            </h5>

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
                  Course Program <span className="text-rose-500">*</span>
                </label>
                <Controller
                  name="courseName"
                  control={control}
                  rules={{ required: 'Course is required' }}
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

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Select Registered Student <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="studentId"
                control={control}
                rules={{ required: 'Student selection is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={modalStudentOptions.map(s => `${s.name} (${s.id})`)}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          {/* Section 2: Examination & Subject */}
          <div className="space-y-3 pt-2">
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              2. Examination & Subject Details
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Subject / Paper Title <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  type="text"
                  placeholder="e.g. Data Structures"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
                />
                {errors.subject && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Associated Exam Schedule
                </label>
                <Controller
                  name="examId"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                      options={modalExamOptions.map(ex => `${ex.subject} (${ex.id})`)}
                      className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Marks & Auto-Calculated Evaluation */}
          <div className="space-y-3 pt-2">
            <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              3. Score Marks & Auto Grade Calculation
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Marks Obtained <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('marks', { 
                    required: 'Marks are required', 
                    min: { value: 0, message: 'Marks cannot be negative' },
                    validate: val => Number(val) <= Number(watchMaxMarks) || 'Marks cannot exceed Maximum Marks'
                  })}
                  type="number"
                  placeholder="e.g. 85"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-mono"
                />
                {errors.marks && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.marks.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Maximum Marks <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register('maxMarks', { 
                    required: 'Max marks are required', 
                    min: { value: 1, message: 'Max marks must be > 0' } 
                  })}
                  type="number"
                  placeholder="e.g. 100"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-mono"
                />
                {errors.maxMarks && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.maxMarks.message}</p>}
              </div>
            </div>

            {/* Realtime Grade Calculation Preview */}
            {formGradePreview && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Auto Grade: </span>
                  <strong className="text-primary text-sm font-bold ml-1">{formGradePreview.grade}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Evaluation Status: </span>
                  <strong className={formGradePreview.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700'}>
                    {formGradePreview.status}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Result Status */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Publication Status
              </label>
              <Controller
                name="resultStatus"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={['Draft', 'Published', 'Withheld', 'Pending']}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <input
                {...register('academicYear')}
                type="text"
                placeholder="2024-25"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingResultId ? "Save Result Changes" : "Record Result"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Transcript Details View Modal ────────────────────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Academic Transcript & Evaluation Record"
      >
        {viewingResult && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px]">
                  Transcript Entry
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingResult.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingResult.studentName}</h4>
              <p className="text-slate-500 font-mono">Student ID: {viewingResult.studentId}</p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Course Program:</span>
                <span className="font-bold text-slate-900">{viewingResult.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Subject / Paper:</span>
                <span className="font-bold text-slate-800">{viewingResult.subject || viewingResult.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Score / Maximum:</span>
                <span className="font-bold font-mono text-slate-900">{viewingResult.marks} / {viewingResult.maxMarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Percentage:</span>
                <span className="font-bold font-mono text-slate-800">
                  {((viewingResult.marks / viewingResult.maxMarks) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Letter Grade:</span>
                <span className="font-extrabold text-primary">{viewingResult.grade}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Evaluation Outcome:</span>
                <span className={`font-bold ${viewingResult.status === 'Pass' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {viewingResult.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Publication Status:</span>
                <span className="font-bold text-slate-800">{viewingResult.resultStatus || 'Draft'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Transcript
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Custom Delete Result Confirmation Modal ──────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Academic Result Removal"
      >
        {deletingResult && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Delete Academic Result Record?</p>
                <p>You are about to remove the result record for <strong>{deletingResult.studentName}</strong> ({deletingResult.courseName}).</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
              <p><strong>Result ID:</strong> {deletingResult.id}</p>
              <p><strong>Student ID:</strong> {deletingResult.studentId}</p>
              <p><strong>Score:</strong> {deletingResult.marks}/{deletingResult.maxMarks} (Grade: {deletingResult.grade})</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
