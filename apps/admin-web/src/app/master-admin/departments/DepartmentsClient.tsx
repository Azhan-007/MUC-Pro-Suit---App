"use client";

import { apiClient } from "@/lib/apiClient";
import React, { useState, useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
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
  Award,
  Clock,
  BookOpen,
  UserCheck,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import {
  ResolvedDepartment,
  DepartmentDirectoryMetrics,
  Faculty,
} from "@/types/domain";
import { Dossier, DossierSection, DossierItem } from "@/components/shared/Dossier";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { cn } from "@/lib/utils";

interface DepartmentsClientProps {
  initialDepartments: ResolvedDepartment[];
  metrics: DepartmentDirectoryMetrics;
  availableFaculty: Faculty[];
}

export function DepartmentsClient({
  initialDepartments,
  metrics: initialMetrics,
  availableFaculty,
}: DepartmentsClientProps) {
  // State — initialDepartments comes SSR-enriched with faculty/course counts.
  // router.refresh() re-runs SSR to get fresh enriched data after mutations.
  const router = useRouter();
  const [departments, setDepartments] = useState<ResolvedDepartment[]>(initialDepartments);

  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  const addDepartmentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/academic/departments', payload);
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
      }, 1200);
    },
    onError: (err: any) => {
      alert("Failed to add department: " + (err.response?.data?.error || err.message));
    }
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.put(`/academic/departments/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
      setIsEditModalOpen(false);
      setEditDeptId(null);
    },
    onError: (err: any) => {
      alert("Failed to update department: " + (err.response?.data?.error || err.message));
    }
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/academic/departments/${id}`);
      return res.data;
    },
    onSuccess: () => {
      router.refresh();
    },
    onError: (err: any) => {
      alert("Failed to delete department: " + (err.response?.data?.error || err.message));
    }
  });
  const [selectedDept, setSelectedDept] = useState<ResolvedDepartment | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedHodStatus, setSelectedHodStatus] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Add Department Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newHodId, setNewHodId] = useState("");
  const [addFormSuccess, setAddFormSuccess] = useState(false);

  // Edit Department Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  // Keyboard dismiss for modals
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
      if (event.key === "Escape" && isEditModalOpen) {
        setIsEditModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, isEditModalOpen]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.hodName.toLowerCase().includes(q);

      let matchesShift = true;
      if (selectedShift === "SHIFT_I") matchesShift = d.shiftDistribution.hasShift1;
      else if (selectedShift === "SHIFT_II") matchesShift = d.shiftDistribution.hasShift2;
      else if (selectedShift === "BOTH")
        matchesShift = d.shiftDistribution.hasShift1 && d.shiftDistribution.hasShift2;

      let matchesHod = true;
      if (selectedHodStatus === "APPOINTED") matchesHod = Boolean(d.hodId);
      else if (selectedHodStatus === "PENDING") matchesHod = !d.hodId;

      const matchesStatus = selectedStatus ? d.status === selectedStatus : true;

      return matchesSearch && matchesShift && matchesHod && matchesStatus;
    });
  }, [departments, search, selectedShift, selectedHodStatus, selectedStatus]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedShift) ||
    Boolean(selectedHodStatus) ||
    Boolean(selectedStatus);

  const resetFilters = () => {
    setSearch("");
    setSelectedShift("");
    setSelectedHodStatus("");
    setSelectedStatus("");
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Department Code",
      "Department Name",
      "Head of Department",
      "HOD Employee ID",
      "Programs Count",
      "Faculty Count",
      "Students Count",
      "Shift Coverage",
      "Status",
    ];

    const rows = filteredDepartments.map((d) => [
      `"${d.code}"`,
      `"${d.name}"`,
      `"${d.hodName}"`,
      `"${d.hodEmployeeId || "N/A"}"`,
      d.coursesCount,
      d.facultyCount,
      d.studentCount,
      `"${d.shiftDistribution.shiftLabel}"`,
      `"${d.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MUC_Departments_Directory_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Department Submit
  const handleAddDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    addDepartmentMutation.mutate({
      code: newCode.toUpperCase(),
      name: newName,
      alias: newCode.toUpperCase(),
      description: `${newName} Department`,
    });
  };

  const handleEditDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editCode || !editDeptId) return;

    updateDepartmentMutation.mutate({
      id: editDeptId,
      payload: {
        code: editCode.toUpperCase(),
        name: editName,
      }
    });
  };

  const handleDeleteDept = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this department? This action cannot be undone.")) {
      deleteDepartmentMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* ─── 1. Institutional Actions in Navbar ─── */}
      <NavbarActions>
        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors shadow-2xs cursor-pointer"
          title="Export departments to CSV"
        >
          <Download className="w-3.5 h-3.5 text-muted-foreground" />
          Export ({filteredDepartments.length})
        </button>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Department
        </button>
      </NavbarActions>

      {/* ─── 2. KPI Metrics Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Departments */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Departments
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {departments.length}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                100% Active
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
        </div>

        {/* Degree Programs */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Degree Programs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {departments.reduce((acc, d) => acc + d.coursesCount, 0)}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                UG & PG
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Appointed HODs */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              HOD Leadership
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {departments.filter((d) => Boolean(d.hodId)).length}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                Of {departments.length}
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Student Body
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">
                {departments.reduce((acc, d) => acc + d.studentCount, 0)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Enrolled
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
              placeholder="Search department by name, code, or HOD..."
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
            {/* Shift Distribution */}
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
                <option value="SHIFT_I">Offers Shift I (Aided)</option>
                <option value="SHIFT_II">Offers Shift II (Self-Financing)</option>
                <option value="BOTH">Offers Both Shifts</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            </div>

            {/* HOD Status */}
            <div className="relative">
              <select
                value={selectedHodStatus}
                onChange={(e) => setSelectedHodStatus(e.target.value)}
                className={cn(
                  "appearance-none h-8.5 pl-3 pr-7 text-xs font-medium rounded-xl border transition-all cursor-pointer",
                  selectedHodStatus
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold"
                    : "bg-background border-border text-foreground hover:bg-muted/60"
                )}
              >
                <option value="">All Leadership</option>
                <option value="APPOINTED">HOD Appointed</option>
                <option value="PENDING">Appointment Pending</option>
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
            {selectedShift && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Shift: {selectedShift === "SHIFT_I" ? "Shift I" : selectedShift === "SHIFT_II" ? "Shift II" : "Both"}
                <button
                  type="button"
                  onClick={() => setSelectedShift("")}
                  className="hover:text-primary/70 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedHodStatus && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
                Leadership: {selectedHodStatus === "APPOINTED" ? "HOD Appointed" : "Pending"}
                <button
                  type="button"
                  onClick={() => setSelectedHodStatus("")}
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

      {/* ─── 4. Departments Workspace ─── */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[1000px]">
            <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border font-bold">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Department</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Head of Department</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Degree Programs</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Shift Coverage</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Faculty / Students</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  onClick={() => setSelectedDept(dept)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group h-16"
                >
                  {/* Department & Code */}
                  <td className="px-5 py-3.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform border border-primary/20">
                        {dept.code.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors text-xs whitespace-nowrap">
                          {dept.name}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground block whitespace-nowrap">
                          Code: {dept.code}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Head of Department */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    {dept.hodId ? (
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5 text-xs whitespace-nowrap">
                          <Award className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{dept.hodName}</span>
                        </div>
                        {dept.hodEmployeeId && (
                          <div className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                            {dept.hodEmployeeId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic bg-muted/40 px-2 py-0.5 rounded border border-border/50 whitespace-nowrap">
                        Appointment Pending
                      </span>
                    )}
                  </td>

                  {/* Programs */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="font-bold text-foreground text-xs">
                          {dept.coursesCount} {dept.coursesCount === 1 ? "Program" : "Programs"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 max-w-[200px] overflow-hidden whitespace-nowrap">
                        {dept.courses.map((c) => (
                          <span
                            key={c.id}
                            className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60 whitespace-nowrap"
                          >
                            {c.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Shift Coverage */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold border whitespace-nowrap",
                        dept.shiftDistribution.hasShift1 && dept.shiftDistribution.hasShift2
                          ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          : dept.shiftDistribution.hasShift2
                          ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      )}
                    >
                      {dept.shiftDistribution.shiftLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 whitespace-nowrap">
                      Academic Shift
                    </span>
                  </td>

                  {/* Faculty / Students */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <div className="font-medium text-foreground text-xs whitespace-nowrap">
                      <span className="font-bold">{dept.facultyCount}</span> Faculty
                      <span className="text-muted-foreground mx-1.5">•</span>
                      <span className="font-bold">{dept.studentCount}</span> Students
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 whitespace-nowrap">
                      Enrolled Roster
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      {dept.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 block mt-0.5 whitespace-nowrap">
                      Operational
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditDeptId(dept.id);
                          setEditName(dept.name);
                          setEditCode(dept.code);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDept(dept.id, e)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDept(dept);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:bg-primary hover:text-primary-foreground rounded-lg text-xs font-semibold text-foreground transition-all cursor-pointer whitespace-nowrap ml-2"
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
          {filteredDepartments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => setSelectedDept(dept)}
              className="p-4 space-y-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 border border-primary/20">
                    {dept.code.slice(0, 3)}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-xs">
                      {dept.name}
                    </h4>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Code: {dept.code}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {dept.status}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-muted-foreground">
                  HOD: <span className="font-semibold text-foreground">{dept.hodName}</span>
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{dept.shiftDistribution.shiftLabel}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  {dept.coursesCount} Programs • {dept.facultyCount} Faculty • {dept.studentCount} Students
                </span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  View Dossier <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDepartments.length === 0 && (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground border border-border">
              <Filter className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-base font-bold text-foreground">
              No departments found matching your criteria
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Try adjusting your search query or clearing active filters.
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

      {/* ─── 5. Department Dossier Drawer ─── */}
      <Dossier
        isOpen={Boolean(selectedDept)}
        onClose={() => setSelectedDept(null)}
        title={selectedDept?.name || "Department Dossier"}
        subtitle={`Code: ${selectedDept?.code} • MUC Academic Structure`}
      >
        {selectedDept && (
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-base font-bold">
                  {selectedDept.code.slice(0, 3)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedDept.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedDept.shiftDistribution.shiftLabel}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedDept.status}
              </span>
            </div>

            {/* Department Leadership */}
            <DossierSection title="Department Leadership">
              <DossierItem label="Head of Department" value={selectedDept.hodName} />
              {selectedDept.hodEmployeeId && (
                <DossierItem label="HOD Employee ID" value={selectedDept.hodEmployeeId} />
              )}
              <DossierItem
                label="Leadership Status"
                value={selectedDept.hodId ? "Appointed & Active" : "Appointment Pending"}
              />
            </DossierSection>

            {/* Degree Programs Offered */}
            <DossierSection title="Offered Degree Programs">
              {selectedDept.courses.length > 0 ? (
                <div className="space-y-2">
                  {selectedDept.courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3 rounded-lg border border-border bg-card space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-foreground">
                          {course.code}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {course.degree} • {course.shiftLabel}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-foreground">
                        {course.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No courses formally linked to this department record yet.
                </p>
              )}
            </DossierSection>

            {/* Allocated Faculty */}
            <DossierSection title="Faculty Appointments">
              {selectedDept.faculty.length > 0 ? (
                <div className="space-y-2">
                  {selectedDept.faculty.map((f) => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-lg border border-border bg-card flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span>{f.name}</span>
                          {f.isHod && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                              HOD
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {f.employeeId} • {f.designation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">
                  No faculty members directly assigned yet.
                </p>
              )}
            </DossierSection>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Departmental Navigation
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/master-admin/courses"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <BookOpen className="w-4 h-4 text-primary mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Courses</span>
                </Link>

                <Link
                  href="/master-admin/faculty"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <Users className="w-4 h-4 text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Faculty</span>
                </Link>

                <Link
                  href="/master-admin/students"
                  className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors text-center cursor-pointer group"
                >
                  <GraduationCap className="w-4 h-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-semibold text-foreground block">Students</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Dossier>

      {/* ─── 6. Add Department Modal ─── */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-dept-modal-title"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="flex min-h-full items-center justify-center p-3 sm:p-5">
            <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-card-foreground animate-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      id="add-dept-modal-title"
                      className="text-base font-bold text-foreground tracking-tight"
                    >
                      Establish Academic Department
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Index a new academic division into MUC institutional register
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
                      Department Successfully Established
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Academic department added to institutional catalog.
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
                  onSubmit={handleAddDeptSubmit}
                  className="flex flex-col flex-1 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Department Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Computer Applications"
                        className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Department Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="e.g. BCA"
                        className="w-full h-9 px-3 text-xs font-mono uppercase bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Appoint Head of Department (HOD)
                      </label>
                      <div className="relative">
                        <select
                          value={newHodId}
                          onChange={(e) => setNewHodId(e.target.value)}
                          className="w-full appearance-none h-9 pl-3 pr-8 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="">Appointment Pending / Select Later</option>
                          {availableFaculty.map((f) => (
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
                      Institutional division
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
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Establish Department</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ─── Edit Department Modal ─── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm border-none"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-border/80 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Edit Department
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Update department details
                  </p>
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
              onSubmit={handleEditDeptSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Department Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-medium bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Department Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 text-xs font-mono uppercase bg-background border border-border/80 rounded-lg text-foreground hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="shrink-0 px-6 py-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Update details
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/80 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-xs transition-all cursor-pointer font-medium"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
