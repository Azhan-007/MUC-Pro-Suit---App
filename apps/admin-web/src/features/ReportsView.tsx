"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  LineChart as LineChartIcon, Plus, Download, FileText, CheckCircle2, Clock, Search, Filter, 
  Eye, RefreshCw, Layers, TrendingUp, Users, GraduationCap, DollarSign, BookOpen, 
  Briefcase, Award, ShieldCheck, Calendar, X, AlertTriangle, Building2, Check
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { ReportItem } from '../types';

interface ReportConfigFormValues {
  title: string;
  type: ReportItem['type'];
  department: string;
  academicYear: string;
  semester: string;
  dateFrom: string;
  dateTo: string;
  statusFilter: string;
}

export default function ReportsView() {
  const store = useERPStore();

  // ── Filters & Search ───────────────────────────────────────────────────
  const [reportSearch, setReportSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Domains');

  // ── Modals ─────────────────────────────────────────────────────────────
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ title: string; type: ReportItem['type']; desc: string } | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  // ── Form Hook ──────────────────────────────────────────────────────────
  const { 
    control, register, handleSubmit, reset, setValue, watch 
  } = useForm<ReportConfigFormValues>({
    defaultValues: {
      department: 'All Departments',
      academicYear: store.academicYear,
      semester: store.semester,
      dateFrom: '2026-01-01',
      dateTo: new Date().toISOString().split('T')[0],
      statusFilter: 'All Statuses',
    }
  });

  // Department Options
  const deptOptions = useMemo(
    () => ["All Departments", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  // ── Derived Institutional Analytics Metrics ─────────────────────────────
  const totalStudents = store.students.length;
  const totalFaculty = store.faculties.length;
  const totalDepartments = store.departments.length;
  const totalCourses = store.courses.length;

  const avgAttendancePct = useMemo(() => {
    if (totalStudents === 0) return 0;
    const sum = store.students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0);
    return Math.round(sum / totalStudents);
  }, [store.students, totalStudents]);

  const totalFeeRevenue = useMemo(() => {
    return store.feeRecords.reduce((acc, f) => acc + (f.paidAmount || f.amount || 0), 0);
  }, [store.feeRecords]);

  const totalPlacementsCount = store.placements.filter(p => p.status === 'Placed').length;

  // ── Native Visual Chart Datasets ────────────────────────────────────────
  const deptDistributionData = useMemo(() => {
    const maxVal = Math.max(...store.departments.map(d => {
      const studentCount = store.students.filter(s => s.department === d.name).length || d.countStudents;
      return studentCount;
    }), 1);

    return store.departments.map(d => {
      const studentCount = store.students.filter(s => s.department === d.name).length || d.countStudents;
      const pct = Math.round((studentCount / maxVal) * 100);
      return {
        name: d.code || d.name.substring(0, 10),
        fullDept: d.name,
        students: studentCount,
        pct: Math.max(15, pct),
      };
    });
  }, [store.departments, store.students]);

  const feeStatusData = useMemo(() => {
    const totalRecs = Math.max(1, store.feeRecords.length);
    const paid = store.feeRecords.filter(f => f.status === 'Paid').length;
    const partial = store.feeRecords.filter(f => f.status === 'Partial').length;
    const overdue = store.feeRecords.filter(f => f.status === 'Overdue').length;

    return [
      { label: 'Paid Receipts', count: paid, pct: Math.round((paid / totalRecs) * 100), color: 'bg-emerald-500' },
      { label: 'Partial Payments', count: partial, pct: Math.round((partial / totalRecs) * 100), color: 'bg-sky-500' },
      { label: 'Overdue Dues', count: overdue, pct: Math.round((overdue / totalRecs) * 100), color: 'bg-rose-500' },
    ];
  }, [store.feeRecords]);

  const resultGradeData = useMemo(() => {
    const gradesCount: Record<string, number> = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'F': 0 };
    store.results.forEach(r => {
      const g = r.grade || 'A';
      if (gradesCount[g] !== undefined) gradesCount[g]++;
      else gradesCount['A']++;
    });

    const maxCount = Math.max(...Object.values(gradesCount), 1);
    return Object.entries(gradesCount).map(([grade, count]) => ({
      grade,
      count,
      pct: Math.max(10, Math.round((count / maxCount) * 100)),
    }));
  }, [store.results]);

  // ── Pre-configured Institutional Report Templates ───────────────────────
  const reportTemplates: Array<{
    id: string;
    title: string;
    type: ReportItem['type'];
    desc: string;
    dataSource: string;
  }> = [
    { id: 'TPL-01', title: 'Department Enrollment & Intake Report', type: 'Academic', desc: 'Breakdown of active student enrollments across all academic departments & courses.', dataSource: 'store.students & store.departments' },
    { id: 'TPL-02', title: 'Fee Collection & Dues Statement', type: 'Financial', desc: 'Comprehensive financial revenue ledger, paid receipts, partial payments & overdue balances.', dataSource: 'store.feeRecords' },
    { id: 'TPL-03', title: 'Institutional Attendance Audit', type: 'Attendance', desc: 'Overall attendance logs, low attendance alerts (<75%) & department-wise statistics.', dataSource: 'store.attendanceRecords' },
    { id: 'TPL-04', title: 'Curriculum & Course Allocation Summary', type: 'Academic', desc: 'Active semester courses, credit hours, faculty assignments & student enrollments.', dataSource: 'store.courses & store.faculties' },
    { id: 'TPL-05', title: 'Semester Examination Schedule Report', type: 'Examination', desc: 'Master timetable for midterm, practical & semester end examinations with room allocations.', dataSource: 'store.examSchedules' },
    { id: 'TPL-06', title: 'Academic Performance & Pass Rate Summary', type: 'Results', desc: 'Published result records, grade distributions (A+ to F), pass percentages & GPA analytics.', dataSource: 'store.results' },
    { id: 'TPL-07', title: 'Library Inventory & Circulation History', type: 'Library', desc: 'Book catalog titles, available copies, active student borrowing transactions & overdue stock.', dataSource: 'store.libraryBooks & store.libraryTransactions' },
    { id: 'TPL-08', title: 'Corporate Recruitment & Offer Package Ledger', type: 'Placement', desc: 'Placement drive results, hiring partners, salary LPA packages & candidate placement status.', dataSource: 'store.placements' },
    { id: 'TPL-09', title: 'Registrar Certificate Clearance Audit', type: 'Certificates', desc: 'Degree, provisional & transfer certificate requests, approval status & reference logs.', dataSource: 'store.certificates' },
    { id: 'TPL-10', title: 'Faculty Workload & Department Roster', type: 'Faculty', desc: 'Active faculty members, designation, subject assignments & teaching timetables.', dataSource: 'store.faculties' },
  ];

  // ── Filtered History Reports ───────────────────────────────────────────
  const filteredReports = useMemo(() => {
    const q = (reportSearch || store.searchQuery).trim().toLowerCase();

    return store.reports.filter(rep => {
      const matchCat = selectedCategoryFilter === 'All Domains' || rep.type === selectedCategoryFilter;

      const matchSearch = !q ||
        rep.title.toLowerCase().includes(q) ||
        rep.id.toLowerCase().includes(q) ||
        rep.type.toLowerCase().includes(q) ||
        (rep.department && rep.department.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [store.reports, selectedCategoryFilter, reportSearch, store.searchQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenConfigModal = useCallback((tpl: typeof reportTemplates[0]) => {
    setSelectedTemplate(tpl);
    reset({
      title: tpl.title,
      type: tpl.type,
      department: 'All Departments',
      academicYear: store.academicYear,
      semester: store.semester,
      dateFrom: '2026-01-01',
      dateTo: new Date().toISOString().split('T')[0],
      statusFilter: 'All Statuses',
    });
    setIsConfigModalOpen(true);
  }, [store.academicYear, store.semester, reset]);

  const onSubmitGenerate = useCallback((values: ReportConfigFormValues) => {
    setIsGenerating(true);

    setTimeout(() => {
      let count = 0;
      if (values.type === 'Academic' || values.type === 'Student') count = store.students.length;
      else if (values.type === 'Financial') count = store.feeRecords.length;
      else if (values.type === 'Attendance') count = store.attendanceRecords.length;
      else if (values.type === 'Results') count = store.results.length;
      else if (values.type === 'Library') count = store.libraryBooks.length;
      else if (values.type === 'Placement') count = store.placements.length;
      else if (values.type === 'Certificates') count = store.certificates.length;
      else count = store.courses.length;

      const filterSummary = `Dept: ${values.department} | Term: ${values.academicYear} (${values.semester})`;

      store.generateReport(values.title, values.type, {
        department: values.department,
        academicYear: values.academicYear,
        semester: values.semester,
        recordCount: count,
        filterSummary,
      });

      setIsGenerating(false);
      setIsConfigModalOpen(false);
      
      setExportToast(`Report "${values.title}" compiled successfully! Added to report archives.`);
      setTimeout(() => setExportToast(null), 4000);
    }, 800);
  }, [store, reset]);

  const handleExportCSV = useCallback((report: ReportItem) => {
    let csvContent = `data:text/csv;charset=utf-8,ID,Title,Domain,Generated At,Academic Year,Semester,Record Count\n`;
    csvContent += `"${report.id}","${report.title}","${report.type}","${report.generatedAt}","${report.academicYear || store.academicYear}","${report.semester || store.semester}","${report.recordCount || 10}"\n\n`;

    csvContent += `Domain Specific Data Ledger:\n`;
    if (report.type === 'Financial') {
      csvContent += `Receipt No,Student Name,Amount,Status,Method,Date\n`;
      store.feeRecords.forEach(f => {
        csvContent += `"${f.receiptNo}","${f.studentName}","${f.amount}","${f.status}","${f.method}","${f.date}"\n`;
      });
    } else if (report.type === 'Results') {
      csvContent += `Result ID,Student Name,Course,Marks,Grade,Status\n`;
      store.results.forEach(r => {
        csvContent += `"${r.id}","${r.studentName}","${r.courseName}","${r.marks}","${r.grade}","${r.status}"\n`;
      });
    } else if (report.type === 'Placement') {
      csvContent += `Offer ID,Student Name,Company,Position,Package,Status\n`;
      store.placements.forEach(p => {
        csvContent += `"${p.id}","${p.studentName}","${p.company}","${p.position}","${p.salaryPackage}","${p.status}"\n`;
      });
    } else {
      csvContent += `Student ID,Name,Department,Course,Status,Attendance %\n`;
      store.students.forEach(s => {
        csvContent += `"${s.id}","${s.name}","${s.department}","${s.course}","${s.status}","${s.attendancePercentage}%"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MUC_Report_${report.type}_${report.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(`CSV Export complete: "MUC_Report_${report.type}_${report.id}.csv" downloaded.`);
    setTimeout(() => setExportToast(null), 4000);
  }, [store]);

  const handleSimulatePDF = useCallback((report: ReportItem) => {
    setExportToast(`PDF Export Simulation: Document "${report.title}" compiled with official seal.`);
    setTimeout(() => setExportToast(null), 4000);
  }, []);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Reports</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Institutional Reports & Analytical Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven institutional analytics, custom report compilation, audit statements & CSV exports
          </p>
        </div>
      </div>

      {/* ── Institutional Analytics Summary Metrics ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Enrolled Students</p>
            <h3 className="text-2xl font-black text-slate-950 mt-1">{totalStudents} Students</h3>
            <p className="text-[10px] text-primary font-bold mt-0.5">{totalDepartments} Departments · {totalCourses} Courses</p>
          </div>
          <div className="w-11 h-11 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-2xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Total Fee Revenue</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{totalFeeRevenue.toLocaleString()}</h3>
            <p className="text-[10px] text-emerald-600/80 font-bold mt-0.5">{store.feeRecords.length} Paid Receipts</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center rounded-2xl shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Avg Student Attendance</p>
            <h3 className="text-2xl font-black text-blue-700 mt-1">{avgAttendancePct}%</h3>
            <p className="text-[10px] text-blue-600/80 font-bold mt-0.5">Across All Programs</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center rounded-2xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">Corporate Placements</p>
            <h3 className="text-2xl font-black text-purple-700 mt-1">{totalPlacementsCount} Placed</h3>
            <p className="text-[10px] text-purple-600/80 font-bold mt-0.5">{store.placements.length} Total Offers Recorded</p>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center rounded-2xl shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Native Responsive Visual Charts Section ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Department Enrollment Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>Department Enrolment Distribution</span>
            </h4>
            <p className="text-[11px] text-slate-500">Student enrollment breakdown by department</p>
          </div>

          <div className="space-y-3 pt-2">
            {deptDistributionData.map((d, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{d.fullDept} ({d.name})</span>
                  <span className="font-mono text-primary">{d.students} Students</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${d.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Fee Collection Status Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Fee Collection Breakdown</span>
            </h4>
            <p className="text-[11px] text-slate-500">Receipt payment status distribution</p>
          </div>

          <div className="space-y-4 pt-2">
            {feeStatusData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{item.label}</span>
                  <span className="font-mono">{item.count} Receipts ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${Math.max(5, item.pct)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Result Grade Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Academic Grade Distribution</span>
            </h4>
            <p className="text-[11px] text-slate-500">Pass/Fail grade counts across published results</p>
          </div>

          <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
            {resultGradeData.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold font-mono text-slate-600">{item.count}</span>
                <div className="w-full bg-slate-100 rounded-t-lg flex items-end h-full overflow-hidden">
                  <div 
                    className="w-full bg-sky-500 hover:bg-sky-600 rounded-t-lg transition-all duration-500" 
                    style={{ height: `${item.pct}%` }} 
                  />
                </div>
                <span className="text-xs font-black text-slate-800">{item.grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── REPORT CENTER: 10 Pre-configured Domain Cards ─────────────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-primary" />
            <span>Institutional Report Catalog & Generator</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Select a domain template to configure & compile custom reports</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map(tpl => (
            <div 
              key={tpl.id} 
              className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-md font-bold text-[10px] uppercase">
                    {tpl.type}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{tpl.id}</span>
                </div>
                <h4 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1.5">{tpl.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{tpl.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Source: {tpl.dataSource}</span>
                <button
                  onClick={() => handleOpenConfigModal(tpl)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Configure & Generate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPILED REPORTS ARCHIVE TABLE ────────────────────────────── */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              <span>Compiled Reports Archive ({store.reports.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Historical generated report log with live CSV download & preview</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={reportSearch}
                onChange={e => setReportSearch(e.target.value)}
                placeholder="Search generated reports..."
                className="w-full h-9 pl-9 pr-8 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {reportSearch && (
                <button onClick={() => setReportSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <CustomSelect
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              options={["All Domains", "Academic", "Financial", "Attendance", "Registrar", "Results", "Library", "Placement", "Certificates", "Faculty"]}
              className="h-9 bg-white border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Report ID</th>
                  <th className="py-4 px-6">Document Title</th>
                  <th className="py-4 px-6">Domain Segment</th>
                  <th className="py-4 px-6">Generated At</th>
                  <th className="py-4 px-6">Records Included</th>
                  <th className="py-4 px-6">File Size</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredReports.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-slate-400">{rep.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900 group-hover:text-primary transition-colors">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span>{rep.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded font-bold text-[10px] uppercase">
                        {rep.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">{rep.generatedAt}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{rep.recordCount || 10} Records</td>
                    <td className="py-4 px-6 text-slate-400 font-mono">{rep.size}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => { setPreviewReport(rep); setIsPreviewModalOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                          title="View Report Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV(rep)}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded transition-colors cursor-pointer"
                          title="Download CSV Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                      No compiled reports found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal 1: Report Configuration Modal ───────────────────────── */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title={selectedTemplate ? `Configure Report: ${selectedTemplate.title}` : "Configure Custom Report"}
      >
        <form onSubmit={handleSubmit(onSubmitGenerate)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Report Document Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              placeholder="e.g. End Semester Department Enrollment Audit"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Domain Segment
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Academic", "Financial", "Attendance", "Registrar", "Results", "Library", "Placement", "Certificates", "Faculty"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Target Department Filter
              </label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={deptOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Academic Session Year
              </label>
              <Controller
                name="academicYear"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["2025-26", "2024-25", "2023-24"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Academic Semester Term
              </label>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Fall Semester", "Spring Semester", "Summer Term"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer flex items-center gap-2"
            >
              {isGenerating ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Compiling Datasets...' : 'Compile & Save Report'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Official Institutional Report Preview Modal ────────── */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="MUC COLLEGE - Official Institutional Report Preview"
      >
        {previewReport && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded uppercase">
                  {previewReport.type}
                </span>
                <span className="font-mono text-slate-400 font-bold">{previewReport.id}</span>
              </div>
              <h4 className="font-bold text-lg text-white">{previewReport.title}</h4>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Generated: {previewReport.generatedAt}</span>
                <span>File Size: {previewReport.size}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Target Department:</span>
                <span className="font-bold text-slate-900">{previewReport.department || 'All Departments'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Academic Term:</span>
                <span className="font-bold text-slate-800">{previewReport.academicYear || store.academicYear} ({previewReport.semester || store.semester})</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Total Audited Records:</span>
                <span className="font-bold text-emerald-700">{previewReport.recordCount || 10} Records</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900">Applied Filter Parameters:</p>
              <p className="text-slate-600 font-mono text-[11px]">{previewReport.filterSummary || 'All Academic Records & Statuses Included'}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleSimulatePDF(previewReport)}
                className="px-4 h-9 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs cursor-pointer text-slate-700 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Simulate PDF</span>
              </button>
              <button
                onClick={() => {
                  handleExportCSV(previewReport);
                  setIsPreviewModalOpen(false);
                }}
                className="px-5 h-9 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official CSV</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
