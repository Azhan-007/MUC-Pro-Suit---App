"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  Briefcase, Building2, TrendingUp, Sparkles, Star, Plus, Trash2, Edit, 
  Check, Eye, Search, Filter, AlertTriangle, CheckCircle2, UserCheck, X, 
  DollarSign, Award, ArrowUpRight, ChevronRight, Layers, FileText
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { PlacementRecord } from '../types';

interface PlacementFormValues {
  studentId: string;
  company: string;
  position: string;
  salaryPackage: string;
  placementType: 'On-Campus' | 'Off-Campus' | 'Internship + PPO' | 'Pool Drive';
  status: 'Placed' | 'Selected' | 'Interview Round' | 'Shortlisted' | 'Rejected';
  appliedDate: string;
  offerDate: string;
}

export default function PlacementsView() {
  const store = useERPStore();

  // ── Filters & Search ───────────────────────────────────────────────────
  const [placementSearch, setPlacementSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');

  // ── Modals ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacementId, setEditingPlacementId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPlacement, setDeletingPlacement] = useState<PlacementRecord | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingPlacement, setViewingPlacement] = useState<PlacementRecord | null>(null);

  // ── Form Hook ──────────────────────────────────────────────────────────
  const { 
    control, register, handleSubmit, reset, setValue, watch, formState: { errors } 
  } = useForm<PlacementFormValues>({
    defaultValues: {
      placementType: 'On-Campus',
      status: 'Selected',
      appliedDate: new Date().toISOString().split('T')[0],
      offerDate: new Date().toISOString().split('T')[0],
    }
  });

  const watchStudentId = watch('studentId');
  const watchCompany = watch('company');
  const watchPosition = watch('position');

  // Selected Student Info in Form
  const selectedStudent = useMemo(() => {
    return store.students.find(s => s.id === watchStudentId) || store.students[0];
  }, [watchStudentId, store.students]);

  // Duplicate Record Protection
  const duplicateWarning = useMemo(() => {
    if (!isModalOpen || !watchStudentId || !watchCompany || !watchPosition) return null;

    const duplicate = store.placements.find(p => 
      p.id !== editingPlacementId &&
      (p.studentId === watchStudentId || p.studentName === selectedStudent?.name) &&
      p.company.toLowerCase().trim() === watchCompany.toLowerCase().trim() &&
      p.position.toLowerCase().trim() === watchPosition.toLowerCase().trim()
    );

    if (duplicate) {
      return `Active Offer Notice: A placement record for "${selectedStudent?.name}" at "${watchCompany}" (${watchPosition}) already exists (${duplicate.id}).`;
    }
    return null;
  }, [isModalOpen, watchStudentId, watchCompany, watchPosition, store.placements, editingPlacementId, selectedStudent]);

  // Options from store
  const deptOptions = useMemo(
    () => ["All Departments", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  // ── Filtered Placements ────────────────────────────────────────────────
  const filteredPlacements = useMemo(() => {
    const q = (placementSearch || store.searchQuery).trim().toLowerCase();

    return store.placements.filter(plc => {
      const matchDept = selectedDeptFilter === 'All Departments' || (plc.department || '') === selectedDeptFilter;
      const matchStatus = selectedStatusFilter === 'All Statuses' || plc.status === selectedStatusFilter;
      const matchType = selectedTypeFilter === 'All Types' || (plc.placementType || 'On-Campus') === selectedTypeFilter;

      const matchSearch = !q ||
        plc.studentName.toLowerCase().includes(q) ||
        (plc.studentId && plc.studentId.toLowerCase().includes(q)) ||
        plc.company.toLowerCase().includes(q) ||
        plc.position.toLowerCase().includes(q) ||
        plc.id.toLowerCase().includes(q) ||
        (plc.department && plc.department.toLowerCase().includes(q));

      return matchDept && matchStatus && matchType && matchSearch;
    });
  }, [store.placements, selectedDeptFilter, selectedStatusFilter, selectedTypeFilter, placementSearch, store.searchQuery]);

  // ── Derived KPI Metrics ────────────────────────────────────────────────
  const totalCount = store.placements.length;

  const placedStudents = useMemo(() => {
    const uniqueIds = new Set(
      store.placements
        .filter(p => p.status === 'Placed')
        .map(p => p.studentId || p.studentName)
    );
    return uniqueIds.size;
  }, [store.placements]);

  const placementRate = totalCount > 0 ? ((placedStudents / Math.max(1, store.students.length)) * 100).toFixed(1) : "0";

  const partnerRecruitersCount = useMemo(() => {
    return new Set(store.placements.map(p => p.company.trim().toLowerCase())).size;
  }, [store.placements]);

  const packagesList = useMemo(() => {
    return store.placements.map(p => {
      const cleaned = p.salaryPackage.replace(/[^0-9.]/g, '');
      const val = parseFloat(cleaned);
      return isNaN(val) ? 0 : val;
    }).filter(v => v > 0);
  }, [store.placements]);

  const highestPackageStr = useMemo(() => {
    if (store.placements.length === 0) return "$0";
    return store.placements[0]?.salaryPackage || "$120,000";
  }, [store.placements]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingPlacementId(null);
    const firstStudent = store.students[0];
    reset({
      studentId: firstStudent?.id || '',
      company: '',
      position: '',
      salaryPackage: '$100,000',
      placementType: 'On-Campus',
      status: 'Selected',
      appliedDate: new Date().toISOString().split('T')[0],
      offerDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  }, [store.students, reset]);

  const handleOpenEdit = useCallback((plc: PlacementRecord) => {
    setEditingPlacementId(plc.id);
    const matchedStudent = store.students.find(s => s.id === plc.studentId || s.name === plc.studentName) || store.students[0];

    setValue('studentId', matchedStudent?.id || '');
    setValue('company', plc.company);
    setValue('position', plc.position);
    setValue('salaryPackage', plc.salaryPackage);
    setValue('placementType', plc.placementType || 'On-Campus');
    setValue('status', plc.status);
    setValue('appliedDate', plc.appliedDate || new Date().toISOString().split('T')[0]);
    setValue('offerDate', plc.offerDate || new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  }, [store.students, setValue]);

  const handleOpenDelete = useCallback((plc: PlacementRecord) => {
    setDeletingPlacement(plc);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingPlacement) return;
    store.deletePlacement(deletingPlacement.id);
    setIsDeleteModalOpen(false);
    setDeletingPlacement(null);
  }, [deletingPlacement, store]);

  const onSubmit = useCallback((values: PlacementFormValues) => {
    const studentObj = store.students.find(s => s.id === values.studentId) || selectedStudent;

    const payload = {
      ...values,
      studentId: studentObj.id,
      studentName: studentObj.name,
      department: studentObj.department,
      course: studentObj.course,
    };

    if (editingPlacementId) {
      store.updatePlacement(editingPlacementId, payload);
    } else {
      store.addPlacement(payload);
    }
    setIsModalOpen(false);
    reset();
  }, [editingPlacementId, selectedStudent, store, reset]);

  return (
    <div className="space-y-8">
      {/* ── Page Header Controls ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Placements</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Placement & Career Recruitment Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Student recruitment drives, corporate offers, selection status & career analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Record Placement Offer</span>
          </button>
        </div>
      </div>

      {/* ── Live KPI Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Placement Rate</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{placementRate}%</h3>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{placedStudents} / {store.students.length} Total Students</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-2xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Highest Offer Package</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{highestPackageStr}</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Top Corporate Offer</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center rounded-2xl shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Recruiters</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{partnerRecruitersCount} Corporate Partners</h3>
            <p className="text-[10px] text-primary font-bold mt-0.5">Hiring Companies</p>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-2xl shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Placement Offers</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{totalCount} Offers</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Across All Programs</p>
          </div>
          <div className="w-11 h-11 bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center rounded-2xl shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Placement Records
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={placementSearch}
                onChange={e => setPlacementSearch(e.target.value)}
                placeholder="Student name, student ID, company, position..."
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {placementSearch && (
                <button onClick={() => setPlacementSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <CustomSelect
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              options={deptOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[150px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
            <CustomSelect
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              options={["All Statuses", "Placed", "Selected", "Interview Round", "Shortlisted", "Rejected"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[150px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Drive Type</label>
            <CustomSelect
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              options={["All Types", "On-Campus", "Off-Campus", "Internship + PPO", "Pool Drive"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {(selectedDeptFilter !== 'All Departments' || selectedStatusFilter !== 'All Statuses' || selectedTypeFilter !== 'All Types' || placementSearch) && (
            <button
              onClick={() => {
                setSelectedDeptFilter('All Departments');
                setSelectedStatusFilter('All Statuses');
                setSelectedTypeFilter('All Types');
                setPlacementSearch('');
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Placement Records Table ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Offer ID</th>
                <th className="py-4 px-6">Student Candidate</th>
                <th className="py-4 px-6">Hiring Recruiter</th>
                <th className="py-4 px-6">Position Offered</th>
                <th className="py-4 px-6">Package Offered</th>
                <th className="py-4 px-6">Drive Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPlacements.map(plc => (
                <tr key={plc.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">{plc.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{plc.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{plc.studentId || 'S10245'} · {plc.department || 'Computer Science'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold text-slate-800">{plc.company}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{plc.position}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 font-mono">{plc.salaryPackage}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[10px]">
                      {plc.placementType || 'On-Campus'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                      plc.status === 'Placed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : plc.status === 'Selected'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : plc.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {plc.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setViewingPlacement(plc); setIsDetailsModalOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                        title="View Record Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {plc.status !== 'Placed' && (
                        <button 
                          onClick={() => store.updatePlacementStatus(plc.id, 'Placed')}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded cursor-pointer"
                          title="Mark as Placed"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button 
                        onClick={() => handleOpenEdit(plc)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleOpenDelete(plc)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPlacements.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 font-medium">
                    No placement records match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal 1: Create / Edit Placement Offer Modal ─────────────── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPlacementId ? "Update Placement Offer Record" : "Record Corporate Placement Offer"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Duplicate Offer Warning Banner */}
          {duplicateWarning && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Select Student Candidate <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="studentId"
              control={control}
              rules={{ required: 'Student candidate selection is required' }}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                  options={store.students.map(s => `${s.name} (${s.id}) - ${s.department}`)}
                  className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Hiring Partner (Company) <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('company', { required: 'Hiring partner is required' })}
                type="text" 
                placeholder="e.g. Google / Microsoft"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.company && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.company.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Position Offered <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('position', { required: 'Position offered is required' })}
                type="text" 
                placeholder="e.g. Software Engineer"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.position && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.position.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Salary Package Offered <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('salaryPackage', { required: 'Salary package is required' })}
                type="text" 
                placeholder="e.g. $120,000 or ₹12.5 LPA"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.salaryPackage && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.salaryPackage.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Drive Type
              </label>
              <Controller
                name="placementType"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["On-Campus", "Off-Campus", "Internship + PPO", "Pool Drive"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Selection Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Selected", "Placed", "Interview Round", "Shortlisted", "Rejected"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Offer / Drive Date
              </label>
              <input 
                {...register('offerDate')}
                type="text" 
                placeholder="2026-10-15"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingPlacementId ? "Save Record Changes" : "Record Placement Offer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Placement Record Details Modal ────────────────────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Official Corporate Placement Offer Details"
      >
        {viewingPlacement && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px]">
                  {viewingPlacement.placementType || 'On-Campus'}
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingPlacement.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingPlacement.studentName}</h4>
              <p className="text-slate-500 font-medium">Candidate ID: {viewingPlacement.studentId || 'S10245'} · {viewingPlacement.department || 'Computer Science'}</p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Recruiting Company:</span>
                <span className="font-bold text-slate-900">{viewingPlacement.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Position / Role:</span>
                <span className="font-bold text-slate-800">{viewingPlacement.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Package Offered:</span>
                <span className="font-bold font-mono text-emerald-700">{viewingPlacement.salaryPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Selection Status:</span>
                <span className="font-bold text-primary">{viewingPlacement.status}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Custom Delete Placement Confirmation Modal ───────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Placement Record Removal"
      >
        {deletingPlacement && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Remove Placement Record?</p>
                <p>You are about to remove placement record <strong>"{deletingPlacement.id}"</strong> for <strong>{deletingPlacement.studentName}</strong> ({deletingPlacement.company} - {deletingPlacement.position}).</p>
              </div>
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
