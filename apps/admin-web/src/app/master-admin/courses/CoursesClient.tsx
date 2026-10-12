"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Plus,
  Filter,
  Download,
  GraduationCap,
  Users,
  CheckCircle2,
  ChevronDown,
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Building2,
  Layers,
} from "lucide-react";
import {
  ResolvedCourse,
  CourseDirectoryMetrics,
  Department,
  Subject,
  ClassEntity,
} from "@/types/domain";
import { Dossier, DossierSection, DossierItem } from "@/components/shared/Dossier";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";

interface CoursesClientProps {
  initialCourses: ResolvedCourse[];
  departments: Department[];
  metrics: CourseDirectoryMetrics;
  subjects: Subject[];
  classes: ClassEntity[];
}

export function CoursesClient({
  initialCourses,
  departments,
  metrics: initialMetrics,
  subjects,
  classes,
}: CoursesClientProps) {
  // State — initialCourses comes SSR-enriched with subjectsCount/classesCount/studentCount.
  // router.refresh() re-runs SSR to get fresh enriched data after mutations.
  const router = useRouter();
  const [courses, setCourses] = useState<ResolvedCourse[]>(initialCourses);

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const addCourseMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/academic/courses', payload);
      return res.data;
    },
    onSuccess: () => {
      setAddFormSuccess(true);
      router.refresh();
      setTimeout(() => {
        setAddFormSuccess(false);
        setIsAddModalOpen(false);
        setNewCode("");
        setNewName("");
        setNewDuration(3);
        setNewShift("SHIFT_I");
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to add course: " + (err.response?.data?.error || err.message));
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/academic/courses/${id}`);
    },
    onSuccess: () => {
      router.refresh();
      setSelectedCourse(null);
    },
    onError: (err: any) => {
      alert("Failed to delete course: " + (err.response?.data?.error || err.message));
    }
  });

  const handleDeleteCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      deleteCourseMutation.mutate(id);
    }
  };
  const [selectedCourse, setSelectedCourse] = useState<ResolvedCourse | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Dropdown ref
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  // Add Course Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  const [newDegree, setNewDegree] = useState("UG");
  const [newShift, setNewShift] = useState<"SHIFT_I" | "SHIFT_II">("SHIFT_I");
  const [newDuration, setNewDuration] = useState(3);
  const [newRegulation, setNewRegulation] = useState("Reg-2024");
  const [addFormSuccess, setAddFormSuccess] = useState(false);

  // Outside click listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        deptDropdownRef.current &&
        !deptDropdownRef.current.contains(event.target as Node)
      ) {
        setDeptDropdownOpen(false);
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

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.departmentName.toLowerCase().includes(q);

      const matchesDept = selectedDept ? c.departmentId === selectedDept : true;
      const matchesShift = selectedShift ? c.shift === selectedShift : true;
      const matchesDegree = selectedDegree ? c.degree === selectedDegree : true;
      const matchesStatus = selectedStatus ? c.status === selectedStatus : true;

      return matchesSearch && matchesDept && matchesShift && matchesDegree && matchesStatus;
    });
  }, [courses, search, selectedDept, selectedShift, selectedDegree, selectedStatus]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedDept) ||
    Boolean(selectedShift) ||
    Boolean(selectedDegree) ||
    Boolean(selectedStatus);

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("");
    setSelectedShift("");
    setSelectedDegree("");
    setSelectedStatus("");
  };

  const selectedDeptObj = useMemo(
    () => departments.find((d) => d.id === selectedDept),
    [departments, selectedDept]
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Course Code",
      "Course Name",
      "Department",
      "Degree Level",
      "Regulation",
      "Duration (Years)",
      "Total Semesters",
      "Shift",
      "Shift Type",
      "Subjects Count",
      "Classes Count",
      "Enrolled Students",
      "Status",
    ];

    const rows = filteredCourses.map((c) => [
      `"${c.code}"`,
      `"${c.name}"`,
      `"${c.departmentName}"`,
      `"${c.degree}"`,
      `"${c.regulation}"`,
      c.durationYears,
      c.totalSemesters,
      `"${c.shiftLabel}"`,
      `"${c.shiftType}"`,
      c.subjectsCount,
      c.classesCount,
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
      `MUC_Courses_Programs_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newDeptId) return;

    addCourseMutation.mutate({
      code: newCode,
      name: newName,
      departmentId: newDeptId,
      // shiftId in API? UI provides newShift ("SHIFT_I" or "SHIFT_II").
      // But the API expects UUID for shiftId. Let's pass the string for now, assuming the backend can handle it, or we need to find shiftId.
      shiftId: newShift,
      degree: newDegree,
      durationYears: Number(newDuration),
      totalSemesters: Number(newDuration) * 2,
    });
  };

  // Subjects for selected course
  const courseSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    return subjects.filter((s) => s.courseId === selectedCourse.id);
  }, [selectedCourse, subjects]);

  // Classes for selected course
  const courseClasses = useMemo(() => {
    if (!selectedCourse) return [];
    return classes.filter((cl) => cl.courseId === selectedCourse.id);
  }, [selectedCourse, classes]);

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ─── 1. Institutional Actions in Navbar ─── */}
      <NavbarActions>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
          title="Export courses to CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          Export ({filteredCourses.length})
        </button>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Course
        </button>
      </NavbarActions>

      {/* ─── 2. KPI Metrics Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Programs */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Total Programs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {courses.length}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                100% Active
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Degree Breakdown */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Degree Levels
            </span>
            <div className="flex items-baseline gap-1.5 text-xs font-semibold">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                UG: {courses.filter((c) => c.degree === "UG").length}
              </span>
              <span className="text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                PG: {courses.filter((c) => c.degree === "PG").length}
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        {/* Shift I Aided vs Shift II SF */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Shift Structure
            </span>
            <div className="flex items-baseline gap-1.5 text-xs font-semibold">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Aided: {courses.filter((c) => c.shift === "SHIFT_I").length}
              </span>
              <span className="text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                SF: {courses.filter((c) => c.shift === "SHIFT_II").length}
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Total Enrolled Students */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Total Enrolled
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {courses.reduce((acc, c) => acc + c.studentCount, 0)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Students
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
              placeholder="Search course code, full degree name, or department..."
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

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Popover */}
            <div className="relative" ref={deptDropdownRef}>
              <button
                type="button"
                onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-medium transition-all cursor-pointer",
                  selectedDept
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {selectedDeptObj ? selectedDeptObj.name : "All Departments"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-muted-foreground" />
              </button>

              {deptDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-card border border-border rounded-xl shadow-xl z-30 p-2 text-xs">
                  <div className="flex items-center justify-between px-2 py-1 mb-1 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                    <span>Department Filter</span>
                    {selectedDept && (
                      <button
                        type="button"
                        onClick={() => setSelectedDept("")}
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
                        setSelectedDept("");
                        setDeptDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer",
                        !selectedDept
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span>All Departments</span>
                      <span className="text-[10px] opacity-75">{courses.length}</span>
                    </button>
                    {departments.map((d) => {
                      const count = courses.filter((c) => c.departmentId === d.id).length;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setSelectedDept(d.id);
                            setDeptDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer",
                            selectedDept === d.id
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span className="truncate pr-2">{d.name}</span>
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

            {/* Degree Filter */}
            <div className="relative">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedDegree
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Degrees</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
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
            {selectedDeptObj && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Dept: {selectedDeptObj.name}
                <button
                  type="button"
                  onClick={() => setSelectedDept("")}
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
            {selectedDegree && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Degree: {selectedDegree}
                <button
                  type="button"
                  onClick={() => setSelectedDegree("")}
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

      {/* ─── 4. Courses Data Workspace ─── */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border font-semibold">
              <tr>
                <th className="px-5 py-3.5">Degree Program</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Level & Duration</th>
                <th className="px-4 py-3.5">Shift & Financing</th>
                <th className="px-4 py-3.5">Curriculum / Cohort</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCourses.map((course) => (
                <tr
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  {/* Course Code & Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform border border-primary/20">
                        {course.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {course.name}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Code: {course.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-foreground">
                      {course.departmentName}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {course.departmentCode}
                    </span>
                  </td>

                  {/* Degree & Duration */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">
                        {course.degree}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {course.durationYears} Years ({course.totalSemesters} Sem)
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {course.regulation}
                    </div>
                  </td>

                  {/* Shift (MUC Rule 2 & 21) */}
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border",
                        course.shift === "SHIFT_I"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {course.shiftLabel}
                    </span>
                  </td>

                  {/* Curriculum & Students */}
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">
                      <span className="font-bold">{course.subjectsCount}</span> Subjects
                      <span className="text-muted-foreground mx-1">•</span>
                      <span className="font-bold">{course.studentCount}</span> Students
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {course.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCourse(course);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted/60 hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer"
                    >
                      <span>Dossier</span>
                      <ArrowRight className="w-3 h-3" />
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
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                    {course.code.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-xs">
                      {course.name}
                    </h4>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {course.code} • {course.departmentName}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {course.status}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {course.degree} · {course.durationYears} Years
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{course.shiftLabel}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  {course.subjectsCount} Subjects • {course.studentCount} Students
                </span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  View Dossier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-base font-bold text-foreground">
              No programs found matching your criteria
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query, shift selection, or clearing active filters.
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

      {/* ─── 5. Course Dossier Drawer ─── */}
      <Dossier
        isOpen={Boolean(selectedCourse)}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.name || "Program Dossier"}
        subtitle={`${selectedCourse?.code} • ${selectedCourse?.shiftLabel}`}
      >
        {selectedCourse && (
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-base font-bold">
                  {selectedCourse.code.slice(0, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedCourse.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedCourse.departmentName} ({selectedCourse.departmentCode})
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedCourse.status}
              </span>
            </div>

            {/* Academic Structure */}
            <DossierSection title="Academic Structure & Shift">
              <DossierItem label="Degree Level" value={selectedCourse.degree} />
              <DossierItem label="Authoritative Shift" value={selectedCourse.shiftLabel} />
              <DossierItem label="Financing Category" value={selectedCourse.shiftType} />
              <DossierItem
                label="Duration & Semesters"
                value={`${selectedCourse.durationYears} Academic Years (${selectedCourse.totalSemesters} Semesters)`}
              />
              <DossierItem label="Curriculum Regulation" value={selectedCourse.regulation} />
              <DossierItem label="Enrolled Students" value={`${selectedCourse.studentCount} Active Students`} />
            </DossierSection>

            {/* Curriculum Subjects */}
            <DossierSection title="Curriculum Subjects Handled">
              {courseSubjects.length > 0 ? (
                <div className="space-y-2">
                  {courseSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-lg border border-border bg-card space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {sub.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {sub.credits} Credits · {sub.type}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {sub.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Semester {sub.semesterNumber}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No subjects currently indexed for this program.
                </p>
              )}
            </DossierSection>

            {/* Authoritative Classes (MUC Rule 4: I [Course], II [Course], III [Course]) */}
            <DossierSection title="Academic Classes">
              {courseClasses.length > 0 ? (
                <div className="space-y-2">
                  {courseClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-primary" />
                          <span>{cls.code}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Semester {cls.semesterNumber}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Active Class
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No academic classes created yet.
                </p>
              )}
            </DossierSection>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Program Navigation
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/master-admin/subjects"
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground block">Curriculum</span>
                  <span className="text-[10px] text-muted-foreground">View Subjects</span>
                </Link>

                <Link
                  href="/master-admin/classes"
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground block">Classes</span>
                  <span className="text-[10px] text-muted-foreground">Academic Roster</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Dossier>

      {/* ─── 6. Add Course Modal ─── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-course-modal-title"
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
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="add-course-modal-title"
                      className="text-base font-bold text-foreground tracking-tight"
                    >
                      Establish Degree Program
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Index a new academic course, degree, and shift assignment
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
                      Degree Program Successfully Established
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Course record added to institutional curriculum register.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 mt-2">
                    <span>{newCode}</span>
                    <span>•</span>
                    <span className="font-sans font-medium">{newName}</span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleAddCourseSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Program Identity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Course Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          placeholder="e.g. B.Sc(CS) or BCA"
                          className="w-full h-9 px-3 text-xs font-mono bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Degree Level <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newDegree}
                            onChange={(e) => setNewDegree(e.target.value)}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="UG">Undergraduate (UG)</option>
                            <option value="PG">Postgraduate (PG)</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Full Course Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Bachelor of Computer Applications"
                        className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Department & Shift */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Affiliated Department <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            required
                            value={newDeptId}
                            onChange={(e) => setNewDeptId(e.target.value)}
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

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Operating Shift & Funding <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newShift}
                            onChange={(e) => setNewShift(e.target.value as "SHIFT_I" | "SHIFT_II")}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="SHIFT_I">Shift I (Aided • 8:00 AM - 12:55 PM)</option>
                            <option value="SHIFT_II">Shift II (Self-Financing • 1:00 PM - 5:55 PM)</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Duration & Regulation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Duration (Years)
                        </label>
                        <div className="relative">
                          <select
                            value={newDuration}
                            onChange={(e) => setNewDuration(Number(e.target.value))}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value={3}>3 Years (6 Semesters - UG Standard)</option>
                            <option value={2}>2 Years (4 Semesters - PG Standard)</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Curriculum Regulation
                        </label>
                        <input
                          type="text"
                          value={newRegulation}
                          onChange={(e) => setNewRegulation(e.target.value)}
                          placeholder="e.g. Reg-2024"
                          className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 px-6 py-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      MUC Institutional Program
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
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Establish Program</span>
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
