"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { 
  Users, UserCheck, AlertTriangle, GraduationCap, 
  Search, Trash2, Edit, Eye, Filter, Plus, FileSpreadsheet, 
  Download, ChevronLeft, ChevronRight, BarChart3, HelpCircle,
  CheckCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';

interface StudentFormValues {
  name: string;
  email: string;
  department: string;
  course: string;
  year: string;
  status: 'Active' | 'Inactive' | 'On Probation';
  attendancePercentage: number;
}

export default function StudentView() {
  const store = useERPStore();
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedSem, setSelectedSem] = useState('All Semesters');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StudentFormValues>({
    defaultValues: {
      status: 'Active',
      attendancePercentage: 90,
    }
  });

  // Handle Form Submission
  const onSubmitForm = (values: StudentFormValues) => {
    if (editingStudentId) {
      store.updateStudent(editingStudentId, {
        ...values,
        attendancePercentage: Number(values.attendancePercentage)
      });
      setEditingStudentId(null);
    } else {
      store.addStudent({
        ...values,
        attendancePercentage: Number(values.attendancePercentage)
      });
    }
    setIsModalOpen(false);
    reset();
  };

  // Open Edit Modal
  const handleEdit = (student: typeof store.students[0]) => {
    setEditingStudentId(student.id);
    setValue('name', student.name);
    setValue('email', student.email);
    setValue('department', student.department);
    setValue('course', student.course);
    setValue('year', student.year);
    setValue('status', student.status);
    setValue('attendancePercentage', student.attendancePercentage);
    setIsModalOpen(true);
  };

  // Filtered Students
  const filteredStudents = store.students.filter(student => {
    const matchesSearch = store.searchQuery === '' || 
      student.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(store.searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All Departments' || student.department === selectedDept;
    
    const matchesSem = selectedSem === 'All Semesters' || (
      (selectedSem === 'Semester 1' && student.year === '2024') ||
      (selectedSem === 'Semester 3' && student.year === '2023') ||
      (selectedSem === 'Semester 5' && student.year === '2022')
    );

    const matchesYear = selectedYear === 'All Years' || student.year === selectedYear;

    const matchesStatus = selectedStatus === 'All Statuses' || student.status === selectedStatus;
    
    return matchesSearch && matchesDept && matchesSem && matchesYear && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(paginatedStudents.map(s => s.id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete all ${selectedStudents.length} selected student records?`)) {
      selectedStudents.forEach(id => store.deleteStudent(id));
      setSelectedStudents([]);
    }
  };

  const handleBulkStatus = (status: 'Active' | 'On Probation' | 'Inactive') => {
    selectedStudents.forEach(id => {
      store.updateStudent(id, { status });
    });
    setSelectedStudents([]);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Student ID,Name,Email,Department,Course,Year,Status,Attendance"].join(",") + "\n"
      + filteredStudents.map(s => `${s.id},${s.name},${s.email},${s.department},${s.course},${s.year},${s.status},${s.attendancePercentage}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "MUC_Students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Student Management</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Student Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Bulk Import initiated: Select your CSV files to sync student databases.")}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-white hover:bg-surface-container-low rounded-xl text-sm font-bold text-on-surface-variant transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-outline" />
            <span>Bulk Import</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-white hover:bg-surface-container-low rounded-xl text-sm font-bold text-on-surface-variant transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-outline" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => { setEditingStudentId(null); reset(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div 
          onClick={() => {
            setSelectedStatus('All Statuses');
            setSelectedYear('All Years');
            setSelectedDept('All Departments');
            setSelectedSem('All Semesters');
            store.setSearchQuery('');
          }}
          className="bg-white p-5 border border-slate-200 rounded-2xl flex items-center gap-4 shadow-xs hover:border-primary/80 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group"
          title="Filter: Show All Students"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-105 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{store.students.length}</h4>
          </div>
        </div>

        {/* Active Students */}
        <div 
          onClick={() => {
            setSelectedStatus('Active');
          }}
          className="bg-white p-5 border border-slate-200 rounded-2xl flex items-center gap-4 shadow-xs hover:border-emerald-500/80 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group"
          title="Filter: Show Active Students Only"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{store.students.filter(s => s.status === 'Active').length}</h4>
          </div>
        </div>

        {/* On Probation */}
        <div 
          onClick={() => {
            setSelectedStatus('Probation');
          }}
          className="bg-white p-5 border border-slate-200 rounded-2xl flex items-center gap-4 shadow-xs hover:border-amber-500/80 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group"
          title="Filter: Show Probation Students Only"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-500 group-hover:text-white group-hover:scale-105 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">On Probation</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{store.students.filter(s => s.status === 'Probation').length}</h4>
          </div>
        </div>

        {/* New Admissions */}
        <div 
          onClick={() => {
            setSelectedYear('2024');
            setSelectedStatus('All Statuses');
          }}
          className="bg-white p-5 border border-slate-200 rounded-2xl flex items-center gap-4 shadow-xs hover:border-secondary/80 hover:shadow-xl hover:shadow-secondary/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer relative overflow-hidden group"
          title="Filter: Show Year 2024 Admissions Only"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-secondary to-sky-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/5 rounded-full blur-xl group-hover:scale-110 transition-all duration-500 pointer-events-none" />

          <div className="relative z-10 w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center transition-all duration-300 group-hover:bg-secondary group-hover:text-white group-hover:scale-105 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">New Admissions</p>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{store.students.filter(s => s.year === '2024').length}</h4>
          </div>
        </div>
      </div>

      {/* Filter Row Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Department</label>
            <CustomSelect 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={["All Departments", "Computer Science", "Artificial Intelligence", "Business Administration"]}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Semester</label>
            <CustomSelect 
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              options={["All Semesters", "Semester 1", "Semester 3", "Semester 5", "Semester 7"]}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Admission Year</label>
            <CustomSelect 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={["All Years", "2024", "2023", "2022"]}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Status</label>
            <CustomSelect 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={["All Statuses", "Active", "Probation", "Inactive"]}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
          </div>

          <button 
            onClick={() => { 
              setSelectedDept('All Departments'); 
              setSelectedSem('All Semesters'); 
              setSelectedYear('All Years'); 
              setSelectedStatus('All Statuses'); 
            }}
            className="px-6 py-2.5 bg-surface hover:bg-surface-container-high border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant transition-all hover:text-on-surface cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant/60">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline w-12">
                  <input 
                    type="checkbox" 
                    checked={paginatedStudents.length > 0 && selectedStudents.length === paginatedStudents.length}
                    onChange={toggleSelectAll}
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Student ID</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Name</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Course</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Year</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-outline text-right">Actions</th>
              </tr>
            </thead>
            <tbody key={`${selectedDept}-${selectedSem}-${selectedYear}-${store.searchQuery}`} className="divide-y divide-outline-variant/30 animate-in fade-in-0 slide-in-from-top-1 duration-300 ease-out">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70 transition-all duration-200 group">
                  <td className="py-4 px-6 border-l-2 border-l-transparent group-hover:border-l-primary transition-all duration-200">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelectStudent(student.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-on-surface-variant font-mono group-hover:text-primary transition-colors duration-200">{student.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 group-hover:translate-x-1.5 transition-transform duration-200">
                      {student.avatarUrl ? (
                        <img 
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm transition-transform duration-200 group-hover:scale-105" 
                          src={student.avatarUrl} 
                          alt={student.name} 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-sm transition-transform duration-200 group-hover:scale-105">
                          {student.initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-tight transition-colors duration-200 group-hover:text-primary-dark">{student.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs font-bold border border-primary/10 group-hover:bg-primary/10 group-hover:border-primary/25 transition-all duration-200">
                      {student.course}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface transition-colors duration-200 group-hover:text-on-surface/90">{student.year}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-200 group-hover:scale-102 ${
                      student.status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' 
                        : student.status === 'On Probation'
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                        : 'bg-outline-variant/30 text-on-surface-variant border-outline-variant/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'Active' 
                          ? 'bg-emerald-600' 
                          : student.status === 'On Probation'
                          ? 'bg-amber-600'
                          : 'bg-outline'
                      }`} />
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 scale-95 group-hover:scale-100 transition-all duration-200 ease-out">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/65 text-slate-500 hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-3xs" 
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Are you sure you want to delete this record?")) store.deleteStudent(student.id); }}
                        className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer shadow-3xs" 
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-on-surface-variant text-sm">
                    No student records found matching the active filters or search terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section footer */}
        <div className="bg-surface border-t border-outline-variant/50 px-6 py-4 flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface-variant">
            Showing <span className="text-on-surface font-extrabold">{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="text-on-surface font-extrabold">{filteredStudents.length}</span> students
          </p>
          <div className="flex items-center gap-1.5">
             <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 border border-outline-variant bg-white rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    currentPage === idx + 1 
                      ? 'bg-primary text-on-primary' 
                      : 'hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1.5 border border-outline-variant bg-white rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Bento Analytics/Callout cards below */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white border border-outline-variant rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-sans font-bold text-base text-on-surface">Recent Enrollment Trends</h5>
            <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View Full Analytics</span>
          </div>
          <div className="h-48 bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center">
            <BarChart3 className="w-10 h-10 text-outline mb-2 animate-bounce" />
            <p className="text-sm font-bold text-on-surface">MUC Autumn Intake peaked with 2,105 enrollments.</p>
            <p className="text-xs text-on-surface-variant mt-1">Computer Science and AI-ML continue to hold the highest demand.</p>
          </div>
        </div>

        <div className="bg-primary p-6 rounded-2xl text-on-primary relative overflow-hidden group flex flex-col justify-between shadow-md">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h5 className="font-sans font-bold text-lg mb-2">Academic Reports</h5>
            <p className="text-xs text-white/80 leading-relaxed">
              Generate automated performance reviews, list statistics, and probation metrics for the active semester.
            </p>
          </div>
          <button 
            onClick={() => store.setActiveTab('reports')}
            className="mt-6 w-fit bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs hover:bg-surface-bright transition-all shadow-sm flex items-center gap-1.5 relative z-10 active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Generate Now</span>
          </button>
        </div>
      </div>

      {/* Add/Edit Student Modal Dialog */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingStudentId ? 'Edit Student Profile' : 'Add New Student Profile'}
      >
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Full Name</label>
            <input 
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              type="text" 
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.name && <p className="text-xs text-error mt-1 font-bold">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Institutional Email</label>
            <input 
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Must be a valid email address' } })}
              type="email" 
              placeholder="e.g. rahul.s@muc.edu"
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.email && <p className="text-xs text-error mt-1 font-bold">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Department</label>
              <CustomSelect 
                {...register('department', { required: 'Department is required' })}
                options={["Computer Science", "Artificial Intelligence", "Business Administration"]}
                placeholder="Select Dept"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.department && <p className="text-xs text-error mt-1 font-bold">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Course / Program</label>
              <CustomSelect 
                {...register('course', { required: 'Course is required' })}
                options={["MCA", "B.Com", "Computer Science", "BBA", "AI"]}
                placeholder="Select Course"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.course && <p className="text-xs text-error mt-1 font-bold">{errors.course.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Academic Year</label>
              <CustomSelect 
                {...register('year', { required: 'Year is required' })}
                options={["Year 1", "Year 2", "Year 3", "Year 4"]}
                placeholder="Select Year"
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
              {errors.year && <p className="text-xs text-error mt-1 font-bold">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Current Status</label>
              <CustomSelect 
                {...register('status')}
                options={["Active", "Inactive", "On Probation"]}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-outline uppercase mb-1.5">Attendance Percentage (%)</label>
            <input 
              {...register('attendancePercentage', { required: 'Attendance rate is required', min: { value: 0, message: 'Must be >= 0' }, max: { value: 100, message: 'Must be <= 100' } })}
              type="number" 
              className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            />
            {errors.attendancePercentage && <p className="text-xs text-error mt-1 font-bold">{errors.attendancePercentage.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/30 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-surface hover:bg-surface-container-high border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md"
            >
              {editingStudentId ? 'Save Changes' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Floating Bulk Actions Bar */}
      {selectedStudents.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 shrink-0 select-none">
            <span className="bg-primary/20 border border-primary/30 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              {selectedStudents.length} Selected
            </span>
          </div>
          
          <div className="h-4 w-[1px] bg-slate-800 shrink-0" />
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleBulkDelete}
              className="h-8 px-3.5 bg-rose-50 hover:bg-rose-600 border border-rose-200 text-rose-600 hover:text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer duration-200 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
            <button 
              onClick={() => handleBulkStatus('Active')}
              className="h-8 px-3.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 text-emerald-700 hover:text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer duration-200 active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Set Active</span>
            </button>
            <button 
              onClick={() => handleBulkStatus('On Probation')}
              className="h-8 px-3.5 bg-amber-50 hover:bg-amber-500 border border-amber-200 text-amber-700 hover:text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer duration-200 active:scale-95"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Set Probation</span>
            </button>
            <button 
              onClick={() => setSelectedStudents([])}
              className="h-8 px-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-700/50 rounded-full text-xs font-bold flex items-center transition-all cursor-pointer duration-200 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

