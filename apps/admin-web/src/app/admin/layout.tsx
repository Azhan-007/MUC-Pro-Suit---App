"use client";

import React, { useState } from 'react';
import { useERPStore } from '@/store';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { 
  HelpCircle, Send, Bell, Clock, AlertTriangle, Check, Loader2
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const addStudent = useERPStore((state) => state.addStudent);
  const addFaculty = useERPStore((state) => state.addFaculty);
  const addFeeRecord = useERPStore((state) => state.addFeeRecord);
  const addAnnouncement = useERPStore((state) => state.addAnnouncement);
  const activeRole = useERPStore((state) => state.activeRole);

  // Modal control states
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<'student' | 'faculty' | 'fee' | 'announcement' | null>(null);

  // Support form state
  const [supportText, setSupportText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState<'student' | 'faculty' | 'fee' | 'announcement' | 'support' | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Notifications list
  const notifications = [
    { id: 1, title: 'Automatic Fee Reminders Dispatched', detail: 'Reminders successfully sent to 24 students with overdue balances.', time: '10 mins ago', type: 'fees' },
    { id: 2, title: 'New Semester Schedule Approved', detail: 'The academic routine for Winter term is now live.', time: '2 hours ago', type: 'academic' },
    { id: 3, title: 'Biometric Attendance Sync Complete', detail: '948 student logs synced from block reader devices.', time: '4 hours ago', type: 'attendance' },
  ];

  // Support ticket dispatch handler
  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    const ticketRef = `MUC-TKT-${Math.floor(Math.random() * 9000) + 1000}`;

    setSubmittingForm('support');
    setTimeout(() => {
      showToast(`Support Ticket ${ticketRef} successfully dispatched.`);
      setSupportText('');
      setSubmittingForm(null);
      setIsSupportOpen(false);
    }, 1000);
  };

  // Quick Create submissions
  const handleQuickStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const department = data.get('department') as string;
    const course = data.get('course') as string;

    setSubmittingForm('student');
    setTimeout(() => {
      addStudent({
        name,
        email,
        department,
        course,
        year: 'Year 1',
        status: 'Active',
        attendancePercentage: 100
      });
      setSubmittingForm(null);
      setQuickCreateType(null);
      showToast('Student Profile registered successfully.');
    }, 1000);
  };

  const handleQuickFacultySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const department = data.get('department') as string;
    const course = data.get('course') as string;
    const subject = data.get('subject') as string;

    setSubmittingForm('faculty');
    setTimeout(() => {
      addFaculty({
        name,
        email,
        department,
        course,
        subject,
        time: '09:30 AM',
        status: 'Scheduled'
      });
      setSubmittingForm(null);
      setQuickCreateType(null);
      showToast('Faculty Profile registered successfully.');
    }, 1000);
  };

  const handleQuickFeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const studentName = data.get('studentName') as string;
    const studentId = data.get('studentId') as string;
    const amount = Number(data.get('amount'));
    const method = data.get('method') as string;

    setSubmittingForm('fee');
    setTimeout(() => {
      addFeeRecord({
        studentId,
        studentName,
        initials: studentName.split(' ').map(n => n[0]).join('').toUpperCase(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount,
        method,
        status: 'Paid'
      });
      setSubmittingForm(null);
      setQuickCreateType(null);
      showToast('Fee Payment receipt recorded successfully.');
    }, 1000);
  };

  const handleQuickAnnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = data.get('title') as string;
    const content = data.get('content') as string;

    setSubmittingForm('announcement');
    setTimeout(() => {
      addAnnouncement({
        title,
        content,
        category: 'primary'
      });
      setSubmittingForm(null);
      setQuickCreateType(null);
      showToast('Announcement published successfully.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex font-sans antialiased">
      {/* Sidebar - Fixed Left */}
      <Sidebar onOpenSupport={() => setIsSupportOpen(true)} />

      {/* Main Content Area - Shifted Right */}
      <div className="flex-1 pl-72">
        {/* Header - Fixed Top */}
        <Header 
          onQuickCreate={(type) => setQuickCreateType(type)} 
          onOpenNotifications={() => setIsNotificationsOpen(true)} 
        />

        {/* Scrollable Workspace Container */}
        <main className="pt-24 pb-12 px-8 min-h-[calc(100vh-64px)] max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* Quick Support Ticket Modal */}
      <Modal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        title="Live Support Ticket"
      >
        <form onSubmit={handleSendSupport} className="space-y-4">
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-150 flex gap-3 text-xs text-slate-500 leading-relaxed">
            <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">MUC IT Support Operations</p>
              <p className="mt-1">Describe any latency or administrative questions. Our team will review the ticket immediately.</p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 select-none">Description</label>
            <textarea
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
              placeholder="e.g. Database connection latency in Lab 4..."
              rows={4}
              required
              className="w-full p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <button 
              type="button" 
              onClick={() => setIsSupportOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all active:scale-[0.98] duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Ticket</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Notifications Drawer/Modal */}
      <Modal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        title="Administrative Alerts & Logs"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map(n => (
            <div key={n.id} className="p-4 rounded-lg bg-white border border-slate-200 flex gap-3 hover:border-primary transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-900 leading-tight">{n.title}</h5>
                <p className="text-xs text-slate-600 mt-1 leading-normal">{n.detail}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase mt-3">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{n.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-slate-200 flex justify-end mt-6">
          <button 
            onClick={() => setIsNotificationsOpen(false)}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/95 transition-all text-sm shadow-sm"
          >
            Acknowledge Alerts
          </button>
        </div>
      </Modal>

      {/* Quick Create Dialogs */}
      <Modal 
        isOpen={quickCreateType !== null} 
        onClose={() => setQuickCreateType(null)} 
        title={`Quick Create: ${quickCreateType ? quickCreateType.toUpperCase() : ''}`}
      >
        {quickCreateType === 'student' && (
          <form onSubmit={handleQuickStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Full Name</label>
              <input name="name" required placeholder="e.g. Ahmed Khan" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Email</label>
              <input name="email" type="email" required placeholder="e.g. ahmed.k@muc.edu" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Department</label>
              <input name="department" required placeholder="e.g. Computer Science" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Course Assigned</label>
              <input name="course" required placeholder="e.g. MCA" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <button 
              type="submit" 
              disabled={submittingForm === 'student'}
              className="w-full h-11 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submittingForm === 'student' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Registering Student...</span>
                </>
              ) : (
                <span>Register Profile</span>
              )}
            </button>
          </form>
        )}

        {quickCreateType === 'faculty' && (
          <form onSubmit={handleQuickFacultySubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Full Name</label>
              <input name="name" required placeholder="e.g. Prof. Alan Turing" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Email</label>
              <input name="email" type="email" required placeholder="e.g. alan.t@muc.edu" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Department</label>
              <input name="department" required placeholder="e.g. Artificial Intelligence" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Course Assigned</label>
              <input name="course" required placeholder="e.g. M.Tech AI" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Subject</label>
              <input name="subject" required placeholder="e.g. Neural Networks" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <button 
              type="submit" 
              disabled={submittingForm === 'faculty'}
              className="w-full h-11 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submittingForm === 'faculty' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Registering Faculty...</span>
                </>
              ) : (
                <span>Register Faculty</span>
              )}
            </button>
          </form>
        )}

        {quickCreateType === 'fee' && activeRole !== 'ADMIN' && (
          <form onSubmit={handleQuickFeeSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Student Full Name</label>
              <input name="studentName" required placeholder="e.g. Jane Doe" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Student ID</label>
              <input name="studentId" required placeholder="e.g. S10245" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Amount ($)</label>
              <input name="amount" type="number" required placeholder="e.g. 2500" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Method</label>
              <CustomSelect 
                name="method" 
                defaultValue="UPI"
                options={["UPI", "Card", "Bank Transfer"]}
                className="w-full h-10 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer transition-all shadow-3xs"
              />
            </div>
            <button 
              type="submit" 
              disabled={submittingForm === 'fee'}
              className="w-full h-11 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submittingForm === 'fee' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Recording Payment...</span>
                </>
              ) : (
                <span>Record Payment</span>
              )}
            </button>
          </form>
        )}

        {quickCreateType === 'announcement' && (
          <form onSubmit={handleQuickAnnSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Announcement Title</label>
              <input name="title" required placeholder="e.g. Semester Exam Routine Released" className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 select-none">Content Detail</label>
              <textarea name="content" required placeholder="e.g. End Semester examinations start Nov 20..." rows={4} className="w-full p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium" />
            </div>
            <button 
              type="submit" 
              disabled={submittingForm === 'announcement'}
              className="w-full h-11 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-[0.98] duration-150 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submittingForm === 'announcement' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish</span>
              )}
            </button>
          </form>
        )}
      </Modal>

      {/* Animated success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 border border-slate-800 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm shadow-emerald-500/30">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Success</p>
            <p className="text-xs font-bold text-white mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
