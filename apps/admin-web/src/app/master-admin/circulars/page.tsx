"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  FileBadge,
  AlertCircle,
  Calendar,
  UserCheck,
  Building,
  GraduationCap,
  Users
} from "lucide-react";
import { mockOfficialCirculars, OfficialCircular } from "@/data/mock/db";

export default function CircularsPage() {
  const [circulars, setCirculars] = useState<OfficialCircular[]>(mockOfficialCirculars);
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedAudience, setSelectedAudience] = useState<string>("ALL");

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<OfficialCircular["category"]>("ACADEMIC");
  const [targetAudience, setTargetAudience] = useState<OfficialCircular["targetAudience"]>("ALL");
  const [summary, setSummary] = useState("");
  const [signatory, setSignatory] = useState("Dr. K. H. Kaleemullah");
  const [signatoryDesignation, setSignatoryDesignation] = useState("Principal & Head of Institution");

  const filteredCirculars = circulars.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.signatory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesAudience = selectedAudience === "ALL" || c.targetAudience === selectedAudience;

    return matchesSearch && matchesCategory && matchesAudience;
  });

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const newCircular: OfficialCircular = {
      id: `circ-${Date.now()}`,
      referenceNumber: `MUC/CIR/2026/0${circulars.length + 50}`,
      title,
      category,
      targetAudience,
      issuedDate: new Date().toISOString().split("T")[0],
      signatory,
      signatoryDesignation,
      status: "ACTIVE",
      acknowledgementRate: "100%",
      summary
    };

    setCirculars([newCircular, ...circulars]);
    setTitle("");
    setSummary("");
    setViewMode("list");
  };

  const getCategoryColor = (cat: OfficialCircular["category"]) => {
    switch (cat) {
      case "ACADEMIC":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "EXAMINATION":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "FEES":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ADMINISTRATION":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "EVENT":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getAudienceIcon = (aud: OfficialCircular["targetAudience"]) => {
    switch (aud) {
      case "STUDENTS":
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case "FACULTY":
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case "DEPARTMENTS":
        return <Building className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  if (viewMode === "create") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-10">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">New Official Circular</h2>
          <p className="text-sm text-gray-500 mt-1">Draft and dispatch a new institutional circular</p>
        </div>

        <form onSubmit={handleDispatch} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Circular Subject / Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory Guidelines for Continuous Internal Assessment"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="ACADEMIC">Academic</option>
                <option value="EXAMINATION">Examination</option>
                <option value="FEES">Fees & Finance</option>
                <option value="ADMINISTRATION">Administration</option>
                <option value="EVENT">Event</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Target Audience *</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="ALL">All Students & Faculty</option>
                <option value="STUDENTS">Students Only</option>
                <option value="FACULTY">Faculty & Staff Only</option>
                <option value="DEPARTMENTS">Specific Departments</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Signatory & Authority *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
                placeholder="Signatory Name"
                className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <input
                type="text"
                value={signatoryDesignation}
                onChange={(e) => setSignatoryDesignation(e.target.value)}
                placeholder="Designation"
                className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Content Body / Summary *</label>
            <textarea
              rows={4}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write the full circular notice instructions and guidelines here..."
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" /> Dispatch Circular
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Official Circulars</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track authoritative institutional circulars and memos</p>
        </div>
        <button
          onClick={() => setViewMode("create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Circular
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Dispatched</p>
            <p className="text-2xl font-bold text-gray-900">{circulars.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Acknowledgement</p>
            <p className="text-2xl font-bold text-gray-900">92%</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Circulars</p>
            <p className="text-2xl font-bold text-gray-900">{circulars.filter((c) => c.status === "ACTIVE").length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Institutional Circulars Directory</h3>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search circulars, subject, signatory..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="ACADEMIC">Academic</option>
              <option value="EXAMINATION">Examination</option>
              <option value="FEES">Fees</option>
              <option value="ADMINISTRATION">Administration</option>
            </select>
            <select
              value={selectedAudience}
              onChange={(e) => setSelectedAudience(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Audiences</option>
              <option value="STUDENTS">Students Only</option>
              <option value="FACULTY">Faculty Only</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredCirculars.map((circ) => (
            <div key={circ.id} className="p-5 hover:bg-gray-50/70 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {circ.referenceNumber}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(circ.category)}`}>
                    {circ.category}
                  </span>
                  <span className="text-[11px] text-gray-600 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                    {getAudienceIcon(circ.targetAudience)}
                    <span>{circ.targetAudience}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {circ.issuedDate}
                  </span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {circ.acknowledgementRate} Ack
                  </span>
                </div>
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-1.5">{circ.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{circ.summary}</p>

              <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">{circ.signatory}</span>
                  <span className="text-gray-400 mx-1.5">·</span>
                  <span>{circ.signatoryDesignation}</span>
                </div>
                <span className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                  View Full Document &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
