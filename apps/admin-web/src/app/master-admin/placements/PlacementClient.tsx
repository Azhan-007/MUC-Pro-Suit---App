"use client";

import React, { useState, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Briefcase, Search, Plus, Filter, Users, Building2,
  Trophy, ArrowLeft, FileText, CheckCircle2, XCircle,
  Clock, MapPin, IndianRupee, Target
} from "lucide-react";
import {
  PlacementProfile, Company, PlacementDrive, JobRole,
  PlacementRound, RoundResult, PlacementApplication,
  PlacementOffer, Student
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface PlacementClientProps {
  initialCompanies: Company[];
  initialDrives: PlacementDrive[];
  initialRoles: JobRole[];
  initialProfiles: PlacementProfile[];
  initialApplications: PlacementApplication[];
  initialRounds: PlacementRound[];
  initialResults: RoundResult[];
  initialOffers: PlacementOffer[];
  students: Student[];
}

type ViewMode = "dashboard" | "drive_detail";

/* ======================== MAIN ======================== */
export function PlacementClient({
  initialCompanies, initialDrives, initialRoles, initialProfiles,
  initialApplications, initialRounds, initialResults, initialOffers, students
}: PlacementClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selDriveId, setSelDriveId] = useState<string | null>(null);
  
  /* -------- DASHBOARD METRICS -------- */
  const metrics = useMemo(() => {
    return {
      activeDrives: initialDrives.filter(d => new Date(d.date) >= new Date(Date.now() - 30*24*60*60*1000)).length, // last 30 days and future
      companiesCount: initialCompanies.length,
      offersMade: initialOffers.length,
      studentsPlaced: new Set(
        initialOffers.map(o => {
          const app = initialApplications.find(a => a.id === o.applicationId);
          return app ? app.studentId : "";
        }).filter(Boolean)
      ).size
    };
  }, [initialDrives, initialCompanies, initialOffers]);

  /* -------- FILTERED DRIVES -------- */
  const filteredDrives = useMemo(() => {
    let list = initialDrives;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => {
        const c = initialCompanies.find(x => x.id === d.companyId);
        return d.title.toLowerCase().includes(q) || c?.name.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [initialDrives, searchQuery, initialCompanies]);

  /* -------- DRIVE DETAIL CONTEXT -------- */
  const selDrive = useMemo(() => initialDrives.find(d => d.id === selDriveId), [initialDrives, selDriveId]);
  const selCompany = useMemo(() => selDrive ? initialCompanies.find(c => c.id === selDrive.companyId) : null, [selDrive, initialCompanies]);
  const selRoles = useMemo(() => initialRoles.filter(r => r.driveId === selDriveId), [initialRoles, selDriveId]);
  const selRounds = useMemo(() => initialRounds.filter(r => r.driveId === selDriveId).sort((a, b) => a.sequenceNumber - b.sequenceNumber), [initialRounds, selDriveId]);
  const selApps = useMemo(() => initialApplications.filter(a => a.driveId === selDriveId), [initialApplications, selDriveId]);
  const selOffers = useMemo(() => initialOffers.filter(o => selRoles.some(r => r.id === o.jobRoleId)), [initialOffers, selRoles]);

  /* ========================================================
     RENDER: DASHBOARD VIEW
     ======================================================== */
  if (viewMode === "dashboard") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Placement Cell</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage campus recruitment drives and student placements</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Drive
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Target className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Drives</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.activeDrives}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Companies</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.companiesCount}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Briefcase className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Offers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.offersMade}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Trophy className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Students Placed</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700">{metrics.studentsPlaced}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drives or companies..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {/* Drives List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map(drive => {
            const company = initialCompanies.find(c => c.id === drive.companyId);
            const roles = initialRoles.filter(r => r.driveId === drive.id);
            const appsCount = initialApplications.filter(a => a.driveId === drive.id).length;
            const offersCount = initialOffers.filter(o => roles.some(r => r.id === o.jobRoleId)).length;
            const isUpcoming = new Date(drive.date) > new Date();

            return (
              <div 
                key={drive.id} 
                onClick={() => { setSelDriveId(drive.id); setViewMode("drive_detail"); }}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{drive.title}</h3>
                    <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{company?.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isUpcoming ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {drive.driveType.replace("_", " ")}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs text-gray-600 mb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{new Date(drive.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{roles.length} Roles: {roles.map(r => r.title).join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{appsCount} Applications</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Offers Made</span>
                    <span className="text-lg font-bold text-gray-900">{offersCount}</span>
                  </div>
                  <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </div>
              </div>
            );
          })}
          {filteredDrives.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-100 rounded-xl">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No drives match your search.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: DRIVE DETAIL
     ======================================================== */
  if (viewMode === "drive_detail" && selDrive && selCompany) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button onClick={() => { setViewMode("dashboard"); setSelDriveId(null); }} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 shadow-sm mt-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selDrive.title}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{selCompany.name} · {selDrive.driveType.replace("_", " ")}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(selDrive.date).toLocaleDateString("en-GB")}</span>
                <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Min CGPA: {selDrive.minCgpa}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm">
              Edit Drive
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles & Rounds (Left Col) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Job Roles</h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{selRoles.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {selRoles.map(r => (
                  <div key={r.id} className="px-5 py-4">
                    <p className="text-sm font-bold text-gray-900 mb-1">{r.title}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> {r.salaryCtc.toLocaleString("en-IN")} LPA</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {r.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Selection Process</h3>
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{selRounds.length} Rounds</span>
              </div>
              <div className="px-5 py-4 space-y-4">
                {selRounds.map((r, i) => (
                  <div key={r.id} className="flex items-start gap-3 relative">
                    {i !== selRounds.length - 1 && <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-emerald-100" />}
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 relative z-10">
                      {r.sequenceNumber}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <p className="text-[11px] text-gray-500">{new Date(r.date).toLocaleDateString("en-GB")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Applications & Offers (Right Col) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden h-full">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Candidate Pipeline</h3>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">{selApps.length} Applicants</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{selOffers.length} Offers</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Student</th>
                      <th className="px-5 py-3 font-semibold text-center">Status</th>
                      <th className="px-5 py-3 font-semibold">Role Offered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selApps.map(app => {
                      const stu = students.find(s => s.id === app.studentId);
                      const offer = selOffers.find(o => o.applicationId === app.id);
                      const role = offer ? selRoles.find(r => r.id === offer.jobRoleId) : null;
                      
                      let statusEl = <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-bold">IN PROGRESS</span>;
                      if (offer) {
                        statusEl = <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 justify-center w-fit mx-auto"><Trophy className="w-3 h-3" /> SELECTED</span>;
                      }

                      return (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-semibold text-gray-900">{stu?.firstName} {stu?.lastName}</p>
                            <p className="text-[11px] text-gray-500">{stu?.registrationNumber}</p>
                          </td>
                          <td className="px-5 py-3 text-center">
                            {statusEl}
                          </td>
                          <td className="px-5 py-3">
                            {offer ? (
                              <div>
                                <p className="font-semibold text-gray-900">{role?.title}</p>
                                <p className="text-[11px] text-emerald-600 font-bold">₹{role?.salaryCtc.toLocaleString("en-IN")} LPA</p>
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {selApps.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No applications received yet.</p>
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
