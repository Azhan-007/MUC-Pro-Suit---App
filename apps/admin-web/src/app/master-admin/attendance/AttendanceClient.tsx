"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CalendarCheck, Users, Clock, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, BarChart3, ArrowLeft, Save, UserCheck, UserX,
  ClipboardCheck, TrendingDown, Search, Check, RotateCcw, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AcademicYear, Semester, Course, ClassEntity, SectionEntity,
  Subject, Faculty, Student, AttendanceRecord, TimetableEntry
} from "@/types/domain";
import { apiClient } from "@/lib/apiClient";


/* ======================== PROPS ======================== */
interface AttendanceClientProps {
  academicYears: AcademicYear[];
  semesters: Semester[];
  courses: Course[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: Subject[];
  facultyList: Faculty[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  timetableEntries: TimetableEntry[];
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const PERIODS = ["H1", "H2", "H3", "H4", "H5"] as const;
type Period = typeof PERIODS[number];
type AttStatus = AttendanceRecord["status"];

const SHIFT_I_TIMES: Record<Period, string> = {
  H1: "8:00 – 8:55", H2: "8:55 – 9:50", H3: "10:10 – 11:05",
  H4: "11:05 – 12:00", H5: "12:00 – 12:55",
};
const SHIFT_II_TIMES: Record<Period, string> = {
  H1: "1:00 – 1:55", H2: "1:55 – 2:50", H3: "2:50 – 3:45",
  H4: "3:45 – 4:40", H5: "5:00 – 5:55",
};

type ViewMode = "dashboard" | "marking" | "shortage";

/* ======================== HELPERS ======================== */
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getAttPercentageStyle(pct: number) {
  if (pct >= 75) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-500" };
  if (pct >= 65) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-500" };
  return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", ring: "ring-rose-500" };
}

/* ========================================================
   MAIN COMPONENT
   ======================================================== */
export function AttendanceClient({
  academicYears, semesters, courses, classes, sections, subjects,
  facultyList, students, attendanceRecords, timetableEntries
}: AttendanceClientProps) {

  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  // Marking context
  const [markingClassId, setMarkingClassId] = useState<string | null>(null);
  const [markingSubjectId, setMarkingSubjectId] = useState<string | null>(null);
  const [markingPeriod, setMarkingPeriod] = useState<Period | null>(null);
  const [markingFacultyId, setMarkingFacultyId] = useState<string | null>(null);

  // Attendance state for current session
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttStatus>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Shortage filter
  const [shortageShiftFilter, setShortageShiftFilter] = useState<"" | "SHIFT_I" | "SHIFT_II">("");

  // Fetch paginated attendance records from the backend
  const { data: attendanceData, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["attendance", selectedDate, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get(`/attendance/attendance?fromDate=${selectedDate}&toDate=${selectedDate}&page=${page}&pageSize=${pageSize}`);
      return res.data;
    },
    initialData: { data: attendanceRecords, pagination: { page: 1, pageSize: 50, total: attendanceRecords.length, totalPages: 1 } }
  });

  const currentAttendanceRecords = attendanceData.data;
  const pagination = attendanceData.pagination;

  /* -------- RESOLVED DATA -------- */
  const activeAcademicYear = useMemo(() => academicYears.find(ay => ay.isActive), [academicYears]);
  const activeSemester = useMemo(() => semesters.find(s => s.isActive), [semesters]);

  // Build class cards with resolved info
  const classCards = useMemo(() => {
    return classes.map(cls => {
      const course = courses.find(c => c.id === cls.courseId);
      const section = sections.find(s => s.classId === cls.id);
      const sectionStudents = section
        ? students.filter(s => s.sectionId === section.id)
        : students.filter(s => s.academicClassId === cls.id);
      const courseCode = course?.code || "Class";
      let yearRoman = "I";
      if (cls.semesterNumber >= 5) yearRoman = "III";
      else if (cls.semesterNumber >= 3) yearRoman = "II";
      const label = `${yearRoman} ${courseCode}`;
      const shift = course?.shift || "SHIFT_I";

      // Today's attendance status per period
      const classSubjects = subjects.filter(s => s.courseId === cls.courseId && s.semesterNumber === cls.semesterNumber);
      const todayRecords = currentAttendanceRecords.filter((a: any) =>
        a.date === selectedDate &&
        a.classId === cls.id
      );
      const completedPeriods = new Set(todayRecords.map((r: any) => r.period));
      const pendingPeriods = PERIODS.filter(p => !completedPeriods.has(p));

      // Timetable lookup for today
      const dayOfWeek = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }) as TimetableEntry["dayOfWeek"];
      const todayTimetable = timetableEntries.filter(tt =>
        tt.classId === cls.id && tt.dayOfWeek === dayOfWeek
      );

      return {
        id: cls.id,
        code: cls.code,
        label,
        courseId: cls.courseId,
        courseName: course?.name || "Program",
        shift,
        shiftLabel: shift === "SHIFT_I" ? "Shift I · Aided" : "Shift II · SF",
        sectionId: section?.id || "",
        sectionName: section?.name || "",
        advisorId: section?.advisorId,
        advisorName: section?.advisorId
          ? (() => { const f = facultyList.find(fac => fac.id === section?.advisorId); return f ? `${f.firstName} ${f.lastName}` : "—"; })()
          : "—",
        studentCount: sectionStudents.length,
        subjects: classSubjects,
        completedPeriods: completedPeriods.size,
        pendingPeriods: pendingPeriods.length,
        totalPeriods: PERIODS.length,
        todayTimetable,
        semesterNumber: cls.semesterNumber,
      };
    });
  }, [classes, courses, sections, students, subjects, currentAttendanceRecords, selectedDate, timetableEntries, facultyList]);

  /* -------- DASHBOARD METRICS -------- */
  const dashboardMetrics = useMemo(() => {
    const totalClasses = classCards.length;
    const totalSessions = totalClasses * PERIODS.length;
    const completedSessions = classCards.reduce((sum, c) => sum + c.completedPeriods, 0);
    const pendingSessions = totalSessions - completedSessions;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Shortage students: < 75% attendance
    const shortageStudents = students.filter(stu => {
      const stuRecords = currentAttendanceRecords.filter((a: any) => a.studentId === stu.id);
      if (stuRecords.length === 0) return false;
      const present = stuRecords.filter((a: any) => a.status === "PRESENT" || a.status === "ON_DUTY").length;
      const pct = Math.round((present / stuRecords.length) * 100);
      return pct < 75;
    });

    return { totalClasses, totalSessions, completedSessions, pendingSessions, completionRate, shortageStudents };
  }, [classCards, students, currentAttendanceRecords]);

  /* -------- MARKING LOGIC -------- */
  const markingClass = useMemo(() => classCards.find(c => c.id === markingClassId), [classCards, markingClassId]);

  const enrolledStudents = useMemo(() => {
    if (!markingClass?.id) return [];
    return students.filter(s => s.academicClassId === markingClass.id || s.sectionId === markingClass.sectionId);
  }, [students, markingClass]);

  const filteredEnrolledStudents = useMemo(() => {
    if (!searchQuery.trim()) return enrolledStudents;
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q)
    );
  }, [enrolledStudents, searchQuery]);

  const markedCount = useMemo(() => Object.keys(localAttendance).length, [localAttendance]);
  const presentCount = useMemo(() => Object.values(localAttendance).filter(s => s === "PRESENT").length, [localAttendance]);
  const absentCount = useMemo(() => Object.values(localAttendance).filter(s => s === "ABSENT").length, [localAttendance]);

  const startMarking = useCallback((classId: string, subjectId: string, period: Period, facultyId: string) => {
    setMarkingClassId(classId);
    setMarkingSubjectId(subjectId);
    setMarkingPeriod(period);
    setMarkingFacultyId(facultyId);
    setIsSaved(false);
    setSearchQuery("");
    setViewMode("marking");

    // Load existing records for this session
    const cls = classCards.find(c => c.id === classId);
    if (cls) {
      const existing = currentAttendanceRecords.filter((a: any) =>
        a.classId === classId &&
        a.subjectId === subjectId &&
        a.date === selectedDate &&
        a.period === period
      );
      const map: Record<string, AttStatus> = {};
      existing.forEach((r: any) => { map[r.studentId] = r.status; });
      setLocalAttendance(map);
    }
  }, [classCards, currentAttendanceRecords, selectedDate]);

  const handleMark = useCallback((studentId: string, status: AttStatus) => {
    setLocalAttendance(prev => ({ ...prev, [studentId]: status }));
    setIsSaved(false);
  }, []);

  const handleMarkAllPresent = useCallback(() => {
    const allPresent: Record<string, AttStatus> = {};
    enrolledStudents.forEach(s => { allPresent[s.id] = "PRESENT"; });
    setLocalAttendance(allPresent);
    setIsSaved(false);
  }, [enrolledStudents]);

  const handleResetAll = useCallback(() => {
    setLocalAttendance({});
    setIsSaved(false);
  }, []);

  const markMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post("/attendance/mark", payload);
      return res.data;
    },
    onSuccess: () => {
      setIsSaved(true);
      setSaveError(null);
      router.refresh();
    },
    onError: (err: any) => {
      console.error(err);
      setSaveError(err.message || "Failed to save attendance");
    }
  });

  const handleSave = useCallback(() => {
    if (!markingClassId || !markingSubjectId || !markingPeriod) return;
    
    const entries = Object.entries(localAttendance).map(([studentId, status]) => ({
      studentId,
      status
    }));
    
    markMutation.mutate({
      classId: markingClassId,
      subjectId: markingSubjectId,
      facultyId: markingFacultyId || undefined,
      date: selectedDate,
      period: markingPeriod,
      entries
    });
  }, [markingClassId, markingSubjectId, markingFacultyId, selectedDate, markingPeriod, localAttendance, markMutation]);

  const calculatePercentage = useCallback((studentId: string) => {
    const records = currentAttendanceRecords.filter((a: any) => a.studentId === studentId);
    if (records.length === 0) return 100;
    const present = records.filter((a: any) => a.status === "PRESENT" || a.status === "ON_DUTY").length;
    return Math.round((present / records.length) * 100);
  }, [currentAttendanceRecords]);

  /* -------- SHORTAGE DATA -------- */
  const shortageData = useMemo(() => {
    return students.map(stu => {
      const course = courses.find(c => c.id === stu.courseId);
      const stuRecords = currentAttendanceRecords.filter((a: any) => a.studentId === stu.id);
      const total = stuRecords.length;
      const present = stuRecords.filter((a: any) => a.status === "PRESENT" || a.status === "ON_DUTY").length;
      const pct = total > 0 ? Math.round((present / total) * 100) : 100;
      const statusInfo = (pct >= 75 ? { label: "Good", color: "text-green-600 bg-green-50", icon: <CheckCircle2 className="w-3 h-3 text-green-600" /> } : pct >= 65 ? { label: "Warning", color: "text-amber-600 bg-amber-50", icon: <AlertTriangle className="w-3 h-3 text-amber-600" /> } : { label: "Critical", color: "text-red-600 bg-red-50", icon: <XCircle className="w-3 h-3 text-red-600" /> });
      return {
        ...stu,
        courseCode: course?.code || "",
        courseName: course?.name || "",
        shift: course?.shift || ("SHIFT_I" as const),
        totalSessions: total,
        attendedSessions: present,
        percentage: pct,
        attendanceStatus: statusInfo.label,
        requiredAction: "",
      };
    }).filter(s => {
      if (s.percentage >= 75) return false;
      if (shortageShiftFilter && s.shift !== shortageShiftFilter) return false;
      return true;
    }).sort((a, b) => a.percentage - b.percentage);
  }, [students, currentAttendanceRecords, courses, shortageShiftFilter]);

  /* ========================================================
     RENDER: DASHBOARD VIEW
     ======================================================== */
  if (viewMode === "dashboard") {
    return (
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Attendance Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeAcademicYear?.code || "2026-27"} · {activeSemester?.term || "Odd Term"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
            <button
              onClick={() => setViewMode("shortage")}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              <TrendingDown className="w-4 h-4" />
              Shortage Monitor
              {dashboardMetrics.shortageStudents.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded-full text-[10px] font-bold">
                  {dashboardMetrics.shortageStudents.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ClipboardCheck className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Today&apos;s Completion</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.completionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {dashboardMetrics.completedSessions} of {dashboardMetrics.totalSessions} sessions
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Sessions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.pendingSessions}</p>
            <p className="text-xs text-gray-500 mt-1">Across {dashboardMetrics.totalClasses} classes</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            <p className="text-xs text-gray-500 mt-1">Enrolled this semester</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Shortage Alerts</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.shortageStudents.length}</p>
            <p className="text-xs text-gray-500 mt-1">Below 75% attendance</p>
          </div>
        </div>

        {/* Class Cards — Attendance Workstation */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Class-wise Attendance · {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </h2>

          {classCards.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
              <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No classes configured for this academic session.</p>
              <p className="text-xs text-gray-400 mt-1">Create classes under Master Admin → Classes to begin attendance tracking.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {classCards.map(card => {
                const isShift1 = card.shift === "SHIFT_I";
                const periodTimes = isShift1 ? SHIFT_I_TIMES : SHIFT_II_TIMES;
                const todayRecordsByPeriod = PERIODS.map(p => {
                  const records = currentAttendanceRecords.filter((a: any) =>
                    a.date === selectedDate && a.classId === card.id && a.period === p
                  );
                  return { period: p, hasRecords: records.length > 0, count: records.length };
                });

                return (
                  <div key={card.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Card Header */}
                    <div className={`px-4 py-3 border-b ${isShift1 ? "border-emerald-100 bg-emerald-50/50" : "border-blue-100 bg-blue-50/50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{card.label}</h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">{card.shiftLabel} · {card.studentCount} students</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${card.completedPeriods === 5
                            ? "bg-emerald-100 text-emerald-700"
                            : card.completedPeriods > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                            }`}>
                            {card.completedPeriods}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Period Timeline */}
                    <div className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {todayRecordsByPeriod.map(pr => (
                          <button
                            key={pr.period}
                            onClick={() => {
                              // Pick first subject for this period from timetable, or first available
                              const ttEntry = card.todayTimetable.find(tt => tt.period === pr.period);
                              const subId = ttEntry?.subjectId || card.subjects[0]?.id || "";
                              const facId = ttEntry?.facultyId || "";
                              if (subId) {
                                startMarking(card.id, subId, pr.period, facId);
                              }
                            }}
                            className={`flex-1 py-2 rounded-lg text-center transition-all ${pr.hasRecords
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 border border-dashed border-gray-200"
                              }`}
                          >
                            <p className="text-[11px] font-bold">{pr.period}</p>
                            <p className="text-[9px] mt-0.5">{periodTimes[pr.period]}</p>
                            {pr.hasRecords && <Check className="w-3 h-3 mx-auto mt-0.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Info Footer */}
                    <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">
                        Advisor: <span className="font-medium text-gray-600">{card.advisorName}</span>
                      </span>
                      <button
                        onClick={() => {
                          // Pick first pending period
                          const firstPending = PERIODS.find(p => {
                            const records = currentAttendanceRecords.filter((a: any) =>
                              a.date === selectedDate && a.classId === card.id && a.period === p
                            );
                            return records.length === 0;
                          });
                          if (firstPending) {
                            const ttEntry = card.todayTimetable.find(tt => tt.period === firstPending);
                            const subId = ttEntry?.subjectId || card.subjects[0]?.id || "";
                            const facId = ttEntry?.facultyId || "";
                            if (subId) startMarking(card.id, subId, firstPending, facId);
                          }
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Take Attendance <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination Controls */}
          {classCards.length > 0 && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 border border-gray-200 rounded-xl">
              <span className="text-sm text-gray-700">
                Showing page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                <span className="mx-2">|</span>
                Total Records: <span className="font-semibold">{pagination.total}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="ml-4 px-2 py-1 bg-white border border-gray-200 rounded-lg text-sm"
                >
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: MARKING VIEW (Attendance Workstation)
     ======================================================== */
  if (viewMode === "marking" && markingClass && markingPeriod && markingSubjectId) {
    const subject = subjects.find(s => s.id === markingSubjectId);
    const faculty = markingFacultyId ? facultyList.find(f => f.id === markingFacultyId) : null;
    const isShift1 = markingClass.shift === "SHIFT_I";
    const periodTimes = isShift1 ? SHIFT_I_TIMES : SHIFT_II_TIMES;
    const allMarked = markedCount === enrolledStudents.length && enrolledStudents.length > 0;

    return (
      <div className="flex flex-col gap-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setViewMode("dashboard"); setMarkingClassId(null); }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            {/* Period Switcher */}
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => {
                  const ttEntry = markingClass.todayTimetable.find(tt => tt.period === p);
                  const subId = ttEntry?.subjectId || markingClass.subjects[0]?.id || markingSubjectId;
                  const facId = ttEntry?.facultyId || markingFacultyId || "";
                  startMarking(markingClass.id, subId, p, facId);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${p === markingPeriod
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Session Context Header */}
        <div className={`rounded-xl border p-4 ${isShift1 ? "bg-emerald-50/60 border-emerald-200" : "bg-blue-50/60 border-blue-200"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{markingClass.label}</h2>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isShift1 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                  {markingClass.shiftLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{subject?.code} — {subject?.name}</span>
                <span className="mx-2 text-gray-300">|</span>
                {markingPeriod} · {periodTimes[markingPeriod]}
                <span className="mx-2 text-gray-300">|</span>
                {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </p>
              {faculty && (
                <p className="text-xs text-gray-500 mt-1">
                  Faculty: <span className="font-medium">{faculty.firstName} {faculty.lastName}</span> ({faculty.employeeId})
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="text-center px-3 py-1.5 bg-white/80 rounded-lg border border-gray-200">
                <p className="font-bold text-gray-800 text-base">{enrolledStudents.length}</p>
                <p className="text-gray-500">Total</p>
              </div>
              <div className="text-center px-3 py-1.5 bg-emerald-100/80 rounded-lg border border-emerald-200">
                <p className="font-bold text-emerald-700 text-base">{presentCount}</p>
                <p className="text-emerald-600">Present</p>
              </div>
              <div className="text-center px-3 py-1.5 bg-rose-100/80 rounded-lg border border-rose-200">
                <p className="font-bold text-rose-700 text-base">{absentCount}</p>
                <p className="text-rose-600">Absent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleMarkAllPresent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Mark All Present
            </button>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={handleSave}
              disabled={markedCount === 0 || markMutation.isPending}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${isSaved
                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                : markedCount > 0
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {isSaved ? (
                <><CheckCircle2 className="w-4 h-4" /> Submitted</>
              ) : (
                <><Save className="w-4 h-4" /> Save Attendance ({markedCount}/{enrolledStudents.length})</>
              )}
            </button>
          </div>
        </div>
        
        {saveError && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
            <X className="w-4 h-4" />
            {saveError}
          </div>
        )}

        {/* Student Roster — Marking Grid */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-12 whitespace-nowrap">#</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Reg. No</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Student Name</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">Sem %</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEnrolledStudents.map((student, idx) => {
                  const currentStatus = localAttendance[student.id];
                  const semPct = calculatePercentage(student.id);
                  const pctStyle = getAttPercentageStyle(semPct);

                  return (
                    <tr key={student.id} className={`transition-colors h-14 ${currentStatus === "PRESENT" ? "bg-emerald-50/30" : currentStatus === "ABSENT" ? "bg-rose-50/30" : "hover:bg-gray-50/50"}`}>
                      <td className="px-4 py-3 align-middle text-xs text-gray-400 font-mono whitespace-nowrap">{idx + 1}</td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <span className="text-xs font-semibold text-gray-700 font-mono">{student.registrationNumber}</span>
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                      </td>
                      <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${pctStyle.bg} ${pctStyle.text}`}>
                          {semPct}%
                        </span>
                        {semPct < 75 && (
                          <p className="text-[9px] text-amber-600 font-medium mt-0.5 whitespace-nowrap">
                            {semPct < 65 ? "Redo" : "Condonation"}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleMark(student.id, "PRESENT")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentStatus === "PRESENT"
                              ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/30"
                              : "bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                              }`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleMark(student.id, "ABSENT")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentStatus === "ABSENT"
                              ? "bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/30"
                              : "bg-gray-100 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                              }`}
                          >
                            A
                          </button>
                          <button
                            onClick={() => handleMark(student.id, "ON_DUTY")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentStatus === "ON_DUTY"
                              ? "bg-blue-500 text-white shadow-sm ring-2 ring-blue-500/30"
                              : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                              }`}
                          >
                            OD
                          </button>
                          <button
                            onClick={() => handleMark(student.id, "LATE")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentStatus === "LATE"
                              ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30"
                              : "bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                              }`}
                          >
                            L
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredEnrolledStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <UserX className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        {searchQuery ? "No students match your search." : "No students enrolled in this class."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredEnrolledStudents.map((student, idx) => {
              const currentStatus = localAttendance[student.id];
              const semPct = calculatePercentage(student.id);
              const pctStyle = getAttPercentageStyle(semPct);

              return (
                <div key={student.id} className={`p-4 ${currentStatus === "PRESENT" ? "bg-emerald-50/30" : currentStatus === "ABSENT" ? "bg-rose-50/30" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{idx + 1}. {student.firstName} {student.lastName}</p>
                      <p className="text-[11px] text-gray-500 font-mono">{student.registrationNumber}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${pctStyle.bg} ${pctStyle.text}`}>
                      {semPct}%
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {(["PRESENT", "ABSENT", "ON_DUTY", "LATE"] as AttStatus[]).map(status => {
                      const labels: Record<string, string> = { PRESENT: "P", ABSENT: "A", ON_DUTY: "OD", LATE: "L" };
                      const colors: Record<string, string> = {
                        PRESENT: currentStatus === "PRESENT" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500",
                        ABSENT: currentStatus === "ABSENT" ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500",
                        ON_DUTY: currentStatus === "ON_DUTY" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500",
                        LATE: currentStatus === "LATE" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500",
                      };
                      return (
                        <button
                          key={status}
                          onClick={() => handleMark(student.id, status)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${colors[status]}`}
                        >
                          {labels[status]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submission Progress Bar */}
        {enrolledStudents.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">Marking Progress</span>
              <span className="text-xs font-bold text-gray-700">{markedCount} / {enrolledStudents.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${allMarked ? "bg-emerald-500" : "bg-emerald-400"}`}
                style={{ width: `${enrolledStudents.length > 0 ? (markedCount / enrolledStudents.length) * 100 : 0}%` }}
              />
            </div>
            {!allMarked && markedCount < enrolledStudents.length && (
              <p className="text-[10px] text-amber-600 mt-1.5 font-medium">
                ⚠ {enrolledStudents.length - markedCount} student(s) not yet marked
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ========================================================
     RENDER: SHORTAGE MONITOR VIEW
     ======================================================== */
  if (viewMode === "shortage") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("dashboard")}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Attendance Shortage Monitor</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Students below 75% attendance threshold · {activeAcademicYear?.code || "2026-27"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={shortageShiftFilter}
              onChange={e => setShortageShiftFilter(e.target.value as typeof shortageShiftFilter)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="">All Shifts</option>
              <option value="SHIFT_I">Shift I (Aided)</option>
              <option value="SHIFT_II">Shift II (SF)</option>
            </select>
          </div>
        </div>

        {/* Threshold Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Regular</span>
            </div>
            <p className="text-sm text-emerald-600 font-medium">≥ 75% Attendance</p>
            <p className="text-[11px] text-emerald-500 mt-0.5">Eligible without fine/condonation</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Condonation</span>
            </div>
            <p className="text-sm text-amber-600 font-medium">65% – 74.9%</p>
            <p className="text-[11px] text-amber-500 mt-0.5">Condonation fine applicable</p>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Redo Semester</span>
            </div>
            <p className="text-sm text-rose-600 font-medium">Below 65%</p>
            <p className="text-[11px] text-rose-500 mt-0.5">Student must redo the semester</p>
          </div>
        </div>

        {/* Shortage Table */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {shortageData.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">No students below 75% threshold</p>
              <p className="text-xs text-gray-500 mt-1">All enrolled students meet the minimum attendance requirement.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm min-w-[850px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">#</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Student</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Course</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sessions</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Attendance</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Action Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {shortageData.map((s, idx) => {
                      const pctStyle = getAttPercentageStyle(s.percentage);
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors h-14">
                          <td className="px-4 py-3 align-middle text-xs text-gray-400 whitespace-nowrap">{idx + 1}</td>
                          <td className="px-4 py-3 align-middle whitespace-nowrap">
                            <p className="text-sm font-medium text-gray-900">{s.firstName} {s.lastName}</p>
                            <p className="text-[11px] text-gray-500 font-mono">{s.registrationNumber}</p>
                          </td>
                          <td className="px-4 py-3 align-middle whitespace-nowrap">
                            <p className="text-sm text-gray-700">{s.courseCode}</p>
                            <p className="text-[11px] text-gray-400">Sem {s.currentSemester}</p>
                          </td>
                          <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                            <p className="text-sm font-medium text-gray-700">{s.attendedSessions}/{s.totalSessions}</p>
                          </td>
                          <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${pctStyle.bg} ${pctStyle.text}`}>
                              {s.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 align-middle text-center whitespace-nowrap">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${s.attendanceStatus === "CONDONATION"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                              }`}>
                              {s.attendanceStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-middle text-xs text-gray-600 whitespace-nowrap">
                            {s.requiredAction || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {shortageData.map((s, idx) => {
                  const pctStyle = getAttPercentageStyle(s.percentage);
                  return (
                    <div key={s.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{idx + 1}. {s.firstName} {s.lastName}</p>
                          <p className="text-[11px] text-gray-500">{s.registrationNumber} · {s.courseCode} · Sem {s.currentSemester}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${pctStyle.bg} ${pctStyle.text}`}>
                          {s.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.attendanceStatus === "CONDONATION" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                          {s.attendanceStatus}
                        </span>
                        <span className="text-[11px] text-gray-500">{s.attendedSessions}/{s.totalSessions} sessions</span>
                        {s.requiredAction && <span className="text-[11px] text-amber-600 font-medium ml-auto">{s.requiredAction}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Summary Footer */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-amber-700">{shortageData.filter(s => s.attendanceStatus === "CONDONATION").length}</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Condonation</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-lg font-bold text-rose-700">{shortageData.filter(s => s.attendanceStatus === "REDO").length}</p>
              <p className="text-[10px] text-gray-500 uppercase font-medium">Redo Semester</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Total shortage: <span className="font-bold text-gray-700">{shortageData.length} students</span></span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}


