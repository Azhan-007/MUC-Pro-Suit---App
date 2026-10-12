"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { 
  Bell, Send, Mail, Megaphone, AlertCircle, History, Clock, FileText, CheckCircle2, User, Users, CheckSquare
} from "lucide-react";
import { NavbarActions } from "@/components/layout/NavbarActions";
import { 
  Notification,
  NotificationCategory,
  NotificationDelivery,
  NotificationHistory,
  Student,
  Faculty,
  Department,
  Course
} from "@/types/domain";


interface NotificationClientProps {
  initialNotifications: Notification[];
  initialDeliveries: NotificationDelivery[];
  initialHistories: NotificationHistory[];
  students: Student[];
  faculty: Faculty[];
  departments: Department[];
  courses: Course[];
}

export function NotificationClient({
  initialNotifications, initialDeliveries, initialHistories, students, faculty, departments, courses
}: NotificationClientProps) {
  const [activeTab, setActiveTab] = useState<"DASHBOARD" | "COMPOSE" | "DELIVERIES" | "HISTORY">("DASHBOARD");
  
  // Data State
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [deliveries, setDeliveries] = useState<NotificationDelivery[]>(initialDeliveries);
    const [histories, setHistories] = useState<NotificationHistory[]>(initialHistories);

  // Form State for Compose
  const [composeTitle, setComposeTitle] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeCategory, setComposeCategory] = useState<NotificationCategory>("GENERAL");
  const [composeAudience, setComposeAudience] = useState<"STUDENTS" | "FACULTY" | "BOTH">("BOTH");
  const [composeScope, setComposeScope] = useState<"ALL" | "SPECIFIC_DEPARTMENT" | "SPECIFIC_COURSE">("ALL");
  const [composeTargetId, setComposeTargetId] = useState("");

  const handleCreateDraft = async () => {
    if (!composeTitle || !composeMessage) return alert("Title and Message required.");
    
    try {
      await apiClient.post('/notifications/notifications', {
        title: composeTitle,
        message: composeMessage,
        category: composeCategory,
        audience: composeAudience,
        targetRoles: ["STUDENT", "FACULTY"],
        status: 'DRAFT'
      });
      const res = await apiClient.get('/notifications/notifications');
      setNotifications(res.data?.data || []);
      setComposeTitle("");
      setComposeMessage("");
      alert("Draft saved successfully.");
      setActiveTab("DASHBOARD");
    } catch (e: any) {
      alert("Error saving draft: " + e.message);
    }
  };

  const publishMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string; targetScope: string; category: string; audience: string; targetIds: string[] }) => {
      const res = await apiClient.post("/notifications/publish", payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      alert("Notification published successfully via Backend API.");
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to publish notification");
    }
  });

  const handlePublish = (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif) return;

    if (confirm("Are you sure you want to publish this notification? It will instantly resolve recipients based on your targeting rules and generate delivery payloads.")) {
      // Fire the API call
      publishMutation.mutate({
        title: notif.title,
        content: notif.message,
        targetScope: notif.targetScope,
        category: notif.category,
        audience: notif.audience,
        targetIds: notif.targetIds || []
      });
    }
  };

  const handleCancel = async (notificationId: string) => {
    const notif = notifications.find(n => n.id === notificationId);
    if (!notif) return;
    const reason = prompt("Enter reason for cancellation:");
    if (!reason) return;

    try {
      await apiClient.post(`/notifications/notifications/${notificationId}/cancel`, { reason });
      const res = await apiClient.get('/notifications/notifications');
      setNotifications(res.data?.data || []);
    } catch(e) { console.error(e); }
  };

  const handleMarkAsRead = async (deliveryId: string) => {
    const del = deliveries.find(d => d.id === deliveryId);
    if (!del) return;
    
    try {
      await apiClient.post(`/notifications/deliveries/${deliveryId}/read`);
      const res = await apiClient.get('/notifications/deliveries');
      setDeliveries(res.data?.data || []);
    } catch(e) { console.error(e); }
  };

  const getRecipientName = (id: string, type: "STUDENT" | "FACULTY") => {
    if (type === "STUDENT") {
      const s = students.find(s => s.id === id);
      return s ? `${s.firstName} ${s.lastName}` : id;
    } else {
      const f = faculty.find(f => f.id === id);
      return f ? `${f.firstName} ${f.lastName}` : id;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <NavbarActions>
        <button onClick={() => setActiveTab("COMPOSE")} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer">
          <Send className="w-3.5 h-3.5"/> Compose Alert
        </button>
      </NavbarActions>

      <div className="flex gap-4 border-b border-border px-2 overflow-x-auto">
        <button onClick={() => setActiveTab("DASHBOARD")} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === "DASHBOARD" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
          Announcements
        </button>
        <button onClick={() => setActiveTab("DELIVERIES")} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === "DELIVERIES" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
          Delivery Tracking
        </button>
        <button onClick={() => setActiveTab("HISTORY")} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === "HISTORY" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
          Audit Log
        </button>
      </div>

      {activeTab === "COMPOSE" && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-3xl">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><Megaphone className="w-5 h-5"/> Draft New Notification</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input value={composeTitle} onChange={e => setComposeTitle(e.target.value)} type="text" className="w-full px-3 py-2 border border-border rounded-md bg-background" placeholder="E.g. Server Maintenance..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message Body</label>
              <textarea value={composeMessage} onChange={e => setComposeMessage(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-[100px]" placeholder="Detailed information here..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select value={composeCategory} onChange={e => setComposeCategory(e.target.value as any)} className="w-full px-3 py-2 border border-border rounded-md bg-background">
                  <option value="GENERAL">GENERAL</option>
                  <option value="ACADEMIC">ACADEMIC</option>
                  <option value="EXAMINATION">EXAMINATION</option>
                  <option value="FEES">FEES</option>
                  <option value="EVENT">EVENT</option>
                  <option value="SYSTEM">SYSTEM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Target Audience</label>
                <select value={composeAudience} onChange={e => setComposeAudience(e.target.value as any)} className="w-full px-3 py-2 border border-border rounded-md bg-background">
                  <option value="BOTH">All Users (Students + Faculty)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="FACULTY">Faculty Only</option>
                </select>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4"/> Audience Resolution Scope</h3>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Scope</label>
                <select value={composeScope} onChange={e => { setComposeScope(e.target.value as any); setComposeTargetId(""); }} className="w-full px-3 py-2 border border-border rounded-md bg-background">
                  <option value="ALL">ALL (Entire Audience)</option>
                  <option value="SPECIFIC_DEPARTMENT">Specific Department</option>
                  {composeAudience !== "FACULTY" && <option value="SPECIFIC_COURSE">Specific Course</option>}
                </select>
              </div>

              {composeScope === "SPECIFIC_DEPARTMENT" && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Select Department</label>
                  <select value={composeTargetId} onChange={e => setComposeTargetId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option value="">Select...</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              {composeScope === "SPECIFIC_COURSE" && (
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Select Course</label>
                  <select value={composeTargetId} onChange={e => setComposeTargetId(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option value="">Select...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleCreateDraft} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">Save as Draft</button>
              <button onClick={() => setActiveTab("DASHBOARD")} className="px-4 py-2 border border-border rounded-md hover:bg-muted font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "DASHBOARD" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notifications.map(notif => {
            const notifDeliveries = deliveries.filter(d => d.notificationId === notif.id);
            const total = notifDeliveries.length;
            const read = notifDeliveries.filter(d => d.status === "READ").length;
            const percent = total === 0 ? 0 : Math.round((read / total) * 100);

            return (
              <div key={notif.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary">
                      {notif.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      notif.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                      notif.status === 'DRAFT' ? 'bg-muted text-muted-foreground' :
                      notif.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {notif.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base mb-1">{notif.title}</h3>
                  <div className="text-xs text-muted-foreground mb-4 line-clamp-3">{notif.message}</div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-border">
                    <div className="flex items-center gap-2"><Users className="w-3 h-3"/> Target: <span className="font-medium text-foreground">{notif.audience}</span> ({notif.targetScope})</div>
                    <div className="flex items-center gap-2"><Clock className="w-3 h-3"/> Created: {new Date(notif.createdAt).toLocaleDateString()}</div>
                  </div>
                  
                  {notif.status === "PUBLISHED" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-medium mb-1">
                        <span>Read Engagement</span>
                        <span>{percent}% ({read}/{total})</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2 pt-3 border-t border-border">
                  {notif.status === "DRAFT" && (
                    <button onClick={() => handlePublish(notif.id)} className="flex-1 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700">Publish Now</button>
                  )}
                  {notif.status === "PUBLISHED" && (
                    <button onClick={() => handleCancel(notif.id)} className="flex-1 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-medium hover:bg-rose-100">Cancel/Retract</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "DELIVERIES" && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg flex items-center gap-2"><Mail className="w-5 h-5"/> Recipient Inbox Tracking</h2>
              <p className="text-xs text-muted-foreground">Track whether resolved targets have seen their notifications.</p>
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Notification</th>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Delivered At</th>
                <th className="px-4 py-3 font-medium">Read Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deliveries.slice().reverse().map(del => {
                const notif = notifications.find(n => n.id === del.notificationId);
                return (
                  <tr key={del.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium text-xs max-w-[200px] truncate">{notif?.title}</td>
                    <td className="px-4 py-3">{getRecipientName(del.recipientId, del.recipientType)}</td>
                    <td className="px-4 py-3 text-[10px]">{del.recipientType}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{del.deliveredAt ? new Date(del.deliveredAt).toLocaleString() : 'Pending'}</td>
                    <td className="px-4 py-3">
                      {del.status === "READ" ? (
                        <div className="flex flex-col">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 w-max">READ</span>
                          <span className="text-[10px] text-muted-foreground mt-1">{del.readAt ? new Date(del.readAt).toLocaleString() : ''}</span>
                        </div>
                      ) : (
                        <button onClick={() => handleMarkAsRead(del.id)} className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-medium hover:bg-muted/80 flex items-center gap-1">
                          <CheckSquare className="w-3 h-3"/> Mark Read
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "HISTORY" && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-lg flex items-center gap-2"><History className="w-5 h-5"/> Notification Audit Log</h2>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Notification Title</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {histories.slice().reverse().map(h => {
                const notif = notifications.find(n => n.id === h.notificationId);
                return (
                  <tr key={h.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium text-xs">{notif?.title || h.notificationId}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        h.action === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                        h.action === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {h.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(h.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{h.reason}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}




