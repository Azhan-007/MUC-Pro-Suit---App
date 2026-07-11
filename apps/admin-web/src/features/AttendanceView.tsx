import React, { useState } from 'react';
import { useERPStore } from '../store';
import { 
  Calendar, Check, X, Search, ChevronLeft, ChevronRight, 
  BarChart3, UserCheck, UserX, SlidersHorizontal, ArrowUpRight, 
  Settings, Sparkles, Download, Info
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AttendanceView() {
  const store = useERPStore();
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSubj, setSelectedSubj] = useState('All');
  const [selectedTab, setSelectedTab] = useState<'all' | 'present' | 'absent'>('all');
  const [currentDate, setCurrentDate] = useState('2026-07-10');

  // Heatmap calendar mock data
  const weeks = Array.from({ length: 4 });
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const cellIntensities = [
    [92, 94, 88, 91, 95, 78, 60],
    [95, 93, 89, 92, 96, 80, 50],
    [91, 94, 95, 87, 94, 75, 55],
    [93, 91, 90, 94, 95, 82, 60]
  ];

  // Faculty status logger list
  const faculties = store.faculties;

  // Filter student attendance records
  const filteredRecords = store.attendanceRecords.filter(rec => {
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'present' && rec.status === 'Present') ||
      (selectedTab === 'absent' && rec.status === 'Absent');

    const matchesSearch = store.searchQuery === '' ||
      rec.studentName.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      rec.studentId.toLowerCase().includes(store.searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const toggleStatus = (id: string) => {
    store.markAttendance({
      ...store.attendanceRecords.find(r => r.id === id)!,
      status: store.attendanceRecords.find(r => r.id === id)!.status === 'Present' ? 'Absent' : 'Present'
    });
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Record ID,Student ID,Student Name,Section,Status,Attendance Rate"].join(",") + "\n"
      + store.attendanceRecords.map(r => `${r.id},${r.studentId},${satinizeCSV(r.studentName)},${r.courseSection},${r.status},${r.attendancePercentage}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MUC_Attendance_Log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const satinizeCSV = (str: string) => str.replace(/,/g, '');

  return (
    <div className="space-y-8">
      {/* Breadcrumbs and Page Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Dashboard</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Attendance Management</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Attendance Overview</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-white rounded-xl text-sm font-bold text-on-surface-variant">
            <Calendar className="w-4 h-4 text-outline" />
            <input 
              type="date" 
              value={currentDate} 
              onChange={(e) => setCurrentDate(e.target.value)} 
              className="border-none p-0 bg-transparent text-sm font-bold text-on-surface focus:outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={() => alert("Mark Attendance: System automatically synched with faculty smart biometric devices.")}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
          >
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Filter Row Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Department</label>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              <option>All</option>
              <option>Computer Science</option>
              <option>Artificial Intelligence</option>
              <option>Business Administration</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Course</label>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              <option>All</option>
              <option>B.Tech CS</option>
              <option>M.Tech AI</option>
              <option>BBA</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Subject</label>
            <select 
              value={selectedSubj}
              onChange={(e) => setSelectedSubj(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              <option>All</option>
              <option>Data Structures</option>
              <option>Neural Networks</option>
              <option>BBA Marketing</option>
            </select>
          </div>

          <button 
            className="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 rounded-xl text-sm font-bold transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>

      {/* Bento Row: Metrics breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Average Attendance Rate */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden group">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-outline tracking-wider">Average Attendance</p>
              <h3 className="text-4xl font-extrabold text-on-surface mt-1 tracking-tight">92.4%</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-error font-bold bg-error-container/40 px-2 py-0.5 rounded-md">
              -1.5% since last week
            </span>
          </div>

          {/* Dynamic visual indicator loop */}
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" className="stroke-outline-variant fill-none" strokeWidth="6" />
              <circle cx="40" cy="40" r="32" className="stroke-primary fill-none" strokeWidth="6" strokeDasharray="200" strokeDashoffset="15" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary font-mono">92%</span>
          </div>
        </div>

        {/* Card 2: Departmental breakdown */}
        <div className="bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h5 className="text-xs font-bold uppercase text-outline tracking-wider mb-4">Departmental Breakdown</h5>
            <div className="space-y-3">
              {/* CS */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface">Computer Science</span>
                  <span className="text-primary">94.5%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '94.5%' }} />
                </div>
              </div>
              {/* AI */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface">Artificial Intelligence</span>
                  <span className="text-secondary">88.0%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
              {/* BBA */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-on-surface">Business Administration</span>
                  <span className="text-tertiary">91.2%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: '91.2%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: October Peak insight */}
        <div className="bg-gradient-to-br from-secondary to-on-secondary-container p-6 rounded-2xl text-white flex flex-col justify-between shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md">October Peak</span>
            <h4 className="text-xl font-bold mt-3 leading-snug">94.5% Attendance Peak reached in Week 2.</h4>
            <p className="text-xs text-white/70 mt-1">Due to scheduled mid-term reviews across all block halls.</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold mt-4 hover:underline cursor-pointer group-hover:translate-x-1 transition-transform">
            <span>Analyze active calendars</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Bento Layout: Heatmap & Faculty status list */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Heatmap calendar view */}
        <div className="xl:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-sans font-bold text-lg text-on-surface">Attendance Intensity Heatmap</h3>
              <p className="text-xs text-on-surface-variant">Grid represents relative lecture room fill-rates this month.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-outline font-bold">
              <span>Low</span>
              <div className="w-3.5 h-3.5 bg-primary/10 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-primary/35 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-primary/70 rounded-sm" />
              <div className="w-3.5 h-3.5 bg-primary rounded-sm" />
              <span>High</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-bold text-outline py-1">{day}</div>
            ))}
            {weeks.map((_, weekIdx) => (
              cellIntensities[weekIdx].map((intensity, dayIdx) => (
                <div 
                  key={`${weekIdx}-${dayIdx}`}
                  className={`aspect-video rounded-md flex flex-col justify-between p-2 cursor-pointer border hover:scale-105 hover:border-primary transition-all relative group ${
                    intensity >= 94 
                      ? 'bg-primary text-on-primary border-primary/20' 
                      : intensity >= 88 
                      ? 'bg-primary/70 text-on-primary border-primary/10'
                      : intensity >= 70 
                      ? 'bg-primary/35 text-on-surface border-outline-variant/35'
                      : 'bg-primary/10 text-on-surface-variant border-outline-variant/20'
                  }`}
                >
                  <span className="text-[9px] font-bold opacity-60">Day {weekIdx * 7 + dayIdx + 1}</span>
                  <span className="text-xs font-extrabold self-end">{intensity}%</span>
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Faculty Logs Status List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-bold text-lg text-on-surface">Faculty Status Logs</h3>
              <span className="text-[10px] bg-surface p-1 rounded font-bold text-outline uppercase">Live Sync</span>
            </div>

            <div className="divide-y divide-outline-variant/30 space-y-4">
              {faculties.map((fac) => (
                <div key={fac.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                      {fac.initials}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-on-surface">{fac.name}</h5>
                      <p className="text-xs text-on-surface-variant mt-0.5">{fac.subject} • {fac.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fac.status === 'Marked' 
                      ? 'bg-emerald-500/10 text-emerald-700' 
                      : fac.status === 'Pending'
                      ? 'bg-amber-500/10 text-amber-700'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {fac.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-2 text-xs text-on-surface-variant leading-relaxed">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>Biometric logs are updated instantly when lecturers access designated smart lecture rooms.</span>
          </div>
        </div>
      </div>

      {/* Student Attendance Detailed Log Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        {/* Table Control Header Tabs */}
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
              All Records
            </button>
            <button 
              onClick={() => setSelectedTab('present')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedTab === 'present' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Present
            </button>
            <button 
              onClick={() => setSelectedTab('absent')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedTab === 'absent' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Absent
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant bg-white hover:bg-surface-container rounded-xl text-xs font-bold text-on-surface-variant transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-outline" />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant/60">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student ID</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student Name</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Course Section</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Overall Rate</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="py-4 px-6 text-sm font-bold text-on-surface-variant font-mono">{rec.studentId}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                        {rec.initials}
                      </div>
                      <span className="text-sm font-bold text-on-surface">{rec.studentName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface-variant">{rec.courseSection}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      rec.status === 'Present' 
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                        : 'bg-error/10 text-error border-error/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rec.status === 'Present' ? 'bg-emerald-600' : 'bg-error'}`} />
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-on-surface">{rec.attendancePercentage}%</td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => toggleStatus(rec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        rec.status === 'Present'
                          ? 'bg-error/5 hover:bg-error/15 text-error border-error/10'
                          : 'bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-700 border-emerald-500/10'
                      }`}
                    >
                      {rec.status === 'Present' ? 'Set Absent' : 'Set Present'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-on-surface-variant text-sm">
                    No attendance records match your active search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
