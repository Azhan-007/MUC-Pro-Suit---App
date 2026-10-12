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
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  FileText,
  Clock,
  Trash2,
} from "lucide-react";
import {
  ResolvedSubject,
  SubjectDirectoryMetrics,
  Course,
  Department,
  Faculty,
} from "@/types/domain";
import { Dossier, DossierSection, DossierItem } from "@/components/shared/Dossier";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";

interface SubjectsClientProps {
  initialSubjects: ResolvedSubject[];
  courses: Course[];
  departments: Department[];
  facultyList: Faculty[];
  metrics: SubjectDirectoryMetrics;
}

export function SubjectsClient({
  initialSubjects,
  courses,
  departments,
  facultyList,
  metrics: initialMetrics,
}: SubjectsClientProps) {
  // State
  // State — initialSubjects comes SSR-enriched with courseCode/deptName/semesterLabel.
  // router.refresh() re-runs SSR to get fresh enriched data after mutations.
  const router = useRouter();
  const [subjects, setSubjects] = useState<ResolvedSubject[]>(initialSubjects);
  const [selectedSubject, setSelectedSubject] = useState<ResolvedSubject | null>(null);

  // Keep in sync after SSR refresh
  useEffect(() => {
    setSubjects(initialSubjects);
  }, [initialSubjects]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Course dropdown ref
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef<HTMLDivElement>(null);

  // Add Subject Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newSemester, setNewSemester] = useState(1);
  const [newCredits, setNewCredits] = useState(4);
  const [newType, setNewType] = useState<"CORE" | "ELECTIVE" | "LAB" | "PROJECT">("CORE");
  const [newFacultyId, setNewFacultyId] = useState("");
  const [addFormSuccess, setAddFormSuccess] = useState(false);

  // Outside click listener
  const addSubjectMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/academic/subjects', payload);
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
        setNewCourseId("");
        setNewFacultyId("");
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to add subject: " + (err.response?.data?.error || err.message));
    }
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/academic/subjects/${id}`);
    },
    onSuccess: () => {
      router.refresh();
      setSelectedSubject(null);
    },
    onError: (err: any) => {
      alert("Failed to delete subject: " + (err.response?.data?.error || err.message));
    }
  });

  const handleDeleteSubject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this subject? This action cannot be undone.")) {
      deleteSubjectMutation.mutate(id);
    }
  };

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

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.courseCode.toLowerCase().includes(q) ||
        s.courseName.toLowerCase().includes(q) ||
        s.assignedFaculty.some((f) => f.name.toLowerCase().includes(q));

      const matchesCourse = selectedCourse ? s.courseId === selectedCourse : true;
      const matchesSem = selectedSemester ? s.semesterNumber === Number(selectedSemester) : true;
      const matchesType = selectedType ? s.type === selectedType : true;
      const matchesFac = selectedFacultyFilter
        ? s.facultyIds.includes(selectedFacultyFilter)
        : true;
      const matchesStatus = selectedStatus ? s.status === selectedStatus : true;

      return matchesSearch && matchesCourse && matchesSem && matchesType && matchesFac && matchesStatus;
    });
  }, [
    subjects,
    search,
    selectedCourse,
    selectedSemester,
    selectedType,
    selectedFacultyFilter,
    selectedStatus,
  ]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCourse) ||
    Boolean(selectedSemester) ||
    Boolean(selectedType) ||
    Boolean(selectedFacultyFilter) ||
    Boolean(selectedStatus);

  const resetFilters = () => {
    setSearch("");
    setSelectedCourse("");
    setSelectedSemester("");
    setSelectedType("");
    setSelectedFacultyFilter("");
    setSelectedStatus("");
  };

  const selectedCourseObj = useMemo(
    () => courses.find((c) => c.id === selectedCourse),
    [courses, selectedCourse]
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Subject Code",
      "Subject Name",
      "Course Code",
      "Course Name",
      "Department",
      "Semester",
      "Credits",
      "Subject Type",
      "Operating Shift",
      "Assigned Faculty",
      "Status",
    ];

    const rows = filteredSubjects.map((s) => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.courseCode}"`,
      `"${s.courseName}"`,
      `"${s.departmentName}"`,
      s.semesterNumber,
      s.credits,
      `"${s.type}"`,
      `"${s.shiftLabel}"`,
      `"${s.assignedFaculty.map((f) => f.name).join("; ") || "Not Assigned"}"`,
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
      `MUC_Curriculum_Subjects_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Subject Submit
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newCourseId) return;

    const course = courses.find((c) => c.id === newCourseId);
    const dept = course ? departments.find((d) => d.id === course.departmentId) : undefined;
    const shift = course?.shift || "SHIFT_I";

    addSubjectMutation.mutate({
      code: newCode.toUpperCase(),
      name: newName,
      courseId: newCourseId,
      semesterNumber: Number(newSemester),
      credits: Number(newCredits),
      type: newType,
      shift,
      facultyId: newFacultyId ? newFacultyId : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ─── 1. Institutional Actions in Navbar ─── */}
      <NavbarActions>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
          title="Export curriculum syllabus to CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          Export ({filteredSubjects.length})
        </button>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Subject
        </button>
      </NavbarActions>

      {/* ─── 2. KPI Metrics Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Subjects */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Curriculum Subjects
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {subjects.length}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Active Syllabus
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Core Papers */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Core Coursework
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {subjects.filter((s) => s.type === "CORE").length}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                Core Modules
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Faculty Allocations */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Faculty Coverage
            </span>
            <div className="flex items-baseline gap-1.5 text-xs font-semibold">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Assigned: {subjects.filter((s) => s.facultyIds.length > 0).length}
              </span>
              {subjects.filter((s) => s.facultyIds.length === 0).length > 0 && (
                <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Unassigned: {subjects.filter((s) => s.facultyIds.length === 0).length}
                </span>
              )}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Total Academic Credits */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Curriculum Credits
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {subjects.reduce((acc, s) => acc + s.credits, 0)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Total Credits
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
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
              placeholder="Search syllabus by code, subject name, course, or assigned instructor..."
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
            {/* Course Popover */}
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
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
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
                      <span className="text-[10px] opacity-75">{subjects.length}</span>
                    </button>
                    {courses.map((c) => {
                      const count = subjects.filter((s) => s.courseId === c.id).length;
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

            {/* Semester Filter */}
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedSemester
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {/* Subject Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedType
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Types</option>
                <option value="CORE">Core Subject</option>
                <option value="ELECTIVE">Elective</option>
                <option value="LAB">Practical Lab</option>
                <option value="PROJECT">Project Work</option>
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
            {selectedSemester && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Sem: {selectedSemester}
                <button
                  type="button"
                  onClick={() => setSelectedSemester("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Type: {selectedType}
                <button
                  type="button"
                  onClick={() => setSelectedType("")}
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

      {/* ─── 4. Subjects Data Workspace ─── */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[1050px]">
            <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border font-bold">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Subject & Code</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Program & Dept</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Semester & Shift</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Credits & Type</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Assigned Faculty</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredSubjects.map((subject) => (
                <tr
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group h-16"
                >
                  {/* Subject Code & Name */}
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform border border-primary/20">
                        {subject.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors text-xs whitespace-nowrap">
                          {subject.name}
                        </div>
                        <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted/70 px-1.5 py-0.2 rounded border border-border/60 block whitespace-nowrap">
                          {subject.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Program & Department */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <div className="font-semibold text-foreground text-xs whitespace-nowrap">
                      {subject.courseCode} — {subject.courseName}
                    </div>
                    <span className="text-[10px] text-muted-foreground block whitespace-nowrap">
                      {subject.departmentName}
                    </span>
                  </td>

                  {/* Semester & Shift */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <div className="font-semibold text-foreground text-xs whitespace-nowrap">
                      {subject.semesterLabel}
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10.5px] font-semibold mt-0.5 whitespace-nowrap",
                        subject.shift === "SHIFT_I"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-sky-700 dark:text-sky-400"
                      )}
                    >
                      {subject.shiftLabel}
                    </span>
                  </td>

                  {/* Credits & Type */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-bold text-foreground text-xs">
                        {subject.credits} Credits
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap",
                          subject.type === "CORE"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                        )}
                      >
                        {subject.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 whitespace-nowrap">
                      Academic Curriculum
                    </span>
                  </td>

                  {/* Assigned Faculty */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    {subject.assignedFaculty.length > 0 ? (
                      <div className="space-y-0.5">
                        {subject.assignedFaculty.map((fac) => (
                          <div
                            key={fac.id}
                            className="font-medium text-foreground flex items-center gap-1.5 text-xs whitespace-nowrap"
                          >
                            <Users className="w-3 h-3 text-primary shrink-0" />
                            <span>{fac.name}</span>
                          </div>
                        ))}
                        <span className="text-[10px] text-muted-foreground block whitespace-nowrap">
                          Allocated Faculty
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap inline-flex items-center">
                          Unassigned
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 block whitespace-nowrap">
                          Allocation Needed
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      {subject.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 block mt-0.5 whitespace-nowrap">
                      Active Curriculum
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSubject(subject.id, e)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubject(subject);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer whitespace-nowrap"
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
          {filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                    {subject.code.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-xs">
                      {subject.name}
                    </h4>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {subject.code} • {subject.courseCode}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {subject.status}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {subject.credits} Credits · {subject.type}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{subject.semesterLabel}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                  Faculty: {subject.assignedFaculty.map((f) => f.name).join(", ") || "Not Assigned"}
                </span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  View Dossier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubjects.length === 0 && (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-base font-bold text-foreground">
              No curriculum subjects found matching your criteria
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query, semester, or clearing active filters.
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

      {/* ─── 5. Subject Dossier Drawer ─── */}
      <Dossier
        isOpen={Boolean(selectedSubject)}
        onClose={() => setSelectedSubject(null)}
        title={selectedSubject?.name || "Subject Dossier"}
        subtitle={`${selectedSubject?.code} • ${selectedSubject?.courseCode}`}
      >
        {selectedSubject && (
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-base font-bold">
                  {selectedSubject.code.slice(0, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedSubject.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedSubject.courseName} ({selectedSubject.courseCode})
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedSubject.status}
              </span>
            </div>

            {/* Academic Classification */}
            <DossierSection title="Curriculum Metadata">
              <DossierItem label="Subject Code" value={selectedSubject.code} />
              <DossierItem label="Academic Semester" value={selectedSubject.semesterLabel} />
              <DossierItem label="Paper Classification" value={selectedSubject.type} />
              <DossierItem label="Instructional Credits" value={`${selectedSubject.credits} Credits`} />
              <DossierItem label="Department" value={selectedSubject.departmentName} />
              <DossierItem label="Operating Shift" value={selectedSubject.shiftLabel} />
            </DossierSection>

            {/* Teaching Assignments */}
            <DossierSection title="Assigned Faculty Instructors">
              {selectedSubject.assignedFaculty.length > 0 ? (
                <div className="space-y-2">
                  {selectedSubject.assignedFaculty.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          <span>{f.name}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {f.employeeId} • {f.designation}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Allocated
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No instructor currently assigned. Please allocate a faculty member.
                </p>
              )}
            </DossierSection>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Operational Navigation
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/master-admin/faculty"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <Users className="w-4 h-4 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Faculty</span>
                </Link>

                <Link
                  href="/master-admin/classes"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Classes</span>
                </Link>

                <Link
                  href="/master-admin/attendance"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <Clock className="w-4 h-4 text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Attendance</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Dossier>

      {/* ─── 6. Add Subject Modal ─── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-subject-modal-title"
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
                      id="add-subject-modal-title"
                      className="text-base font-bold text-foreground tracking-tight"
                    >
                      Curriculum Subject Creation
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Index a new academic syllabus paper into MUC curriculum register
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
                      Subject Successfully Created
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Curriculum paper indexed into active program syllabus.
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
                  onSubmit={handleAddSubjectSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Subject Identity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Subject Code <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                          placeholder="e.g. BCA104 or MAT201"
                          className="w-full h-9 px-3 text-xs font-mono uppercase bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Subject Classification <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as "CORE" | "ELECTIVE" | "LAB" | "PROJECT")}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            <option value="CORE">Core Subject</option>
                            <option value="ELECTIVE">Elective Course</option>
                            <option value="LAB">Practical Laboratory</option>
                            <option value="PROJECT">Project / Dissertation</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Subject Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Database Management Systems"
                        className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Program & Semester */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.code} — {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Semester <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newSemester}
                            onChange={(e) => setNewSemester(Number(e.target.value))}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6].map((sem) => (
                              <option key={sem} value={sem}>
                                Semester {sem}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                          Credits <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={newCredits}
                            onChange={(e) => setNewCredits(Number(e.target.value))}
                            className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6].map((cr) => (
                              <option key={cr} value={cr}>
                                {cr} Credits
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Faculty Instructor */}
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Assigned Faculty Instructor
                      </label>
                      <div className="relative">
                        <select
                          value={newFacultyId}
                          onChange={(e) => setNewFacultyId(e.target.value)}
                          className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">Unassigned / Allocate Later</option>
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
                      MUC Curriculum Standard
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
                        <span>Create Subject</span>
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
