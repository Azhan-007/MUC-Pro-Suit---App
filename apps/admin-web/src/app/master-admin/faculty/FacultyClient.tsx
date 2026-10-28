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
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  UserCheck,
  ShieldCheck,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import {
  ResolvedFaculty,
  Department,
  Subject,
  FacultyDirectoryMetrics,
} from "@/types/domain";
import { Dossier, DossierSection, DossierItem } from "@/components/shared/Dossier";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";

interface FacultyClientProps {
  initialFaculty: ResolvedFaculty[];
  departments: Department[];
  subjects: Subject[];
  metrics: FacultyDirectoryMetrics;
}

export function FacultyClient({
  initialFaculty,
  departments,
  subjects,
  metrics: initialMetrics,
}: FacultyClientProps) {
  // State — initialFaculty comes SSR-enriched with workload/shift computed fields.
  // router.refresh() re-runs SSR to get fresh enriched data after mutations.
  const router = useRouter();
  const [facultyList, setFacultyList] = useState<ResolvedFaculty[]>(initialFaculty);
  const [selectedFaculty, setSelectedFaculty] = useState<ResolvedFaculty | null>(null);

  useEffect(() => {
    setFacultyList(initialFaculty);
  }, [initialFaculty]);

  const addFacultyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/academic/faculty', payload);
      return res.data;
    },
    onSuccess: () => {
      setAddFormSuccess(true);
      router.refresh();
      setTimeout(() => {
        setAddFormSuccess(false);
        setIsAddModalOpen(false);
        setNewFirstName("");
        setNewLastName("");
        setNewEmpId("");
        setNewEmail("");
        setNewPhone("");
        setNewSpecialization("");
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to add faculty: " + (err.response?.data?.error || err.message));
    }
  });

  const updateFacultyMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...data } = payload;
      const res = await apiClient.put(`/academic/faculty/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      setEditFormSuccess(true);
      router.refresh();
      if (selectedFaculty && selectedFaculty.id === editFacultyId) {
         setSelectedFaculty(null);
      }
      setTimeout(() => {
        setEditFormSuccess(false);
        setIsEditModalOpen(false);
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to update faculty: " + (err.response?.data?.error || err.message));
    }
  });

  const deleteFacultyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/academic/faculty/${id}`);
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
      setSelectedFaculty(null);
    },
    onError: (err: any) => {
      alert("Failed to delete/deactivate faculty: " + (err.response?.data?.error || err.message));
    }
  });

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedWorkload, setSelectedWorkload] = useState("");

  // Filter Popover Open State
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [activeMenuFacultyId, setActiveMenuFacultyId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Add Faculty Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmpId, setNewEmpId] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDeptId, setNewDeptId] = useState("");
  const [newDesignation, setNewDesignation] = useState("Assistant Professor");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [newShift, setNewShift] = useState<"SHIFT_I" | "SHIFT_II">("SHIFT_I");
  const [addFormSuccess, setAddFormSuccess] = useState(false);

  // Edit Faculty Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFacultyId, setEditFacultyId] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDeptId, setEditDeptId] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editFormSuccess, setEditFormSuccess] = useState(false);

  const openEditModal = (faculty: ResolvedFaculty) => {
    setEditFacultyId(faculty.id);
    setEditFirstName(faculty.firstName);
    setEditLastName(faculty.lastName);
    setEditPhone(faculty.phone || "");
    setEditDeptId(faculty.departmentId);
    setEditDesignation(faculty.designation);
    setEditSpecialization(faculty.specialization || "");
    setEditStatus(faculty.status);
    setIsEditModalOpen(true);
  };

  // Click outside listener
  const deptDropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
        setActiveMenuFacultyId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard dismiss for modals
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);

  // Unique designations present in data
  const designations = useMemo(() => {
    const set = new Set(facultyList.map((f) => f.designation));
    return Array.from(set);
  }, [facultyList]);

  // Filtered Faculty
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.fullName.toLowerCase().includes(q) ||
        f.employeeId.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        f.specialization.toLowerCase().includes(q) ||
        f.departmentName.toLowerCase().includes(q);

      const matchesDept = selectedDept ? f.departmentId === selectedDept : true;
      const matchesDesig = selectedDesignation ? f.designation === selectedDesignation : true;
      const matchesShift = selectedShift ? f.primaryShift === selectedShift || f.primaryShift === "DUAL_SHIFT" : true;
      const matchesStatus = selectedStatus ? f.status === selectedStatus : true;

      let matchesWorkload = true;
      if (selectedWorkload === "ASSIGNED") {
        matchesWorkload = f.workload.assignedSubjectsCount > 0;
      } else if (selectedWorkload === "UNASSIGNED") {
        matchesWorkload = f.workload.assignedSubjectsCount === 0;
      }

      return matchesSearch && matchesDept && matchesDesig && matchesShift && matchesStatus && matchesWorkload;
    });
  }, [
    facultyList,
    search,
    selectedDept,
    selectedDesignation,
    selectedShift,
    selectedStatus,
    selectedWorkload,
  ]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedDept) ||
    Boolean(selectedDesignation) ||
    Boolean(selectedShift) ||
    Boolean(selectedStatus) ||
    Boolean(selectedWorkload);

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("");
    setSelectedDesignation("");
    setSelectedShift("");
    setSelectedStatus("");
    setSelectedWorkload("");
  };

  // Selected Department Object
  const selectedDeptObj = useMemo(
    () => departments.find((d) => d.id === selectedDept),
    [departments, selectedDept]
  );

  // CSV Export Action
  const handleExportCSV = () => {
    const headers = [
      "Employee ID",
      "Full Name",
      "Department",
      "Designation",
      "Specialization",
      "HOD Status",
      "Primary Shift",
      "Assigned Subjects",
      "Total Credits",
      "Email",
      "Phone",
      "Status",
    ];

    const rows = filteredFaculty.map((f) => [
      `"${f.employeeId}"`,
      `"${f.fullName}"`,
      `"${f.departmentName}"`,
      `"${f.designation}"`,
      `"${f.specialization}"`,
      f.isHod ? "Yes" : "No",
      `"${f.shiftLabel}"`,
      f.workload.assignedSubjectsCount,
      f.workload.totalCredits,
      `"${f.email}"`,
      `"${f.phone}"`,
      `"${f.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MUC_Faculty_Directory_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Faculty Submit Handler
  const handleAddFacultySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newEmpId || !newDeptId) return;

    addFacultyMutation.mutate({
      employeeId: newEmpId.toUpperCase(),
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail || `${newFirstName.toLowerCase()}@muc.edu`,
      phone: newPhone || "9998887770",
      departmentId: newDeptId,
      designation: newDesignation,
      specialization: newSpecialization || "General Instruction",
      primaryShift: newShift
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
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-background border border-border/80 rounded-lg text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/70 hover:border-border transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
          title="Export faculty roster to CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>Export ({filteredFaculty.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs hover:shadow active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Add Faculty</span>
        </button>
      </NavbarActions>

      {/* ─── 2. KPI Metrics Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Faculty */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Total Faculty
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground num-tabular">
                {facultyList.length}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                100% Active
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Department Leadership (HODs) */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Dept Leadership
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground num-tabular">
                {facultyList.filter((f) => f.isHod).length}
              </span>
              <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                HOD Officers
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Shift Coverage */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Shift Coverage
            </span>
            <div className="flex items-baseline gap-1.5 text-xs font-semibold num-tabular">
              <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                Shift I: {facultyList.filter((f) => f.primaryShift === "SHIFT_I").length}
              </span>
              <span className="text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800">
                Shift II: {facultyList.filter((f) => f.primaryShift === "SHIFT_II").length}
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Assigned Curriculum Load */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Academic Workload
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground num-tabular">
                {facultyList.reduce((acc, f) => acc + f.workload.totalCredits, 0)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Credits Assigned
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
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
              placeholder="Search faculty by name, employee ID, specialization, or department..."
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

          {/* Filter Popovers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter Popover */}
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
                    <span>Filter by Department</span>
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
                      <span className="text-[10px] opacity-75">
                        {facultyList.length}
                      </span>
                    </button>
                    {departments.map((d) => {
                      const count = facultyList.filter(
                        (f) => f.departmentId === d.id
                      ).length;
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

            {/* Designation Filter */}
            <div className="relative">
              <select
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedDesignation
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Designations</option>
                {designations.map((desig) => (
                  <option key={desig} value={desig}>
                    {desig}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
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
                <option value="DUAL_SHIFT">Dual Shift</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {/* Workload Status Filter */}
            <div className="relative">
              <select
                value={selectedWorkload}
                onChange={(e) => setSelectedWorkload(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedWorkload
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Workloads</option>
                <option value="ASSIGNED">Has Assigned Subjects</option>
                <option value="UNASSIGNED">Unassigned Workload</option>
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
            {selectedDesignation && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Designation: {selectedDesignation}
                <button
                  type="button"
                  onClick={() => setSelectedDesignation("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedShift && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Shift: {selectedShift === "SHIFT_I" ? "Shift I" : selectedShift === "SHIFT_II" ? "Shift II" : "Dual Shift"}
                <button
                  type="button"
                  onClick={() => setSelectedShift("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedWorkload && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Workload: {selectedWorkload}
                <button
                  type="button"
                  onClick={() => setSelectedWorkload("")}
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

      {/* ─── 4. Faculty Table Workspace ─── */}
      <div className="space-y-2.5">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="erp-card-table text-xs text-left min-w-[1050px]">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none">
              <tr>
                <th scope="col" className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold min-w-[260px]">Faculty Member</th>
                <th scope="col" className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold w-[130px]">Employee ID</th>
                <th scope="col" className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold min-w-[200px]">Department & Designation</th>
                <th scope="col" className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold w-[160px]">Academic Load</th>
                <th scope="col" className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold w-[145px]">Class Advisory</th>
                <th scope="col" className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold w-[140px]">Shift</th>
                <th scope="col" className="px-4 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 whitespace-nowrap text-left align-middle font-bold w-[120px]">Status</th>
                <th scope="col" className="px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground/90 text-right whitespace-nowrap align-middle font-bold w-[135px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((faculty) => {
                const initials = `${faculty.firstName?.[0] || ""}${faculty.lastName?.[0] || ""}`.toUpperCase() || "FA";
                return (
                  <tr
                    key={faculty.id}
                    onClick={() => setSelectedFaculty(faculty)}
                    className="group"
                  >
                    {/* Faculty Identity */}
                    <td className="px-5 py-3.5 align-middle whitespace-nowrap min-w-[260px]">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-xs font-black shrink-0 group-hover:scale-105 group-hover:border-emerald-500/60 transition-transform shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors text-[13px] whitespace-nowrap">
                            <span>{faculty.fullName}</span>
                            {faculty.isHod && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[10px] font-semibold text-purple-700 dark:text-purple-300 shrink-0">
                                <Award className="w-2.5 h-2.5" />
                                HOD
                              </span>
                            )}
                          </div>
                          <div className="text-[11.5px] text-muted-foreground whitespace-nowrap truncate max-w-[200px]" title={faculty.specialization}>
                            {faculty.specialization}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap w-[130px]">
                      <span className="text-[13px] font-bold text-foreground tabular-nums select-all group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {faculty.employeeId}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 whitespace-nowrap font-medium">
                        Faculty ID
                      </span>
                    </td>

                    {/* Department & Designation */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap min-w-[200px]">
                      <div className="font-semibold text-foreground text-xs whitespace-nowrap">
                        {faculty.departmentName}
                      </div>
                      <div className="text-[11px] text-muted-foreground whitespace-nowrap font-medium">
                        {faculty.designation}
                      </div>
                    </td>

                    {/* Academic Workload */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap w-[160px]">
                      {faculty.workload.assignedSubjectsCount > 0 ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="font-semibold text-foreground text-xs">
                              {faculty.workload.assignedSubjectsCount} {faculty.workload.assignedSubjectsCount === 1 ? "Subject" : "Subjects"}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-1.5 py-0.2 rounded whitespace-nowrap">
                              {faculty.workload.totalCredits} Credits
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[170px] whitespace-nowrap" title={faculty.workload.subjects.map((s) => `${s.code} (${s.name})`).join(", ")}>
                            {faculty.workload.subjects.map((s) => s.code).join(", ")}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <span className="text-xs text-muted-foreground font-medium">
                              0 Subjects
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground/60 bg-muted/40 border border-border/50 px-1.5 py-0.2 rounded whitespace-nowrap">
                              0 Credits
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground/50 italic whitespace-nowrap">
                            No assigned load
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Class Advisory */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap w-[145px]">
                      {faculty.workload.advisoryClasses.length > 0 ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            {faculty.workload.advisoryClasses.map((adv) => (
                              <span
                                key={adv.classId}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10.5px] font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap shadow-2xs"
                              >
                                <GraduationCap className="w-3 h-3 shrink-0" />
                                {adv.classCode}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block whitespace-nowrap font-medium">
                            Class Advisor
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium text-muted-foreground/60 bg-muted/40 border border-border/40 whitespace-nowrap">
                            None
                          </span>
                          <span className="text-[10px] text-muted-foreground/40 block whitespace-nowrap">
                            No advisory
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Shift */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap w-[140px]">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border whitespace-nowrap shadow-2xs",
                          faculty.primaryShift === "SHIFT_I"
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : faculty.primaryShift === "SHIFT_II"
                            ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                            : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", faculty.primaryShift === "SHIFT_I" ? "bg-emerald-500" : "bg-sky-500")} />
                        {faculty.shiftLabel}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 whitespace-nowrap font-medium">
                        {faculty.primaryShift === "SHIFT_I"
                          ? "Morning Session"
                          : faculty.primaryShift === "SHIFT_II"
                          ? "Evening Session"
                          : "Dual Session"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap w-[120px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        {faculty.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 block mt-0.5 whitespace-nowrap font-medium">
                        In Service
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap w-[135px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFaculty(faculty);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-800/80 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-emerald-600 shadow-2xs cursor-pointer group-hover:border-emerald-400/80 group-hover:shadow-xs transition-all duration-150 whitespace-nowrap"
                      >
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2.5">
          {filteredFaculty.map((faculty) => {
            const initials = `${faculty.firstName[0] || ""}${faculty.lastName[0] || ""}`.toUpperCase();
            return (
              <div
                key={faculty.id}
                onClick={() => setSelectedFaculty(faculty)}
                className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <span>{faculty.fullName}</span>
                        {faculty.isHod && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                            HOD
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {faculty.employeeId} • {faculty.departmentName}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {faculty.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                    {faculty.designation}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {faculty.shiftLabel}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    Load: {faculty.workload.totalCredits} Credits ({faculty.workload.assignedSubjectsCount} Subjects)
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
        {filteredFaculty.length === 0 && (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-base font-bold text-foreground">
              No faculty found matching your criteria
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query, department selection, or clearing active filters.
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

      {/* ─── 5. Faculty Dossier Drawer ─── */}
      <Dossier
        isOpen={Boolean(selectedFaculty)}
        onClose={() => setSelectedFaculty(null)}
        title={selectedFaculty?.fullName || "Faculty Dossier"}
        subtitle={`${selectedFaculty?.employeeId} • ${selectedFaculty?.departmentName}`}
      >
        {selectedFaculty && (
          <div className="space-y-6">
            {/* Header Profile Badge */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-base font-bold">
                  {selectedFaculty.firstName[0]}
                  {selectedFaculty.lastName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>{selectedFaculty.fullName}</span>
                    {selectedFaculty.isHod && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[10px] font-semibold border border-purple-200">
                        HOD
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedFaculty.designation} • {selectedFaculty.specialization}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedFaculty.status}
                </span>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedFaculty)}
                  className="px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={deleteFacultyMutation.isPending}
                  onClick={() => {
                    if (confirm('Are you sure you want to deactivate/delete this faculty?')) {
                       deleteFacultyMutation.mutate(selectedFaculty.id);
                    }
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Official Appointment & Contact */}
            <DossierSection title="Appointment & Contact">
              <DossierItem label="Employee ID" value={selectedFaculty.employeeId} />
              <DossierItem label="Department" value={selectedFaculty.departmentName} />
              <DossierItem label="Designation" value={selectedFaculty.designation} />
              <DossierItem label="Specialization" value={selectedFaculty.specialization} />
              <DossierItem label="Primary Shift" value={selectedFaculty.shiftLabel} />
              <DossierItem label="Phone Number" value={selectedFaculty.phone} />
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/50">
                <span className="text-muted-foreground font-medium">Institutional Email</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">{selectedFaculty.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedFaculty.email)}
                    className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </DossierSection>

            {/* Academic Workload & Teaching Assignments (MUC Rule 13) */}
            <DossierSection title="Curriculum & Teaching Assignments">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                  <span className="text-xs text-muted-foreground block">Total Workload</span>
                  <span className="text-base font-bold text-foreground">
                    {selectedFaculty.workload.totalCredits} Credits
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border text-center">
                  <span className="text-xs text-muted-foreground block">Subjects Handled</span>
                  <span className="text-base font-bold text-primary">
                    {selectedFaculty.workload.assignedSubjectsCount}
                  </span>
                </div>
              </div>

              {selectedFaculty.workload.subjects.length > 0 ? (
                <div className="space-y-2">
                  {selectedFaculty.workload.subjects.map((sub) => (
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
                      <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
                        <span>{sub.courseName} ({sub.courseCode})</span>
                        <span>Sem {sub.semesterNumber} • {sub.shift === "SHIFT_I" ? "Shift I" : "Shift II"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No direct teaching subjects currently allocated in curriculum.
                </p>
              )}
            </DossierSection>

            {/* Class Advisories */}
            <DossierSection title="Class Advisory Assignments">
              {selectedFaculty.workload.advisoryClasses.length > 0 ? (
                <div className="space-y-2">
                  {selectedFaculty.workload.advisoryClasses.map((adv) => (
                    <div
                      key={adv.classId}
                      className="p-3 rounded-lg border border-border bg-card flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-primary" />
                          <span>Class Advisor: {adv.classCode}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {adv.courseName} • Academic Year {adv.academicYear}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {adv.studentCount} Students
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  Not currently assigned as Class Advisor to an active cohort.
                </p>
              )}
            </DossierSection>

            {/* Quick Navigation Links */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Operational Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/master-admin/subjects"
                  className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-foreground block">Curriculum</span>
                  <span className="text-[10px] text-muted-foreground">All Subjects</span>
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

      {/* ─── 6. Add Faculty Modal Dialog ─── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-faculty-modal-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="add-faculty-modal-title"
                      className="text-base font-bold text-foreground tracking-tight"
                    >
                      Faculty Appointment & Registration
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Register a new academic instructor or department officer
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
                      Faculty Member Successfully Registered
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Record indexed into MUC institutional faculty directory.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 mt-2">
                    <span>{newEmpId}</span>
                    <span>•</span>
                    <span className="font-sans font-medium">
                      {newFirstName} {newLastName}
                    </span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleAddFacultySubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* 1. Identity & Employment */}
                    <div className="rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          1. Personal & Employment Identity
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newFirstName}
                            onChange={(e) => setNewFirstName(e.target.value)}
                            placeholder="e.g. Dr. Ayesha"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Last Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newLastName}
                            onChange={(e) => setNewLastName(e.target.value)}
                            placeholder="e.g. Begum"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Employee ID <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={newEmpId}
                            onChange={(e) => setNewEmpId(e.target.value.toUpperCase())}
                            placeholder="e.g. EMP-006"
                            className="w-full h-9 px-3 text-xs font-mono uppercase bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Designation <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={newDesignation}
                              onChange={(e) => setNewDesignation(e.target.value)}
                              className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="Assistant Professor">Assistant Professor</option>
                              <option value="Associate Professor">Associate Professor</option>
                              <option value="Head of Department">Head of Department</option>
                              <option value="Lecturer">Lecturer</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Specialization
                          </label>
                          <input
                            type="text"
                            value={newSpecialization}
                            onChange={(e) => setNewSpecialization(e.target.value)}
                            placeholder="e.g. Data Structures"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Department & Academic Assignment */}
                    <div className="rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <div className="h-6 w-6 rounded-md bg-sky-500/10 text-sky-600 flex items-center justify-center">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          2. Departmental Assignment
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Primary Department <span className="text-rose-500">*</span>
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
                            Primary Shift
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
                    </div>

                    {/* 3. Official Contact */}
                    <div className="rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3.5">
                      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                        <div className="h-6 w-6 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          3. Official Contact
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Institutional Email
                          </label>
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="faculty@muc.edu"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="9998887771"
                            className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="shrink-0 px-6 py-3.5 border-t border-border/80 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Profile will be indexed into active college staff roster</span>
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
                        className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xs transition-all cursor-pointer font-medium"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Register Faculty</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 7. Edit Faculty Modal Dialog --- */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-border/50 bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Faculty Profile</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update directory details for this faculty member.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {editFormSuccess ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Profile Updated Successfully
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    The faculty directory has been updated.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (updateFacultyMutation.isPending) return;
                    updateFacultyMutation.mutate({
                      id: editFacultyId,
                      firstName: editFirstName,
                      lastName: editLastName,
                      phone: editPhone,
                      departmentId: editDeptId,
                      designation: editDesignation,
                      specialization: editSpecialization,
                      status: editStatus
                    });
                  }}
                  className="space-y-8"
                >
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Personal Information</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">First Name *</label>
                        <input
                          type="text"
                          required
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Phone Number</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Status</label>
                        <select
                          required
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Academic Profile */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                      <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">Academic Profile</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Department *</label>
                        <select
                          required
                          value={editDeptId}
                          onChange={(e) => setEditDeptId(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="" disabled>Select department</option>
                          {departments.map((d) => (
                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">Designation *</label>
                        <select
                          required
                          value={editDesignation}
                          onChange={(e) => setEditDesignation(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="Professor">Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Lecturer">Lecturer</option>
                          <option value="Adjunct Faculty">Adjunct Faculty</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-foreground">Specialization</label>
                        <input
                          type="text"
                          value={editSpecialization}
                          onChange={(e) => setEditSpecialization(e.target.value)}
                          placeholder="e.g. Machine Learning, Structural Engineering"
                          className="w-full px-3 py-2 bg-background border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Changes reflect instantly</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/80 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={updateFacultyMutation.isPending}
                        className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xs transition-all cursor-pointer font-medium disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{updateFacultyMutation.isPending ? "Saving..." : "Save Changes"}</span>
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
