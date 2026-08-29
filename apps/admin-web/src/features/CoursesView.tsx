"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { BookOpen, Star, Plus, Trash2, Edit, Search, ChevronDown } from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';

interface CourseFormValues {
  name: string;
  code: string;
  department: string;
  semester: string;
  credits: number;
}

export default function CoursesView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All Departments');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CourseFormValues>();

  const isDeleteRestricted = store.activeRole === 'ADMIN';

  const handleOpenCreate = () => {
    setEditingCourseId(null);
    reset({ name: '', code: '', department: store.departments[0]?.name || '', semester: 'Semester 1', credits: 3 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: typeof store.courses[0]) => {
    setEditingCourseId(course.id);
    setValue('name', course.name);
    setValue('code', course.code);
    setValue('department', course.department);
    setValue('semester', course.semester);
    setValue('credits', course.credits);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (isDeleteRestricted) {
      alert("Operational Officers (ADMIN) do not have course decommissioning privileges. Deletions are reserved for Master Admins and Super Admins.");
      return;
    }
    if (confirm("Are you sure you want to decommission this course from the institutional syllabus? This action is irreversible.")) {
      store.deleteCourse(id);
    }
  };

  const onSubmit = (values: CourseFormValues) => {
    if (editingCourseId) {
      store.updateCourse(editingCourseId, {
        ...values,
        credits: Number(values.credits)
      });
    } else {
      store.addCourse({
        ...values,
        credits: Number(values.credits)
      });
    }
    setIsModalOpen(false);
    reset();
  };

  const filteredCourses = store.courses.filter(course => {
    const matchesDept = selectedDeptFilter === 'All Departments' || course.department === selectedDeptFilter;
    const matchesSearch = store.searchQuery === '' ||
      course.name.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(store.searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Home</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Courses</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">Academic Curriculum</h2>
        </div>
        <div className="flex items-center gap-3">
            <CustomSelect
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              options={["All Departments", ...store.departments.map(d => d.name)]}
              className="appearance-none pr-9 pl-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors focus:outline-none cursor-pointer shadow-3xs"
            />
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course</span>
          </button>
        </div>
      </div>

      {/* Curriculum Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-outline-variant/60">
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Code</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Course Name</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Department</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Active Semester</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Credits</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">Students</th>
              <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody key={`${selectedDeptFilter}-${store.searchQuery}`} className="divide-y divide-slate-100 text-sm animate-in fade-in-0 slide-in-from-top-1 duration-300 ease-out">
            {filteredCourses.map(course => (
              <tr key={course.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 px-6 font-mono font-bold text-slate-600">{course.code}</td>
                <td className="py-4 px-6 font-bold text-slate-900">{course.name}</td>
                <td className="py-4 px-6 text-slate-600">{course.department}</td>
                <td className="py-4 px-6 text-slate-600">{course.semester}</td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 font-bold text-xs rounded-lg border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{course.credits} Credits</span>
                  </span>
                </td>
                <td className="py-4 px-6 font-bold text-slate-800">{course.activeStudents}</td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                  No courses found matching active filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Curriculum Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCourseId ? "Modify Course Configurations" : "Add Course to Curriculum"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Course Name</label>
            <input 
              {...register('name', { required: 'Course name is required', minLength: { value: 3, message: 'Must be at least 3 characters' } })}
              type="text" 
              placeholder="e.g. B.Tech Computer Science"
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.name && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Course Code</label>
              <input 
                {...register('code', { required: 'Code is required', pattern: { value: /^[A-Z0-9-]{2,10}$/i, message: '2-10 alphanumeric' } })}
                type="text" 
                placeholder="e.g. BTech-CS"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-mono"
              />
              {errors.code && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Department</label>
              <CustomSelect 
                {...register('department', { required: 'Department is required' })}
                options={store.departments.map(d => d.name)}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.department && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.department.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Semester</label>
              <CustomSelect 
                {...register('semester', { required: 'Semester is required' })}
                options={["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"]}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.semester && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.semester.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Credits</label>
              <input 
                {...register('credits', { required: 'Credits required', min: { value: 1, message: 'Min 1 credit' }, max: { value: 6, message: 'Max 6 credits' } })}
                type="number" 
                placeholder="e.g. 4"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.credits && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.credits.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 mt-6">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-sm shadow-md"
            >
              {editingCourseId ? "Update Course" : "Add Course"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
