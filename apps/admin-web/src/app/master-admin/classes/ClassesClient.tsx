"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Plus,
  Filter,
  Download,
  Users,
  CheckCircle2,
  ChevronDown,
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  Building2,
  BookOpen,
  Award,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import {
  ResolvedClass,
  ClassDirectoryMetrics,
  Course,
  Department,
  AcademicYear,
  Faculty,
  Student,
} from "@/types/domain";
import { Dossier, DossierSection, DossierItem } from "@/components/shared/Dossier";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";

interface ClassesClientProps {
  initialClasses: ResolvedClass[];
  courses: Course[];
  departments: Department[];
  academicYears: AcademicYear[];
  metrics: ClassDirectoryMetrics;
  facultyList: Faculty[];
  students: Student[];
}

export function ClassesClient({
  initialClasses,
  courses,
  departments,
  academicYears,
  metrics: initialMetrics,
  facultyList,
  students,
}: ClassesClientProps) {
  // State
  // State — initialClasses comes SSR-enriched with classYearLabel/shift/advisorName.
  // router.refresh() re-runs SSR to get fresh enriched data after mutations.
  const router = useRouter();
  const [classes, setClasses] = useState<ResolvedClass[]>(initialClasses);
  const [selectedClass, setSelectedClass] = useState<ResolvedClass | null>(null);

  useEffect(() => {
    setClasses(initialClasses);
  }, [initialClasses]);

  const addClassMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/academic/classes', payload);
      return res.data;
    },
    onSuccess: () => {
      setAddFormSuccess(true);
      router.refresh();
      setTimeout(() => {
        setAddFormSuccess(false);
        setIsAddModalOpen(false);
        setNewCourseId("");
        setNewAdvisorId("");
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to add class: " + (err.response?.data?.error || err.message));
    }
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.put(`/academic/classes/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
      setIsEditModalOpen(false);
      setEditClassId(null);
    },
    onError: (err: any) => {
      alert("Failed to update class: " + (err.response?.data?.error || err.message));
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/academic/classes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
      setSelectedClass(null);
    },
    onError: (err: any) => {
      alert("Failed to delete class: " + (err.response?.data?.error || err.message));
    }
  });

  const handleDeleteClass = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      deleteClassMutation.mutate(id);
    }
  };

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedAdvisorStatus, setSelectedAdvisorStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Course dropdown popover
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Add Class Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourseId, setNewCourseId] = useState("");
  const [newSemester, setNewSemester] = useState(1);
  const [newAcademicYearId, setNewAcademicYearId] = useState(
    academicYears.find((ay) => ay.isActive)?.id || academicYears[0]?.id || ""
  );
  const [newAdvisorId, setNewAdvisorId] = useState("");
  const [addFormSuccess, setAddFormSuccess] = useState(false);

  // Edit Class Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClassId, setEditClassId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");

  // Outside click listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target as Node)
      ) {
        setCourseDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard dismiss
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);

  // Derived Cohort Preview for Modal (MUC Rule 4)
  const modalSelectedCourse = useMemo(
    () => courses.find((c) => c.id === newCourseId),
    [courses, newCourseId]
  );

  const modalClassPreview = useMemo(() => {
    if (!modalSelectedCourse) return null;
    let roman = "I";
    if (newSemester >= 5) roman = "III";
    else if (newSemester >= 3) roman = "II";
    const shiftStr =
      modalSelectedCourse.shift === "SHIFT_I"
        ? "Shift I (Aided)"
        : "Shift II (Self-Financing)";
    return `${roman} ${modalSelectedCourse.code} · Sem ${newSemester} · ${shiftStr}`;
  }, [modalSelectedCourse, newSemester]);

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cls.classYearLabel.toLowerCase().includes(q) ||
        cls.courseName.toLowerCase().includes(q) ||
        cls.courseCode.toLowerCase().includes(q) ||
        (cls.advisorName && cls.advisorName.toLowerCase().includes(q)) ||
        cls.departmentName.toLowerCase().includes(q);

      const matchesCourse = selectedCourse ? cls.courseId === selectedCourse : true;
      const matchesShift = selectedShift ? cls.shift === selectedShift : true;

      let matchesYear = true;
      if (selectedYear === "1") matchesYear = cls.semesterNumber <= 2;
      else if (selectedYear === "2")
        matchesYear = cls.semesterNumber === 3 || cls.semesterNumber === 4;
      else if (selectedYear === "3") matchesYear = cls.semesterNumber >= 5;

      let matchesAdvisor = true;
      if (selectedAdvisorStatus === "ASSIGNED") matchesAdvisor = Boolean(cls.advisorId);
      else if (selectedAdvisorStatus === "PENDING") matchesAdvisor = !cls.advisorId;

      const matchesStatus = selectedStatus ? cls.status === selectedStatus : true;

      return matchesSearch && matchesCourse && matchesShift && matchesYear && matchesAdvisor && matchesStatus;
    });
  }, [
    classes,
    search,
    selectedCourse,
    selectedShift,
    selectedYear,
    selectedAdvisorStatus,
    selectedStatus,
  ]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCourse) ||
    Boolean(selectedShift) ||
    Boolean(selectedYear) ||
    Boolean(selectedAdvisorStatus) ||
    Boolean(selectedStatus);

  const resetFilters = () => {
    setSearch("");
    setSelectedCourse("");
    setSelectedShift("");
    setSelectedYear("");
    setSelectedAdvisorStatus("");
    setSelectedStatus("");
  };

  const selectedCourseObj = useMemo(
    () => courses.find((c) => c.id === selectedCourse),
    [courses, selectedCourse]
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Class / Year",
      "Course Code",
      "Course Name",
      "Department",
      "Shift",
      "Shift Type",
      "Academic Year",
      "Semester",
      "Class Advisor",
      "Advisor ID",
      "Enrolled Students",
      "Status",
    ];

    const rows = filteredClasses.map((c) => [
      `"${c.classYearLabel}"`,
      `"${c.courseCode}"`,
      `"${c.courseName}"`,
      `"${c.departmentName}"`,
      `"${c.shiftLabel}"`,
      `"${c.shiftType}"`,
      `"${c.academicYearCode}"`,
      c.semesterNumber,
      `"${c.advisorName || "Unassigned"}"`,
      `"${c.advisorEmployeeId || "N/A"}"`,
      c.studentCount,
      `"${c.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MUC_Academic_Classes_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Class Submit (MUC Rule 4)
  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseId || !newAcademicYearId) return;

    const course = courses.find((c) => c.id === newCourseId);
    let yearNum = 1;
    if (newSemester >= 5) yearNum = 3;
    else if (newSemester >= 3) yearNum = 2;

    let yearRoman = "I";
    if (newSemester >= 5) yearRoman = "III";
    else if (newSemester >= 3) yearRoman = "II";

    const payload = {
      academicYearId: newAcademicYearId,
      programId: newCourseId,
      yearOfStudy: yearNum,
      code: `${course?.code || "Class"}-${yearRoman}`
    };

    // Note: The advisorId needs to be assigned either through a secondary relation
    // or by expanding the Class creation endpoint if it supports `advisorId` natively.
    // For now, we pass standard required fields for `AcademicClass` creation.

    addClassMutation.mutate(payload);
  };

  // Class Roster Students
  const classRoster = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(
      (s) => s.academicClassId === selectedClass.id
    );
  }, [selectedClass, students]);

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ─── 1. Institutional Actions in Navbar ─── */}
      <NavbarActions>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
          title="Export academic classes to CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          Export ({filteredClasses.length})
        </button>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Class
        </button>
      </NavbarActions>

      {/* ─── 2. KPI Metrics Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Academic Classes */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Academic Cohorts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {classes.length}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                AY {initialMetrics.activeAcademicYear}
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        {/* Shift Distribution */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Shift Cohorts
            </span>
            <div className="flex items-baseline gap-1.5 text-xs font-semibold">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Shift I: {classes.filter((c) => c.shift === "SHIFT_I").length}
              </span>
              <span className="text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                Shift II: {classes.filter((c) => c.shift === "SHIFT_II").length}
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Appointed Class Advisors */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Class Advisors
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {classes.filter((c) => Boolean(c.advisorId)).length}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Of {classes.length} Assigned
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Total Students Enrolled */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Enrolled Students
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {classes.reduce((acc, c) => acc + c.studentCount, 0)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Active Cohort
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ─── 3. Search & Filter Bar ─── */}
      <div className="flex flex-col gap-2.5 bg-card border border-border p-3 rounded-2xl shadow-2xs">
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by class (e.g. I BCA), program name, or class advisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2 bg-background border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Filter */}
            <div className="relative" ref={courseDropdownRef}>
              <button
                type="button"
                onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-medium transition-all cursor-pointer",
                  selectedCourse
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {selectedCourseObj ? selectedCourseObj.code : "All Programs"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-muted-foreground" />
              </button>

              {courseDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl z-30 p-2 text-xs">
                  <div className="flex items-center justify-between px-2 py-1 mb-1 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <span>Program Filter</span>
                    {selectedCourse && (
                      <button
                        type="button"
                        onClick={() => setSelectedCourse("")}
                        className="text-primary hover:underline lowercase font-normal"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourse("");
                        setCourseDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer",
                        !selectedCourse
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span>All Programs</span>
                      <span className="text-[10px] opacity-75">{classes.length}</span>
                    </button>
                    {courses.map((c) => {
                      const count = classes.filter((cl) => cl.courseId === c.id).length;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCourse(c.id);
                            setCourseDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer",
                            selectedCourse === c.id
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span className="truncate pr-2">{c.name} ({c.code})</span>
                          <span className="text-[10px] opacity-75 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shift Filter */}
            <div className="relative">
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedShift
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Shifts</option>
                <option value="SHIFT_I">Shift I (Aided)</option>
                <option value="SHIFT_II">Shift II (Self-Financing)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {/* Year Filter */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedYear
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Academic Years</option>
                <option value="1">I Year (Sem 1-2)</option>
                <option value="2">II Year (Sem 3-4)</option>
                <option value="3">III Year (Sem 5-6)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {/* Advisor Status */}
            <div className="relative">
              <select
                value={selectedAdvisorStatus}
                onChange={(e) => setSelectedAdvisorStatus(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedAdvisorStatus
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Advisors</option>
                <option value="ASSIGNED">Advisor Assigned</option>
                <option value="PENDING">Advisor Pending</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                title="Reset all active filters"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-border/60 text-xs">
            <span className="text-[11px] text-muted-foreground font-medium">
              Active Filters:
            </span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground text-xs">
                Query: &quot;{search}&quot;
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="hover:text-primary cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCourseObj && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Program: {selectedCourseObj.code}
                <button
                  type="button"
                  onClick={() => setSelectedCourse("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedShift && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Shift: {selectedShift === "SHIFT_I" ? "Shift I (Aided)" : "Shift II (SF)"}
                <button
                  type="button"
                  onClick={() => setSelectedShift("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedYear && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Year: {selectedYear === "1" ? "I Year" : selectedYear === "2" ? "II Year" : "III Year"}
                <button
                  type="button"
                  onClick={() => setSelectedYear("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-primary hover:underline font-semibold ml-1 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ─── 4. Classes Data Workspace ─── */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border font-semibold">
              <tr>
                <th className="px-5 py-3.5">Academic Class</th>
                <th className="px-4 py-3.5">Program & Department</th>
                <th className="px-4 py-3.5">Shift & Financing</th>
                <th className="px-4 py-3.5">Academic Session</th>
                <th className="px-4 py-3.5">Class Advisor</th>
                <th className="px-4 py-3.5">Enrolled Roster</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClasses.map((cls) => (
                <tr
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  {/* Academic Class (MUC Rule 4: I BCA, etc.) */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform border border-primary/20">
                        {cls.classYearLabel.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                          {cls.classYearLabel}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {cls.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Program & Department */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground">
                      {cls.courseName}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {cls.departmentName}
                    </span>
                  </td>

                  {/* Shift (MUC Rule 4: Shift applies to class) */}
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border",
                        cls.shift === "SHIFT_I"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {cls.shiftLabel}
                    </span>
                  </td>

                  {/* Academic Session */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground">
                      {cls.semesterLabel}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      AY {cls.academicYearCode}
                    </span>
                  </td>

                  {/* Class Advisor */}
                  <td className="px-4 py-3.5">
                    {cls.advisorId ? (
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Award className="w-3 h-3 text-primary" />
                          <span>{cls.advisorName}</span>
                        </div>
                        {cls.advisorEmployeeId && (
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {cls.advisorEmployeeId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic bg-muted/40 px-2 py-0.5 rounded border border-border/50">
                        Advisor Pending
                      </span>
                    )}
                  </td>

                  {/* Enrolled Students */}
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-foreground">
                      {cls.studentCount} Students
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {cls.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClass(cls.id, e)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClass(cls);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted/60 hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
                      >
                        <span>Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditClassId(cls.id);
                          setEditCode(cls.courseCode);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-muted/60 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/40 dark:hover:text-amber-400 text-muted-foreground transition-all cursor-pointer"
                        title="Edit Class"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
                            deleteClassMutation.mutate(cls.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-muted/60 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/40 dark:hover:text-rose-400 text-muted-foreground transition-all cursor-pointer"
                        title="Delete Class"
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

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                    {cls.classYearLabel.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">
                      {cls.classYearLabel}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">
                      {cls.courseName}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {cls.status}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {cls.shiftLabel}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{cls.semesterLabel}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Advisor: {cls.advisorName || "Pending"} • {cls.studentCount} Students
                </span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  View Dossier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClasses.length === 0 && (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-base font-bold text-foreground">
              No academic classes found matching your criteria
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query, course selection, or clearing active filters.
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
      </div>

      {/* ─── 5. Class Dossier Drawer ─── */}
      <Dossier
        isOpen={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        title={selectedClass?.classYearLabel || "Academic Class Dossier"}
        subtitle={`${selectedClass?.courseName} • AY ${selectedClass?.academicYearCode}`}
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-base font-bold">
                  {selectedClass.classYearLabel.slice(0, 3)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    {selectedClass.classYearLabel}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedClass.courseName} ({selectedClass.departmentName})
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedClass.status}
              </span>
            </div>

            {/* Academic Classification */}
            <DossierSection title="Cohort Classification">
              <DossierItem label="Class / Year Label" value={selectedClass.classYearLabel} />
              <DossierItem label="Academic Year" value={`AY ${selectedClass.academicYearCode}`} />
              <DossierItem label="Current Term" value={selectedClass.semesterLabel} />
              <DossierItem label="Operating Shift" value={selectedClass.shiftLabel} />
              <DossierItem label="Financing Category" value={selectedClass.shiftType} />
              <DossierItem label="Student Population" value={`${selectedClass.studentCount} Students Enrolled`} />
            </DossierSection>

            {/* Class Advisor */}
            <DossierSection title="Appointed Class Advisor">
              <DossierItem label="Advisor Name" value={selectedClass.advisorName || "Pending Allocation"} />
              {selectedClass.advisorEmployeeId && (
                <DossierItem label="Employee ID" value={selectedClass.advisorEmployeeId} />
              )}
            </DossierSection>

            {/* Student Roster Preview */}
            <DossierSection title="Enrolled Student Roster">
              {classRoster.length > 0 ? (
                <div className="space-y-2">
                  {classRoster.map((s) => (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-foreground">
                          {s.firstName} {s.lastName}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {s.registrationNumber} • {s.admissionNumber}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No students currently mapped directly to this class cohort.
                </p>
              )}
            </DossierSection>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Class Operational Navigation
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/master-admin/students"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <Users className="w-4 h-4 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Students</span>
                </Link>

                <Link
                  href="/master-admin/attendance"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <Clock className="w-4 h-4 text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Attendance</span>
                </Link>

                <Link
                  href="/master-admin/timetable"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Timetable</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Dossier>

      {/* ─── 6. Add Class Modal (MUC Rule 4) ─── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-class-modal-title"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="add-class-modal-title"
                      className="text-base font-bold text-foreground tracking-tight"
                    >
                      Establish Academic Class Cohort
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Index a new instructional year group according to MUC class standards
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
                      Class Cohort Successfully Established
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Academic cohort indexed into the MUC institutional register.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 mt-2">
                    <span>{modalClassPreview}</span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleAddClassSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Live Preview Banner */}
                    {modalClassPreview && (
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold text-foreground">
                            Standard Class Identifier:
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {modalClassPreview}
                        </span>
                      </div>
                    )}

                    {/* Program Selection */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Degree Program <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={newCourseId}
                          onChange={(e) => setNewCourseId(e.target.value)}
                          className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">Select Degree Course</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code} — {c.name} ({c.shift === "SHIFT_I" ? "Shift I · Aided" : "Shift II · SF"})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Semester & Academic Year */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Current Semester <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newSemester}
                            onChange={(e) => setNewSemester(Number(e.target.value))}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value={1}>Semester 1 (Year I)</option>
                            <option value={2}>Semester 2 (Year I)</option>
                            <option value={3}>Semester 3 (Year II)</option>
                            <option value={4}>Semester 4 (Year II)</option>
                            <option value={5}>Semester 5 (Year III)</option>
                            <option value={6}>Semester 6 (Year III)</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Academic Year <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newAcademicYearId}
                            onChange={(e) => setNewAcademicYearId(e.target.value)}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            {academicYears.map((ay) => (
                              <option key={ay.id} value={ay.id}>
                                {ay.code} {ay.isActive ? "(Current Active Session)" : ""}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Class Advisor Allocation */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Appoint Class Advisor
                      </label>
                      <div className="relative">
                        <select
                          value={newAdvisorId}
                          onChange={(e) => setNewAdvisorId(e.target.value)}
                          className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">Advisor Pending / Allocate Later</option>
                          {facultyList.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.firstName} {f.lastName} ({f.employeeId} • {f.designation})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 px-6 py-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Standard MUC Academic Cohort
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/80 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xs transition-all cursor-pointer font-medium"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Establish Class</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. Edit Class Modal ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl flex flex-col text-card-foreground animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground tracking-tight">Edit Academic Class</h3>
                    <p className="text-xs text-muted-foreground">Modify class identity information</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editClassId) {
                    updateClassMutation.mutate({
                      id: editClassId,
                      payload: { code: editCode },
                    });
                  }
                }}
                className="flex flex-col flex-1"
              >
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Class Code / Label <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editCode}
                      onChange={(e) => setEditCode(e.target.value)}
                      placeholder="e.g., BCA Year I"
                      className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateClassMutation.isPending}
                    className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{updateClassMutation.isPending ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
