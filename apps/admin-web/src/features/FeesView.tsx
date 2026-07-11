"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { 
  Receipt, Landmark, CreditCard, Send, Search, 
  Plus, Download, Check, HelpCircle, BellRing, Sparkles, 
  TrendingUp, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle
} from 'lucide-react';
import Modal from '../components/Modal';

interface FeeFormValues {
  studentName: string;
  studentId: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Partial' | 'Overdue';
  date: string;
}

export default function FeesView() {
  const store = useERPStore();
  const [selectedTab, setSelectedTab] = useState<'all' | 'Paid' | 'Partial' | 'Overdue'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FeeFormValues>({
    defaultValues: {
      status: 'Paid',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  });

  const onSubmitFee = (values: FeeFormValues) => {
    store.addFeeRecord({
      studentId: values.studentId,
      studentName: values.studentName,
      initials: values.studentName.split(' ').map(n => n[0]).join('').toUpperCase(),
      date: values.date,
      amount: Number(values.amount),
      method: values.method,
      status: values.status
    });
    setIsModalOpen(false);
    reset();
  };

  const filteredFees = store.feeRecords.filter(fee => {
    const matchesTab = selectedTab === 'all' || fee.status === selectedTab;
    const matchesSearch = store.searchQuery === '' ||
      fee.studentName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      fee.receiptNo.toLowerCase().includes(store.searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalDues = 140250;
  const collected = 325400;
  const overdue = 48150;

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Receipt No,Student ID,Student Name,Date,Amount,Method,Status"].join(",") + "\n"
      + store.feeRecords.map(f => `${f.receiptNo},${f.studentId},${f.studentName},${f.date},${f.amount},${f.method},${f.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MUC_Fee_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerReminders = () => {
    alert("Pro Suite Automatic Fee Reminders: Reminders dispatched to 24 overdue students via registered WhatsApp and email handles.");
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Dashboard</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Fee Management</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Fee Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Semester Filters loaded: Autumn 2026 active.")}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-white hover:bg-surface-container rounded-xl text-sm font-bold text-on-surface-variant transition-colors"
          >
            <span>Semester: Fall 2026</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Record Fee Receipt</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row with Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Dues */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase text-outline tracking-wider">Total Dues</span>
              <Landmark className="w-5 h-5 text-outline" />
            </div>
            <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">${totalDues.toLocaleString()}</h3>
          </div>
          <div className="h-1 bg-surface-container-high rounded-full overflow-hidden mt-6">
            <div className="h-full bg-primary" style={{ width: '40%' }} />
          </div>
          <p className="text-[10px] text-on-surface-variant font-bold mt-2">Active Semester target collection rate</p>
        </div>

        {/* Collected Target progress bar */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase text-outline tracking-wider">Collected</span>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-3xl font-extrabold text-on-surface tracking-tight">${collected.toLocaleString()}</h3>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-[10px] font-bold text-outline uppercase">
              <span>Progress: 72.3%</span>
              <span>Target: $450k</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72.3%' }} />
            </div>
          </div>
        </div>

        {/* Overdue with send action button */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase text-outline tracking-wider">Overdue</span>
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <h3 className="text-3xl font-extrabold text-error tracking-tight">${overdue.toLocaleString()}</h3>
          </div>
          <button 
            onClick={triggerReminders}
            className="w-full mt-4 bg-error-container text-on-error-container py-2.5 rounded-xl font-bold text-xs hover:bg-error-container/80 transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-error/10"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Automatic Reminders</span>
          </button>
        </div>
      </div>

      {/* Main Content: Receipts table + Channels sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Receipts Data Table */}
        <div className="xl:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          {/* Table Header controls */}
          <div className="border-b border-outline-variant/50 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-surface">
            <div className="flex bg-surface-container p-1 rounded-lg">
              <button 
                onClick={() => setSelectedTab('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  selectedTab === 'all' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Receipts
              </button>
              <button 
                onClick={() => setSelectedTab('Paid')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  selectedTab === 'Paid' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Paid
              </button>
              <button 
                onClick={() => setSelectedTab('Partial')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  selectedTab === 'Partial' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Partial
              </button>
              <button 
                onClick={() => setSelectedTab('Overdue')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  selectedTab === 'Overdue' 
                    ? 'bg-white shadow-sm text-primary' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Overdue
              </button>
            </div>

            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant bg-white hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-outline" />
              <span>Export Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/60">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Receipt No</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student ID</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student Name</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Method</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                {filteredFees.map((fee) => (
                  <tr key={fee.receiptNo} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 font-bold font-mono text-on-surface-variant">{fee.receiptNo}</td>
                    <td className="py-4 px-6 text-on-surface font-mono">{fee.studentId}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {fee.initials}
                        </div>
                        <span className="font-bold text-on-surface">{fee.studentName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant">{fee.date}</td>
                    <td className="py-4 px-6 font-bold text-on-surface">${fee.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{fee.method}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                          : fee.status === 'Partial'
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                          : 'bg-error/10 text-error border-error/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          fee.status === 'Paid' ? 'bg-emerald-600' : fee.status === 'Partial' ? 'bg-amber-600' : 'bg-error'
                        }`} />
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredFees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                      No fee records found matching active query filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Channels breakdown and alerts */}
        <div className="space-y-8">
          {/* Collection channels progress bars */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h4 className="font-sans font-bold text-base text-on-surface mb-6">Collection Channels</h4>
            <div className="space-y-4">
              {/* UPI */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>UPI / Instant Payments</span>
                  </span>
                  <span className="text-primary">58%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              {/* Card */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-outline" />
                    <span>Debit & Credit Cards</span>
                  </span>
                  <span className="text-secondary">24%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              {/* Bank transfer */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-outline" />
                    <span>Bank Transfers (NEFT/RTGS)</span>
                  </span>
                  <span className="text-tertiary">18%</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BellRing className="w-5 h-5 text-primary" />
              <h4 className="font-sans font-bold text-base text-on-surface">Recent Fee Alerts</h4>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex gap-3">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-on-surface">High-value Payment Detected</p>
                  <p className="text-on-surface-variant mt-0.5">Ahmed Khan completed total MCA semester payment of $2,500.</p>
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-on-surface">Auto-reminder Sent</p>
                  <p className="text-on-surface-variant mt-0.5">Payment reminder dispatched to Chen Wei (#S10342) for overdue $3,800.</p>
                </div>
              </div>

              <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 flex gap-3">
                <Landmark className="w-4 h-4 text-outline shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-on-surface">Bank Reconciliation Completed</p>
                  <p className="text-on-surface-variant mt-0.5">UPI and NEFT portals fully balanced for Oct 15 transaction cycle.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Fee Modal Dialog */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Fee Payment Receipt">
        <form onSubmit={handleSubmit(onSubmitFee)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Student Full Name</label>
            <input 
              {...register('studentName', { required: 'Student Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              type="text" 
              placeholder="e.g. Jane Doe"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.studentName && <p className="text-xs text-error mt-1 font-bold">{errors.studentName.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Student ID</label>
            <input 
              {...register('studentId', { required: 'Student ID is required' })}
              type="text" 
              placeholder="e.g. S10245"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.studentId && <p className="text-xs text-error mt-1 font-bold">{errors.studentId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Amount ($)</label>
              <input 
                {...register('amount', { required: 'Amount is required', min: { value: 1, message: 'Must be > 0' } })}
                type="number" 
                placeholder="e.g. 2500"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.amount && <p className="text-xs text-error mt-1 font-bold">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Payment Method</label>
              <select 
                {...register('method', { required: 'Method is required' })}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Payment Status</label>
              <select 
                {...register('status')}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Date</label>
              <input 
                {...register('date', { required: 'Date is required' })}
                type="text" 
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.date && <p className="text-xs text-error mt-1 font-bold">{errors.date.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-surface hover:bg-surface-container-high border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
            >
              Record Receipt
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

