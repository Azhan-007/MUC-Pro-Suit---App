"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Clock, CalendarDays, Users, GraduationCap, Plus, Trash2, AlertCircle,
  ArrowLeft, ChevronDown, Pencil, X, Check, Save, Grid3X3
} from "lucide-react";
import {
  AcademicYear, Semester, Course, ClassEntity, SectionEntity,
  Subject, Faculty, TimetableEntry
} from "@/types/domain";

/* ======================== PROPS & CONSTANTS ======================== */
interface TimetableClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: Subject[];
  facultyList: Faculty[];
  timetableEntries: TimetableEntry[];
}

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as const;
const PERIODS = ["H1", "H2", "H3", "H4", "H5"] as const;
type Day = typeof DAYS[number];
type Period = typeof PERIODS[number];

const SHIFT_I_PERIODS: Record<Period, string> = {
  H1: "8:00 – 8:55", H2: "8:55 – 9:50", H3: "10:10 – 11:05",
  H4: "11:05 – 12:00", H5: "12:00 – 12:55",
};
const SHIFT_II_PERIODS: Record<Period, string> = {
  H1: "1:00 – 1:55", H2: "1:55 – 2:50", H3: "2:50 – 3:45",
  H4: "3:45 – 4:40", H5: "5:00 – 5:55",
};

// Subject type color palette
const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  CORE: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", light: "bg-blue-100" },
  ELECTIVE: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", light: "bg-violet-100" },
  LAB: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", light: "bg-orange-100" },
  PROJECT: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", light: "bg-emerald-100" },
};

type ViewMode = "class" | "faculty";

/* ======================== MAIN COMPONENT ======================== */
export function TimetableClient({
  academicYears, semesters, courses, classes, sections, subjects,
  facultyList, timetableEntries: initialEntries
}: TimetableClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("class");
  const router = useRouter();
  const [localEntries, setLocalEntries] = useState<TimetableEntry[]>(initialEntries);

  // Keep in sync after SSR refresh
  React.useEffect(() => {
    setLocalEntries(initialEntries);
  }, [initialEntries]);

  // Class View State
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Faculty View State
  const [selectedFacultyViewId, setSelectedFacultyViewId] = useState<string | null>(null);

  // Editor State
  const [editingCell, setEditingCell] = useState<{ day: Day; period: Period } | null>(null);
  const [editSubjectId, setEditSubjectId] = useState("");
  const [editFacultyId, setEditFacultyId] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [draggedCell, setDraggedCell] = useState<{ day: Day; period: Period; entryId: string } | null>(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  /* -------- RESOLVED DATA -------- */
  const activeAy = useMemo(() => academicYears.find(ay => ay.isActive), [academicYears]);
  const activeSem = useMemo(() => semesters.find(s => s.isActive), [semesters]);

  // Resolve class options with labels
  const classOptions = useMemo(() => {
    return classes.map(cls => {
      const course = courses.find(c => c.id === cls.courseId);
      const courseCode = course?.code || "Class";
      let yearRoman = "I";
      if (cls.semesterNumber >= 5) yearRoman = "III";
      else if (cls.semesterNumber >= 3) yearRoman = "II";
      const label = `${yearRoman} ${courseCode}`;
      const shift = course?.shift || "SHIFT_I";
      return { id: cls.id, label, courseId: cls.courseId, courseCode, shift, semesterNumber: cls.semesterNumber, courseName: course?.name || "" };
    });
  }, [classes, courses]);

  const shift1Classes = useMemo(() => classOptions.filter(c => c.shift === "SHIFT_I"), [classOptions]);
  const shift2Classes = useMemo(() => classOptions.filter(c => c.shift === "SHIFT_II"), [classOptions]);

  const selectedClassInfo = useMemo(() => classOptions.find(c => c.id === selectedClassId), [classOptions, selectedClassId]);

  const classSubjects = useMemo(() => {
    if (!selectedClassInfo) return [];
    // Only filter by courseId to allow scheduling any subject for the course (e.g. electives, arrears, or misconfigured semesters)
    return subjects.filter(s => s.courseId === selectedClassInfo.courseId);
  }, [subjects, selectedClassInfo]);

  // Current grid entries for class view
  const currentGridEntries = useMemo(() => {
    if (!selectedClassId || !activeAy || !activeSem) return [];
    return localEntries.filter((e: any) =>
      e.classId === selectedClassId &&
      e.academicYearId === activeAy.id &&
      e.semesterId === activeSem.id
    );
  }, [localEntries, selectedClassId, activeAy, activeSem]);

  // Faculty view entries
  const facultyGridEntries = useMemo(() => {
    if (!selectedFacultyViewId || !activeAy || !activeSem) return [];
    return localEntries.filter((e: any) =>
      e.facultyId === selectedFacultyViewId &&
      e.academicYearId === activeAy.id &&
      e.semesterId === activeSem.id
    );
  }, [localEntries, selectedFacultyViewId, activeAy, activeSem]);

  /* -------- HELPERS -------- */
  const getSubject = useCallback((id: string) => subjects.find(s => s.id === id), [subjects]);
  const getFaculty = useCallback((id: string) => facultyList.find(f => f.id === id), [facultyList]);
  const getClassLabel = useCallback((classId: string) => classOptions.find(c => c.id === classId)?.label || "—", [classOptions]);
  const getClassShift = useCallback((classId: string) => {
    const co = classOptions.find(c => c.id === classId);
    return co?.shift || "SHIFT_I";
  }, [classOptions]);

  const getCellEntry = useCallback((day: Day, period: Period): TimetableEntry | undefined => {
    if (viewMode === "class") {
      return currentGridEntries.find((e: any) => e.dayOfWeek === day && e.period === period);
    }
    return facultyGridEntries.find((e: any) => e.dayOfWeek === day && e.period === period);
  }, [viewMode, currentGridEntries, facultyGridEntries]);

  /* -------- MUTATIONS -------- */
  const saveMutation = useMutation({
    mutationFn: async (entry: TimetableEntry) => {
      await apiClient.post('/academic/timetable/entries', entry);
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (err: any) => {
      setConflictError(err.response?.data?.error || "Failed to save timetable entry.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/academic/timetable/entries/${id}`);
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to delete timetable entry.");
      router.refresh();
    }
  });

  /* -------- CRUD -------- */
  const openEditor = useCallback((day: Day, period: Period) => {
    setConflictError(null);
    const entry = getCellEntry(day, period);
    if (entry) {
      setEditSubjectId(entry.subjectId);
      setEditFacultyId(entry.facultyId);
    } else {
      setEditSubjectId("");
      setEditFacultyId("");
    }
    setEditingCell({ day, period });
  }, [getCellEntry]);

  const handleSaveEntry = useCallback((day: Day, period: Period) => {
    setConflictError(null);
    if (!editSubjectId || !editFacultyId || !selectedClassId || !activeAy || !activeSem || !selectedClassInfo) return;

    const existingEntry = currentGridEntries.find((e: any) => e.dayOfWeek === day && e.period === period);

    const payload: TimetableEntry = {
      id: existingEntry?.id || `tt-new-${Date.now()}`,
      academicYearId: activeAy.id,
      semesterId: activeSem.id,
      shift: selectedClassInfo.shift as TimetableEntry["shift"],
      dayOfWeek: (day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()) as TimetableEntry["dayOfWeek"],
      period,
      courseId: selectedClassInfo.courseId,
      classId: selectedClassId,
      subjectId: editSubjectId,
      facultyId: editFacultyId,
    };

    saveMutation.mutate(payload, {
      onSuccess: () => {
        setEditingCell(null);
        setEditSubjectId("");
        setEditFacultyId("");
      }
    });

  }, [editSubjectId, editFacultyId, selectedClassId, activeAy, activeSem, selectedClassInfo, currentGridEntries, saveMutation]);

  const handleDeleteEntry = useCallback((entryId: string) => {
    deleteMutation.mutate(entryId);
  }, [deleteMutation]);


  const handleDragStart = (e: React.DragEvent, day: Day, period: Period, entryId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ day, period, entryId }));
    setDraggedCell({ day, period, entryId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetDay: Day, targetPeriod: Period) => {
    e.preventDefault();
    setDraggedCell(null);
    const isCopy = isCopyMode || e.ctrlKey || e.altKey;
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.day === targetDay && data.period === targetPeriod) return;

      const sourceEntry = localEntries.find((entry: any) => entry.id === data.entryId);
      if (!sourceEntry) return;

      const targetEntry = localEntries.find((entry: any) => 
        entry.classId === selectedClassId &&
        entry.academicYearId === activeAy?.id &&
        entry.semesterId === activeSem?.id &&
        entry.dayOfWeek === targetDay && 
        entry.period === targetPeriod
      );

      if (targetEntry) {
        if (isCopy) {
           await apiClient.delete(`/academic/timetable/entries/${targetEntry.id}`);
           const { id: _, ...newPayload } = sourceEntry;
           await apiClient.post('/academic/timetable/entries', { ...newPayload, dayOfWeek: targetDay, period: targetPeriod });
        } else {
           // Swap logic
           await apiClient.delete(`/academic/timetable/entries/${targetEntry.id}`);
           await apiClient.post('/academic/timetable/entries', { ...sourceEntry, dayOfWeek: targetDay, period: targetPeriod });
           const { id: _, ...targetPayload } = targetEntry;
           await apiClient.post('/academic/timetable/entries', { ...targetPayload, dayOfWeek: data.day, period: data.period });
        }
      } else {
        if (isCopy) {
           const { id: _, ...newPayload } = sourceEntry;
           await apiClient.post('/academic/timetable/entries', { ...newPayload, dayOfWeek: targetDay, period: targetPeriod });
        } else {
           // Move logic
           await apiClient.post('/academic/timetable/entries', { ...sourceEntry, dayOfWeek: targetDay, period: targetPeriod });
        }
      }
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to move timetable entry. A conflict may exist.");
      router.refresh();
    }
  };


  /* -------- GRID STATS -------- */
  const gridStats = useMemo(() => {
    const entries = viewMode === "class" ? currentGridEntries : facultyGridEntries;
    const totalSlots = DAYS.length * PERIODS.length;
    const filledSlots = entries.length;
    const uniqueSubjects = new Set(entries.map((e: any) => e.subjectId)).size;
    const uniqueFaculty = new Set(entries.map((e: any) => e.facultyId)).size;
    return { totalSlots, filledSlots, uniqueSubjects, uniqueFaculty };
  }, [viewMode, currentGridEntries, facultyGridEntries]);

  /* ========================================================
     RENDER: CLASS PICKER (when no class is selected)
     ======================================================== */
  const renderClassPicker = () => (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Timetable Scheduler</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeAy?.code || "2026-27"} · {activeSem?.term || "Odd Term"} · Select a class to view or edit its schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("class")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "class" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <GraduationCap className="w-3.5 h-3.5 inline mr-1" /> Class View
          </button>
          <button
            onClick={() => { setViewMode("faculty"); setSelectedClassId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "faculty" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1" /> Faculty View
          </button>
        </div>
      </div>

      {viewMode === "class" ? (
        <div className="space-y-6">
          {/* Shift I Classes */}
          {shift1Classes.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Shift I — Aided (8:00 AM – 12:55 PM)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {shift1Classes.map(cls => {
                  const entryCount = localEntries.filter((e: any) => e.classId === cls.id && e.academicYearId === activeAy?.id && e.semesterId === activeSem?.id).length;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className="bg-white border border-emerald-100 rounded-xl p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{cls.label}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{cls.courseName}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-gray-400">Sem {cls.semesterNumber}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${entryCount === 25 ? "bg-emerald-100 text-emerald-700" : entryCount > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                          {entryCount}/25
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shift II Classes */}
          {shift2Classes.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Shift II — Self-Financing (1:00 PM – 5:55 PM)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {shift2Classes.map(cls => {
                  const entryCount = localEntries.filter((e: any) => e.classId === cls.id && e.academicYearId === activeAy?.id && e.semesterId === activeSem?.id).length;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className="bg-white border border-blue-100 rounded-xl p-4 text-left hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{cls.label}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{cls.courseName}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-gray-400">Sem {cls.semesterNumber}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${entryCount === 25 ? "bg-emerald-100 text-emerald-700" : entryCount > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                          {entryCount}/25
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {shift1Classes.length === 0 && shift2Classes.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
              <Grid3X3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No classes configured</p>
              <p className="text-xs text-gray-400 mt-1">Create classes under Master Admin → Classes to start scheduling.</p>
            </div>
          )}
        </div>
      ) : (
        /* Faculty Picker */
        <div>
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Faculty Member</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {facultyList.map(fac => {
              const entryCount = localEntries.filter((e: any) => e.facultyId === fac.id && e.academicYearId === activeAy?.id && e.semesterId === activeSem?.id).length;
              const initials = `${fac.firstName.charAt(0)}${fac.lastName.charAt(0)}`.toUpperCase();
              return (
                <button
                  key={fac.id}
                  onClick={() => { setSelectedFacultyViewId(fac.id); }}
                  className="bg-white border border-gray-100 rounded-xl p-4 text-left hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{fac.firstName} {fac.lastName}</h3>
                      <p className="text-[11px] text-gray-500">{fac.employeeId} · {fac.designation}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-gray-400">{fac.specialization}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                      {entryCount} periods
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ========================================================
     RENDER: WEEKLY GRID
     ======================================================== */
  const renderGrid = () => {
    const isClassView = viewMode === "class";
    const isShift1 = isClassView
      ? selectedClassInfo?.shift === "SHIFT_I"
      : (() => {
        // For faculty view, determine shift from their entries
        const fEntries = facultyGridEntries;
        if (fEntries.length === 0) return true;
        const shifts = new Set(fEntries.map((e: any) => e.shift));
        return !shifts.has("SHIFT_II");
      })();
    const periodTimes = isShift1 ? SHIFT_I_PERIODS : SHIFT_II_PERIODS;

    const title = isClassView
      ? selectedClassInfo?.label || "Timetable"
      : (() => { const f = getFaculty(selectedFacultyViewId || ""); return f ? `${f.firstName} ${f.lastName}` : "Faculty"; })();

    const subtitle = isClassView
      ? `${selectedClassInfo?.courseName} · ${selectedClassInfo?.shift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (SF)"}`
      : (() => { const f = getFaculty(selectedFacultyViewId || ""); return f ? `${f.employeeId} · ${f.designation}` : ""; })();

    return (
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedClassId(null); setSelectedFacultyViewId(null); }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">{subtitle} · {activeAy?.code || "2026-27"} · {activeSem?.term || "Odd Term"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {isClassView && (
              <label className="flex items-center gap-2 text-[11px] font-medium text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={isCopyMode} 
                  onChange={(e) => setIsCopyMode(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" 
                />
                Copy Mode (Drag to duplicate)
              </label>
            )}
            <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-lg px-4 py-2">
              <div className="text-center">
                <p className="font-bold text-gray-800">{gridStats.filledSlots}</p>
                <p className="text-[10px] text-gray-400">Scheduled</p>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-center">
                <p className="font-bold text-gray-800">{gridStats.totalSlots - gridStats.filledSlots}</p>
                <p className="text-[10px] text-gray-400">Empty</p>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-center">
                <p className="font-bold text-gray-800">{gridStats.uniqueSubjects}</p>
                <p className="text-[10px] text-gray-400">Subjects</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3 font-semibold text-gray-600 border-r border-gray-200 w-24 text-center text-xs uppercase tracking-wider">
                    Day / Period
                  </th>
                  {PERIODS.map(p => (
                    <th key={p} className="px-2 py-3 font-semibold text-gray-600 border-r border-gray-200 last:border-r-0 text-center" style={{ width: "18%" }}>
                      <p className="text-xs font-bold">{p}</p>
                      <p className="text-[10px] text-gray-400 font-normal mt-0.5">{periodTimes[p]}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIdx) => {
                  // Break row between H2 and H3 (for Shift I) or H4 and H5 (for Shift II)
                  return (
                    <tr key={day} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-3 py-2 font-medium text-gray-700 border-r border-gray-200 text-center bg-gray-50/50 text-xs">
                        <span className="block font-bold">{day.charAt(0) + day.slice(1, 3).toLowerCase()}</span>
                        <span className="block text-[10px] text-gray-400 font-normal">{day}</span>
                      </td>
                      {PERIODS.map(period => {
                        const entry = getCellEntry(day, period);
                        const isEditing = editingCell?.day === day && editingCell?.period === period;
                        const sub = entry ? getSubject(entry.subjectId) : null;
                        const fac = entry ? getFaculty(entry.facultyId) : null;
                        const colors = sub ? SUBJECT_COLORS[sub.type] || SUBJECT_COLORS.CORE : SUBJECT_COLORS.CORE;

                        return (
                          <td key={period} className={`p-1.5 border-r border-gray-100 last:border-r-0 align-top group ${draggedCell && draggedCell.day === day && draggedCell.period === period ? "opacity-50" : ""}`} style={{ minHeight: "90px" }} onDragOver={isClassView ? handleDragOver : undefined} onDrop={isClassView ? (e) => handleDrop(e, day, period) : undefined}>
                            {isEditing && isClassView ? (
                              /* Editor */
                              <div className="flex flex-col gap-1.5 p-2 bg-white border-2 border-emerald-300 rounded-lg shadow-lg">
                                {conflictError && (
                                  <div className="text-[10px] bg-rose-50 text-rose-600 p-1.5 rounded-md flex gap-1 items-start leading-tight">
                                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" /> {conflictError}
                                  </div>
                                )}
                                <select
                                  value={editSubjectId}
                                  onChange={e => setEditSubjectId(e.target.value)}
                                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                >
                                  <option value="">Subject...</option>
                                  {classSubjects.map(s => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
                                </select>
                                <select
                                  value={editFacultyId}
                                  onChange={e => setEditFacultyId(e.target.value)}
                                  className="w-full px-2 py-1.5 text-[11px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                >
                                  <option value="">Faculty...</option>
                                  {facultyList.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>)}
                                </select>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleSaveEntry(day, period)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-[11px] py-1.5 rounded-md hover:bg-emerald-700 font-medium"
                                  >
                                    <Check className="w-3 h-3" /> Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingCell(null); setConflictError(null); }}
                                    className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-600 text-[11px] py-1.5 rounded-md hover:bg-gray-200 font-medium"
                                  >
                                    <X className="w-3 h-3" /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : entry && sub ? (
                              /* Filled Cell */
                              <div draggable={isClassView} onDragStart={isClassView ? (e) => handleDragStart(e, day, period, entry.id) : undefined} className={`h-full p-2 rounded-lg border ${colors.bg} ${colors.border} group-hover:shadow-sm transition-all relative ${isClassView ? "cursor-move" : ""}`}>
                                <div className="flex items-start justify-between">
                                  <span className={`text-[11px] font-bold ${colors.text}`}>{sub.code}</span>
                                  {isClassView && (
                                    <div className="hidden group-hover:flex items-center gap-0.5">
                                      <button onClick={() => openEditor(day, period)} className="p-0.5 rounded hover:bg-white/60">
                                        <Pencil className="w-3 h-3 text-gray-400" />
                                      </button>
                                      <button onClick={() => handleDeleteEntry(entry.id)} className="p-0.5 rounded hover:bg-white/60">
                                        <Trash2 className="w-3 h-3 text-rose-400" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className={`text-[10px] ${colors.text} opacity-80 mt-0.5 line-clamp-2 leading-tight`}>
                                  {sub.name}
                                </p>
                                {isClassView ? (
                                  <div className={`mt-2 text-[9px] font-medium ${colors.text} opacity-70`}>
                                    {fac ? `${fac.firstName} ${fac.lastName}` : "—"}
                                  </div>
                                ) : (
                                  <div className={`mt-2 text-[9px] font-medium ${colors.text} opacity-70`}>
                                    {getClassLabel(entry.classId)}
                                  </div>
                                )}
                                <span className={`absolute bottom-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded ${colors.light} ${colors.text}`}>
                                  {sub.credits}cr
                                </span>
                              </div>
                            ) : (
                              /* Empty Cell */
                              <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-gray-200 bg-gray-50/30 hover:bg-gray-100/50 transition-all">
                                {isClassView && (
                                  <button
                                    onClick={() => openEditor(day, period)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-gray-200 text-gray-500 hover:bg-emerald-500 hover:text-white transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(SUBJECT_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
              <span className="text-[10px] text-gray-500 font-medium">{type}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ========================================================
     FINAL RENDER SELECTION
     ======================================================== */
  if (viewMode === "class" && selectedClassId) {
    return renderGrid();
  }

  if (viewMode === "faculty" && selectedFacultyViewId) {
    return renderGrid();
  }

  return renderClassPicker();
}
