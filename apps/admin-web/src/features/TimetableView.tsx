"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  CalendarDays, Clock, MapPin, Plus, Search, Filter, 
  Trash2, Edit, AlertTriangle, CheckCircle2, UserCheck, 
  X, Eye, Info, Layers, RefreshCw, SlidersHorizontal, User,
  LayoutGrid, List
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { TimetableSlot } from '../types';

interface SlotFormValues {
  department: string;
  courseName: string;
  subject: string;
  facultyName: string;
  room: string;
  day: string;
  time: string;
  endTime: string;
  section: string;
  status: 'Scheduled' | 'Substituted' | 'Cancelled';
  replacementFaculty?: string;
}

export default function TimetableView() {
  const store = useERPStore();

  // ── Filters & View State ───────────────────────────────────────────────
  const [selectedDay, setSelectedDay] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [viewFormat, setViewFormat] = useState<'grid' | 'list'>('grid');
  const [localSearch, setLocalSearch] = useState('');

  // ── Modal States ───────────────────────────────────────────────────────
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  
  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<TimetableSlot | null>(null);

  // Slot Details View Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingSlot, setViewingSlot] = useState<TimetableSlot | null>(null);

  // ── Form State ─────────────────────────────────────────────────────────
  const { control, register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SlotFormValues>({
    defaultValues: {
      day: 'Mon',
      time: '09:30 AM',
      endTime: '10:30 AM',
      section: 'Sec A',
      status: 'Scheduled',
    }
  });

  const watchDept = watch('department');
  const watchStatus = watch('status');
  const watchDay = watch('day');
  const watchTime = watch('time');
  const watchRoom = watch('room');
  const watchFaculty = watch('facultyName');
  const watchSection = watch('section');

  // ── Department & Dynamic Course Options ───────────────────────────────
  const deptOptions = useMemo(
    () => ["All", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  const courseOptions = useMemo(() => {
    if (selectedDept === 'All') {
      return ["All", ...store.courses.map(c => c.name)];
    }
    const filtered = store.courses.filter(c => c.department === selectedDept);
    return ["All", ...(filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name))];
  }, [selectedDept, store.courses]);

  const modalCourseOptions = useMemo(() => {
    if (!watchDept) return store.courses.map(c => c.name);
    const filtered = store.courses.filter(c => c.department === watchDept);
    return filtered.length > 0 ? filtered.map(c => c.name) : store.courses.map(c => c.name);
  }, [watchDept, store.courses]);

  const facultyOptions = useMemo(
    () => ["All", ...store.faculties.map(f => f.name)],
    [store.faculties]
  );

  // ── Realtime Conflict Detection in Form Modal ─────────────────────────
  const conflictWarning = useMemo(() => {
    if (!isSlotModalOpen || !watchDay || !watchTime) return null;

    const otherSlots = store.timetable.filter(s => s.id !== editingSlotId);

    // Faculty conflict
    if (watchFaculty) {
      const facConflict = otherSlots.find(s => s.day === watchDay && s.time === watchTime && s.facultyName === watchFaculty);
      if (facConflict) {
        return `Faculty Conflict: ${watchFaculty} is already assigned to ${facConflict.courseName} in ${facConflict.room} at ${watchTime} on ${watchDay}.`;
      }
    }

    // Room conflict
    if (watchRoom) {
      const roomConflict = otherSlots.find(s => s.day === watchDay && s.time === watchTime && s.room.toLowerCase() === watchRoom.toLowerCase());
      if (roomConflict) {
        return `Room Conflict: ${watchRoom} is already booked for ${roomConflict.courseName} (${roomConflict.facultyName}) at ${watchTime} on ${watchDay}.`;
      }
    }

    // Section conflict
    if (watchSection) {
      const secConflict = otherSlots.find(s => s.day === watchDay && s.time === watchTime && (s.section || 'Sec A') === watchSection);
      if (secConflict) {
        return `Section Conflict: Section ${watchSection} already has a scheduled lecture (${secConflict.courseName}) at ${watchTime} on ${watchDay}.`;
      }
    }

    return null;
  }, [isSlotModalOpen, watchDay, watchTime, watchFaculty, watchRoom, watchSection, store.timetable, editingSlotId]);

  // ── Filtered Timetable Slots ──────────────────────────────────────────
  const filteredSlots = useMemo(() => {
    const q = (localSearch || store.searchQuery).trim().toLowerCase();

    return store.timetable.filter(slot => {
      const matchDay = selectedDay === 'All' || slot.day === selectedDay;
      
      const matchDept = selectedDept === 'All' || 
        (slot.department && slot.department === selectedDept) ||
        store.courses.find(c => c.name === slot.courseName)?.department === selectedDept;

      const matchCourse = selectedCourse === 'All' || slot.courseName === selectedCourse;
      const matchFaculty = selectedFaculty === 'All' || slot.facultyName === selectedFaculty;
      const matchSec = selectedSection === 'All' || (slot.section || 'Sec A') === selectedSection;

      const matchSearch = !q ||
        slot.courseName.toLowerCase().includes(q) ||
        slot.facultyName.toLowerCase().includes(q) ||
        (slot.subject && slot.subject.toLowerCase().includes(q)) ||
        slot.room.toLowerCase().includes(q) ||
        slot.id.toLowerCase().includes(q);

      return matchDay && matchDept && matchCourse && matchFaculty && matchSec && matchSearch;
    });
  }, [store.timetable, selectedDay, selectedDept, selectedCourse, selectedFaculty, selectedSection, localSearch, store.searchQuery, store.courses]);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingSlotId(null);
    const defaultDept = store.departments[0]?.name || 'Computer Science';
    const defaultCourse = store.courses.find(c => c.department === defaultDept)?.name || store.courses[0]?.name || 'B.Tech CS';
    const defaultFac = store.faculties[0]?.name || 'Dr. Sarah Jenkins';

    setEditingSlotId(null);
    reset({
      department: defaultDept,
      courseName: defaultCourse,
      subject: store.faculties[0]?.subject || 'Data Structures',
      facultyName: defaultFac,
      room: 'Lab 4',
      day: 'Mon',
      time: '09:30 AM',
      endTime: '10:30 AM',
      section: 'Sec A',
      status: 'Scheduled',
      replacementFaculty: '',
    });
    setIsSlotModalOpen(true);
  }, [store.departments, store.courses, store.faculties, reset]);

  const handleOpenEdit = useCallback((slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setValue('department', slot.department || store.courses.find(c => c.name === slot.courseName)?.department || 'Computer Science');
    setValue('courseName', slot.courseName);
    setValue('subject', slot.subject || slot.courseName);
    setValue('facultyName', slot.facultyName);
    setValue('room', slot.room);
    setValue('day', slot.day);
    setValue('time', slot.time);
    setValue('endTime', slot.endTime || '10:30 AM');
    setValue('section', slot.section || 'Sec A');
    setValue('status', slot.status || 'Scheduled');
    setValue('replacementFaculty', slot.replacementFaculty || '');
    setIsSlotModalOpen(true);
  }, [store.courses, setValue]);

  const handleOpenDelete = useCallback((slot: TimetableSlot) => {
    setDeletingSlot(slot);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deletingSlot) return;
    store.deleteTimetableSlot(deletingSlot.id);
    setIsDeleteModalOpen(false);
    setDeletingSlot(null);
  }, [deletingSlot, store]);

  const onSubmit = useCallback((values: SlotFormValues) => {
    if (editingSlotId) {
      store.updateTimetableSlot(editingSlotId, values);
    } else {
      store.addTimetableSlot(values);
    }
    setIsSlotModalOpen(false);
    reset();
  }, [editingSlotId, store, reset]);

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb & Header ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Dashboard</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Timetable</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight">Lecture Schedules & Timetable</h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional class allocations, room scheduling & faculty conflict resolution
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewFormat('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewFormat === 'grid' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewFormat('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewFormat === 'list' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-sm shadow-md cursor-pointer active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Lecture Slot</span>
          </button>
        </div>
      </div>

      {/* ── Day Order Tabs ──────────────────────────────────────────────── */}
      <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl overflow-x-auto shadow-xs gap-1">
        {['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedDay === day 
                ? 'bg-primary text-white shadow-xs' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {day === 'All' ? 'All Days' : day}
          </button>
        ))}
      </div>

      {/* ── Filter Row Section ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
              Search Timetable
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Course, Subject, Faculty, Room..."
                className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
              />
              {localSearch && (
                <button onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
            <CustomSelect
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              options={deptOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Course</label>
            <CustomSelect
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
              options={courseOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Faculty</label>
            <CustomSelect
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              options={facultyOptions}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="min-w-[120px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Section</label>
            <CustomSelect
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              options={["All", "Sec A", "Sec B", "Sec C"]}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
            />
          </div>

          {(selectedDept !== 'All' || selectedCourse !== 'All' || selectedFaculty !== 'All' || selectedSection !== 'All' || localSearch) && (
            <button
              onClick={() => {
                setSelectedDept('All');
                setSelectedCourse('All');
                setSelectedFaculty('All');
                setSelectedSection('All');
                setLocalSearch('');
              }}
              className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Timetable Slots View (Grid / List) ─────────────────────────── */}
      {viewFormat === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSlots.map(slot => (
            <div 
              key={slot.id} 
              className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs">
                    {slot.day} Slot
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-bold font-mono bg-slate-50 border rounded px-2 py-0.5">{slot.id}</span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                      <button 
                        onClick={() => { setViewingSlot(slot); setIsDetailsModalOpen(true); }}
                        className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                        title="View Slot Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(slot)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded cursor-pointer"
                        title="Edit Slot"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(slot)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                        title="Delete Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Badge if Substituted or Cancelled */}
                {slot.status && slot.status !== 'Scheduled' && (
                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      slot.status === 'Substituted' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {slot.status === 'Substituted' ? `Substituted (${slot.replacementFaculty || 'Substitute'})` : 'Cancelled'}
                    </span>
                  </div>
                )}

                <h4 className="font-bold text-lg text-slate-900 mb-1 group-hover:text-primary transition-colors">{slot.courseName}</h4>
                <p className="text-xs text-slate-500 font-medium mb-1">{slot.subject || 'Core Subject'} · Section: <strong className="text-slate-700">{slot.section || 'Sec A'}</strong></p>
                <p className="text-xs text-slate-600 font-medium">Lecturer: <strong className="text-slate-800">{slot.facultyName}</strong></p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{slot.time}{slot.endTime ? ` - ${slot.endTime}` : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{slot.room}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredSlots.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-xs">
              No lecture slots match the active day order or filter criteria.
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Slot ID</th>
                  <th className="py-4 px-6">Day</th>
                  <th className="py-4 px-6">Course & Subject</th>
                  <th className="py-4 px-6">Faculty</th>
                  <th className="py-4 px-6">Room / Time</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSlots.map(slot => (
                  <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-slate-500">{slot.id}</td>
                    <td className="py-4 px-6 font-bold text-primary">{slot.day}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{slot.courseName}</p>
                      <p className="text-[10px] text-slate-400">{slot.subject || 'Core Subject'} · {slot.section || 'Sec A'}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{slot.facultyName}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{slot.room}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{slot.time}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        slot.status === 'Substituted'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : slot.status === 'Cancelled'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {slot.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setViewingSlot(slot); setIsDetailsModalOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(slot)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSlots.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No timetable slots match criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal 1: Create / Edit Timetable Slot ─────────────────────── */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={editingSlotId ? "Edit Lecture Slot Allocation" : "Allocate New Lecture Slot"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Conflict Warning Banner */}
          {conflictWarning && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Department <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="department"
                control={control}
                rules={{ required: 'Department is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={store.departments.map(d => d.name)}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Course Program <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="courseName"
                control={control}
                rules={{ required: 'Course is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={modalCourseOptions}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Subject Name <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('subject', { required: 'Subject name is required' })}
                type="text"
                placeholder="e.g. Data Structures"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.subject && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Assigned Faculty <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="facultyName"
                control={control}
                rules={{ required: 'Faculty assignment is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={store.faculties.map(f => f.name)}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Day Order <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="day"
                control={control}
                rules={{ required: 'Day is required' }}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('time', { required: 'Start time is required' })}
                type="text"
                placeholder="e.g. 09:30 AM"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                {...register('endTime')}
                type="text"
                placeholder="e.g. 10:30 AM"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Room / Lab <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('room', { required: 'Room allocation is required' })}
                type="text"
                placeholder="e.g. Lab 4"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.room && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.room.message}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Section
              </label>
              <Controller
                name="section"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={['Sec A', 'Sec B', 'Sec C']}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Slot Status
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={['Scheduled', 'Substituted', 'Cancelled']}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          {watchStatus === 'Substituted' && (
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Replacement / Substitute Lecturer
              </label>
              <Controller
                name="replacementFaculty"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value || ''}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={store.faculties.map(f => f.name)}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          )}

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSlotModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingSlotId ? "Save Slot Allocation" : "Allocate Slot"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: View Slot Details Modal ──────────────────────────── */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Lecture Slot Details"
      >
        {viewingSlot && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px]">
                  {viewingSlot.day} Slot
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingSlot.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingSlot.courseName}</h4>
              <p className="text-slate-500 font-medium">{viewingSlot.subject || 'Core Subject'} · Section: {viewingSlot.section || 'Sec A'}</p>
            </div>

            <div className="space-y-2.5 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Assigned Lecturer:</span>
                <span className="font-bold text-slate-900">{viewingSlot.facultyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Time Slot:</span>
                <span className="font-bold text-slate-800">{viewingSlot.time}{viewingSlot.endTime ? ` - ${viewingSlot.endTime}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Room / Hall Allocation:</span>
                <span className="font-bold text-emerald-700">{viewingSlot.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Slot Status:</span>
                <span className="font-bold text-slate-800">{viewingSlot.status || 'Scheduled'}</span>
              </div>
              {viewingSlot.status === 'Substituted' && (
                <div className="flex justify-between bg-amber-50 p-2 rounded-lg text-amber-800">
                  <span className="font-semibold">Substitute Lecturer:</span>
                  <span className="font-bold">{viewingSlot.replacementFaculty || 'Assigned'}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Custom Delete Slot Modal ──────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Slot Deletion"
      >
        {deletingSlot && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Remove Lecture Slot Allocation?</p>
                <p>You are about to remove <strong>{deletingSlot.courseName}</strong> ({deletingSlot.day} - {deletingSlot.time}) in {deletingSlot.room}.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p><strong>Lecturer:</strong> {deletingSlot.facultyName}</p>
              <p><strong>Room:</strong> {deletingSlot.room}</p>
              <p><strong>Section:</strong> {deletingSlot.section || 'Sec A'}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer"
              >
                Delete Slot Allocation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
