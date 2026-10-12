"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  X,
  MoreVertical,
  CalendarCheck,
  CreditCard,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import {
  Department,
  Course,
  ResolvedStudent,
  StudentRegisterMetrics,
} from "@/types/domain";
import { Dossier, DossierSection, DossierItem } from "@/components/shared/Dossier";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";

interface StudentsClientProps {
  students: ResolvedStudent[];
  departments: Department[];
  courses: Course[];
  metrics: StudentRegisterMetrics;
}

export function StudentsClient({
  students: initialStudents,
  departments,
  courses,
  metrics: initialMetrics,
}: StudentsClientProps) {
  const router = useRouter();
  // Data State — initialStudents comes SSR-enriched with summary/shift/classYearLabel.
  // After mutations, we do router.refresh() to re-run SSR and get fresh enriched data.
  const [students, setStudents] = useState<ResolvedStudent[]>(initialStudents);
  const [selectedStudent, setSelectedStudent] = useState<ResolvedStudent | null>(null);

  // Keep local list in sync if SSR re-runs (e.g., after router.refresh)
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const addStudentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/academic/students', payload);
      return res.data;
    },
    onSuccess: () => {
      setAddFormSuccess(true);
      // Trigger Next.js SSR refresh so the new student appears with full enrichment
      router.refresh();
      setTimeout(() => {
        setAddFormSuccess(false);
        setIsAddModalOpen(false);
        setNewFirstName("");
        setNewLastName("");
        setNewRegNo("");
        setNewAdmNo("");
        setNewEmail("");
        setNewPhone("");
        setNewGuardianName("");
        setNewGuardianPhone("");
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to add student: " + (err.response?.data?.message || err.response?.data?.error || err.message));
    }
  });

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [selectedShift, setSelectedShift] = useState<"" | "SHIFT_I" | "SHIFT_II">("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<"" | "1" | "2" | "3">("");
  const [selectedStatus, setSelectedStatus] = useState<"" | "ACTIVE" | "INACTIVE">("");

  // UI Dropdown States
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [activeMenuStudentId, setActiveMenuStudentId] = useState<string | null>(null);

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newRegNo, setNewRegNo] = useState("");
  const [newAdmNo, setNewAdmNo] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newSemester, setNewSemester] = useState(1);
  const [newDob, setNewDob] = useState("2007-05-15");
  const [newGender, setNewGender] = useState("Male");
  const [newBloodGroup, setNewBloodGroup] = useState("O+");
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianPhone, setNewGuardianPhone] = useState("");
  const [addFormSuccess, setAddFormSuccess] = useState(false);

  // Clipboard Copied State
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Close menus on outside click
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setCourseDropdownOpen(false);
      }
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target as Node)
      ) {
        setDeptDropdownOpen(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setActiveMenuStudentId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard dismiss (Escape) for Add Modal
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.registrationNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q);

      const matchesShift = selectedShift ? s.shift === selectedShift : true;
      const matchesDept = selectedDept ? s.departmentId === selectedDept : true;
      const matchesCourse = selectedCourse ? s.courseId === selectedCourse : true;
      const matchesStatus = selectedStatus ? s.status === selectedStatus : true;

      let matchesYear = true;
      if (selectedYear === "1") matchesYear = s.currentSemester <= 2;
      else if (selectedYear === "2")
        matchesYear = s.currentSemester === 3 || s.currentSemester === 4;
      else if (selectedYear === "3") matchesYear = s.currentSemester >= 5;

      return (
        matchesSearch &&
        matchesShift &&
        matchesDept &&
        matchesCourse &&
        matchesStatus &&
        matchesYear
      );
    });
  }, [
    students,
    search,
    selectedShift,
    selectedDept,
    selectedCourse,
    selectedStatus,
    selectedYear,
  ]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedShift) ||
    Boolean(selectedDept) ||
    Boolean(selectedCourse) ||
    Boolean(selectedYear) ||
    Boolean(selectedStatus);

  const resetFilters = () => {
    setSearch("");
    setSelectedShift("");
    setSelectedDept("");
    setSelectedCourse("");
    setSelectedYear("");
    setSelectedStatus("");
  };

  // Group Courses by Authoritative Shift (MUC Rule 8 & 21)
  const shift1Courses = useMemo(
    () => courses.filter((c) => c.shift === "SHIFT_I"),
    [courses]
  );
  const shift2Courses = useMemo(
    () => courses.filter((c) => c.shift === "SHIFT_II"),
    [courses]
  );

  // Selected names for filter pills
  const selectedCourseObj = useMemo(
    () => courses.find((c) => c.id === selectedCourse),
    [courses, selectedCourse]
  );
  const selectedDeptObj = useMemo(
    () => departments.find((d) => d.id === selectedDept),
    [departments, selectedDept]
  );

  // Add Student Modal Helpers
  const modalSelectedCourse = useMemo(
    () => courses.find((c) => c.id === newCourseId),
    [courses, newCourseId]
  );
  const modalAvailableCourses = useMemo(() => {
    if (!newDeptId) return courses;
    return courses.filter((c) => c.departmentId === newDeptId);
  }, [courses, newDeptId]);

  const modalClassPreview = useMemo(() => {
    if (!modalSelectedCourse) return null;
    let roman = "I";
    if (newSemester >= 5) roman = "III";
    else if (newSemester >= 3) roman = "II";
    const shiftStr =
      modalSelectedCourse.shift === "SHIFT_I"
        ? "Shift I · Aided"
        : "Shift II · SF";
    return `${roman} ${modalSelectedCourse.code} · Sem ${newSemester} · ${shiftStr}`;
  }, [modalSelectedCourse, newSemester]);

  // CSV Export Action (MUC Rule 22: Functional frontend mock export)
  const handleExportCSV = () => {
    const headers = [
      "Registration Number",
      "Admission Number",
      "Full Name",
      "Course Code",
      "Course Name",
      "Department",
      "Class / Year",
      "Semester",
      "Shift",
      "Shift Type",
      "Email",
      "Phone",
      "Attendance %",
      "Fee Outstanding",
      "Status",
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.registrationNumber}"`,
      `"${s.admissionNumber}"`,
      `"${s.fullName}"`,
      `"${s.courseCode}"`,
      `"${s.courseName}"`,
      `"${s.departmentName}"`,
      `"${s.classYearLabel}"`,
      s.currentSemester,
      `"${s.shift}"`,
      `"${s.shiftType}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `${s.summary.attendancePercentage}%`,
      `INR ${s.summary.feeOutstanding}`,
      `"${s.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MUC_Students_Register_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Student Handler
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newRegNo || !newDeptId || !newCourseId) {
      return;
    }

    addStudentMutation.mutate({
      registrationNumber: newRegNo.toUpperCase(),
      admissionNumber: newAdmNo || `ADM-25-${Math.floor(100 + Math.random() * 900)}`,
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail || `${newFirstName.toLowerCase()}@student.muc.edu`,
      phone: newPhone || "9876543299",
      dateOfBirth: newDob,
      gender: newGender,
      bloodGroup: newBloodGroup,
      guardianName: newGuardianName || "Guardian",
      guardianPhone: newGuardianPhone || "9876543298",
      departmentId: newDeptId,
      courseId: newCourseId,
      currentSemester: Number(newSemester)
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ─── 1. Institutional Actions in Navbar ─── */}
      <NavbarActions>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
          title="Export student roster to CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          Export ({filteredStudents.length})
        </button>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Student
        </button>
      </NavbarActions>

      {/* ─── 2. Institutional Header & Summary Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Students Register
            </h1>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
              Academic Year {initialMetrics.academicYear}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage student identity, academic enrollment and institutional records.
          </p>
        </div>

        {/* Real KPI Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-muted/40 border border-border/70 flex flex-col justify-center">
            <span className="text-[10.5px] font-medium text-muted-foreground">Total Enrolled</span>
            <span className="text-base font-bold text-foreground">{initialMetrics.totalStudents}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-muted/40 border border-border/70 flex flex-col justify-center">
            <span className="text-[10.5px] font-medium text-emerald-700 dark:text-emerald-400">Shift I (Aided)</span>
            <span className="text-base font-bold text-foreground">{initialMetrics.shift1Count}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-muted/40 border border-border/70 flex flex-col justify-center">
            <span className="text-[10.5px] font-medium text-indigo-700 dark:text-indigo-400">Shift II (Self-Fin)</span>
            <span className="text-base font-bold text-foreground">{initialMetrics.shift2Count}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-muted/40 border border-border/70 flex flex-col justify-center">
            <span className="text-[10.5px] font-medium text-muted-foreground">Active Roster</span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {initialMetrics.activeCount}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Filter & Search Control Center (Custom Styled Dropdowns) ─── */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by student name, reg. number, admission no, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Shift Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedShift("")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedShift === ""
                  ? "bg-card text-foreground shadow-2xs border border-border/80 font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Shifts
            </button>
            <button
              type="button"
              onClick={() => setSelectedShift("SHIFT_I")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedShift === "SHIFT_I"
                  ? "bg-emerald-600 text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Shift I (Aided)
            </button>
            <button
              type="button"
              onClick={() => setSelectedShift("SHIFT_II")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedShift === "SHIFT_II"
                  ? "bg-indigo-600 text-white shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Shift II (Self-Fin)
            </button>
          </div>

          {/* Department Filter (Custom Select Popover) */}
          <div className="relative shrink-0" ref={deptDropdownRef}>
            <button
              type="button"
              onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
              className={cn(
                "w-full sm:w-auto px-3.5 py-2 bg-background border rounded-xl text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all",
                selectedDept
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-foreground hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="truncate">
                  {selectedDeptObj ? selectedDeptObj.name : "All Departments"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>

            {deptDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-card border border-border rounded-xl shadow-lg z-30 p-1.5 max-h-64 overflow-y-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDept("");
                    setDeptDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-between",
                    !selectedDept
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted/70 text-foreground"
                  )}
                >
                  All Departments
                  {!selectedDept && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="h-px bg-border my-1" />
                {departments.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDept(d.id);
                      setDeptDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-between",
                      selectedDept === d.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <span className="truncate">{d.name}</span>
                    {selectedDept === d.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Course Filter Grouped by Shift (MUC Rule 8) */}
          <div className="relative shrink-0" ref={courseDropdownRef}>
            <button
              type="button"
              onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
              className={cn(
                "w-full sm:w-auto px-3.5 py-2 bg-background border rounded-xl text-xs font-semibold flex items-center justify-between gap-2 cursor-pointer transition-all",
                selectedCourse
                  ? "border-primary text-primary bg-primary/5"
                  : "border-border text-foreground hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="truncate">
                  {selectedCourseObj
                    ? `${selectedCourseObj.code} • ${selectedCourseObj.name}`
                    : "All Courses"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>

            {courseDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-card border border-border rounded-xl shadow-lg z-30 p-1.5 max-h-72 overflow-y-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCourse("");
                    setCourseDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-between",
                    !selectedCourse
                      ? "bg-primary/10 text-primary font-bold"
                      : "hover:bg-muted/70 text-foreground"
                  )}
                >
                  All Courses
                  {!selectedCourse && <Check className="w-3.5 h-3.5" />}
                </button>

                {/* Section A: Shift I Aided */}
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 rounded mt-1 mb-0.5">
                  Shift I — Aided
                </div>
                {shift1Courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(c.id);
                      setCourseDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-between",
                      selectedCourse === c.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <div className="min-w-0 pr-1">
                      <p className="font-bold truncate">{c.code}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.name}</p>
                    </div>
                    {selectedCourse === c.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}

                {/* Section B: Shift II Self-Financing */}
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 rounded mt-2 mb-0.5">
                  Shift II — Self-Financing
                </div>
                {shift2Courses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(c.id);
                      setCourseDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-between",
                      selectedCourse === c.id
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-muted/70 text-foreground"
                    )}
                  >
                    <div className="min-w-0 pr-1">
                      <p className="font-bold truncate">{c.code}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{c.name}</p>
                    </div>
                    {selectedCourse === c.id && (
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── 4. Student Roster Table (Desktop & Tablet) ─── */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Reg. Number</th>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-5 py-3.5">Course</th>
                <th className="px-5 py-3.5">Class / Semester</th>
                <th className="px-5 py-3.5">Shift</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {filteredStudents.map((student) => {
                const initials = `${student.firstName[0] || ""}${student.lastName[0] || ""}`.toUpperCase();

                return (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    {/* Reg Number & Admission */}
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted/70 px-2 py-0.5 rounded-md border border-border/60">
                        {student.registrationNumber}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {student.admissionNumber}
                      </p>
                    </td>

                    {/* Student Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors truncate">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Course */}
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-foreground text-xs">
                        {student.courseCode}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={student.courseName}>
                        {student.courseName}
                      </p>
                    </td>

                    {/* Academic Class & Semester (MUC Rule 2 & 4: I BCA · Sem 1) */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-xs text-foreground">
                        {student.classYearLabel}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        Semester {student.currentSemester}
                      </span>
                    </td>

                    {/* Shift Badge (MUC Rule 4) */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border",
                          student.shift === "SHIFT_I"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60"
                        )}
                      >
                        {student.shiftLabel}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {student.departmentName}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {student.status}
                      </span>
                    </td>

                    {/* Row Actions Menu */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─── Mobile Responsive Card Roster (<768px) ─── */}
        <div className="md:hidden divide-y divide-border/70">
          {filteredStudents.map((student) => {
            const initials = `${student.firstName[0] || ""}${student.lastName[0] || ""}`.toUpperCase();

            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="p-4 hover:bg-muted/30 transition-colors cursor-pointer flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-bold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">
                        {student.fullName}
                      </p>
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        {student.registrationNumber}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {student.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {student.classYearLabel}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{student.courseName}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    {student.shiftLabel}
                  </span>
                  <span className="text-primary font-semibold flex items-center gap-0.5">
                    View Dossier <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-base font-bold text-foreground">
              No students found matching your filters
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query, shift selection, or clearing course/department filters.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <span>
            Showing <strong className="text-foreground">{filteredStudents.length}</strong> of{" "}
            <strong className="text-foreground">{students.length}</strong> registered students
          </span>
          <span className="text-[11px]">
            Academic Year {initialMetrics.academicYear} • Relational ERP Register
          </span>
        </div>
      </div>

      {/* ─── 5. Redesigned 360° Student Dossier (Slide-Over Drawer) ─── */}
      <Dossier
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile Dossier"
        subtitle="Authoritative Institutional Record"
        width="max-w-xl"
      >
        {selectedStudent && (
          <div className="flex flex-col gap-6">
            {/* Header Banner */}
            <div className="flex items-start gap-4 pb-5 border-b border-border/70">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xl font-extrabold shrink-0 shadow-xs">
                {selectedStudent.firstName[0]}
                {selectedStudent.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">
                    {selectedStudent.fullName}
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                    {selectedStudent.status}
                  </span>
                </div>

                <p className="text-xs font-mono font-semibold text-muted-foreground mt-0.5">
                  Reg No: {selectedStudent.registrationNumber} • Adm: {selectedStudent.admissionNumber}
                </p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {selectedStudent.classYearLabel} · Sem {selectedStudent.currentSemester}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-md border",
                      selectedStudent.shift === "SHIFT_I"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    )}
                  >
                    {selectedStudent.shiftLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* 360° Academic Health Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Attendance Card */}
              <div className="p-3 rounded-xl border border-border/80 bg-muted/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  <span>Attendance</span>
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-lg font-bold text-foreground my-1">
                  {selectedStudent.summary.attendancePercentage}%
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border w-fit",
                    selectedStudent.summary.attendanceStatus === "REGULAR"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selectedStudent.summary.attendanceStatus === "CONDONATION"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  )}
                >
                  {selectedStudent.summary.attendanceStatus === "REGULAR"
                    ? "Eligible"
                    : selectedStudent.summary.attendanceStatus === "CONDONATION"
                    ? "Condonation"
                    : "Redo Sem"}
                </span>
              </div>

              {/* Fee Account Card */}
              <div className="p-3 rounded-xl border border-border/80 bg-muted/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  <span>Fee Account</span>
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <p className="text-lg font-bold text-foreground my-1">
                  ₹{selectedStudent.summary.feeOutstanding.toLocaleString("en-IN")}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border w-fit",
                    selectedStudent.summary.feeStatus === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : selectedStudent.summary.feeStatus === "PARTIALLY_PAID"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  )}
                >
                  {selectedStudent.summary.feeStatus.replace("_", " ")}
                </span>
              </div>

              {/* Library Loans Card */}
              <div className="p-3 rounded-xl border border-border/80 bg-muted/20 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  <span>Library Loans</span>
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <p className="text-lg font-bold text-foreground my-1">
                  {selectedStudent.summary.libraryActiveLoansCount} / 2
                </p>
                <span className="text-[10px] text-muted-foreground truncate">
                  {selectedStudent.summary.libraryActiveLoansCount > 0
                    ? selectedStudent.summary.libraryBookTitles[0] || "Book Issued"
                    : "No active loans"}
                </span>
              </div>
            </div>

            {/* Section 1: Identity */}
            <DossierSection title="Identity Details">
              <div className="grid grid-cols-2 gap-3.5 bg-muted/20 border border-border/60 p-3.5 rounded-xl">
                <DossierItem label="Register Number" value={selectedStudent.registrationNumber} />
                <DossierItem label="Admission Number" value={selectedStudent.admissionNumber} />
                <DossierItem label="Date of Birth" value={selectedStudent.formattedDateOfBirth} />
                <DossierItem label="Gender" value={selectedStudent.gender} />
                <DossierItem label="Blood Group" value={selectedStudent.bloodGroup} />
                <DossierItem label="Academic Year" value={selectedStudent.academicYearCode} />
              </div>
            </DossierSection>

            {/* Section 2: Academic Profile */}
            <DossierSection title="Academic Profile">
              <div className="grid grid-cols-2 gap-3.5 bg-muted/20 border border-border/60 p-3.5 rounded-xl">
                <DossierItem label="Program Code" value={selectedStudent.courseCode} />
                <DossierItem label="Academic Class" value={selectedStudent.classYearLabel} />
                <DossierItem label="Department" value={selectedStudent.departmentName} />
                <DossierItem label="Current Semester" value={`Semester ${selectedStudent.currentSemester}`} />
                <DossierItem label="Academic Shift" value={selectedStudent.shiftLabel} />
                <DossierItem label="Program Name" value={selectedStudent.courseName} />
              </div>
            </DossierSection>

            {/* Section 3: Contact & Guardian */}
            <DossierSection title="Contact & Guardian">
              <div className="grid grid-cols-2 gap-3.5 bg-muted/20 border border-border/60 p-3.5 rounded-xl">
                <div className="col-span-2 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Email Address</p>
                    <a
                      href={`mailto:${selectedStudent.email}`}
                      className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {selectedStudent.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedStudent.email)}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs cursor-pointer flex items-center gap-1"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Student Phone</p>
                  <a
                    href={`tel:${selectedStudent.phone}`}
                    className="text-sm font-semibold text-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    +91 {selectedStudent.phone}
                  </a>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Guardian Name</p>
                  <p className="text-sm font-semibold text-foreground">{selectedStudent.guardianName}</p>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-0.5">Guardian Phone</p>
                  <a
                    href={`tel:${selectedStudent.guardianPhone}`}
                    className="text-sm font-semibold text-foreground hover:text-primary flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    +91 {selectedStudent.guardianPhone}
                  </a>
                </div>
              </div>
            </DossierSection>

            {/* Cross-Module Operational Deep-Links */}
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Cross-Module Administrative Records
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/master-admin/attendance"
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground block">Attendance</span>
                  <span className="text-[10px] text-muted-foreground">Full Session Log</span>
                </Link>

                <Link
                  href="/master-admin/fees"
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <CreditCard className="w-4 h-4 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground block">Fees & Dues</span>
                  <span className="text-[10px] text-muted-foreground">Account Ledger</span>
                </Link>

                <Link
                  href="/master-admin/library"
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground block">Library</span>
                  <span className="text-[10px] text-muted-foreground">Circulation Log</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Dossier>

      {/* ─── 6. Add Student Modal Dialog ─── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-student-modal-title"
        >
          {/* Backdrop with subtle blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="add-student-modal-title"
                      className="text-base font-bold text-foreground tracking-tight"
                    >
                      Institutional Student Registration
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Enroll and index a new student record into MUC academic register
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {addFormSuccess ? (
                <div className="py-14 px-6 text-center flex flex-col items-center justify-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      Student Successfully Enrolled
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Record created and indexed into the active MUC college register.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 mt-2">
                    <span>{newRegNo || "NEW REGISTRATION"}</span>
                    <span>•</span>
                    <span className="font-sans font-medium">
                      {newFirstName} {newLastName}
                    </span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleAddStudentSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  {/* Scrollable Form Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* ── Section 1: Academic Placement ── */}
                    <div className="rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-border/60">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                            1. Academic Placement
                          </span>
                        </div>
                        {modalClassPreview && (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                            {modalClassPreview}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Department */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Department <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={newDeptId}
                              onChange={(e) => {
                                const dId = e.target.value;
                                setNewDeptId(dId);
                                const matchCourse = courses.find(
                                  (c) => c.departmentId === dId
                                );
                                if (matchCourse) setNewCourseId(matchCourse.id);
                              }}
                              className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="">Select Department</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({d.code})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Course */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Course & Shift <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              required
                              value={newCourseId}
                              onChange={(e) => {
                                const cId = e.target.value;
                                setNewCourseId(cId);
                                const found = courses.find((c) => c.id === cId);
                                if (found && !newDeptId) {
                                  setNewDeptId(found.departmentId);
                                }
                              }}
                              className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="">Select Course</option>
                              {modalAvailableCourses.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.code} — {c.name} (
                                  {c.shift === "SHIFT_I"
                                    ? "Shift I · Aided"
                                    : "Shift II · SF"}
                                  )
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Semester */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Semester <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={newSemester}
                              onChange={(e) =>
                                setNewSemester(Number(e.target.value))
                              }
                              className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                            >
                              {[1, 2, 3, 4, 5, 6].map((sem) => (
                                <option key={sem} value={sem}>
                                  Semester {sem} (Year{" "}
                                  {sem <= 2 ? "1" : sem <= 4 ? "2" : "3"})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Registration Number */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Registration No. <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newRegNo}
                            onChange={(e) =>
                              setNewRegNo(e.target.value.toUpperCase())
                            }
                            placeholder="e.g. 25UCA010"
                            className="w-full h-9 px-3 text-xs font-mono uppercase bg-background border border-border/80 rounded-lg text-foreground placeholder:font-sans placeholder:normal-case placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Admission Number */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Admission No.
                          </label>
                          <input
                            type="text"
                            value={newAdmNo}
                            onChange={(e) => setNewAdmNo(e.target.value)}
                            placeholder="e.g. ADM-25-010"
                            className="w-full h-9 px-3 text-xs bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Section 2: Student Identity & Demographics ── */}
                    <div className="rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          2. Student Demographics
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* First Name */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                            placeholder="e.g. Tariq"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Last Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                            placeholder="e.g. Ahmed"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Date of Birth */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={newDob}
                            onChange={(e) => setNewDob(e.target.value)}
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          />
                        </div>

                        {/* Gender */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Gender
                          </label>
                          <div className="relative">
                            <select
                              value={newGender}
                              onChange={(e) => setNewGender(e.target.value)}
                              className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Blood Group */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Blood Group
                          </label>
                          <div className="relative">
                            <select
                              value={newBloodGroup}
                              onChange={(e) => setNewBloodGroup(e.target.value)}
                              className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                            >
                              {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-", "Unknown"].map((bg) => (
                                <option key={bg} value={bg}>
                                  {bg}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Section 3: Contact & Guardian ── */}
                    <div className="rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <div className="h-6 w-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          3. Contact & Guardian Records
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Student Email */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Student Email
                          </label>
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="student@muc.edu"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Student Phone */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Student Phone
                          </label>
                          <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="9876543210"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Guardian Name */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Parent / Guardian Name
                          </label>
                          <input
                            type="text"
                            value={newGuardianName}
                            onChange={(e) => setNewGuardianName(e.target.value)}
                            placeholder="e.g. Parent / Legal Guardian"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Guardian Phone */}
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Guardian Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={newGuardianPhone}
                            onChange={(e) => setNewGuardianPhone(e.target.value)}
                            placeholder="e.g. 9876543298"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="shrink-0 px-6 py-3.5 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Record auto-synced with active academic roster</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/80 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all cursor-pointer font-medium"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Register Student</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
