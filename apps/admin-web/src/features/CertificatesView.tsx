"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  FolderLock, Award, CheckCircle2, Download, FileText, Plus, Trash2, Edit, 
  Eye, Search, Filter, AlertTriangle, UserCheck, X, Check, ShieldCheck, 
  Clock, RotateCcw, AlertCircle, FileCheck
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Certificate } from '../types';

interface CertFormValues {
  studentId: string;
  type: string;
  issueDate: string;
  status: 'Requested' | 'Pending Approval' | 'Approved' | 'Generated' | 'Issued' | 'Rejected';
  remarks?: string;
}

export default function CertificatesView() {
  const store = useERPStore();

  // ── Filters & Search ───────────────────────────────────────────────────
  const [certSearch, setCertSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All Types');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Statuses');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');

  // ── Modals ─────────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCert, setDeletingCert] = useState<Certificate | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // ── Form Hook ──────────────────────────────────────────────────────────
  const { 
    control, register, handleSubmit, reset, setValue, watch, formState: { errors } 
  } = useForm<CertFormValues>({
    defaultValues: {
      type: 'Degree Certificate',
      status: 'Pending Approval',
      issueDate: new Date().toISOString().split('T')[0],
      remarks: 'Clearance verified by Registrar Office.',
    }
  });

  const watchStudentId = watch('studentId');
  const watchType = watch('type');

  // Selected Student Info in Form
  const selectedStudent = useMemo(() => {
    return store.students.find(s => s.id === watchStudentId) || store.students[0];
  }, [watchStudentId, store.students]);

  // Duplicate Request Protection
  const duplicateWarning = useMemo(() => {
    if (!isModalOpen || !watchStudentId || !watchType) return null;

    const duplicate = store.certificates.find(c => 
      c.id !== editingCertId &&
      (c.studentId === watchStudentId || c.studentName === selectedStudent?.name) &&
      c.type.toLowerCase().trim() === watchType.toLowerCase().trim() &&
      c.status !== 'Rejected'
    );

    if (duplicate) {
      return `Active Request Notice: A "${watchType}" request for candidate "${selectedStudent?.name}" already exists (${duplicate.id} - ${duplicate.status}).`;
    }
    return null;
  }, [isModalOpen, watchStudentId, watchType, store.certificates, editingCertId, selectedStudent]);

  // Department Options
  const deptOptions = useMemo(
    () => ["All Departments", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  // Certificate Types Options
  const certTypeOptions = [
    "Degree Certificate",
    "Provisional Certificate",
    "Transfer Certificate",
    "Academic Clearance Letter",
    "Character Certificate",
    "Migration Certificate"
  ];

  // ── Filtered Certificates ──────────────────────────────────────────────
  const filteredCertificates = useMemo(() => {
    const q = (certSearch || store.searchQuery).trim().toLowerCase();

    return store.certificates.filter(cert => {
      const matchType = selectedTypeFilter === 'All Types' || cert.type === selectedTypeFilter;
      const matchStatus = selectedStatusFilter === 'All Statuses' || cert.status === selectedStatusFilter;
      const matchDept = selectedDeptFilter === 'All Departments' || (cert.department || '') === selectedDeptFilter;

      const matchSearch = !q ||
        cert.studentName.toLowerCase().includes(q) ||
        (cert.studentId && cert.studentId.toLowerCase().includes(q)) ||
        cert.type.toLowerCase().includes(q) ||
        cert.id.toLowerCase().includes(q) ||
        (cert.certNumber && cert.certNumber.toLowerCase().includes(q));

      return matchType && matchStatus && matchDept && matchSearch;
    });
  }, [store.certificates, selectedTypeFilter, selectedStatusFilter, selectedDeptFilter, certSearch, store.searchQuery]);

  // ── Derived KPI Metrics ────────────────────────────────────────────────
  const totalCount = store.certificates.length;
  const pendingCount = store.certificates.filter(c => c.status === 'Pending Approval' || c.status === 'Requested').length;
  const approvedCount = store.certificates.filter(c => c.status === 'Approved' || c.status === 'Generated').length;
  const issuedCount = store.certificates.filter(c => c.status === 'Issued').length;

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingCertId(null);
    const firstStudent = store.students[0];
    reset({
      studentId: firstStudent?.id || '',
      type: 'Degree Certificate',
      status: 'Pending Approval',
      issueDate: new Date().toISOString().split('T')[0],
      remarks: 'Clearance verified by Registrar Office.',
    });
    setIsModalOpen(true);
  }, [store.students, reset]);

  const handleOpenEdit = useCallback((cert: Certificate) => {
    setEditingCertId(cert.id);
    const matchedStudent = store.students.find(s => s.id === cert.studentId || s.name === cert.studentName) || store.students[0];

    setValue('studentId', matchedStudent?.id || '');
    setValue('type', cert.type);
    setValue('status', cert.status);
    setValue('issueDate', cert.issueDate);
    setValue('remarks', cert.remarks || 'Clearance verified by Registrar Office.');
    setIsModalOpen(true);
  }, [store.students, setValue]);

  const handleOpenDelete = useCallback((cert: Certificate) => {
    setDeletingCert(cert);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingCert) return;
    store.deleteCertificate(deletingCert.id);
    setIsDeleteModalOpen(false);
    setDeletingCert(null);
  }, [deletingCert, store]);

  const onSubmit = useCallback((values: CertFormValues) => {
    const studentObj = store.students.find(s => s.id === values.studentId) || selectedStudent;

    const payload = {
      ...values,
      studentId: studentObj.id,
      studentName: studentObj.name,
      department: studentObj.department,
      course: studentObj.course,
    };

    if (editingCertId) {
      store.updateCertificate(editingCertId, payload);
    } else {
      store.addCertificate(payload);
    }
    setIsModalOpen(false);
    reset();
  }, [editingCertId, selectedStudent, store, reset]);

  const handleExportPDF = useCallback((cert: Certificate) => {
    setDownloadSuccessToast(`Document Verified: Official PDF Certificate for "${cert.studentName}" compiled & downloaded.`);
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  }, []);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

      {/* ── Page Header Controls ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Certificates</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Student Credentials & Official Certificates
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Degree clearance, academic credential verification, certificate issuance & registrar approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Certificate Request</span>
          </button>
        </div>
      </div>

      {/* ── Live KPI Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Certificate Requests</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{totalCount} Requests</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Across All Credentials</p>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-2xl shrink-0">
            <FolderLock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Pending Approval</p>
            <h3 className="text-2xl font-black text-amber-700 mt-1">{pendingCount} Pending</h3>
            <p className="text-[10px] text-amber-600/80 font-bold mt-0.5">Requires Registrar Review</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center rounded-2xl shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Approved & Generated</p>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{approvedCount} Generated</h3>
            <p className="text-[10px] text-blue-600/80 font-bold mt-0.5">Ready for Distribution</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center rounded-2xl shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Officially Issued</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{issuedCount} Issued</h3>
            <p className="text-[10px] text-emerald-600/80 font-bold mt-0.5">Verified Credentials</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-2xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Credentials
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={certSearch}
                onChange={e => setCertSearch(e.target.value)}
                placeholder="Student name, student ID, cert number, type..."
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {certSearch && (
                <button onClick={() => setCertSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Certificate Type</label>
            <CustomSelect
              value={selectedTypeFilter}
              onChange={e => setSelectedTypeFilter(e.target.value)}
              options={["All Types", ...certTypeOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[160px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
            <CustomSelect
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              options={["All Statuses", "Pending Approval", "Approved", "Generated", "Issued", "Rejected"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
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

          {(selectedTypeFilter !== 'All Types' || selectedStatusFilter !== 'All Statuses' || selectedDeptFilter !== 'All Departments' || certSearch) && (
            <button
              onClick={() => {
                setSelectedTypeFilter('All Types');
                setSelectedStatusFilter('All Statuses');
                setSelectedDeptFilter('All Departments');
                setCertSearch('');
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Certificates Grid Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCertificates.map(cert => (
          <div 
            key={cert.id} 
            className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all group relative overflow-hidden"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <FolderLock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors leading-tight">{cert.type}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Ref: {cert.certNumber || 'MUC-CERT-2026-981240'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                    cert.status === 'Issued'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : cert.status === 'Generated' || cert.status === 'Approved'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : cert.status === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {cert.status}
                  </span>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                    <button 
                      onClick={() => { setViewingCert(cert); setIsDetailsModalOpen(true); }}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(cert)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                      title="Edit Request"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleOpenDelete(cert)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                      title="Cancel Request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
                <p className="text-slate-900 font-bold">Student: {cert.studentName}</p>
                <p className="text-slate-500 text-[11px]">ID: <span className="font-mono">{cert.studentId || 'S10245'}</span> · Dept: {cert.department || 'Computer Science'}</p>
                <p className="text-slate-400 text-[10px] font-mono">Assigned Date: {cert.issueDate}</p>
              </div>
            </div>

            {/* Workflow Control Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-1.5">
                {(cert.status === 'Pending Approval' || cert.status === 'Requested') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => store.updateCertificateStatus(cert.id, 'Approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => store.updateCertificateStatus(cert.id, 'Rejected')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {cert.status === 'Approved' && (
                  <button
                    onClick={() => store.updateCertificateStatus(cert.id, 'Generated')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FileCheck className="w-3 h-3" />
                    <span>Generate Certificate</span>
                  </button>
                )}

                {cert.status === 'Generated' && (
                  <button
                    onClick={() => store.updateCertificateStatus(cert.id, 'Issued')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Mark as Issued</span>
                  </button>
                )}
              </div>

              <button 
                onClick={() => handleExportPDF(cert)}
                disabled={cert.status === 'Pending Approval' || cert.status === 'Rejected'}
                className={`flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg font-bold text-[10px] hover:bg-primary/95 transition-all shadow-xs cursor-pointer ml-auto ${
                  (cert.status === 'Pending Approval' || cert.status === 'Rejected') ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <Download className="w-3 h-3" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        ))}
        {filteredCertificates.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-xs">
            No student credentials match your search or filter criteria.
          </div>
        )}
      </div>

      {/* ── Modal 1: Create / Edit Certificate Modal ─────────────────── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCertId ? "Edit Credential Request Details" : "Provision Student Certificate Request"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Duplicate Request Warning Banner */}
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
              rules={{ required: 'Student selection is required' }}
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
                Certificate Type <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={certTypeOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Request / Issue Date <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('issueDate', { required: 'Issue date is required' })}
                type="text" 
                placeholder="2026-10-15"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Workflow Status
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                  options={["Pending Approval", "Approved", "Generated", "Issued", "Rejected"]}
                  className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Registrar Clearance Remarks / Notes
            </label>
            <textarea
              {...register('remarks')}
              rows={3}
              placeholder="e.g. All library, fee and academic clearances completed."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
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
              {editingCertId ? "Save Certificate Changes" : "Provision Request"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Certificate Details & Verification Sheet Modal ─────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Official Registrar Digital Credential Verification"
      >
        {viewingCert && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px]">
                  Official Credential
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingCert.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingCert.type}</h4>
              <p className="text-slate-500 font-medium">Ref No: <span className="font-mono">{viewingCert.certNumber || 'MUC-CERT-2026-981240'}</span></p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Student Candidate:</span>
                <span className="font-bold text-slate-900">{viewingCert.studentName} ({viewingCert.studentId || 'S10245'})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Department:</span>
                <span className="font-bold text-slate-800">{viewingCert.department || 'Computer Science'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Date Assigned:</span>
                <span className="font-bold font-mono text-slate-800">{viewingCert.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Verification Status:</span>
                <span className="font-bold text-emerald-700">{viewingCert.status}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-bold text-slate-900 mb-1">Registrar Remarks:</p>
              <p className="text-slate-600 leading-relaxed">{viewingCert.remarks || 'Clearance verified by Registrar Office.'}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 h-9 bg-white border border-slate-200 rounded-xl font-bold text-xs cursor-pointer text-slate-600"
              >
                Close Verification Sheet
              </button>
              <button
                onClick={() => {
                  handleExportPDF(viewingCert);
                  setIsDetailsModalOpen(false);
                }}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Export Verified PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Custom Delete Certificate Confirmation Modal ───────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Certificate Request Removal"
      >
        {deletingCert && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Cancel / Remove Certificate Request?</p>
                <p>You are about to cancel credential request <strong>"{deletingCert.type}"</strong> ({deletingCert.id}) for student <strong>{deletingCert.studentName}</strong>.</p>
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
