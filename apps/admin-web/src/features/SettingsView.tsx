"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  Settings, Shield, Server, Database, Save, CheckCircle2, Building2, Calendar, 
  Clock, DollarSign, BookOpen, Bell, Lock, Eye, Download, Search, Filter, 
  RotateCcw, Plus, Trash2, Edit, AlertTriangle, Layers, UserCheck, X, FileText
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { SecurityLog } from '../types';

export default function SettingsView() {
  const store = useERPStore();

  // ── Active Settings Tab ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<
    'institution' | 'academic' | 'attendance' | 'fees' | 'exams' | 'notifications' | 'security' | 'audit'
  >('institution');

  // ── Notification Feedback Toast ───────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Tab 1: Institution Settings State ─────────────────────────────────
  const [instName, setInstName] = useState('Mazharul Uloom College Autonomous');
  const [instCode, setInstCode] = useState('MUC-AUT-091');
  const [adminEmail, setAdminEmail] = useState('masteradmin@muc.edu');
  const [phone, setPhone] = useState('+91 4174 242 531');
  const [address, setAddress] = useState('Ambur, Tamil Nadu 635802, India');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // ── Tab 2: Academic Config State ──────────────────────────────────────
  const [academicYears, setAcademicYears] = useState(['2026-27', '2025-26', '2024-25']);
  const [newYearInput, setNewYearInput] = useState('');
  const [semestersList, setSemestersList] = useState(['Fall Semester', 'Spring Semester', 'Summer Term']);
  const [newSemInput, setNewSemInput] = useState('');

  // ── Tab 3: Attendance Policy State ────────────────────────────────────
  const [minAttendancePct, setMinAttendancePct] = useState(75);
  const [warningPct, setWarningPct] = useState(75);
  const [criticalPct, setCriticalPct] = useState(60);
  const [gracePeriodMins, setGracePeriodMins] = useState(15);

  // ── Tab 4: Fee Config State ───────────────────────────────────────────
  const [feeTypes, setFeeTypes] = useState(['Tuition Fee', 'Semester Fee', 'Exam Fee', 'Hostel Fee', 'Library Fine', 'Lab Fee']);
  const [newFeeType, setNewFeeType] = useState('');

  // ── Tab 5: Exam Config State ──────────────────────────────────────────
  const [examDurationMins, setExamDurationMins] = useState(180);
  const [passingPct, setPassingPct] = useState(40);
  const [maxMarks, setMaxMarks] = useState(100);
  const [examTypes, setExamTypes] = useState(['Semester End', 'Midterm Internal', 'Practical Lab', 'Viva Voice']);
  const [newExamType, setNewExamType] = useState('');

  // ── Tab 6: Notifications Preferences ──────────────────────────────────
  const [notifAnnouncements, setNotifAnnouncements] = useState(true);
  const [notifAttendance, setNotifAttendance] = useState(true);
  const [notifFees, setNotifFees] = useState(true);
  const [notifExams, setNotifExams] = useState(true);
  const [notifResults, setNotifResults] = useState(true);
  const [notifCertificates, setNotifCertificates] = useState(true);

  // ── Tab 7: Security Settings ──────────────────────────────────────────
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(30);
  const [failedLoginThreshold, setFailedLoginThreshold] = useState(5);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);

  // ── Tab 8: Security Audit Logs Filters & Modals ────────────────────────
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedAuditCatFilter, setSelectedAuditCatFilter] = useState('All Categories');
  const [selectedAuditStatusFilter, setSelectedAuditStatusFilter] = useState('All Statuses');

  const [isPreviewLogModalOpen, setIsPreviewLogModalOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState<SecurityLog | null>(null);

  // ── Filtered Audit Logs ────────────────────────────────────────────────
  const filteredSecurityLogs = useMemo(() => {
    const q = (auditSearch || store.searchQuery).trim().toLowerCase();

    return store.securityLogs.filter(log => {
      const matchCat = selectedAuditCatFilter === 'All Categories' || log.category === selectedAuditCatFilter;
      const matchStatus = selectedAuditStatusFilter === 'All Statuses' || log.status === selectedAuditStatusFilter;

      const matchSearch = !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q);

      return matchCat && matchStatus && matchSearch;
    });
  }, [store.securityLogs, selectedAuditCatFilter, selectedAuditStatusFilter, auditSearch, store.searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    // // TODO: Backend Integration
    showToast("Institution Settings saved and replicated across ERP modules.");
  };

  const handleAddAcademicYear = () => {
    if (!newYearInput.trim()) return;
    if (academicYears.includes(newYearInput.trim())) {
      alert("Academic Year already exists.");
      return;
    }
    setAcademicYears([...academicYears, newYearInput.trim()]);
    setNewYearInput('');
    showToast(`Added Academic Year "${newYearInput.trim()}".`);
  };

  const handleAddSemester = () => {
    if (!newSemInput.trim()) return;
    if (semestersList.includes(newSemInput.trim())) {
      alert("Semester term already exists.");
      return;
    }
    setSemestersList([...semestersList, newSemInput.trim()]);
    setNewSemInput('');
    showToast(`Added Semester Term "${newSemInput.trim()}".`);
  };

  const handleSaveAttendancePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    // // TODO: Backend Integration
    showToast(`Attendance Policy updated: Minimum threshold set to ${minAttendancePct}%.`);
  };

  const handleAddFeeType = () => {
    if (!newFeeType.trim()) return;
    if (feeTypes.map(f => f.toLowerCase()).includes(newFeeType.trim().toLowerCase())) {
      alert("Fee category already exists.");
      return;
    }
    setFeeTypes([...feeTypes, newFeeType.trim()]);
    setNewFeeType('');
    showToast(`Added Fee Category "${newFeeType.trim()}".`);
  };

  const handleRemoveFeeType = (typeToRemove: string) => {
    setFeeTypes(feeTypes.filter(f => f !== typeToRemove));
    showToast(`Removed Fee Category "${typeToRemove}".`);
  };

  const handleSaveExamsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    // // TODO: Backend Integration
    showToast(`Exam Configurations saved: Passing threshold set to ${passingPct}%.`);
  };

  const handleAddExamType = () => {
    if (!newExamType.trim()) return;
    if (examTypes.map(e => e.toLowerCase()).includes(newExamType.trim().toLowerCase())) {
      alert("Exam type already exists.");
      return;
    }
    setExamTypes([...examTypes, newExamType.trim()]);
    setNewExamType('');
    showToast(`Added Exam Type "${newExamType.trim()}".`);
  };

  const handleSaveNotifications = () => {
    showToast("Notification Preferences updated successfully.");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    // // TODO: Backend/Auth Integration
    showToast("Master Admin Security Controls updated.");
  };

  const handleExportAuditCSV = () => {
    let csvContent = `data:text/csv;charset=utf-8,Log ID,Timestamp,Actor,Action,Category,Status,IP Address\n`;
    filteredSecurityLogs.forEach(l => {
      csvContent += `"${l.id}","${l.timestamp}","${l.user}","${l.action.replace(/"/g, '""')}","${l.category}","${l.status}","${l.ipAddress}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MUC_Security_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Exported Security Audit Trail to CSV file.");
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Page Header & Navigation ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Settings</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Master Admin System Control Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional parameters, policy controls, academic configurations & security audit trail
          </p>
        </div>
      </div>

      {/* ── Control Center Navigation Tabs ───────────────────────────── */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('institution')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'institution' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institution</span>
        </button>

        <button
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'academic' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Academic Config</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'attendance' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance Policy</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'fees' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Fee Config</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'exams' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Exam Config</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'notifications' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Audit Logs ({store.securityLogs.length})</span>
        </button>
      </div>

      {/* ── TAB 1: INSTITUTION SETTINGS ───────────────────────────────── */}
      {activeTab === 'institution' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl">
          <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Institutional Identity & Profile Configurations</span>
          </h3>

          <form onSubmit={handleSaveInstitution} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  College Name
                </label>
                <input
                  value={instName}
                  onChange={e => setInstName(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Institutional College Code
                </label>
                <input
                  value={instCode}
                  onChange={e => setInstCode(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Master Admin Email Node
                </label>
                <input
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  type="email"
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Institutional Contact Phone
                </label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Official Campus Address
              </label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Institution Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 2: ACADEMIC CONFIGURATION ─────────────────────────────── */}
      {activeTab === 'academic' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl space-y-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Academic Year & Semester Term Configuration</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Academic Year Selection */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Current Active Academic Session
              </label>
              <CustomSelect
                value={store.academicYear}
                onChange={e => {
                  store.setAcademicYear(e.target.value);
                  showToast(`Active Academic Session changed to ${e.target.value}.`);
                }}
                options={academicYears}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-slate-500">Determines the active session across courses, enrollment & fee calculations.</p>
            </div>

            {/* Active Semester Selection */}
            <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Current Active Term / Semester
              </label>
              <CustomSelect
                value={store.semester}
                onChange={e => {
                  store.setSemester(e.target.value);
                  showToast(`Active Term changed to ${e.target.value}.`);
                }}
                options={semestersList}
                className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-slate-500">Determines current timetable slots & examination schedules.</p>
            </div>
          </div>

          {/* Add New Academic Session */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Add New Academic Year Option</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newYearInput}
                onChange={e => setNewYearInput(e.target.value)}
                placeholder="e.g. 2027-28"
                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
              <button
                onClick={handleAddAcademicYear}
                className="px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Year</span>
              </button>
            </div>
          </div>

          {/* Add New Semester Term */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Add New Semester Term Option</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSemInput}
                onChange={e => setNewSemInput(e.target.value)}
                placeholder="e.g. Winter Trimester"
                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              <button
                onClick={handleAddSemester}
                className="px-4 h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Term</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ATTENDANCE POLICY ──────────────────────────────────── */}
      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl">
          <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Institutional Student Attendance Threshold Policies</span>
          </h3>

          <form onSubmit={handleSaveAttendancePolicy} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Minimum Exam Clearance Attendance (%)
                </label>
                <input
                  type="number"
                  value={minAttendancePct}
                  onChange={e => setMinAttendancePct(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Low Attendance Warning Threshold (%)
                </label>
                <input
                  type="number"
                  value={warningPct}
                  onChange={e => setWarningPct(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Critical Shortage Threshold (%)
                </label>
                <input
                  type="number"
                  value={criticalPct}
                  onChange={e => setCriticalPct(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Late Marking Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  value={gracePeriodMins}
                  onChange={e => setGracePeriodMins(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setMinAttendancePct(75);
                  setWarningPct(75);
                  setCriticalPct(60);
                  setGracePeriodMins(15);
                  showToast("Attendance Policy reset to institutional defaults (75%).");
                }}
                className="px-4 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Reset Defaults
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Attendance Policy</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 4: FEE CONFIGURATION ──────────────────────────────────── */}
      {activeTab === 'fees' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl space-y-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Institutional Fee Structures & Category Configurations</span>
          </h3>

          <div className="space-y-3">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Active Institutional Fee Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {feeTypes.map((type, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                  <span>{type}</span>
                  <button
                    onClick={() => handleRemoveFeeType(type)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Remove Category"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Add Custom Fee Category</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeeType}
                onChange={e => setNewFeeType(e.target.value)}
                placeholder="e.g. Sports & Activity Fee"
                className="flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              <button
                onClick={handleAddFeeType}
                className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: EXAM CONFIGURATION ─────────────────────────────────── */}
      {activeTab === 'exams' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl space-y-6">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Examination Parameters & Evaluation Thresholds</span>
          </h3>

          <form onSubmit={handleSaveExamsConfig} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Default Exam Duration (Mins)
                </label>
                <input
                  type="number"
                  value={examDurationMins}
                  onChange={e => setExamDurationMins(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Passing Threshold Percentage (%)
                </label>
                <input
                  type="number"
                  value={passingPct}
                  onChange={e => setPassingPct(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono font-bold focus:outline-none focus:border-primary text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Standard Maximum Marks
                </label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={e => setMaxMarks(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Exam Parameters</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 6: NOTIFICATION PREFERENCES ───────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl space-y-5">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>Institutional Broadcast & System Alerts</span>
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Broadcast Announcements Notifications</p>
                <p className="text-slate-500">Send instant alerts for primary system notices & events</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifAnnouncements} 
                onChange={e => setNotifAnnouncements(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer" 
              />
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Low Attendance Warning Alerts</p>
                <p className="text-slate-500">Trigger alerts when a student drops below 75% attendance</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifAttendance} 
                onChange={e => setNotifAttendance(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer" 
              />
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Overdue Fee Payment Alerts</p>
                <p className="text-slate-500">Notify Master Admin for overdue fee receipts & installments</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifFees} 
                onChange={e => setNotifFees(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer" 
              />
            </div>

            <div className="py-3.5 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Examination Schedule & Room Reminders</p>
                <p className="text-slate-500">Broadcast exam timetables & room allocation changes</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifExams} 
                onChange={e => setNotifExams(e.target.checked)} 
                className="w-4 h-4 accent-primary cursor-pointer" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 7: SECURITY SETTINGS ──────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs max-w-3xl">
          <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-600" />
            <span>Master Admin Security Controls & Audit Logging</span>
          </h3>

          <form onSubmit={handleSaveSecurity} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Session Timeout Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeoutMins}
                  onChange={e => setSessionTimeoutMins(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono font-bold focus:outline-none focus:border-primary text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Failed Login Attempt Lockout Threshold
                </label>
                <input
                  type="number"
                  value={failedLoginThreshold}
                  onChange={e => setFailedLoginThreshold(Number(e.target.value))}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono font-bold focus:outline-none focus:border-primary text-rose-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Security Controls</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 8: AUDIT LOGS & TRAIL ─────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>Security Audit Trail & Master Administrative Logs ({store.securityLogs.length})</span>
              </h3>
              <p className="text-xs text-slate-500">Immutable ledger of administrative mutations, auth attempts & financial transactions</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportAuditCSV}
                className="flex items-center gap-1.5 px-4 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Audit Search & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Search Audit Logs</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    placeholder="User email, action, log ID, IP..."
                    className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-900"
                  />
                  {auditSearch && (
                    <button onClick={() => setAuditSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-w-[150px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                <CustomSelect
                  value={selectedAuditCatFilter}
                  onChange={e => setSelectedAuditCatFilter(e.target.value)}
                  options={["All Categories", "SECURITY", "ACADEMIC", "FINANCIAL", "AUTH", "DATABASE"]}
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="min-w-[140px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <CustomSelect
                  value={selectedAuditStatusFilter}
                  onChange={e => setSelectedAuditStatusFilter(e.target.value)}
                  options={["All Statuses", "SUCCESS", "WARNING", "FAILED"]}
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {(selectedAuditCatFilter !== 'All Categories' || selectedAuditStatusFilter !== 'All Statuses' || auditSearch) && (
                <button
                  onClick={() => {
                    setSelectedAuditCatFilter('All Categories');
                    setSelectedAuditStatusFilter('All Statuses');
                    setAuditSearch('');
                  }}
                  className="h-9 px-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Security Audit Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Log ID</th>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Actor / User</th>
                    <th className="py-4 px-6">Action Performed</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">IP Address</th>
                    <th className="py-4 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {filteredSecurityLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-500">{log.id}</td>
                      <td className="py-4 px-6 text-slate-400">{log.timestamp}</td>
                      <td className="py-4 px-6 font-bold text-slate-800">{log.user}</td>
                      <td className="py-4 px-6 font-sans text-slate-900 font-medium">{log.action}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                          {log.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.status === 'FAILED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{log.ipAddress}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => { setViewingLog(log); setIsPreviewLogModalOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                          title="View Log Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSecurityLogs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium font-sans">
                        No security audit logs match your search or filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Audit Log Details View Modal ───────────────────────── */}
      <Modal
        isOpen={isPreviewLogModalOpen}
        onClose={() => setIsPreviewLogModalOpen(false)}
        title="Security Audit Log Details"
      >
        {viewingLog && (
          <div className="space-y-4 text-xs font-mono text-slate-700">
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold">
                  {viewingLog.category}
                </span>
                <span className="text-slate-400 font-bold">{viewingLog.id}</span>
              </div>
              <p className="font-bold text-sm text-white pt-1">{viewingLog.action}</p>
              <p className="text-slate-400 text-[10px]">{viewingLog.timestamp}</p>
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 py-3 font-sans">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Actor / Initiator:</span>
                <span className="font-bold text-slate-900 font-mono">{viewingLog.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Action Status:</span>
                <span className="font-bold text-emerald-700">{viewingLog.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">IP Node Address:</span>
                <span className="font-bold text-slate-800 font-mono">{viewingLog.ipAddress}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 font-sans">
              <button
                onClick={() => setIsPreviewLogModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Audit Entry
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
