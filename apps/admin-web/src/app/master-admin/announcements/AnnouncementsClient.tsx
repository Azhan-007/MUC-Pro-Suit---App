"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Megaphone, Plus, Send, Eye, Clock, CheckCircle2,
  XCircle, Users, GraduationCap, Briefcase, AlertCircle,
  ArrowLeft, Search, Bell, Filter, Calendar
} from "lucide-react";
import {
  Notification, NotificationDelivery, NotificationHistory,
  Student, Faculty, Course, Department
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface AnnouncementsClientProps {
  notifications: Notification[];
  deliveries: NotificationDelivery[];
  history: NotificationHistory[];
  students: Student[];
  faculty: Faculty[];
  courses: Course[];
  departments: Department[];
}

type ViewMode = "list" | "compose" | "detail";
type StatusFilter = "" | "DRAFT" | "PUBLISHED" | "SCHEDULED" | "CANCELLED";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: typeof Bell }> = {
  ACADEMIC: { bg: "bg-blue-50", text: "text-blue-700", icon: GraduationCap },
  FEES: { bg: "bg-emerald-50", text: "text-emerald-700", icon: Briefcase },
  EVENT: { bg: "bg-violet-50", text: "text-violet-700", icon: Calendar },
  SYSTEM: { bg: "bg-gray-100", text: "text-gray-700", icon: AlertCircle },
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600" },
  PUBLISHED: { bg: "bg-emerald-100", text: "text-emerald-700" },
  SCHEDULED: { bg: "bg-amber-100", text: "text-amber-700" },
  CANCELLED: { bg: "bg-rose-100", text: "text-rose-700" },
};

/* ======================== MAIN ======================== */
export function AnnouncementsClient({
  notifications: initialNotifs, deliveries, history,
  students, faculty, courses, departments
}: AnnouncementsClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [localNotifs, setLocalNotifs] = useState(initialNotifs);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  // Compose state
  const [compTitle, setCompTitle] = useState("");
  const [compMessage, setCompMessage] = useState("");
  const [compCategory, setCompCategory] = useState<Notification["category"]>("ACADEMIC");
  const [compAudience, setCompAudience] = useState<Notification["audience"]>("STUDENTS");
  const [compScope, setCompScope] = useState<Notification["targetScope"]>("ALL");

  /* -------- FILTERING -------- */
  const filteredNotifs = useMemo(() => {
    let list = localNotifs;
    if (statusFilter) list = list.filter(n => n.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [localNotifs, statusFilter, searchQuery]);

  const metrics = useMemo(() => ({
    total: localNotifs.length,
    published: localNotifs.filter(n => n.status === "PUBLISHED").length,
    drafts: localNotifs.filter(n => n.status === "DRAFT").length,
    scheduled: localNotifs.filter(n => n.status === "SCHEDULED").length,
  }), [localNotifs]);

  const selectedNotif = useMemo(() => localNotifs.find(n => n.id === selectedNotifId), [localNotifs, selectedNotifId]);

  /* -------- ACTIONS -------- */
  const handlePublish = useCallback((notifId: string) => {
    setLocalNotifs(prev => prev.map(n => n.id === notifId ? { ...n, status: "PUBLISHED" as const, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : n));
  }, []);

  const handleCancel = useCallback((notifId: string) => {
    setLocalNotifs(prev => prev.map(n => n.id === notifId ? { ...n, status: "CANCELLED" as const, updatedAt: new Date().toISOString() } : n));
  }, []);

  const handleCreate = useCallback(() => {
    if (!compTitle.trim() || !compMessage.trim()) return;
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: compTitle,
      message: compMessage,
      category: compCategory,
      audience: compAudience,
      targetScope: compScope,
      targetIds: [],
      status: "DRAFT",
      createdBy: "masteradmin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalNotifs(prev => [newNotif, ...prev]);
    setCompTitle("");
    setCompMessage("");
    setViewMode("list");
  }, [compTitle, compMessage, compCategory, compAudience, compScope]);

  /* ========================================================
     RENDER: LIST VIEW
     ======================================================== */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Announcements</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage institutional announcements & notices</p>
          </div>
          <button
            onClick={() => setViewMode("compose")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: metrics.total, color: "bg-gray-50 text-gray-700", icon: Megaphone },
            { label: "Published", value: metrics.published, color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
            { label: "Drafts", value: metrics.drafts, color: "bg-amber-50 text-amber-700", icon: Clock },
            { label: "Scheduled", value: metrics.scheduled, color: "bg-blue-50 text-blue-700", icon: Calendar },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${stat.color.split(" ")[0]} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color.split(" ")[1]}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
          <div className="flex gap-1.5">
            {(["", "PUBLISHED", "DRAFT", "SCHEDULED", "CANCELLED"] as StatusFilter[]).map(sf => (
              <button
                key={sf || "all"}
                onClick={() => setStatusFilter(sf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === sf ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {sf || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Announcement List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {filteredNotifs.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No announcements found</p>
              <p className="text-xs text-gray-400 mt-1">Create a new announcement to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredNotifs.map(notif => {
                const catInfo = CATEGORY_COLORS[notif.category] || CATEGORY_COLORS.SYSTEM;
                const statusStyle = STATUS_STYLES[notif.status] || STATUS_STYLES.DRAFT;
                const CatIcon = catInfo.icon;
                const deliveryCount = deliveries.filter(d => d.notificationId === notif.id).length;

                return (
                  <button
                    key={notif.id}
                    onClick={() => { setSelectedNotifId(notif.id); setViewMode("detail"); }}
                    className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl ${catInfo.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <CatIcon className={`w-5 h-5 ${catInfo.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{notif.title}</h3>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {notif.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                        <span>{notif.audience}</span>
                        <span>·</span>
                        <span>{notif.targetScope.replace("_", " ")}</span>
                        {deliveryCount > 0 && (
                          <>
                            <span>·</span>
                            <span>{deliveryCount} delivered</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{new Date(notif.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: COMPOSE VIEW
     ======================================================== */
  if (viewMode === "compose") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode("list")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Announcement</h2>
            <p className="text-xs text-gray-500">Draft and publish an institutional notice</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Title</label>
            <input
              type="text"
              value={compTitle}
              onChange={e => setCompTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Message</label>
            <textarea
              value={compMessage}
              onChange={e => setCompMessage(e.target.value)}
              placeholder="Write the announcement content..."
              rows={5}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
              <select
                value={compCategory}
                onChange={e => setCompCategory(e.target.value as Notification["category"])}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="FEES">Fees</option>
                <option value="EVENT">Event</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Audience</label>
              <select
                value={compAudience}
                onChange={e => setCompAudience(e.target.value as Notification["audience"])}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="STUDENTS">Students</option>
                <option value="FACULTY">Faculty</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Target Scope</label>
              <select
                value={compScope}
                onChange={e => setCompScope(e.target.value as Notification["targetScope"])}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="ALL">All</option>
                <option value="SPECIFIC_COURSE">Specific Course</option>
                <option value="SPECIFIC_DEPARTMENT">Specific Department</option>
                <option value="SPECIFIC_USERS">Specific Users</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={!compTitle.trim() || !compMessage.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Save as Draft
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: DETAIL VIEW
     ======================================================== */
  if (viewMode === "detail" && selectedNotif) {
    const catInfo = CATEGORY_COLORS[selectedNotif.category] || CATEGORY_COLORS.SYSTEM;
    const statusStyle = STATUS_STYLES[selectedNotif.status] || STATUS_STYLES.DRAFT;
    const CatIcon = catInfo.icon;
    const notifDeliveries = deliveries.filter(d => d.notificationId === selectedNotif.id);
    const notifHistory = history.filter(h => h.notificationId === selectedNotif.id);

    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <button onClick={() => { setViewMode("list"); setSelectedNotifId(null); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Announcement Details</h2>
          </div>
          {selectedNotif.status === "DRAFT" && (
            <div className="flex gap-2">
              <button
                onClick={() => { handlePublish(selectedNotif.id); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
              >
                <Send className="w-3.5 h-3.5" /> Publish
              </button>
              <button
                onClick={() => { handleCancel(selectedNotif.id); setViewMode("list"); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${catInfo.bg} flex items-center justify-center shrink-0`}>
                <CatIcon className={`w-5 h-5 ${catInfo.text}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">{selectedNotif.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                    {selectedNotif.status}
                  </span>
                  <span className="text-[11px] text-gray-400">{selectedNotif.category}</span>
                  <span className="text-[11px] text-gray-400">·</span>
                  <span className="text-[11px] text-gray-400">{selectedNotif.audience}</span>
                  <span className="text-[11px] text-gray-400">·</span>
                  <span className="text-[11px] text-gray-400">{selectedNotif.targetScope.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedNotif.message}</p>
          </div>

          {/* Metadata */}
          <div className="px-6 py-4 bg-gray-50/50 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="font-medium">{new Date(selectedNotif.createdAt).toLocaleString("en-GB")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Author</span>
              <span className="font-medium">{selectedNotif.createdBy}</span>
            </div>
            {selectedNotif.publishedAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Published</span>
                <span className="font-medium">{new Date(selectedNotif.publishedAt).toLocaleString("en-GB")}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Deliveries</span>
              <span className="font-bold text-emerald-600">{notifDeliveries.length} recipients</span>
            </div>
          </div>

          {/* History Timeline */}
          {notifHistory.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Activity Log</h4>
              <div className="space-y-2">
                {notifHistory.map(h => (
                  <div key={h.id} className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-700 font-medium">{h.action}</span>
                    <span className="text-gray-400">by {h.performedBy}</span>
                    <span className="text-gray-400 ml-auto">{new Date(h.timestamp).toLocaleString("en-GB")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
