"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { 
  Users, 
  GraduationCap, 
  Receipt, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Building2, 
  BookOpen, 
  BadgeAlert,
  MapPin,
  ArrowRight,
  Sparkles,
  Megaphone,
  UserCheck,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardView() {
  const store = useERPStore();
  const [analyticsTab, setAnalyticsTab] = useState<'attendance' | 'fees'>('attendance');

  // Compute stats
  const totalStudentsCount = store.students.length;
  const facultyCount = store.faculties.length;
  const feesOverdueSum = store.feeRecords
    .filter(f => f.status === 'Overdue')
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-950 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Operational Excellence</span>
          </div>
          <h2 className="font-sans font-bold text-3xl text-white mb-2 tracking-tight">Good morning, Admin.</h2>
          <p className="font-sans text-slate-300 text-base leading-relaxed">
            Here's what's happening at Mohammed University College today. Your oversight ensures institutional excellence.
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4 shadow-sm relative z-10 min-w-[240px]">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Next Event</p>
            <p className="font-bold text-sm text-white">AI Workshop in 2h</p>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+4.2%</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Total Students</p>
          <h4 className="text-3xl font-bold text-on-surface tracking-tight">{1240 + totalStudentsCount - 7}</h4>
        </div>

        {/* Faculty */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-outline bg-surface px-2.5 py-1 rounded-full">Stable</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Faculty</p>
          <h4 className="text-3xl font-bold text-on-surface tracking-tight">{84 + facultyCount - 4}</h4>
        </div>

        {/* Fee Collection */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Fee Collection</p>
          <h4 className="text-3xl font-bold text-on-surface tracking-tight">$420k</h4>
        </div>

        {/* Average Attendance */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all duration-300 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-error bg-error-container px-2.5 py-1 rounded-full">-1.5%</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Avg. Attendance</p>
          <h4 className="text-3xl font-bold text-on-surface tracking-tight">92%</h4>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold">Departments</p>
            <p className="font-bold text-xl text-on-surface">12</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold">Active Courses</p>
            <p className="font-bold text-xl text-on-surface">45</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-surface-container-lowest p-5 border border-outline-variant rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-error-container/30 flex items-center justify-center text-error">
            <BadgeAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-bold">Pending Admissions</p>
            <p className="font-bold text-xl text-error">15</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Chart + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Side: Analytics & Event Lists */}
        <div className="xl:col-span-2 space-y-8">
          {/* Institutional Analytics Panel */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h3 className="font-sans font-bold text-xl text-on-surface">Institutional Analytics</h3>
                <p className="text-sm text-on-surface-variant mt-1">Performance metrics for the current academic session.</p>
              </div>
              <div className="flex bg-surface-container p-1 rounded-lg self-start">
                <button 
                  onClick={() => setAnalyticsTab('attendance')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    analyticsTab === 'attendance' 
                      ? 'bg-white shadow-sm text-primary' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Attendance
                </button>
                <button 
                  onClick={() => setAnalyticsTab('fees')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    analyticsTab === 'fees' 
                      ? 'bg-white shadow-sm text-primary' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Fees
                </button>
              </div>
            </div>

            {/* Custom SVG/HTML Bar Chart with solid colors */}
            {analyticsTab === 'attendance' ? (
              <div>
                <div className="h-80 relative flex items-end gap-3 px-2">
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[60%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[80%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[75%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[92%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[85%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[88%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[95%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[70%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-blue-600 h-[92%] rounded-t-lg transition-all cursor-pointer relative shadow-sm">
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap shadow-md flex items-center gap-1.5 z-10 border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Today: 92%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 px-2 text-xs font-bold text-outline">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Overall</span><span>Today</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="h-80 relative flex items-end gap-3 px-2">
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[40%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[65%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[85%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[75%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[90%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-sky-600 h-[95%] rounded-t-lg transition-all cursor-pointer relative shadow-sm">
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap shadow-md border border-slate-800 z-10">
                      Peak: $125k
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[60%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[78%] rounded-t-lg transition-all cursor-pointer relative" />
                  <div className="flex-1 bg-slate-200 hover:bg-slate-300 h-[82%] rounded-t-lg transition-all cursor-pointer relative" />
                </div>
                <div className="flex justify-between mt-4 px-2 text-xs font-bold text-outline">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
                </div>
              </div>
            )}
          </div>

          {/* Events & Announcements Bento Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-tertiary" />
                    <span>Upcoming Events</span>
                  </h3>
                  <span className="text-xs font-bold text-primary hover:underline cursor-pointer">View Calendar</span>
                </div>

                <div className="space-y-4">
                  {store.events.map((evt) => (
                    <div 
                      key={evt.id} 
                      className="group flex gap-4 items-center p-3 rounded-xl hover:bg-surface-container transition-all duration-200 border border-transparent hover:border-outline-variant/30 cursor-pointer"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-tertiary-fixed rounded-xl text-on-tertiary-fixed font-sans">
                        <span className="text-xl font-extrabold leading-none">{evt.day}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">{evt.month}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{evt.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-outline" />
                          <span>{evt.location} • {evt.time}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans font-bold text-lg text-on-surface flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-secondary" />
                  <span>Recent Announcements</span>
                </h3>
              </div>

              <div className="space-y-4">
                {store.announcements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className={`p-4 rounded-xl border-l-4 ${
                      ann.category === 'primary' 
                        ? 'bg-surface-container-low border-primary' 
                        : 'bg-surface-container-low border-secondary'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-on-surface mb-1">{ann.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{ann.content}</p>
                    <p className="text-[9px] font-bold text-outline uppercase tracking-wider mt-3">{ann.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Activity Sidebar + Callout Card */}
        <div className="space-y-8">
          {/* Latest Activities Timeline */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <h3 className="font-sans font-bold text-lg text-on-surface">Latest Activities</h3>
              <span className="text-xs font-bold text-outline uppercase">Active Monitor</span>
            </div>

            <div className="relative flex-1">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-outline-variant" />

              <div className="space-y-6 relative">
                {/* Activity 1 */}
                <div className="flex gap-4">
                  <div className="z-10 w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center border-4 border-white shadow-sm text-on-secondary-container">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold text-on-surface">Rahul Sharma</span> enrolled in <span className="font-bold text-primary">CS Gen AI</span>
                    </p>
                    <p className="text-xs text-outline mt-1">10 mins ago • Admissions</p>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="flex gap-4">
                  <div className="z-10 w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center border-4 border-white shadow-sm text-on-tertiary-container">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold text-on-surface">Payment Received</span> from Priya K.
                    </p>
                    <p className="text-xs text-outline mt-1">45 mins ago • $1,250 • Fees</p>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="flex gap-4">
                  <div className="z-10 w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border-4 border-white shadow-sm text-on-primary-fixed">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold text-on-surface">Dr. Sarah Jenkins</span> checked in
                    </p>
                    <p className="text-xs text-outline mt-1">1 hour ago • Faculty Attendance</p>
                  </div>
                </div>

                {/* Activity 4 */}
                <div className="flex gap-4">
                  <div className="z-10 w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center border-4 border-white shadow-sm text-on-secondary-container">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold text-on-surface">Ananya Das</span> enrolled in <span className="font-bold text-primary">BBA Logistics</span>
                    </p>
                    <p className="text-xs text-outline mt-1">3 hours ago • Admissions</p>
                  </div>
                </div>

                {/* Activity 5 */}
                <div className="flex gap-4">
                  <div className="z-10 w-10 h-10 rounded-full bg-error-container flex items-center justify-center border-4 border-white shadow-sm text-on-error-container">
                    <BadgeAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold text-error">System Alert:</span> Network latency in Lab 4
                    </p>
                    <p className="text-xs text-outline mt-1">5 hours ago • IT Support</p>
                  </div>
                </div>

                {/* Activity 6 */}
                <div className="flex gap-4">
                  <div className="z-10 w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border-4 border-white shadow-sm text-on-primary-fixed">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-on-surface leading-snug">
                      <span className="font-bold text-on-surface">New Syllabus</span> uploaded for Semester 4
                    </p>
                    <p className="text-xs text-outline mt-1">6 hours ago • Academic</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => store.setActiveTab('reports')}
              className="w-full mt-6 py-2.5 border border-outline-variant rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container transition-all"
            >
              View All Activity
            </button>
          </div>

          {/* Quick Action Callout Card */}
          <div className="bg-primary text-on-primary p-6 rounded-2xl relative overflow-hidden group shadow-md shadow-primary/20">
            <div className="relative z-10">
              <h4 className="font-sans font-bold text-lg mb-2">Need a Report?</h4>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Generate customized academic or financial reports in seconds with our Pro Suite analytics tool.
              </p>
              <button 
                onClick={() => store.setActiveTab('reports')}
                className="bg-white text-primary px-5 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all hover:bg-surface-bright flex items-center gap-1.5 active:scale-95 text-sm"
              >
                <span>Generate Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <Receipt className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

