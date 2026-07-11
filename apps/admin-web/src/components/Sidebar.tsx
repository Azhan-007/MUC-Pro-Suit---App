"use client";

import React from 'react';
import { useERPStore } from '../store';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  CalendarCheck, 
  CalendarDays, 
  FileText, 
  Award, 
  Receipt, 
  Megaphone, 
  LineChart, 
  Settings, 
  HelpCircle,
  FolderLock,
  Library,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  onOpenSupport: () => void;
}

export default function Sidebar({ onOpenSupport }: SidebarProps) {
  const activeTab = useERPStore((state) => state.activeTab);
  const setActiveTab = useERPStore((state) => state.setActiveTab);
  const activeRole = useERPStore((state) => state.activeRole);

  const primaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'faculty', label: 'Faculty Management', icon: GraduationCap },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
  ];

  const academicNav = [
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: CalendarDays },
    { id: 'exams', label: 'Examinations', icon: FileText },
    { id: 'results', label: 'Results', icon: Award },
  ];

  // Restrict Fees and Reports from base Admin role
  const administrativeNav = [
    ...(activeRole !== 'ADMIN' ? [{ id: 'fees', label: 'Fees', icon: Receipt }] : []),
    { id: 'library', label: 'Library', icon: Library },
    { id: 'placements', label: 'Placements', icon: Briefcase },
    { id: 'certificates', label: 'Certificates', icon: FolderLock },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    ...(activeRole !== 'ADMIN' ? [{ id: 'reports', label: 'Reports', icon: LineChart }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderLink = (item: { id: string; label: string; icon: React.ComponentType<any> }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group relative ${
          isActive 
            ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
        <span className="font-sans text-sm">{item.label}</span>
        {isActive && (
          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </button>
    );
  };

  return (
    <aside className="w-72 fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col py-6 px-4 z-40 overflow-y-auto">
      {/* Brand Header */}
      <div className="px-2 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg text-slate-900 leading-tight">MUC Pro Suite</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Admin Hub</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          {primaryNav.map(renderLink)}
        </div>

        {/* Academic Control Section */}
        <div className="space-y-1">
          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Academic Control
          </div>
          {academicNav.map(renderLink)}
        </div>

        {/* Administrative Section */}
        <div className="space-y-1">
          <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Administrative
          </div>
          {administrativeNav.map(renderLink)}
        </div>
      </div>

      {/* Footer Support Button */}
      <div className="mt-8 pt-4 border-t border-slate-200">
        <button 
          onClick={onOpenSupport}
          className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 duration-150 shadow-sm"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium">Quick Support</span>
        </button>
      </div>
    </aside>
  );
}
