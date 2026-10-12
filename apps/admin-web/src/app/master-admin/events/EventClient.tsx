"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Calendar, Search, Plus, Filter, Users, MapPin, Clock,
  CheckCircle2, XCircle, ArrowLeft, Ticket, FileText,
  AlertTriangle, ShieldAlert
} from "lucide-react";
import {
  Event, EventRegistration, Student, Faculty,
  EventAttendance, EventHistory, EventTargeting
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface EventClientProps {
  initialTypes: any[];
  initialEvents: Event[];
  initialTargetings: EventTargeting[];
  initialRegistrations: EventRegistration[];
  initialAttendances: EventAttendance[];
  initialHistories: EventHistory[];
  students: Student[];
  faculty: Faculty[];
}

type ViewMode = "list" | "detail";

/* ======================== MAIN ======================== */
export function EventClient({
  initialEvents, initialRegistrations, students, faculty, initialTypes
}: EventClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selEventId, setSelEventId] = useState<string | null>(null);

  /* -------- METRICS -------- */
  const metrics = useMemo(() => {
    const upcoming = initialEvents.filter(e => new Date(e.date) > new Date() && e.status === "PUBLISHED");
    const pendingApproval = initialEvents.filter(e => e.status === "PENDING_APPROVAL" || e.approvalStatus === "PENDING");
    return {
      upcomingCount: upcoming.length,
      pendingCount: pendingApproval.length,
      totalRegistrations: initialRegistrations.length
    };
  }, [initialEvents, initialRegistrations]);

  /* -------- FILTERED EVENTS -------- */
  const filteredEvents = useMemo(() => {
    let list = initialEvents;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [initialEvents, searchQuery]);

  /* -------- EVENT DETAIL -------- */
  const selEvent = useMemo(() => initialEvents.find(e => e.id === selEventId), [initialEvents, selEventId]);
  const selType = useMemo(() => initialTypes.find(t => t.id === selEvent?.eventTypeId), [initialTypes, selEvent]);
  const selRegistrations = useMemo(() => initialRegistrations.filter(r => r.eventId === selEventId), [initialRegistrations, selEventId]);

  /* ========================================================
     RENDER: LIST VIEW
     ======================================================== */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Events Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage institutional events, seminars, and workshops</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.upcomingCount}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingCount}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalRegistrations}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events by name or venue..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map(evt => {
            const isUpcoming = new Date(evt.date) > new Date();
            const type = initialTypes.find(t => t.id === evt.eventTypeId);
            const regs = initialRegistrations.filter(r => r.eventId === evt.id).length;

            return (
              <div 
                key={evt.id} 
                onClick={() => { setSelEventId(evt.id); setViewMode("detail"); }}
                className="bg-white border border-gray-100 rounded-xl shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full overflow-hidden"
              >
                <div className={`h-2 w-full ${evt.status === 'PUBLISHED' ? 'bg-emerald-500' : evt.status === 'PENDING_APPROVAL' ? 'bg-amber-500' : evt.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {type?.name || "Event"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${evt.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : evt.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                      {evt.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">{evt.name}</h3>
                  <p className="text-[11px] text-gray-500 mb-4 line-clamp-2">{evt.description}</p>
                  
                  <div className="space-y-1.5 text-xs text-gray-600 mb-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{new Date(evt.date).toLocaleDateString("en-GB")} · {evt.startTime} - {evt.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{evt.venue}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      {regs} {evt.capacity ? `/ ${evt.capacity}` : ''} Registered
                    </div>
                    <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-100 rounded-xl">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No events found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: DETAIL VIEW
     ======================================================== */
  if (viewMode === "detail" && selEvent) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => { setViewMode("list"); setSelEventId(null); }} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 shadow-sm mt-1">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selEvent.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selType?.name} · Organized by {selEvent.organizer}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${selEvent.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {selEvent.status.replace("_", " ")}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(selEvent.date).toLocaleDateString("en-GB")}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> {selEvent.startTime} - {selEvent.endTime}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {selEvent.venue}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Event Details</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{selEvent.description}</p>
              
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Requires Registration</span>
                  <span className="font-semibold text-gray-900">{selEvent.requiresRegistration ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Capacity</span>
                  <span className="font-semibold text-gray-900">{selEvent.capacity || "Unlimited"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fee Amount</span>
                  <span className="font-semibold text-gray-900">{selEvent.requiresFee ? `₹${selEvent.feeAmount}` : "Free"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Provides Certificate</span>
                  <span className="font-semibold text-gray-900">{selEvent.providesCertificate ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Registrations</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                  {selRegistrations.length} Total
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Participant</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Reg. Date</th>
                      <th className="px-5 py-3 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selRegistrations.map(reg => {
                      let pName = "Unknown";
                      let pId = "";
                      if (reg.participantType === "STUDENT") {
                        const s = students.find(x => x.id === reg.participantId);
                        pName = `${s?.firstName} ${s?.lastName}`;
                        pId = s?.registrationNumber || "";
                      } else {
                        const f = faculty.find(x => x.id === reg.participantId);
                        pName = `${f?.firstName} ${f?.lastName}`;
                        pId = f?.employeeId || "";
                      }

                      return (
                        <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-gray-900">{pName}</p>
                            <p className="text-[11px] text-gray-500">{pId}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${reg.participantType === 'STUDENT' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                              {reg.participantType}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600 text-xs">
                            {new Date(reg.registeredAt).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${reg.status === 'REGISTERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {reg.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {selRegistrations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No registrations for this event yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
