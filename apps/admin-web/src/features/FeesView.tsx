"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  Receipt, Landmark, CreditCard, Send, Search, 
  Plus, Download, Check, HelpCircle, BellRing, Sparkles, 
  TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle,
  Eye, Edit, Trash2, X, SlidersHorizontal, DollarSign, RefreshCw
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { FeeRecord } from '../types';

interface FeeFormValues {
  studentId: string;
  department: string;
  course: string;
  amount: number;
  totalDue: number;
  feeType: string;
  method: string;
  status: 'Paid' | 'Partial' | 'Overdue';
  date: string;
  academicYear: string;
  semester: string;
}

export default function FeesView() {
  const store = useERPStore();

  // ── Filters & Search State ─────────────────────────────────────────────
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'Paid' | 'Partial' | 'Overdue'>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');
  const [selectedFeeTypeFilter, setSelectedFeeTypeFilter] = useState('All Types');
  const [localSearch, setLocalSearch] = useState('');

  // ── Modal States ───────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceiptNo, setEditingReceiptNo] = useState<string | null>(null);

  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFee, setDeletingFee] = useState<FeeRecord | null>(null);

  // Receipt Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingFee, setViewingFee] = useState<FeeRecord | null>(null);

  // ── Form State ─────────────────────────────────────────────────────────
  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FeeFormValues>({
    defaultValues: {
      amount: 2500,
      totalDue: 2500,
      feeType: 'Tuition Fee',
      method: 'UPI',
      status: 'Paid',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      academicYear: '2024-25',
      semester: 'Fall Semester',
    }
  });

  const watchStudentId = watch('studentId');
  const watchDept = watch('department');
  const watchCourse = watch('course');
  const watchAmount = watch('amount');
  const watchTotalDue = watch('totalDue');

  // Dynamic balance calculation preview
  const remainingBalancePreview = useMemo(() => {
    const amt = Number(watchAmount) || 0;
    const due = Number(watchTotalDue) || 0;
    return Math.max(0, due - amt);
  }, [watchAmount, watchTotalDue]);

  // Options from store
  const deptOptions = useMemo(
    () => ["All Departments", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  const courseFilterOptions = useMemo(() => {
    if (selectedDeptFilter === 'All Departments') {
      return ["All Courses", ...store.courses.map(c => c.name)];
    }
    const filtered = store.courses.filter(c => c.department === selectedDeptFilter);
    return ["All Courses", ...(filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name))];
  }, [selectedDeptFilter, store.courses]);

  const modalCourseOptions = useMemo(() => {
    if (!watchDept) return store.courses.map(c => c.name);
    const filtered = store.courses.filter(c => c.department === watchDept);
    return filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name);
  }, [watchDept, store.courses]);

  const feeTypeOptions = ["Tuition Fee", "Semester Fee", "Exam Fee", "Hostel Fee", "Library Fine"];
  const paymentMethodOptions = ["UPI", "Card", "Bank Transfer", "Cash", "Cheque"];

  // ── Dynamic Revenue & Financial KPI Calculations ───────────────────────
  const totalRevenueCollected = useMemo(() => {
    return store.feeRecords.reduce((acc, fee) => acc + (fee.amount || 0), 0);
  }, [store.feeRecords]);

  const totalPendingDues = useMemo(() => {
    return store.feeRecords.reduce((acc, fee) => acc + (fee.remainingBalance || (fee.status === 'Overdue' ? fee.amount : fee.status === 'Partial' ? 1200 : 0)), 0);
  }, [store.feeRecords]);

  const overdueAmount = useMemo(() => {
    return store.feeRecords
      .filter(f => f.status === 'Overdue')
      .reduce((acc, fee) => acc + (fee.remainingBalance || fee.amount), 0);
  }, [store.feeRecords]);

  // ── Filtered Fee Records ───────────────────────────────────────────────
  const filteredFees = useMemo(() => {
    const q = (localSearch || store.searchQuery).trim().toLowerCase();

    return store.feeRecords.filter(fee => {
      const matchesStatusTab = selectedStatusTab === 'all' || fee.status === selectedStatusTab;
      
      const matchesDept = selectedDeptFilter === 'All Departments' || 
        fee.department === selectedDeptFilter ||
        store.students.find(s => s.id === fee.studentId)?.department === selectedDeptFilter;

      const matchesCourse = selectedCourseFilter === 'All Courses' || 
        fee.course === selectedCourseFilter ||
        store.students.find(s => s.id === fee.studentId)?.course === selectedCourseFilter;

      const matchesFeeType = selectedFeeTypeFilter === 'All Types' || (fee.feeType || 'Tuition Fee') === selectedFeeTypeFilter;

      const matchesSearch = !q ||
        fee.studentName.toLowerCase().includes(q) ||
        fee.studentId.toLowerCase().includes(q) ||
        fee.receiptNo.toLowerCase().includes(q) ||
        fee.method.toLowerCase().includes(q) ||
        (fee.feeType && fee.feeType.toLowerCase().includes(q));

      return matchesStatusTab && matchesDept && matchesCourse && matchesFeeType && matchesSearch;
    });
  }, [store.feeRecords, selectedStatusTab, selectedDeptFilter, selectedCourseFilter, selectedFeeTypeFilter, localSearch, store.searchQuery, store.students]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingReceiptNo(null);
    const defaultStudent = store.students[0];

    reset({
      studentId: defaultStudent?.id || 'S10245',
      department: defaultStudent?.department || store.departments[0]?.name || 'Computer Science',
      course: defaultStudent?.course || store.courses[0]?.name || 'B.Tech CS',
      amount: 2500,
      totalDue: 2500,
      feeType: 'Tuition Fee',
      method: 'UPI',
      status: 'Paid',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      academicYear: '2024-25',
      semester: 'Fall Semester',
    });
    setIsModalOpen(true);
  }, [store.students, store.departments, store.courses, reset]);

  const handleOpenEdit = useCallback((fee: FeeRecord) => {
    setEditingReceiptNo(fee.receiptNo);
    setValue('studentId', fee.studentId);
    setValue('department', fee.department || store.students.find(s => s.id === fee.studentId)?.department || 'Computer Science');
    setValue('course', fee.course || store.students.find(s => s.id === fee.studentId)?.course || 'B.Tech CS');
    setValue('amount', fee.amount);
    setValue('totalDue', fee.totalDue || fee.amount);
    setValue('feeType', fee.feeType || 'Tuition Fee');
    setValue('method', fee.method);
    setValue('status', fee.status);
    setValue('date', fee.date);
    setValue('academicYear', fee.academicYear || '2024-25');
    setValue('semester', fee.semester || 'Fall Semester');
    setIsModalOpen(true);
  }, [store.students, setValue]);

  const handleOpenDelete = useCallback((fee: FeeRecord) => {
    setDeletingFee(fee);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingFee) return;
    store.deleteFeeRecord(deletingFee.receiptNo);
    setIsDeleteModalOpen(false);
    setDeletingFee(null);
  }, [deletingFee, store]);

  const onSubmitFee = useCallback((values: FeeFormValues) => {
    const studentObj = store.students.find(s => s.id === values.studentId);
    const studentName = studentObj ? studentObj.name : 'Student';
    const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase();
    const amt = Number(values.amount);
    const totalDue = Number(values.totalDue) || amt;
    const remaining = Math.max(0, totalDue - amt);

    // Auto calculate status if total due is provided
    let calculatedStatus: 'Paid' | 'Partial' | 'Overdue' = values.status;
    if (amt >= totalDue && totalDue > 0) {
      calculatedStatus = 'Paid';
    } else if (amt > 0 && amt < totalDue) {
      calculatedStatus = 'Partial';
    }

    const payload = {
      studentId: values.studentId,
      studentName,
      initials,
      department: values.department,
      course: values.course,
      date: values.date,
      amount: amt,
      totalDue,
      paidAmount: amt,
      remainingBalance: remaining,
      method: values.method,
      status: calculatedStatus,
      feeType: values.feeType,
      academicYear: values.academicYear,
      semester: values.semester,
    };

    if (editingReceiptNo) {
      store.updateFeeRecord(editingReceiptNo, payload);
    } else {
      store.addFeeRecord(payload);
    }
    setIsModalOpen(false);
    reset();
  }, [editingReceiptNo, store, reset]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["Receipt No", "Student ID", "Student Name", "Department", "Course", "Date", "Fee Type", "Amount ($)", "Method", "Status"];
    const rows = filteredFees.map(f => [
      f.receiptNo,
      f.studentId,
      `"${f.studentName}"`,
      `"${f.department || ''}"`,
      `"${f.course || ''}"`,
      `"${f.date}"`,
      `"${f.feeType || 'Tuition Fee'}"`,
      f.amount,
      f.method,
      f.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MUC_Fee_Collection_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredFees]);

  const triggerReminders = useCallback(() => {
    alert("MUC Pro Suite Automatic Fee Reminders: Reminders dispatched to overdue student contacts via SMS, Email, and WhatsApp portals.");
  }, []);

  return (
    <div className="space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Financial</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Fee Management</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Student Fees & Collections
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional fee receipts, payment logging & financial dues reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 h-10 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Record Fee Receipt</span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row with Dynamic Calculations ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Collected Revenue */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Total Revenue Collected</span>
              <Landmark className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">${totalRevenueCollected.toLocaleString()}</h3>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-2">Active Semester real time collection summary</p>
        </div>

        {/* Total Pending Dues */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Pending Dues</span>
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-3xl font-black text-amber-700 tracking-tight">${totalPendingDues.toLocaleString()}</h3>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-6">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }} />
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-2">Uncollected outstanding balance</p>
        </div>

        {/* Overdue with send action button */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Overdue Payments</span>
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-3xl font-black text-rose-700 tracking-tight">${overdueAmount.toLocaleString()}</h3>
          </div>
          <button 
            onClick={triggerReminders}
            className="w-full mt-4 bg-rose-50 text-rose-700 hover:bg-rose-100 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-rose-200 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Automatic Reminders</span>
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar Section ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Receipts
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Receipt No, student name, ID, method..."
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Fee Type</label>
            <CustomSelect
              value={selectedFeeTypeFilter}
              onChange={e => setSelectedFeeTypeFilter(e.target.value)}
              options={["All Types", ...feeTypeOptions]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <CustomSelect
              value={selectedDeptFilter}
              onChange={e => setSelectedDeptFilter(e.target.value)}
              options={deptOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Course Program</label>
            <CustomSelect
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              options={courseFilterOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {(selectedDeptFilter !== 'All Departments' || selectedCourseFilter !== 'All Courses' || selectedFeeTypeFilter !== 'All Types' || localSearch) && (
            <button
              onClick={() => {
                setSelectedDeptFilter('All Departments');
                setSelectedCourseFilter('All Courses');
                setSelectedFeeTypeFilter('All Types');
                setLocalSearch('');
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Main Layout: Receipts Table + Financial Sidebar ─────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Receipts Data Table */}
        <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          {/* Table Header controls & Tabs */}
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/50">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(['all', 'Paid', 'Partial', 'Overdue'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setSelectedStatusTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStatusTab === tab 
                      ? 'bg-white shadow-xs text-primary' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'All Receipts' : tab}
                </button>
              ))}
            </div>

            <span className="text-xs font-bold text-slate-400">
              Showing {filteredFees.length} receipt records
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Receipt No</th>
                  <th className="py-4 px-6">Student Information</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFees.map((fee) => (
                  <tr key={fee.receiptNo} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6 font-bold font-mono text-slate-500">{fee.receiptNo}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {fee.initials}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{fee.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{fee.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{fee.date}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 font-mono">${fee.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{fee.method}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : fee.status === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          fee.status === 'Paid' ? 'bg-emerald-600' : fee.status === 'Partial' ? 'bg-amber-600' : 'bg-rose-600'
                        }`} />
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setViewingFee(fee); setIsDetailsModalOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer"
                          title="View Official Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(fee)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                          title="Edit Receipt"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(fee)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                      No fee records found matching active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Channels Breakdown & Recent Alerts Sidebar */}
        <div className="space-y-6">
          {/* Collection channels progress bars */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h4 className="font-sans font-bold text-base text-slate-900 mb-6">Collection Channels</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>UPI / Instant Online</span>
                  </span>
                  <span className="text-primary font-mono">58%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Debit & Credit Cards</span>
                  </span>
                  <span className="text-secondary font-mono">24%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-slate-400" />
                    <span>Bank Transfers (NEFT/RTGS)</span>
                  </span>
                  <span className="text-emerald-600 font-mono">18%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Financial Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <BellRing className="w-5 h-5 text-primary" />
              <h4 className="font-sans font-bold text-base text-slate-900">Financial Log Alerts</h4>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex gap-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">High-value Payment Logged</p>
                  <p className="text-slate-600 mt-0.5">Ahmed Khan completed total MCA semester payment of $2,500.</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Auto-reminder Dispatched</p>
                  <p className="text-slate-600 mt-0.5">Payment reminder sent to overdue students for upcoming fee deadline.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-3">
                <Landmark className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Bank Reconciliation Sync</p>
                  <p className="text-slate-600 mt-0.5">UPI & Gateway portals synchronized with internal ledger.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal 1: Record / Edit Fee Receipt Modal ──────────────────── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingReceiptNo ? `Modify Receipt (${editingReceiptNo})` : "Record Official Fee Receipt"}
      >
        <form onSubmit={handleSubmit(onSubmitFee)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Select Registered Student <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="studentId"
              control={control}
              rules={{ required: 'Student selection is required' }}
              render={({ field }) => (
                <CustomSelect
                  value={field.value}
                  onChange={e => {
                    const id = typeof e === 'string' ? e : e?.target?.value;
                    field.onChange(id);
                    const std = store.students.find(s => s.id === id);
                    if (std) {
                      setValue('department', std.department);
                      setValue('course', std.course);
                    }
                  }}
                  options={store.students.map(s => `${s.name} (${s.id})`)}
                  className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={store.departments.map(d => d.name)}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Course Program
              </label>
              <Controller
                name="course"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={modalCourseOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Fee Category / Type <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="feeType"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={feeTypeOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={paymentMethodOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Paid Amount ($) <span className="text-rose-500">*</span>
              </label>
              <input 
                {...register('amount', { 
                  required: 'Amount is required', 
                  min: { value: 1, message: 'Amount must be > 0' } 
                })}
                type="number" 
                placeholder="2500"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.amount && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Total Fee Due ($)
              </label>
              <input 
                {...register('totalDue', { 
                  required: 'Total due is required', 
                  min: { value: 1, message: 'Total due must be > 0' } 
                })}
                type="number" 
                placeholder="2500"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          {/* Remaining Balance Summary Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Calculated Remaining Balance:</span>
            <span className="font-bold font-mono text-slate-900">${remainingBalancePreview.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Paid", "Partial", "Overdue"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Payment Date
              </label>
              <input 
                {...register('date', { required: 'Date is required' })}
                type="text" 
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
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
              {editingReceiptNo ? "Save Receipt Changes" : "Record Receipt"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Official Fee Receipt Details Modal ──────────────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Official Fee Payment Receipt"
      >
        {viewingFee && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] uppercase border border-emerald-200">
                  Official Receipt
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingFee.receiptNo}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingFee.studentName}</h4>
              <p className="text-slate-500 font-mono">Student ID: {viewingFee.studentId}</p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Fee Category:</span>
                <span className="font-bold text-slate-900">{viewingFee.feeType || 'Tuition Fee'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Payment Date:</span>
                <span className="font-bold text-slate-800">{viewingFee.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Amount Paid:</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">${viewingFee.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Payment Method:</span>
                <span className="font-bold text-slate-800">{viewingFee.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Payment Status:</span>
                <span className="font-bold text-slate-800">{viewingFee.status}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Custom Delete Receipt Confirmation Modal ─────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Receipt Deletion"
      >
        {deletingFee && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Delete Fee Payment Receipt?</p>
                <p>You are about to delete receipt <strong>{deletingFee.receiptNo}</strong> for <strong>{deletingFee.studentName}</strong> (${deletingFee.amount}).</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono">
              <p><strong>Receipt No:</strong> {deletingFee.receiptNo}</p>
              <p><strong>Student ID:</strong> {deletingFee.studentId}</p>
              <p><strong>Amount:</strong> ${deletingFee.amount}</p>
              <p><strong>Method:</strong> {deletingFee.method}</p>
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
