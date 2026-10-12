"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CalendarDays, BookOpen, Clock, FileText, Plus, Search,
  Filter, Pencil, Trash2, AlertCircle, ArrowLeft,
  CheckCircle2, XCircle
} from "lucide-react";
import {
  AcademicYear, Semester, Course, ClassEntity, SectionEntity,
  Subject, Examination
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface ExaminationClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: Subject[];
  initialExaminations: Examination[];
}

type ViewMode = "list" | "schedule";
type ExamType = Examination["examinationType"];
type ExamStatus = Examination["status"];

const EXAM_TYPES: { value: ExamType; label: string; bg: string; text: string }[] = [
  { value: "CIA_I", label: "CIA I", bg: "bg-blue-50", text: "text-blue-700" },
  { value: "CIA_II", label: "CIA II", bg: "bg-violet-50", text: "text-violet-700" },
  { value: "SEMESTER_END", label: "Semester End", bg: "bg-amber-50", text: "text-amber-700" },
  { value: "PRACTICAL", label: "Practical", bg: "bg-emerald-50", text: "text-emerald-700" },
  { value: "PROJECT_VIVA", label: "Project Viva", bg: "bg-rose-50", text: "text-rose-700" },
];

const STATUS_STYLES: Record<ExamStatus, { bg: string; text: string }> = {
  SCHEDULED: { bg: "bg-blue-100", text: "text-blue-700" },
  ONGOING: { bg: "bg-amber-100", text: "text-amber-700" },
  COMPLETED: { bg: "bg-emerald-100", text: "text-emerald-700" },
  CANCELLED: { bg: "bg-gray-100", text: "text-gray-600" },
};

/* ======================== COMPONENT ======================== */
export function ExaminationClient({
  academicYears, semesters, courses, classes, subjects, initialExaminations
}: ExaminationClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [localExams, setLocalExams] = useState<Examination[]>(initialExaminations);

  // Filters for List View
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ExamType | "">("");
  const [filterStatus, setFilterStatus] = useState<ExamStatus | "">("");

  // Schedule View Context
  const [selYearId, setSelYearId] = useState<string>("");
  const [selSemId, setSelSemId] = useState<string>("");
  const [selCourseId, setSelCourseId] = useState<string>("");
  const [selClassId, setSelClassId] = useState<string>("");
  
  // Editor State
  const [editingExam, setEditingExam] = useState<Examination | null>(null);
  const [formType, setFormType] = useState<ExamType>("CIA_I");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("10:00");
  const [formEndTime, setFormEndTime] = useState("13:00");
  const [formError, setFormError] = useState("");

  /* -------- RESOLVED DATA -------- */
  const activeAy = useMemo(() => academicYears.find(ay => ay.isActive) || academicYears[0], [academicYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive) || semesters[0], [semesters]);

  // Derived options for Schedule view
  const activeSemesters = useMemo(() => semesters.filter(s => s.academicYearId === (selYearId || activeAy?.id)), [semesters, selYearId, activeAy]);
  const classOptions = useMemo(() => classes.filter(c => !selCourseId || c.courseId === selCourseId), [classes, selCourseId]);
  
  const classSubjects = useMemo(() => {
    if (!selClassId) return [];
    const cls = classes.find(c => c.id === selClassId);
    if (!cls) return [];
    return subjects.filter(s => s.courseId === cls.courseId && s.semesterNumber === cls.semesterNumber);
  }, [subjects, selClassId, classes]);

  /* -------- LIST VIEW FILTERING -------- */
  const filteredExams = useMemo(() => {
    let list = localExams.filter(e => e.academicYearId === activeAy?.id && e.semesterId === activeSem?.id);
    
    if (filterType) list = list.filter(e => e.examinationType === filterType);
    if (filterStatus) list = list.filter(e => e.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => {
        const sub = subjects.find(s => s.id === e.subjectId);
        const cls = classes.find(c => c.id === e.classId);
        return sub?.name.toLowerCase().includes(q) || 
               sub?.code.toLowerCase().includes(q) ||
               cls?.code.toLowerCase().includes(q);
      });
    }
    
    // Sort by date (closest first)
    return list.sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  }, [localExams, filterType, filterStatus, searchQuery, activeAy, activeSem, subjects, classes]);

  const metrics = useMemo(() => {
    const semExams = localExams.filter(e => e.academicYearId === activeAy?.id && e.semesterId === activeSem?.id);
    return {
      scheduled: semExams.filter(e => e.status === "SCHEDULED").length,
      ongoing: semExams.filter(e => e.status === "ONGOING").length,
      completed: semExams.filter(e => e.status === "COMPLETED").length,
    };
  }, [localExams, activeAy, activeSem]);

  /* -------- HELPERS -------- */
  const getSubject = useCallback((id: string) => subjects.find(s => s.id === id), [subjects]);
  const getClass = useCallback((id: string) => classes.find(c => c.id === id), [classes]);
  const getCourse = useCallback((id: string) => courses.find(c => c.id === id), [courses]);

  /* -------- ACTIONS -------- */
  const openScheduleEditor = (exam?: Examination) => {
    setFormError("");
    if (exam) {
      setEditingExam(exam);
      setSelYearId(exam.academicYearId);
      setSelSemId(exam.semesterId);
      setSelCourseId(exam.courseId);
      setSelClassId(exam.classId);
      setFormType(exam.examinationType);
      setFormSubjectId(exam.subjectId);
      setFormDate(exam.examDate.split('T')[0]);
      setFormStartTime(exam.startTime);
      setFormEndTime(exam.endTime);
    } else {
      setEditingExam(null);
      setSelYearId(activeAy?.id || "");
      setSelSemId(activeSem?.id || "");
      setSelCourseId("");
      setSelClassId("");
      setFormType("CIA_I");
      setFormSubjectId("");
      setFormDate("");
      setFormStartTime("10:00");
      setFormEndTime("13:00");
    }
    setViewMode("schedule");
  };

  const handleSaveExam = () => {
    if (!selYearId || !selSemId || !selClassId || !formSubjectId || !formDate || !formStartTime || !formEndTime) {
      setFormError("Please fill all required fields.");
      return;
    }

    const cls = getClass(selClassId);
    const crs = getCourse(cls?.courseId || "");
    if (!cls || !crs) return;

    if (editingExam) {
      setLocalExams(prev => prev.map(e => e.id === editingExam.id ? {
        ...e,
        academicYearId: selYearId,
        semesterId: selSemId,
        courseId: crs.id,
        classId: cls.id,
        examinationType: formType,
        subjectId: formSubjectId,
        shift: crs.shift,
        examDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
      } : e));
    } else {
      const newExam: Examination = {
        id: `exam-${Date.now()}`,
        academicYearId: selYearId,
        semesterId: selSemId,
        courseId: crs.id,
        classId: cls.id,
        examinationType: formType,
        subjectId: formSubjectId,
        shift: crs.shift,
        examDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        status: "SCHEDULED"
      };
      setLocalExams(prev => [...prev, newExam]);
    }
    setViewMode("list");
  };

  const handleDelete = (id: string) => {
    if(confirm("Are you sure you want to delete this examination schedule?")) {
      setLocalExams(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: ExamStatus) => {
    setLocalExams(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  /* ========================================================
     RENDER: LIST VIEW
     ======================================================== */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Examinations Desk</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage schedules for {activeAy?.code || "Current Year"} · {activeSem?.term || "Current Sem"}
            </p>
          </div>
          <button
            onClick={() => openScheduleEditor()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Schedule Exam
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.scheduled}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ongoing</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.ongoing}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.completed}</p>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject or class code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>
            <div className="flex gap-3">
              <select 
                value={filterType} onChange={e => setFilterType(e.target.value as any)}
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">All Exam Types</option>
                {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select 
                value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Examinations List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {filteredExams.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No examinations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Date & Time</th>
                    <th className="px-5 py-3 font-semibold">Subject</th>
                    <th className="px-5 py-3 font-semibold">Class</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredExams.map(exam => {
                    const sub = getSubject(exam.subjectId);
                    const cls = getClass(exam.classId);
                    const typeInfo = EXAM_TYPES.find(t => t.value === exam.examinationType);
                    const statusStyle = STATUS_STYLES[exam.status];

                    return (
                      <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{new Date(exam.examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
                          <p className="text-xs text-gray-500">{exam.startTime} - {exam.endTime}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900">{sub?.code}</p>
                          <p className="text-[11px] text-gray-500 line-clamp-1">{sub?.name}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{cls?.code}</p>
                          <p className="text-[11px] text-gray-500">{exam.shift === "SHIFT_I" ? "Shift I" : "Shift II"}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${typeInfo?.bg} ${typeInfo?.text}`}>
                            {typeInfo?.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle?.bg} ${statusStyle?.text}`}>
                            {exam.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {exam.status === "SCHEDULED" && (
                              <button onClick={() => handleStatusChange(exam.id, "ONGOING")} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Mark Ongoing">
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                            {exam.status === "ONGOING" && (
                              <button onClick={() => handleStatusChange(exam.id, "COMPLETED")} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Mark Completed">
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => openScheduleEditor(exam)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
     RENDER: SCHEDULE FORM
     ======================================================== */
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => setViewMode("list")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{editingExam ? "Edit Examination" : "Schedule New Examination"}</h2>
          <p className="text-xs text-gray-500">Configure exam details and allocate subjects</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
        {formError && (
          <div className="flex items-start gap-2 bg-rose-50 text-rose-700 p-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{formError}</p>
          </div>
        )}

        {/* Academic Context (Only edit for new exams) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-gray-100">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Academic Year</label>
            <select 
              value={selYearId} onChange={e => { setSelYearId(e.target.value); setSelSemId(""); }}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">Select Year</option>
              {academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.code}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Semester</label>
            <select 
              value={selSemId} onChange={e => setSelSemId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              disabled={!selYearId}
            >
              <option value="">Select Sem</option>
              {activeSemesters.map(s => <option key={s.id} value={s.id}>{s.term}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Course (Optional Filter)</label>
            <select 
              value={selCourseId} onChange={e => { setSelCourseId(e.target.value); setSelClassId(""); }}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Class *</label>
            <select 
              value={selClassId} onChange={e => { setSelClassId(e.target.value); setFormSubjectId(""); }}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">Select Class</option>
              {classOptions.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
        </div>

        {/* Exam Specifics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Subject *</label>
            <select 
              value={formSubjectId} onChange={e => setFormSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              disabled={!selClassId}
            >
              <option value="">Select Subject</option>
              {classSubjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Examination Type *</label>
            <select 
              value={formType} onChange={e => setFormType(e.target.value as ExamType)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date *</label>
            <input 
              type="date" 
              value={formDate} onChange={e => setFormDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Start Time *</label>
            <input 
              type="time" 
              value={formStartTime} onChange={e => setFormStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">End Time *</label>
            <input 
              type="time" 
              value={formEndTime} onChange={e => setFormEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleSaveExam}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {editingExam ? "Update Examination" : "Schedule Examination"}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}



