"use client";

import React, { useState } from 'react';
import { useERPStore } from '../store';
import { useForm } from 'react-hook-form';
import { FileText, Calendar, Clock, MapPin, Plus, Trash2, Edit, ChevronDown } from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';

interface ExamFormValues {
  course: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  room: string;
}

export default function ExamsView() {
  const store = useERPStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All Courses');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExamFormValues>();

  const isDeleteRestricted = store.activeRole === 'ADMIN';

  const handleOpenCreate = () => {
    setEditingExamId(null);
    reset({ course: store.courses[0]?.name || '', subject: '', date: '', time: '10:00 AM', duration: '3 Hours', room: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: typeof store.examSchedules[0]) => {
    setEditingExamId(exam.id);
    setValue('course', exam.course);
    setValue('subject', exam.subject);
    setValue('date', exam.date);
    setValue('time', exam.time);
    setValue('duration', exam.duration);
    setValue('room', exam.room);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (isDeleteRestricted) {
      alert("Operational Officers (ADMIN) do not have exam cancellation privileges. Cancel operations are reserved for Master Admins and Super Admins.");
      return;
    }
    if (confirm("Are you sure you want to cancel and remove this scheduled examination session?")) {
      store.deleteExamSchedule(id);
    }
  };

  const onSubmit = (values: ExamFormValues) => {
    if (editingExamId) {
      store.updateExamSchedule(editingExamId, values);
    } else {
      store.addExamSchedule(values);
    }
    setIsModalOpen(false);
    reset();
  };

  const coursesList = Array.from(new Set(store.courses.map(c => c.name)));

  const filteredExams = store.examSchedules.filter(exam => {
    const matchesCourse = selectedCourseFilter === 'All Courses' || exam.course === selectedCourseFilter;
    const matchesSearch = store.searchQuery === '' ||
      exam.subject.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      exam.course.toLowerCase().includes(store.searchQuery.toLowerCase()) ||
      exam.room.toLowerCase().includes(store.searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Academic</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Examinations</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">Examination Schedule</h2>
        </div>
        <div className="flex items-center gap-3">
          <CustomSelect
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            options={["All Courses", ...coursesList]}
            className="appearance-none pr-9 pl-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-colors focus:outline-none cursor-pointer shadow-3xs"
          />
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all text-sm shadow-md active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam Session</span>
          </button>
        </div>
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredExams.map(exam => (
          <div key={exam.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-primary transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24 text-primary" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-700 rounded-lg text-xs font-bold border border-amber-500/20 uppercase tracking-wider font-sans">Official Session</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-outline bg-slate-50 border rounded px-2 py-0.5">{exam.id}</span>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                    <button 
                      onClick={() => handleOpenEdit(exam)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors"
                      title="Edit Exam Session"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(exam.id)}
                      className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                      title="Cancel Exam Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-lg text-slate-900 leading-tight mb-1">{exam.subject}</h4>
              <p className="text-sm text-slate-500 font-medium mb-6">Course: {exam.course}</p>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-800">{exam.date}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{exam.time} • Duration: <span className="font-semibold text-slate-800">{exam.duration}</span></span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Room Allocation: <span className="font-semibold text-slate-800">{exam.room}</span></span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredExams.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400 font-medium bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
            No scheduled exams match search or course criteria.
          </div>
        )}
      </div>

      {/* Exam Scheduling Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingExamId ? "Reschedule Examination Session" : "Schedule New Examination Session"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subject / Paper Title</label>
            <input 
              {...register('subject', { required: 'Subject title is required', minLength: { value: 3, message: 'Must be at least 3 characters' } })}
              type="text" 
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.subject && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Course Program</label>
            <CustomSelect 
              {...register('course', { required: 'Course allocation is required' })}
              options={store.courses.map(c => c.name)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
            />
            {errors.course && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.course.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Exam Date</label>
              <input 
                {...register('date', { required: 'Date is required', pattern: { value: /^\d{4}-\d{2}-\d{2}$/, message: 'Use YYYY-MM-DD' } })}
                type="text" 
                placeholder="e.g. 2026-11-20"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 font-mono"
              />
              {errors.date && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Start Time</label>
              <input 
                {...register('time', { required: 'Time is required' })}
                type="text" 
                placeholder="e.g. 10:00 AM"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.time && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Duration</label>
              <CustomSelect 
                {...register('duration', { required: 'Duration is required' })}
                options={["3 Hours", "2.5 Hours", "2 Hours", "1.5 Hours"]}
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.duration && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.duration.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Room / Hall Allocation</label>
              <input 
                {...register('room', { required: 'Room allocation is required' })}
                type="text" 
                placeholder="e.g. Block A, Hall 1"
                className="w-full bg-white border border-slate-300 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900"
              />
              {errors.room && <p className="text-xs text-rose-600 mt-1 font-bold">{errors.room.message}</p>}
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
              {editingExamId ? "Confirm Reschedule" : "Schedule Exam"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
