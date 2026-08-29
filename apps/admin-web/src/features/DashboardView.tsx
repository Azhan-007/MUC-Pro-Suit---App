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
  FileSpreadsheet,
  CalendarDays
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
            Here's what's happening at Mazharul Uloom College Autonomous today. Your oversight ensures institutional excellence.
          </p>
        </div>
        <div 
          onClick={() => store.setActiveTab('timetable')}
          className="bg-slate-800/85 p-4 rounded-xl border border-slate-700/80 flex items-center justify-between gap-4 shadow-sm relative z-10 min-w-[240px] cursor-pointer hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
          title="Sync & View Calendar Event: AI Workshop today at 11:30 AM"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg text-white group-hover:scale-105 group-hover:bg-blue-500 transition-all duration-300 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Next Event</p>
              <p className="font-bold text-sm text-white mt-0.5">AI Workshop in 2h</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700/50 hover:bg-blue-600/20 text-slate-400 group-hover:text-blue-400 flex items-center justify-center transition-all duration-300 ml-2" title="Sync with Calendar">
            <CalendarDays className="w-4 h-4" />
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div 
          onClick={() => store.setActiveTab('students')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-500/80 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 shadow-xs relative overflow-hidden group cursor-pointer"
        >
          {/* Top slide-in gradient border accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          {/* Bottom-right radial glowing spot */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/15 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-105">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:bg-emerald-100/70">+4.2%</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-1">Total Students</p>
            <h4 className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-sans">{1240 + totalStudentsCount - 7}</h4>
          </div>
        </div>

        {/* Faculty */}
        <div 
          onClick={() => store.setActiveTab('faculty')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500/80 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 shadow-xs relative overflow-hidden group cursor-pointer"
        >
          {/* Top slide-in gradient border accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          {/* Bottom-right radial glowing spot */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/15 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105">
              <UserCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-555 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:bg-slate-100">Stable</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-1">Faculty</p>
            <h4 className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-sans">{84 + facultyCount - 4}</h4>
          </div>
        </div>

        {/* Fee Collection */}
        <div 
          onClick={() => {
            if (store.activeRole !== 'ADMIN') {
              store.setActiveTab('fees');
            }
          }}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-500/80 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 shadow-xs relative overflow-hidden group cursor-pointer"
        >
          {/* Top slide-in gradient border accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          {/* Bottom-right radial glowing spot */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-105">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:bg-emerald-100/70">+12%</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-1">Fee Collection</p>
            <h4 className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-sans">$420k</h4>
          </div>
        </div>

        {/* Average Attendance */}
        <div 
          onClick={() => store.setActiveTab('attendance')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-500/80 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1.5 transition-all duration-300 shadow-xs relative overflow-hidden group cursor-pointer"
        >
          {/* Top slide-in gradient border accent */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          {/* Bottom-right radial glowing spot */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center transition-all duration-300 group-hover:bg-purple-600 group-hover:text-white group-hover:scale-105">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full transition-all duration-300 group-hover:bg-red-100/70">-1.5%</span>
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-1">Avg. Attendance</p>
            <h4 className="text-3.5xl font-extrabold text-slate-900 tracking-tight font-sans">92%</h4>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => store.setActiveTab('departments')}
          className="flex items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-lg hover:shadow-slate-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Departments</p>
            <p className="font-bold text-xl text-slate-950">12</p>
          </div>
        </div>

        <div 
          onClick={() => store.setActiveTab('courses')}
          className="flex items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-lg hover:shadow-slate-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Active Courses</p>
            <p className="font-bold text-xl text-slate-950">45</p>
          </div>
        </div>

        <div 
          onClick={() => store.setActiveTab('students')}
          className="flex items-center gap-4 bg-white p-5 border border-slate-200 rounded-2xl shadow-xs hover:shadow-lg hover:shadow-red-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
            <BadgeAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wider mb-0.5">Pending Admissions</p>
            <p className="font-bold text-xl text-red-600 font-display">15</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Chart + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Side: Analytics & Event Lists */}
        <div className="xl:col-span-2 space-y-8">
          {/* Institutional Analytics Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h3 className="font-sans font-bold text-xl text-slate-900 tracking-tight">Institutional Analytics</h3>
                <p className="text-sm text-slate-500 mt-1">Performance metrics for the current academic session.</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg self-start">
                <button 
                  onClick={() => setAnalyticsTab('attendance')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    analyticsTab === 'attendance' 
                      ? 'bg-white shadow-3xs text-primary' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Attendance
                </button>
                <button 
                  onClick={() => setAnalyticsTab('fees')}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    analyticsTab === 'fees' 
                      ? 'bg-white shadow-3xs text-primary' 
                      : 'text-slate-500 hover:text-slate-900'
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
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[60%] rounded-t-lg transition-all cursor-pointer relative" title="Monday Attendance: 60%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[80%] rounded-t-lg transition-all cursor-pointer relative" title="Tuesday Attendance: 80%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[75%] rounded-t-lg transition-all cursor-pointer relative" title="Wednesday Attendance: 75%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[92%] rounded-t-lg transition-all cursor-pointer relative" title="Thursday Attendance: 92%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[85%] rounded-t-lg transition-all cursor-pointer relative" title="Friday Attendance: 85%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[88%] rounded-t-lg transition-all cursor-pointer relative" title="Saturday Attendance: 88%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[95%] rounded-t-lg transition-all cursor-pointer relative" title="Sunday Attendance: 95%" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[70%] rounded-t-lg transition-all cursor-pointer relative" title="Weekly Average Attendance: 70%" />
                  <div className="flex-1 bg-gradient-to-t from-primary to-blue-500 h-[92%] rounded-t-lg transition-all cursor-pointer relative shadow-sm shadow-primary/10" title="Today's Attendance: 92%">
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-md flex items-center gap-1.5 z-10 border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Today: 92%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 px-2 text-xs font-extrabold text-slate-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Overall</span><span>Today</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="h-80 relative flex items-end gap-3 px-2">
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[40%] rounded-t-lg transition-all cursor-pointer relative" title="January Collection: $40k" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[65%] rounded-t-lg transition-all cursor-pointer relative" title="February Collection: $65k" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[85%] rounded-t-lg transition-all cursor-pointer relative" title="March Collection: $85k" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[75%] rounded-t-lg transition-all cursor-pointer relative" title="April Collection: $75k" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[90%] rounded-t-lg transition-all cursor-pointer relative" title="May Collection: $90k" />
                  <div className="flex-1 bg-gradient-to-t from-sky-600 to-sky-400 h-[95%] rounded-t-lg transition-all cursor-pointer relative shadow-sm shadow-sky-500/10" title="June (Peak) Collection: $125k">
                    <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-md border border-slate-800 z-10">
                      Peak: $125k
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[60%] rounded-t-lg transition-all cursor-pointer relative" title="July Collection: $60k" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[78%] rounded-t-lg transition-all cursor-pointer relative" title="August Collection: $78k" />
                  <div className="flex-1 bg-slate-100 hover:bg-primary/20 h-[82%] rounded-t-lg transition-all cursor-pointer relative" title="September Collection: $82k" />
                </div>
                <div className="flex justify-between mt-4 px-2 text-xs font-extrabold text-slate-400">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
                </div>
              </div>
            )}
          </div>

          {/* Events & Announcements Bento Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2 select-none">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <span>Upcoming Events</span>
                  </h3>
                  <span className="text-xs font-bold text-primary hover:underline cursor-pointer" onClick={() => store.setActiveTab('timetable')}>View Calendar</span>
                </div>

                <div className="space-y-4">
                  {store.events.map((evt) => (
                    <div 
                      key={evt.id} 
                      className="group flex gap-4 items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-700 font-sans rounded-xl font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <span className="text-xl font-extrabold leading-none">{evt.day}</span>
                        <span className="text-[10px] uppercase font-extrabold tracking-wider mt-0.5">{evt.month}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">{evt.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.location} • {evt.time}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center gap-2 select-none">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  <span>Recent Announcements</span>
                </h3>
              </div>

              <div className="space-y-4">
                {store.announcements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:-translate-y-0.5 cursor-default ${
                      ann.category === 'primary' 
                        ? 'bg-blue-50/40 border-blue-600 hover:bg-blue-50/70' 
                        : 'bg-amber-50/40 border-amber-500 hover:bg-amber-50/70'
                    }`}
                  >
                    <h4 className="font-bold text-sm text-slate-800 mb-1">{ann.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{ann.content}</p>
                    <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-3">{ann.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Activity Sidebar + Callout Card */}
        <div className="flex flex-col h-full gap-8">
          {/* Latest Activities Timeline */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="font-sans font-bold text-lg text-slate-900 select-none">Latest Activities</h3>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider select-none">Active Monitor</span>
            </div>

            <div className="relative flex-1">
              {/* Vertical timeline line */}
              <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100" />

              <div className="space-y-6 relative">
                {/* Activity 1 */}
                <div className="flex gap-4 group cursor-pointer">
                  <div className="z-10 w-10 h-10 rounded-full bg-blue-50 border-4 border-white shadow-3xs flex items-center justify-center text-blue-600 transition-transform duration-200 group-hover:scale-110">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
                      <span className="font-bold text-slate-900">Rahul Sharma</span> enrolled in <span className="font-bold text-primary">CS Gen AI</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">10 mins ago • Admissions</p>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="flex gap-4 group cursor-pointer">
                  <div className="z-10 w-10 h-10 rounded-full bg-amber-50 border-4 border-white shadow-3xs flex items-center justify-center text-amber-600 transition-transform duration-200 group-hover:scale-110">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
                      <span className="font-bold text-slate-900">Payment Received</span> from Priya K.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">45 mins ago • $1,250 • Fees</p>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="flex gap-4 group cursor-pointer">
                  <div className="z-10 w-10 h-10 rounded-full bg-indigo-50 border-4 border-white shadow-3xs flex items-center justify-center text-indigo-600 transition-transform duration-200 group-hover:scale-110">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
                      <span className="font-bold text-slate-900">Dr. Sarah Jenkins</span> checked in
                    </p>
                    <p className="text-xs text-slate-400 mt-1">1 hour ago • Faculty Attendance</p>
                  </div>
                </div>

                {/* Activity 4 */}
                <div className="flex gap-4 group cursor-pointer">
                  <div className="z-10 w-10 h-10 rounded-full bg-blue-50 border-4 border-white shadow-3xs flex items-center justify-center text-blue-600 transition-transform duration-200 group-hover:scale-110">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
                      <span className="font-bold text-slate-900">Ananya Das</span> enrolled in <span className="font-bold text-primary">BBA Logistics</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">3 hours ago • Admissions</p>
                  </div>
                </div>

                {/* Activity 5 */}
                <div className="flex gap-4 group cursor-pointer">
                  <div className="z-10 w-10 h-10 rounded-full bg-red-50 border-4 border-white shadow-3xs flex items-center justify-center text-red-600 transition-transform duration-200 group-hover:scale-110">
                    <BadgeAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
                      <span className="font-bold text-red-600">System Alert:</span> Network latency in Lab 4
                    </p>
                    <p className="text-xs text-slate-400 mt-1">5 hours ago • IT Support</p>
                  </div>
                </div>

                {/* Activity 6 */}
                <div className="flex gap-4 group cursor-pointer">
                  <div className="z-10 w-10 h-10 rounded-full bg-purple-50 border-4 border-white shadow-3xs flex items-center justify-center text-purple-600 transition-transform duration-200 group-hover:scale-110">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug group-hover:text-slate-900 transition-colors">
                      <span className="font-bold text-slate-900">New Syllabus</span> uploaded for Semester 4
                    </p>
                    <p className="text-xs text-slate-400 mt-1">6 hours ago • Academic</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => store.setActiveTab('reports')}
              className="w-full mt-6 py-2.5 border border-slate-200 hover:border-slate-350 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
            >
              View All Activity
            </button>
          </div>

          {/* Quick Action Callout Card */}
          <div className="bg-primary text-on-primary p-6 rounded-2xl relative overflow-hidden group shadow-md shadow-primary/20">
            <div className="relative z-10">
              <h4 className="font-sans font-bold text-lg mb-2 text-white">Need a Report?</h4>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Generate customized academic or financial reports in seconds with our Pro Suite analytics tool.
              </p>
              <button 
                onClick={() => store.setActiveTab('reports')}
                className="bg-white text-primary px-5 py-2.5 rounded-lg font-bold hover:shadow-lg transition-all hover:bg-slate-50 flex items-center gap-1.5 active:scale-95 text-sm cursor-pointer"
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

