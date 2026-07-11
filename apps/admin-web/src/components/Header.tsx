"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { Search, Bell, Grid, Plus, Shield, User, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  onQuickCreate: (type: 'student' | 'faculty' | 'fee' | 'announcement') => void;
  onOpenNotifications: () => void;
}

export default function Header({ onQuickCreate, onOpenNotifications }: HeaderProps) {
  const { 
    searchQuery, setSearchQuery, 
    academicYear, setAcademicYear, 
    semester, setSemester,
    activeRole, setActiveRole
  } = useERPStore();

  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const academicYearsList = ['2024-25', '2023-24', '2022-23'];
  const semestersList = ['Fall Semester', 'Spring Semester', 'Summer Term'];

  const roles = [
    { value: 'ADMIN', label: 'Admin', desc: 'Operational views & data logging', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'MASTER_ADMIN', label: 'Master Admin', desc: 'Finance & certificate approvals', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full institutional configuration', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  ] as const;

  const currentRoleObj = roles.find(r => r.value === activeRole) || roles[0];

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-288px)] h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-30 shadow-xs">
      {/* Left Search & Config Bar */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans text-slate-900"
            placeholder="Search records, names, receipts..."
            type="text"
          />
        </div>

        {/* Global Selections */}
        <div className="hidden lg:flex items-center gap-6 h-full border-l border-slate-200 pl-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Academic Year:</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="text-xs font-bold text-primary hover:text-primary-container focus:outline-none bg-transparent cursor-pointer border-none p-0"
            >
              {academicYearsList.map(y => (
                <option key={y} value={y} className="text-slate-900 bg-white">{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Semester:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="text-xs font-semibold text-slate-600 hover:text-primary focus:outline-none bg-transparent cursor-pointer border-none p-0"
            >
              {semestersList.map(s => (
                <option key={s} value={s} className="text-slate-900 bg-white">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Static Role Indicator (Locked by Credentials) */}
        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 border rounded-full text-xs font-bold shadow-2xs ${currentRoleObj.color}`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{currentRoleObj.label}</span>
        </div>

        {/* Quick Create Action Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowQuickCreateMenu(!showQuickCreateMenu)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-all text-xs shadow-sm shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Create</span>
          </button>

          {showQuickCreateMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowQuickCreateMenu(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50 overflow-hidden">
                <div className="px-4 py-1.5 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  Register Form
                </div>
                <button 
                  onClick={() => { onQuickCreate('student'); setShowQuickCreateMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span>Student Profile</span>
                </button>
                <button 
                  onClick={() => { onQuickCreate('faculty'); setShowQuickCreateMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span>Faculty Profile</span>
                </button>
                {activeRole !== 'ADMIN' && (
                  <button 
                    onClick={() => { onQuickCreate('fee'); setShowQuickCreateMenu(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>Fee Receipt</span>
                  </button>
                )}
                <button 
                  onClick={() => { onQuickCreate('announcement'); setShowQuickCreateMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <span>Announcement</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Grid className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="h-6 w-[1px] bg-slate-200" />
        <div className="flex items-center gap-3 ml-1">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-xs text-slate-900 leading-tight">Admin Console</p>
            <p className="text-[10px] text-slate-400 font-medium">
              {activeRole === 'SUPER_ADMIN' ? 'Super Administrator' : activeRole === 'MASTER_ADMIN' ? 'Master Manager' : 'Operational Officer'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shadow-2xs bg-slate-100 flex items-center justify-center text-slate-600">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
