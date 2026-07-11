"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { 
  Users, UserCheck, AlertTriangle, GraduationCap, 
  Search, Trash2, Edit, Eye, Filter, Plus, FileSpreadsheet, 
  Download, ChevronLeft, ChevronRight, BarChart3, HelpCircle
} from 'lucide-react';
import Modal from '../components/Modal';

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
    
    return matchesSearch && matchesDept;
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
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-white hover:bg-surface-container-low rounded-xl text-sm font-bold text-on-surface-variant transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-outline" />
            <span>Bulk Import</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-white hover:bg-surface-container-low rounded-xl text-sm font-bold text-on-surface-variant transition-colors"
          >
            <Download className="w-4 h-4 text-outline" />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => { setEditingStudentId(null); reset(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:bg-surface-tint transition-all text-sm shadow-md shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Students</p>
            <h4 className="text-2xl font-bold text-on-surface mt-1">12,450</h4>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Active</p>
            <h4 className="text-2xl font-bold text-on-surface mt-1">11,200</h4>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">On Probation</p>
            <h4 className="text-2xl font-bold text-on-surface mt-1">124</h4>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 border border-outline-variant rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">New Admissions</p>
            <h4 className="text-2xl font-bold text-on-surface mt-1">2,105</h4>
          </div>
        </div>
      </div>

      {/* Filter Row Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Department</label>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Artificial Intelligence</option>
              <option>Business Administration</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Semester</label>
            <select 
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              <option>All Semesters</option>
              <option>Semester 1</option>
              <option>Semester 3</option>
              <option>Semester 5</option>
              <option>Semester 7</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-outline uppercase mb-2">Admission Year</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
            >
              <option>All Years</option>
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>

          <button 
            onClick={() => { setSelectedDept('All Departments'); setSelectedSem('All Semesters'); setSelectedYear('All Years'); }}
            className="px-6 py-2.5 bg-surface hover:bg-surface-container-high border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant transition-all hover:text-on-surface"
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
            <tbody className="divide-y divide-outline-variant/30">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="py-4 px-6">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleSelectStudent(student.id)}
                      className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-on-surface-variant font-mono">{student.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img 
                          className="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm" 
                          src={student.avatarUrl} 
                          alt={student.name} 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shadow-sm">
                          {student.initials}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-on-surface leading-tight">{student.name}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-xs font-bold border border-primary/10">
                      {student.course}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-on-surface">{student.year}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
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
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(student)}
                        className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant hover:text-primary transition-colors" 
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Are you sure you want to delete this record?")) store.deleteStudent(student.id); }}
                        className="p-1.5 hover:bg-error/10 rounded-lg text-error transition-colors" 
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
              className="p-1.5 border border-outline-variant bg-white rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
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
              className="p-1.5 border border-outline-variant bg-white rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-30 disabled:pointer-events-none"
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
              <select 
                {...register('department', { required: 'Department is required' })}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="">Select Dept</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Business Administration">Business Administration</option>
              </select>
              {errors.department && <p className="text-xs text-error mt-1 font-bold">{errors.department.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Course / Program</label>
              <select 
                {...register('course', { required: 'Course is required' })}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="">Select Course</option>
                <option value="MCA">MCA</option>
                <option value="B.Com">B.Com</option>
                <option value="Computer Science">Computer Science</option>
                <option value="BBA">BBA</option>
                <option value="AI">AI</option>
              </select>
              {errors.course && <p className="text-xs text-error mt-1 font-bold">{errors.course.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Academic Year</label>
              <select 
                {...register('year', { required: 'Year is required' })}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="">Select Year</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
              </select>
              {errors.year && <p className="text-xs text-error mt-1 font-bold">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1.5">Current Status</label>
              <select 
                {...register('status')}
                className="w-full bg-surface border border-outline-variant rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-sans"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Probation">On Probation</option>
              </select>
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
    </div>
  );
}

