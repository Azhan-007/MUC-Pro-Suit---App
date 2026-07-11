import React, { useState } from 'react';
import { useERPStore } from '../store';
import { Search, Bell, Grid, Plus, Check, Mail, AlertTriangle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onQuickCreate: (type: 'student' | 'faculty' | 'fee' | 'announcement') => void;
  onOpenNotifications: () => void;
}

export default function Header({ onQuickCreate, onOpenNotifications }: HeaderProps) {
  const { 
    searchQuery, setSearchQuery, 
    academicYear, setAcademicYear, 
    semester, setSemester 
  } = useERPStore();

  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState(false);

  const academicYearsList = ['2024-25', '2023-24', '2022-23'];
  const semestersList = ['Fall Semester', 'Spring Semester', 'Summer Term'];

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-288px)] h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 z-30">
      {/* Left Search & Config Bar */}
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all font-sans text-slate-900"
            placeholder="Search records, names, receipts..."
            type="text"
          />
        </div>

        {/* Global Selections */}
        <div className="hidden lg:flex items-center gap-6 h-full border-l border-slate-200 pl-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Academic Year:</span>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 focus:outline-none bg-transparent cursor-pointer border-none p-0"
            >
              {academicYearsList.map(y => (
                <option key={y} value={y} className="text-slate-900 bg-white">{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-400">Semester:</span>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="text-sm text-slate-600 hover:text-blue-600 focus:outline-none bg-transparent cursor-pointer border-none p-0"
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
        {/* Quick Create Action Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowQuickCreateMenu(!showQuickCreateMenu)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Create</span>
          </button>

          <AnimatePresence>
            {showQuickCreateMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQuickCreateMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                    Create New
                  </div>
                  <button 
                    onClick={() => { onQuickCreate('student'); setShowQuickCreateMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>Student Profile</span>
                  </button>
                  <button 
                    onClick={() => { onQuickCreate('faculty'); setShowQuickCreateMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>Faculty Profile</span>
                  </button>
                  <button 
                    onClick={() => { onQuickCreate('fee'); setShowQuickCreateMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>Fee Receipt</span>
                  </button>
                  <button 
                    onClick={() => { onQuickCreate('announcement'); setShowQuickCreateMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>Announcement</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button 
            onClick={onOpenNotifications}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
            <Grid className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="h-8 w-[1px] bg-slate-200" />
        <div className="flex items-center gap-3 ml-1">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-sm text-slate-900 leading-tight">Admin User</p>
            <p className="text-xs text-slate-500">Finance Head</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shadow-sm">
            <img 
              className="w-full h-full object-cover" 
              alt="Admin profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAtJ7hmDSxr7wAdfLyOZ4U_DNbVU3J2PK3KD91ncIt3NudotiGd3FRtMeMGB7sAsvYMWTLR08nxGU-sxpEZySfPCjLn91ZCBxJ3Hx9t4I-n2cd_KhLF7CcfjRfKPR0WA_QmC6liKsgt6ZTS3pHsuYRF0tu-0euvMyIKrzc0cg6-EhAbaH4ah9irVE_tPUu4tAqm4hMN-oxEn76DmzIkR_v_TyHhc449XsNnak6KhgMWuYKpQCiTuc4Bg"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
