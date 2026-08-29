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
  Briefcase,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onOpenSupport: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onOpenSupport, isOpen = false, onClose }: SidebarProps) {
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

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  const renderLink = (item: { id: string; label: string; icon: any }) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => handleNavClick(item.id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group relative overflow-hidden cursor-pointer ${
          isActive 
            ? 'text-primary font-bold' 
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title={`Go to ${item.label} module`}
      >
        {/* Smooth active background transition */}
        <div 
          className={`absolute inset-0 bg-primary/8 rounded-lg transition-all duration-150 ease-out ${
            isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`} 
        />

        {/* Hover background for inactive items */}
        {!isActive && (
          <div className="absolute inset-0 bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />
        )}

        {/* Left vertical indicator slide-in */}
        <div 
          className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-primary transition-all duration-150 ease-out origin-left ${
            isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
          }`} 
        />

        <div className="relative z-10 flex items-center gap-2.5 w-full">
          <Icon className={`w-4.5 h-4.5 transition-all duration-150 group-hover:scale-110 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span className="font-sans text-sm">{item.label}</span>
          {isActive && (
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200" 
        />
      )}

      <aside className={`w-72 fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col py-4 px-3 z-40 overflow-y-auto transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="px-2 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-base text-slate-900 leading-tight">MUC Pro Suite</h1>
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Admin Hub</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 space-y-4">
          {/* Main Section */}
          <div className="space-y-0.5">
            {primaryNav.map(renderLink)}
          </div>

          {/* Academic Control Section */}
          <div className="space-y-0.5">
            <div className="px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Academic Control
            </div>
            {academicNav.map(renderLink)}
          </div>

          {/* Administrative Section */}
          <div className="space-y-0.5">
            <div className="px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Administrative
            </div>
            {administrativeNav.map(renderLink)}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
          <button 
            onClick={() => {
              onOpenSupport();
              if (onClose) onClose();
            }}
            className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 duration-150 shadow-sm"
            title="Contact institutional helpdesk & quick support"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-medium">Quick Support</span>
          </button>
          <button 
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-95 duration-150 shadow-sm text-xs"
            title="Securely log out from current session"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
