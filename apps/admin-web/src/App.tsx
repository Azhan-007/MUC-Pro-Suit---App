import React, { useState } from 'react';
import { useERPStore } from './store';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Modal from './components/Modal';

// Views
import DashboardView from './features/DashboardView';
import StudentView from './features/StudentView';
import FacultyView from './features/FacultyView';
import DepartmentsView from './features/DepartmentsView';
import CoursesView from './features/CoursesView';
import AttendanceView from './features/AttendanceView';
import TimetableView from './features/TimetableView';
import ExamsView from './features/ExamsView';
import ResultsView from './features/ResultsView';
import FeesView from './features/FeesView';
import LibraryView from './features/LibraryView';
import PlacementsView from './features/PlacementsView';
import CertificatesView from './features/CertificatesView';
import AnnouncementsView from './features/AnnouncementsView';
import ReportsView from './features/ReportsView';
import SettingsView from './features/SettingsView';

import { 
  Users, GraduationCap, Receipt, Megaphone, 
  HelpCircle, Send, CheckCircle, Bell, Clock 
} from 'lucide-react';

export default function App() {
  const activeTab = useERPStore((state) => state.activeTab);
  const addStudent = useERPStore((state) => state.addStudent);
  const addFaculty = useERPStore((state) => state.addFaculty);
  const addFeeRecord = useERPStore((state) => state.addFeeRecord);
  const addAnnouncement = useERPStore((state) => state.addAnnouncement);

  // Modal control states
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState<'student' | 'faculty' | 'fee' | 'announcement' | null>(null);

  // Support form state
  const [supportText, setSupportText] = useState('');

  // Notifications list
  const notifications = [
    { id: 1, title: 'Automatic Fee Reminders Dispatched', detail: 'Reminders successfully sent to 24 students with overdue balances.', time: '10 mins ago', type: 'fees' },
    { id: 2, title: 'New Semester Schedule Approved', detail: 'The academic routine for Winter term is now live.', time: '2 hours ago', type: 'academic' },
    { id: 3, title: 'Biometric Attendance Sync Complete', detail: '948 student logs synced from block reader devices.', time: '4 hours ago', type: 'attendance' },
  ];

  // Render correct view based on active tab
  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'students':
        return <StudentView />;
      case 'faculty':
        return <FacultyView />;
      case 'departments':
        return <DepartmentsView />;
      case 'courses':
        return <CoursesView />;
      case 'attendance':
        return <AttendanceView />;
      case 'timetable':
        return <TimetableView />;
      case 'exams':
        return <ExamsView />;
      case 'results':
        return <ResultsView />;
      case 'fees':
        return <FeesView />;
      case 'library':
        return <LibraryView />;
      case 'placements':
        return <PlacementsView />;
      case 'certificates':
        return <CertificatesView />;
      case 'announcements':
        return <AnnouncementsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // Support ticket dispatch handler
  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportText.trim()) return;
    alert(`Pro Suite Support Desk: Ticket successfully dispatched to MUC IT Support nodes. Ref: MUC-TKT-${Math.floor(Math.random() * 9000) + 1000}`);
    setSupportText('');
    setIsSupportOpen(false);
  };

  // Quick Create submissions
  const handleQuickStudentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addStudent({
      name: data.get('name') as string,
      email: data.get('email') as string,
      department: data.get('department') as string,
      course: data.get('course') as string,
      year: 'Year 1',
      status: 'Active',
      attendancePercentage: 100
    });
    setQuickCreateType(null);
    alert('Student Profile Registered!');
  };

  const handleQuickFacultySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addFaculty({
      name: data.get('name') as string,
      email: data.get('email') as string,
      department: data.get('department') as string,
      course: data.get('course') as string,
      subject: data.get('subject') as string,
      time: '09:30 AM',
      status: 'Scheduled'
    });
    setQuickCreateType(null);
    alert('Faculty Profile Registered!');
  };

  const handleQuickFeeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('studentName') as string;
    addFeeRecord({
      studentId: data.get('studentId') as string,
      studentName: name,
      initials: name.split(' ').map(n => n[0]).join('').toUpperCase(),
      date: 'Oct 15, 2026',
      amount: Number(data.get('amount')),
      method: data.get('method') as string,
      status: 'Paid'
    });
    setQuickCreateType(null);
    alert('Fee Payment Receipt Recorded!');
  };

  const handleQuickAnnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addAnnouncement({
      title: data.get('title') as string,
      content: data.get('content') as string,
      category: 'primary'
    });
    setQuickCreateType(null);
    alert('Announcement Published!');
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
          {renderView()}
        </main>
      </div>

      {/* Quick Support Ticket Modal */}
      <Modal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        title="Live Support Ticket"
      >
        <form onSubmit={handleSendSupport} className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-3 text-xs text-slate-600 leading-relaxed">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">MUC IT Support Operations</p>
              <p className="mt-1">Describe any latency or administrative questions. Our team will review the ticket immediately.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
            <textarea
              value={supportText}
              onChange={(e) => setSupportText(e.target.value)}
              placeholder="e.g. Database connection latency in Lab 4..."
              rows={4}
              required
              className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all text-slate-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
            <button 
              type="button" 
              onClick={() => setIsSupportOpen(false)}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm shadow-sm flex items-center gap-1.5"
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
            <div key={n.id} className="p-4 rounded-lg bg-white border border-slate-200 flex gap-3 hover:border-blue-600 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm shadow-sm"
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
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
              <input name="name" required placeholder="e.g. Ahmed Khan" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="e.g. ahmed.k@muc.edu" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
              <input name="department" required placeholder="e.g. Computer Science" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Course Assigned</label>
              <input name="course" required placeholder="e.g. MCA" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all">Register Profile</button>
          </form>
        )}

        {quickCreateType === 'faculty' && (
          <form onSubmit={handleQuickFacultySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
              <input name="name" required placeholder="e.g. Prof. Alan Turing" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="e.g. alan.t@muc.edu" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
              <input name="department" required placeholder="e.g. Artificial Intelligence" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Course Assigned</label>
              <input name="course" required placeholder="e.g. M.Tech AI" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subject</label>
              <input name="subject" required placeholder="e.g. Neural Networks" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all">Register Faculty</button>
          </form>
        )}

        {quickCreateType === 'fee' && (
          <form onSubmit={handleQuickFeeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student Full Name</label>
              <input name="studentName" required placeholder="e.g. Jane Doe" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student ID</label>
              <input name="studentId" required placeholder="e.g. S10245" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount ($)</label>
              <input name="amount" type="number" required placeholder="e.g. 2500" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Method</label>
              <select name="method" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900">
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all">Record Payment</button>
          </form>
        )}

        {quickCreateType === 'announcement' && (
          <form onSubmit={handleQuickAnnSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Announcement Title</label>
              <input name="title" required placeholder="e.g. Semester Exam Routine Released" className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content Detail</label>
              <textarea name="content" required placeholder="e.g. End Semester examinations start Nov 20..." rows={4} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 text-slate-900" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-all">Publish</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
