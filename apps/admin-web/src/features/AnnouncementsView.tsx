"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useERPStore } from '../store';
import { useForm, Controller } from 'react-hook-form';
import { 
  Megaphone, Calendar, Plus, Bell, Clock, MapPin, Search, Filter, 
  Trash2, Edit, Eye, AlertTriangle, CheckCircle2, UserCheck, X, 
  Layers, Users, Archive, FileText, Check, AlertCircle, Building
} from 'lucide-react';
import Modal from '../components/Modal';
import { CustomSelect } from '../components/ui/CustomSelect';
import type { Announcement, EventItem } from '../types';

interface AnnouncementFormValues {
  title: string;
  content: string;
  category: 'primary' | 'secondary' | 'tertiary';
  priority: 'High' | 'Medium' | 'Low' | 'Urgent';
  status: 'Draft' | 'Scheduled' | 'Published' | 'Archived';
  audience: 'All College' | 'Students' | 'Faculty' | 'Department' | 'Course';
  department?: string;
  author?: string;
}

interface EventFormValues {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  organizer: string;
  category: 'Academic' | 'Cultural' | 'Workshop' | 'Seminar' | 'Sports';
  audience: 'All College' | 'Students' | 'Faculty' | 'Department';
  department?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
}

export default function AnnouncementsView() {
  const store = useERPStore();

  // ── Tab State: Announcements vs Events ─────────────────────────────────
  const [activeTab, setActiveTab] = useState<'announcements' | 'events'>('announcements');

  // ── Announcement Filters & Modals ──────────────────────────────────────
  const [annSearch, setAnnSearch] = useState('');
  const [annCategoryFilter, setAnnCategoryFilter] = useState('All Categories');
  const [annAudienceFilter, setAnnAudienceFilter] = useState('All Audiences');
  const [annStatusFilter, setAnnStatusFilter] = useState('All Statuses');

  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  const [isAnnDeleteModalOpen, setIsAnnDeleteModalOpen] = useState(false);
  const [deletingAnn, setDeletingAnn] = useState<Announcement | null>(null);

  const [isAnnDetailsModalOpen, setIsAnnDetailsModalOpen] = useState(false);
  const [viewingAnn, setViewingAnn] = useState<Announcement | null>(null);

  // ── Event Filters & Modals ─────────────────────────────────────────────
  const [evtSearch, setEvtSearch] = useState('');
  const [evtCategoryFilter, setEvtCategoryFilter] = useState('All Categories');
  const [evtStatusFilter, setEvtStatusFilter] = useState('All Statuses');

  const [isEvtModalOpen, setIsEvtModalOpen] = useState(false);
  const [editingEvtId, setEditingEvtId] = useState<string | null>(null);

  const [isEvtDeleteModalOpen, setIsEvtDeleteModalOpen] = useState(false);
  const [deletingEvt, setDeletingEvt] = useState<EventItem | null>(null);

  const [isEvtDetailsModalOpen, setIsEvtDetailsModalOpen] = useState(false);
  const [viewingEvt, setViewingEvt] = useState<EventItem | null>(null);

  // ── Form Hooks ─────────────────────────────────────────────────────────
  const { 
    control: annControl, register: annRegister, handleSubmit: annHandleSubmit, 
    reset: annReset, setValue: annSetValue, watch: annWatch, formState: { errors: annErrors } 
  } = useForm<AnnouncementFormValues>({
    defaultValues: {
      category: 'primary',
      priority: 'Medium',
      status: 'Published',
      audience: 'All College',
    }
  });

  const { 
    control: evtControl, register: evtRegister, handleSubmit: evtHandleSubmit, 
    reset: evtReset, setValue: evtSetValue, watch: evtWatch, formState: { errors: evtErrors } 
  } = useForm<EventFormValues>({
    defaultValues: {
      category: 'Workshop',
      audience: 'All College',
      status: 'Upcoming',
      time: '10:00 AM',
      endTime: '12:00 PM',
      date: new Date().toISOString().split('T')[0],
    }
  });

  const watchEvtDate = evtWatch('date');
  const watchEvtTime = evtWatch('time');
  const watchEvtLocation = evtWatch('location');

  // Realtime Venue Conflict Detection for Events
  const eventConflictWarning = useMemo(() => {
    if (!isEvtModalOpen || !watchEvtDate || !watchEvtTime || !watchEvtLocation) return null;

    const otherEvents = store.events.filter(e => e.id !== editingEvtId);
    const conflict = otherEvents.find(e => 
      e.location.toLowerCase() === watchEvtLocation.toLowerCase() &&
      (e.date === watchEvtDate || e.day === watchEvtDate.split('-')[2]) &&
      e.time === watchEvtTime
    );

    if (conflict) {
      return `Venue Conflict: ${watchEvtLocation} is already booked for "${conflict.title}" at ${watchEvtTime} on ${watchEvtDate}.`;
    }
    return null;
  }, [isEvtModalOpen, watchEvtDate, watchEvtTime, watchEvtLocation, store.events, editingEvtId]);

  // Options from store
  const deptOptions = useMemo(
    () => ["All Departments", ...store.departments.map(d => d.name)],
    [store.departments]
  );

  // ── Filtered Announcements ──────────────────────────────────────────────
  const filteredAnnouncements = useMemo(() => {
    const q = (annSearch || store.searchQuery).trim().toLowerCase();

    return store.announcements.filter(ann => {
      const matchCat = annCategoryFilter === 'All Categories' || ann.category === annCategoryFilter;
      const matchAud = annAudienceFilter === 'All Audiences' || (ann.audience || 'All College') === annAudienceFilter;
      const matchStat = annStatusFilter === 'All Statuses' || (ann.status || 'Published') === annStatusFilter;

      const matchSearch = !q ||
        ann.title.toLowerCase().includes(q) ||
        ann.content.toLowerCase().includes(q) ||
        ann.id.toLowerCase().includes(q);

      return matchCat && matchAud && matchStat && matchSearch;
    });
  }, [store.announcements, annCategoryFilter, annAudienceFilter, annStatusFilter, annSearch, store.searchQuery]);

  // ── Filtered Events ─────────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    const q = (evtSearch || store.searchQuery).trim().toLowerCase();

    return store.events.filter(evt => {
      const matchCat = evtCategoryFilter === 'All Categories' || (evt.category || 'Workshop') === evtCategoryFilter;
      const matchStat = evtStatusFilter === 'All Statuses' || (evt.status || 'Upcoming') === evtStatusFilter;

      const matchSearch = !q ||
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        (evt.organizer && evt.organizer.toLowerCase().includes(q)) ||
        evt.id.toLowerCase().includes(q);

      return matchCat && matchStat && matchSearch;
    });
  }, [store.events, evtCategoryFilter, evtStatusFilter, evtSearch, store.searchQuery]);

  // ── Announcement Handlers ──────────────────────────────────────────────
  const handleOpenCreateAnn = useCallback(() => {
    setEditingAnnId(null);
    annReset({
      title: '',
      content: '',
      category: 'primary',
      priority: 'Medium',
      status: 'Published',
      audience: 'All College',
      department: store.departments[0]?.name || 'Computer Science',
      author: 'Master Admin Office',
    });
    setIsAnnModalOpen(true);
  }, [store.departments, annReset]);

  const handleOpenEditAnn = useCallback((ann: Announcement) => {
    setEditingAnnId(ann.id);
    annSetValue('title', ann.title);
    annSetValue('content', ann.content);
    annSetValue('category', ann.category);
    annSetValue('priority', ann.priority || 'Medium');
    annSetValue('status', ann.status || 'Published');
    annSetValue('audience', ann.audience || 'All College');
    annSetValue('department', ann.department || store.departments[0]?.name || 'Computer Science');
    annSetValue('author', ann.author || 'Master Admin Office');
    setIsAnnModalOpen(true);
  }, [store.departments, annSetValue]);

  const confirmDeleteAnn = useCallback(() => {
    if (!deletingAnn) return;
    store.deleteAnnouncement(deletingAnn.id);
    setIsAnnDeleteModalOpen(false);
    setDeletingAnn(null);
  }, [deletingAnn, store]);

  const onSubmitAnn = useCallback((values: AnnouncementFormValues) => {
    if (editingAnnId) {
      store.updateAnnouncement(editingAnnId, values);
    } else {
      store.addAnnouncement(values);
    }
    setIsAnnModalOpen(false);
    annReset();
  }, [editingAnnId, store, annReset]);

  // ── Event Handlers ─────────────────────────────────────────────────────
  const handleOpenCreateEvt = useCallback(() => {
    setEditingEvtId(null);
    const todayStr = new Date().toISOString().split('T')[0];
    const day = todayStr.split('-')[2];

    evtReset({
      title: '',
      description: '',
      date: todayStr,
      time: '10:00 AM',
      endTime: '12:00 PM',
      location: 'Main Auditorium',
      organizer: 'Master Admin Office',
      category: 'Workshop',
      audience: 'All College',
      department: store.departments[0]?.name || 'Computer Science',
      status: 'Upcoming',
    });
    setIsEvtModalOpen(true);
  }, [store.departments, evtReset]);

  const handleOpenEditEvt = useCallback((evt: EventItem) => {
    setEditingEvtId(evt.id);
    evtSetValue('title', evt.title);
    evtSetValue('description', evt.description || '');
    evtSetValue('date', evt.date || '2026-10-15');
    evtSetValue('time', evt.time);
    evtSetValue('endTime', evt.endTime || '12:00 PM');
    evtSetValue('location', evt.location);
    evtSetValue('organizer', evt.organizer || 'Master Admin Office');
    evtSetValue('category', evt.category || 'Workshop');
    evtSetValue('audience', evt.audience || 'All College');
    evtSetValue('department', evt.department || store.departments[0]?.name || 'Computer Science');
    evtSetValue('status', evt.status || 'Upcoming');
    setIsEvtModalOpen(true);
  }, [store.departments, evtSetValue]);

  const confirmDeleteEvt = useCallback(() => {
    if (!deletingEvt) return;
    store.deleteEvent(deletingEvt.id);
    setIsEvtDeleteModalOpen(false);
    setDeletingEvt(null);
  }, [deletingEvt, store]);

  const onSubmitEvt = useCallback((values: EventFormValues) => {
    const dateParts = values.date.split('-');
    const day = dateParts[2] || '15';
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = parseInt(dateParts[1] || '10', 10) - 1;
    const month = monthNames[monthIndex] || 'Oct';

    const payload = {
      ...values,
      day,
      month,
    };

    if (editingEvtId) {
      store.updateEvent(editingEvtId, payload);
    } else {
      store.addEvent(payload);
    }
    setIsEvtModalOpen(false);
    evtReset();
  }, [editingEvtId, store, evtReset]);

  return (
    <div className="space-y-8">
      {/* ── Page Header & Tab Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline">Administrative</span>
            <span className="text-outline">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Communications</span>
          </nav>
          <h2 className="font-sans font-bold text-3xl text-on-surface tracking-tight font-display">
            Announcements & Events Hub
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Institutional broadcast notices, administrative alerts & official event scheduling
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'announcements' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'events' ? 'bg-white text-primary shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Institutional Events</span>
            </button>
          </div>

          <button 
            onClick={activeTab === 'announcements' ? handleOpenCreateAnn : handleOpenCreateEvt}
            className="flex items-center gap-2 px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer active:scale-95 duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'announcements' ? "Publish Notice" : "Schedule Event"}</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 1: ANNOUNCEMENTS TAB ──────────────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Notices</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{store.announcements.length}</h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Published Alerts</p>
              <h4 className="text-2xl font-black text-emerald-700 mt-1">
                {store.announcements.filter(a => !a.status || a.status === 'Published').length}
              </h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Scheduled Notices</p>
              <h4 className="text-2xl font-black text-amber-700 mt-1">
                {store.announcements.filter(a => a.status === 'Scheduled').length}
              </h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Urgent Alerts</p>
              <h4 className="text-2xl font-black text-primary mt-1">
                {store.announcements.filter(a => a.category === 'secondary' || a.priority === 'High' || a.priority === 'Urgent').length}
              </h4>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Search Announcements
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={annSearch}
                    onChange={e => setAnnSearch(e.target.value)}
                    placeholder="Notice title, keywords, ID..."
                    className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  {annSearch && (
                    <button onClick={() => setAnnSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-w-[150px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <CustomSelect
                  value={annCategoryFilter}
                  onChange={e => setAnnCategoryFilter(e.target.value)}
                  options={["All Categories", "primary", "secondary", "tertiary"]}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="min-w-[150px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Target Audience</label>
                <CustomSelect
                  value={annAudienceFilter}
                  onChange={e => setAnnAudienceFilter(e.target.value)}
                  options={["All Audiences", "All College", "Students", "Faculty", "Department"]}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="min-w-[140px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                <CustomSelect
                  value={annStatusFilter}
                  onChange={e => setAnnStatusFilter(e.target.value)}
                  options={["All Statuses", "Published", "Draft", "Scheduled", "Archived"]}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {(annCategoryFilter !== 'All Categories' || annAudienceFilter !== 'All Audiences' || annStatusFilter !== 'All Statuses' || annSearch) && (
                <button
                  onClick={() => {
                    setAnnCategoryFilter('All Categories');
                    setAnnAudienceFilter('All Audiences');
                    setAnnStatusFilter('All Statuses');
                    setAnnSearch('');
                  }}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.map(ann => (
              <div 
                key={ann.id} 
                className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-6 shadow-xs relative overflow-hidden group transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className={`w-5 h-5 ${ann.category === 'secondary' ? 'text-rose-600' : 'text-primary'}`} />
                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">{ann.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      ann.category === 'secondary' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                      {ann.category === 'secondary' ? 'Urgent Alert' : 'Standard Information'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 border rounded px-2 py-0.5">{ann.id}</span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                      <button 
                        onClick={() => { setViewingAnn(ann); setIsAnnDetailsModalOpen(true); }}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition-colors cursor-pointer"
                        title="View Notice Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleOpenEditAnn(ann)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                        title="Edit Notice"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => { setDeletingAnn(ann); setIsAnnDeleteModalOpen(true); }}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{ann.content}</p>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-wider gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ann.timestamp}</span>
                    </span>
                    <span>Audience: <strong className="text-slate-700">{ann.audience || 'All College'}</strong></span>
                  </div>
                  <span className="bg-slate-50 border px-2 py-0.5 rounded text-slate-600">
                    Status: {ann.status || 'Published'}
                  </span>
                </div>
              </div>
            ))}
            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-16 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-xs">
                No system announcements match your search or filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SECTION 2: INSTITUTIONAL EVENTS TAB ───────────────────────── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Events</p>
              <h4 className="text-2xl font-black text-slate-900 mt-1">{store.events.length}</h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Upcoming Events</p>
              <h4 className="text-2xl font-black text-emerald-700 mt-1">
                {store.events.filter(e => !e.status || e.status === 'Upcoming').length}
              </h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Ongoing Workshops</p>
              <h4 className="text-2xl font-black text-blue-700 mt-1">
                {store.events.filter(e => e.status === 'Ongoing').length}
              </h4>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Completed Events</p>
              <h4 className="text-2xl font-black text-slate-700 mt-1">
                {store.events.filter(e => e.status === 'Completed').length}
              </h4>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                  Search Events
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={evtSearch}
                    onChange={e => setEvtSearch(e.target.value)}
                    placeholder="Event title, location, organizer..."
                    className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-primary focus:bg-white rounded-xl text-xs focus:outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  {evtSearch && (
                    <button onClick={() => setEvtSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="min-w-[160px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                <CustomSelect
                  value={evtCategoryFilter}
                  onChange={e => setEvtCategoryFilter(e.target.value)}
                  options={["All Categories", "Academic", "Cultural", "Workshop", "Seminar", "Sports"]}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="min-w-[140px]">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                <CustomSelect
                  value={evtStatusFilter}
                  onChange={e => setEvtStatusFilter(e.target.value)}
                  options={["All Statuses", "Upcoming", "Ongoing", "Completed", "Cancelled"]}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary transition-all"
                />
              </div>

              {(evtCategoryFilter !== 'All Categories' || evtStatusFilter !== 'All Statuses' || evtSearch) && (
                <button
                  onClick={() => {
                    setEvtCategoryFilter('All Categories');
                    setEvtStatusFilter('All Statuses');
                    setEvtSearch('');
                  }}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Grid of Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.map(evt => (
              <div 
                key={evt.id} 
                className="bg-white border border-slate-200 hover:border-primary rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all group relative overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex flex-col items-center justify-center font-bold shrink-0">
                        <span className="text-base leading-none">{evt.day}</span>
                        <span className="text-[10px] uppercase">{evt.month}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors leading-tight">{evt.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">Category: <strong className="text-slate-700">{evt.category || 'Workshop'}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 border rounded px-2 py-0.5">{evt.id}</span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-10">
                        <button 
                          onClick={() => { setViewingEvt(evt); setIsEvtDetailsModalOpen(true); }}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded transition-colors cursor-pointer"
                          title="View Event Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleOpenEditEvt(evt)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => { setDeletingEvt(evt); setIsEvtDeleteModalOpen(true); }}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded transition-colors cursor-pointer"
                          title="Cancel/Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Venue: <strong className="text-slate-800">{evt.location}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Time: <strong className="text-slate-800">{evt.time}{evt.endTime ? ` - ${evt.endTime}` : ''}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-extrabold uppercase">
                  <span className={`px-2 py-0.5 rounded border ${
                    evt.status === 'Ongoing'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : evt.status === 'Completed'
                      ? 'bg-slate-100 text-slate-700 border-slate-200'
                      : evt.status === 'Cancelled'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {evt.status || 'Upcoming'}
                  </span>
                  <span className="text-slate-400">Audience: {evt.audience || 'All College'}</span>
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-2 text-center py-16 text-slate-400 font-medium bg-white border border-slate-200 rounded-2xl shadow-xs">
                No scheduled institutional events match your search or filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal 1: Create / Edit Announcement ─────────────────────── */}
      <Modal
        isOpen={isAnnModalOpen}
        onClose={() => setIsAnnModalOpen(false)}
        title={editingAnnId ? "Edit System Notice" : "Publish Public System Notice"}
      >
        <form onSubmit={annHandleSubmit(onSubmitAnn)} className="space-y-4">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Notice Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...annRegister('title', { required: 'Title is required', minLength: { value: 3, message: 'Must be at least 3 characters' } })}
              type="text"
              placeholder="e.g. End Semester Examination Schedule Released"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
            {annErrors.title && <p className="text-[10px] text-rose-600 font-bold mt-1">{annErrors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Notice Content / Detail Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...annRegister('content', { required: 'Content is required', minLength: { value: 10, message: 'Must be at least 10 characters' } })}
              rows={4}
              placeholder="Provide complete official notice details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
            {annErrors.content && <p className="text-[10px] text-rose-600 font-bold mt-1">{annErrors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Category Alert Level
              </label>
              <Controller
                name="category"
                control={annControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={[
                      { value: "primary", label: "Standard Notice (Primary)" },
                      { value: "secondary", label: "Urgent Alert (Secondary)" }
                    ]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Priority
              </label>
              <Controller
                name="priority"
                control={annControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["High", "Medium", "Low", "Urgent"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <Controller
                name="audience"
                control={annControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["All College", "Students", "Faculty", "Department"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Notice Status
              </label>
              <Controller
                name="status"
                control={annControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Published", "Draft", "Scheduled", "Archived"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAnnModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingAnnId ? "Save Notice Changes" : "Publish Announcement"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Announcement Details View Modal ──────────────────── */}
      <Modal
        isOpen={isAnnDetailsModalOpen}
        onClose={() => setIsAnnDetailsModalOpen(false)}
        title="Official Broadcast Announcement Details"
      >
        {viewingAnn && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded text-[10px]">
                  {viewingAnn.category === 'secondary' ? 'Urgent Notice' : 'System Notice'}
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingAnn.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingAnn.title}</h4>
              <p className="text-slate-500 font-medium">Published: {viewingAnn.timestamp}</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <p className="font-semibold text-slate-400 mb-1.5 uppercase text-[10px]">Notice Body:</p>
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{viewingAnn.content}</p>
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Target Audience:</span>
                <span className="font-bold text-slate-900">{viewingAnn.audience || 'All College'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Notice Priority:</span>
                <span className="font-bold text-primary">{viewingAnn.priority || 'Medium'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Publication Status:</span>
                <span className="font-bold text-slate-800">{viewingAnn.status || 'Published'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsAnnDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 3: Custom Delete Announcement Confirmation Modal ─────── */}
      <Modal
        isOpen={isAnnDeleteModalOpen}
        onClose={() => setIsAnnDeleteModalOpen(false)}
        title="Confirm Announcement Removal"
      >
        {deletingAnn && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Delete Broadcast Announcement?</p>
                <p>You are about to remove <strong>"{deletingAnn.title}"</strong> ({deletingAnn.id}) from the public notice board.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAnnDeleteModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAnn}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 4: Create / Edit Event ─────────────────────────────── */}
      <Modal
        isOpen={isEvtModalOpen}
        onClose={() => setIsEvtModalOpen(false)}
        title={editingEvtId ? "Edit Institutional Event" : "Schedule Institutional Event"}
      >
        <form onSubmit={evtHandleSubmit(onSubmitEvt)} className="space-y-4">
          {/* Venue Conflict Warning Banner */}
          {eventConflictWarning && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{eventConflictWarning}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...evtRegister('title', { required: 'Title is required' })}
              type="text"
              placeholder="e.g. Annual AI & Robotics Workshop"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
            />
            {evtErrors.title && <p className="text-[10px] text-rose-600 font-bold mt-1">{evtErrors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Event Category
              </label>
              <Controller
                name="category"
                control={evtControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Workshop", "Seminar", "Academic", "Cultural", "Sports"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Venue / Location Allocation <span className="text-rose-500">*</span>
              </label>
              <input
                {...evtRegister('location', { required: 'Location is required' })}
                type="text"
                placeholder="e.g. Main Auditorium"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
              {evtErrors.location && <p className="text-[10px] text-rose-600 font-bold mt-1">{evtErrors.location.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Event Date <span className="text-rose-500">*</span>
              </label>
              <input
                {...evtRegister('date', { required: 'Date is required' })}
                type="text"
                placeholder="2026-10-15"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-primary text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <input
                {...evtRegister('time', { required: 'Start time is required' })}
                type="text"
                placeholder="10:00 AM"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                {...evtRegister('endTime')}
                type="text"
                placeholder="12:00 PM"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <Controller
                name="audience"
                control={evtControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["All College", "Students", "Faculty", "Department"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Event Status
              </label>
              <Controller
                name="status"
                control={evtControl}
                render={({ field }) => (
                  <CustomSelect
                    value={field.value}
                    onChange={e => field.onChange(typeof e === 'string' ? e : e?.target?.value)}
                    options={["Upcoming", "Ongoing", "Completed", "Cancelled"]}
                    className="w-full h-10 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3"
                  />
                )}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEvtModalOpen(false)}
              className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 h-10 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-all text-xs shadow-md cursor-pointer"
            >
              {editingEvtId ? "Save Event Changes" : "Schedule Event"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 5: Event Details View Modal ──────────────────────────── */}
      <Modal
        isOpen={isEvtDetailsModalOpen}
        onClose={() => setIsEvtDetailsModalOpen(false)}
        title="Institutional Event Details"
      >
        {viewingEvt && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] uppercase border border-emerald-200">
                  {viewingEvt.category || 'Workshop'}
                </span>
                <span className="font-mono font-bold text-slate-400">{viewingEvt.id}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 pt-1">{viewingEvt.title}</h4>
              <p className="text-slate-500 font-medium">Scheduled: {viewingEvt.month} {viewingEvt.day}</p>
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Allocated Venue:</span>
                <span className="font-bold text-emerald-700">{viewingEvt.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Time Window:</span>
                <span className="font-bold text-slate-800">{viewingEvt.time}{viewingEvt.endTime ? ` - ${viewingEvt.endTime}` : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Event Status:</span>
                <span className="font-bold text-slate-800">{viewingEvt.status || 'Upcoming'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Target Audience:</span>
                <span className="font-bold text-slate-800">{viewingEvt.audience || 'All College'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsEvtDetailsModalOpen(false)}
                className="px-5 h-9 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Event
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modal 6: Custom Delete Event Confirmation Modal ───────────── */}
      <Modal
        isOpen={isEvtDeleteModalOpen}
        onClose={() => setIsEvtDeleteModalOpen(false)}
        title="Confirm Event Removal"
      >
        {deletingEvt && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Remove Scheduled Event?</p>
                <p>You are about to cancel and remove <strong>"{deletingEvt.title}"</strong> ({deletingEvt.location}).</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEvtDeleteModalOpen(false)}
                className="px-4 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvt}
                className="px-5 h-10 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all text-xs cursor-pointer"
              >
                Confirm Cancel Event
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
