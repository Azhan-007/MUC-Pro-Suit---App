"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useERPStore } from '../store';
import { Search, Bell, Grid, Plus, Shield, User, GraduationCap, Users, Menu } from 'lucide-react';
import { CustomSelect } from './ui/CustomSelect';

interface HeaderProps {
  onQuickCreate: (type: 'student' | 'faculty' | 'fee' | 'announcement') => void;
  onOpenNotifications: () => void;
  onToggleMobileSidebar?: () => void;
}

export default function Header({ onQuickCreate, onOpenNotifications, onToggleMobileSidebar }: HeaderProps) {
  const { 
    searchQuery, setSearchQuery, 
    academicYear, setAcademicYear, 
    semester, setSemester,
    activeRole, setActiveRole
  } = useERPStore();

  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState(false);
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [mounted, setMounted] = useState(false);

  const quickCreateBtnRef = useRef<HTMLButtonElement>(null);
  const appLauncherBtnRef = useRef<HTMLButtonElement>(null);
  const [quickCreateStyle, setQuickCreateStyle] = useState<React.CSSProperties>({});
  const [appLauncherStyle, setAppLauncherStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateQuickCreatePos = useCallback(() => {
    if (!quickCreateBtnRef.current) return;
    const rect = quickCreateBtnRef.current.getBoundingClientRect();
    setQuickCreateStyle({
      position: 'fixed',
      top: `${rect.bottom + 6}px`,
      right: `${window.innerWidth - rect.right}px`,
      zIndex: 9999,
    });
  }, []);

  const updateAppLauncherPos = useCallback(() => {
    if (!appLauncherBtnRef.current) return;
    const rect = appLauncherBtnRef.current.getBoundingClientRect();
    setAppLauncherStyle({
      position: 'fixed',
      top: `${rect.bottom + 6}px`,
      right: `${window.innerWidth - rect.right}px`,
      zIndex: 9999,
    });
  }, []);

  const toggleQuickCreate = () => {
    if (!showQuickCreateMenu) {
      updateQuickCreatePos();
      setShowQuickCreateMenu(true);
      setShowAppLauncher(false);
    } else {
      setShowQuickCreateMenu(false);
    }
  };

  const toggleAppLauncher = () => {
    if (!showAppLauncher) {
      updateAppLauncherPos();
      setShowAppLauncher(true);
      setShowQuickCreateMenu(false);
    } else {
      setShowAppLauncher(false);
    }
  };

  const academicYearsList = ['2024-25', '2023-24', '2022-23'];
  const semestersList = ['Fall Semester', 'Spring Semester', 'Summer Term'];

  // Formatted role options to avoid raw underscore string truncation
  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MASTER_ADMIN', label: 'Master Admin' },
    { value: 'SUPER_ADMIN', label: 'Super Admin' },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 h-16 bg-white/95 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shadow-sm backdrop-blur-md transition-all duration-300">
      {/* Left controls: Mobile Menu + Search + Filters */}
      <div className="flex items-center gap-3 xl:gap-4 min-w-0 flex-1">
        {/* Mobile Sidebar Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* 1. Search */}
        <div className="relative min-w-0 w-32 sm:w-44 md:w-52 lg:w-56 xl:w-64 h-10 flex items-center transition-all duration-300 shrink">
          <Search className="absolute left-3.5 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-9 pr-3 bg-slate-50 border border-slate-200 hover:border-slate-300/80 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-sans text-slate-900 shadow-3xs placeholder:text-slate-400 placeholder:font-medium"
            placeholder="Search..."
            title="Search student records, faculty profiles, and announcements..."
            type="text"
          />
        </div>

        {/* 2. Academic Year */}
        <div className="hidden xl:flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap">Year</span>
          <CustomSelect
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            options={academicYearsList}
            className="h-10 w-28 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-primary focus:outline-none cursor-pointer transition-all shadow-3xs"
            title="Filter by Academic Year"
          />
        </div>

        {/* 3. Semester */}
        <div className="hidden 2xl:flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap">Semester</span>
          <CustomSelect
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            options={semestersList}
            className="h-10 w-40 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none cursor-pointer transition-all shadow-3xs"
            title="Filter by Academic Semester"
          />
        </div>

        {/* 4. Role Selector */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 select-none whitespace-nowrap">Role</span>
          <CustomSelect
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as 'ADMIN' | 'MASTER_ADMIN' | 'SUPER_ADMIN')}
            options={roleOptions}
            className="h-10 w-40 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer transition-all shadow-3xs"
            title="Switch User Role"
          />
        </div>
      </div>

      {/* Right Controls: Quick Create -> Notifications -> Apps -> Divider -> Profile */}
      <div className="flex items-center gap-2 xl:gap-3 shrink-0 ml-3">
        {/* 5. Quick Create */}
        <div className="relative h-10">
          <button 
            ref={quickCreateBtnRef}
            onClick={toggleQuickCreate}
            className="h-10 flex items-center gap-2 px-3.5 sm:px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-sm shadow-primary/10 active:scale-95 duration-150 whitespace-nowrap cursor-pointer"
            title="Open Quick Create Register menu"
          >
            <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick Create</span>
          </button>

          {showQuickCreateMenu && mounted && createPortal(
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowQuickCreateMenu(false)} />
              <div
                style={quickCreateStyle}
                className="w-52 bg-white border border-slate-200 rounded-xl shadow-2xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100 font-sans"
              >
                <div className="px-4 py-1.5 text-[9px] font-bold text-slate-400 uppercase border-b border-slate-100 tracking-wider">
                  Register Form
                </div>
                <button 
                  onClick={() => { onQuickCreate('student'); setShowQuickCreateMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 border-l-4 border-transparent hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-150 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <span>Student Profile</span>
                </button>
                <button 
                  onClick={() => { onQuickCreate('faculty'); setShowQuickCreateMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 border-l-4 border-transparent hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-150 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <span>Faculty Profile</span>
                </button>
                {activeRole !== 'ADMIN' && (
                  <button 
                    onClick={() => { onQuickCreate('fee'); setShowQuickCreateMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 border-l-4 border-transparent hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-150 flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <span>Fee Receipt</span>
                  </button>
                )}
                <button 
                  onClick={() => { onQuickCreate('announcement'); setShowQuickCreateMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-700 border-l-4 border-transparent hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-150 flex items-center gap-2 font-semibold cursor-pointer"
                >
                  <span>Announcement</span>
                </button>
              </div>
            \n</>,
            document.body
          )}
        </div>

        {/* 6. Notifications */}
        <button 
          onClick={onOpenNotifications}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-50 border border-transparent hover:border-slate-200/80 text-slate-500 hover:text-slate-800 transition-all relative cursor-pointer shrink-0"
          title="Notifications Panel"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* 7. Apps/Grid Directory */}
        <div className="relative shrink-0">
          <button 
            ref={appLauncherBtnRef}
            onClick={toggleAppLauncher}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
              showAppLauncher 
                ? 'bg-slate-100 border-slate-200 text-slate-800 shadow-3xs' 
                : 'hover:bg-slate-50 border-transparent text-slate-500 hover:text-slate-800'
            }`}
            title="Applications & Systems Directory"
          >
            <Grid className="w-4 h-4 text-slate-600" />
          </button>

          {showAppLauncher && mounted && createPortal(
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setShowAppLauncher(false)} />
              <div
                style={appLauncherStyle}
                className="w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100 font-sans"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 select-none">
                  Institutional Portals
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex flex-col items-center justify-center text-center cursor-default relative">
                    <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center mb-2 shadow-sm shadow-primary/20">
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-primary">Admin Console</span>
                    <span className="text-[9px] text-primary/60 font-semibold mt-0.5">Active</span>
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>

                  <button 
                    onClick={() => {
                      alert("Navigating to Faculty Portal...");
                      setShowAppLauncher(false);
                    }}
                    className="p-3 bg-slate-50 border border-slate-100 hover:border-slate-350 hover:bg-slate-100/50 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 duration-150 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Faculty Portal</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Academic Control</span>
                  </button>

                  <button 
                    onClick={() => {
                      alert("Navigating to Student Portal...");
                      setShowAppLauncher(false);
                    }}
                    className="p-3 bg-slate-50 border border-slate-100 hover:border-slate-350 hover:bg-slate-100/50 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 duration-150 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Student Portal</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Self Service</span>
                  </button>

                  <button 
                    onClick={() => {
                      alert("Navigating to Parent Portal...");
                      setShowAppLauncher(false);
                    }}
                    className="p-3 bg-slate-50 border border-slate-100 hover:border-slate-300 hover:bg-slate-100/50 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 duration-150 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-200">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Parent Portal</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Monitoring</span>
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
        </div>

        {/* 8. Divider */}
        <div className="h-6 w-[1px] bg-slate-200 shrink-0 mx-0.5" />

        {/* 9. User Profile */}
        <div 
          className="flex items-center gap-3 ml-0.5 cursor-default shrink-0"
          title={`User Session: Admin Console (Role: ${activeRole === 'SUPER_ADMIN' ? 'Super Admin' : activeRole === 'MASTER_ADMIN' ? 'Master Admin' : 'Admin'})`}
        >
          <div className="text-right hidden sm:block">
            <p className="font-bold text-xs text-slate-900 leading-tight">Admin Console</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mt-0.5">
              {activeRole === 'SUPER_ADMIN' ? 'Super Admin' : activeRole === 'MASTER_ADMIN' ? 'Master Admin' : 'Admin'}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold text-white shadow-3xs transition-all duration-300 shrink-0 ${
            activeRole === 'SUPER_ADMIN'
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 border-purple-200 shadow-purple-500/10'
              : activeRole === 'MASTER_ADMIN' 
              ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 border-indigo-200 shadow-indigo-500/10' 
              : 'bg-gradient-to-tr from-blue-600 to-sky-500 border-blue-200 shadow-blue-500/10'
          }`}>
            <span>
              {activeRole === 'SUPER_ADMIN' ? 'SA' : activeRole === 'MASTER_ADMIN' ? 'MA' : 'AD'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
