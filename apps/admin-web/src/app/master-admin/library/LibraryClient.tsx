"use client";

import React, { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import {
  Book, Search, User, BookOpen, Clock, AlertTriangle,
  ArrowLeft, Check, X, ShieldAlert, BookMarked, BarChart3
} from "lucide-react";
import {
  LibraryBook, LibraryBookCopy, LibraryMember, LibraryLoan,
  Student, Faculty
} from "@/types/domain";

/* ======================== PROPS ======================== */
interface LibraryClientProps {
  initialBooks: LibraryBook[];
  initialCopies: LibraryBookCopy[];
  initialMembers: LibraryMember[];
  initialLoans: LibraryLoan[];
  initialReservations: any[];
  initialResolutions: any[];
  students: Student[];
  faculty: Faculty[];
}

type ViewMode = "dashboard" | "issue" | "return";

/* ======================== MAIN ======================== */
export function LibraryClient({
  initialBooks, initialCopies, initialMembers, initialLoans,
  students, faculty
}: LibraryClientProps) {

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
      const [localLoans, setLocalLoans] = useState<LibraryLoan[]>(initialLoans);
  const [localCopies, setLocalCopies] = useState<LibraryBookCopy[]>(initialCopies);

  // Issue View State
  const [issueMemberSearch, setIssueMemberSearch] = useState("");
  const [issueSelMemberId, setIssueSelMemberId] = useState("");
  const [issueBarcode, setIssueBarcode] = useState("");

  // Return View State
  const [returnBarcode, setReturnBarcode] = useState("");
  const [returnStatus, setReturnStatus] = useState<"RETURNED" | "LOST" | "DAMAGED">("RETURNED");

  // General Search
  const [searchQuery, setSearchQuery] = useState("");

  /* -------- METRICS -------- */
  const metrics = useMemo(() => {
    const activeLoans = localLoans.filter(l => l.status === "ACTIVE");
    const overdueLoans = activeLoans.filter(l => new Date(l.dueDate) < new Date());
    const availableCopies = localCopies.filter(c => c.status === "AVAILABLE");
    const today = new Date().toISOString().split("T")[0];
    const issuedToday = localLoans.filter(l => l.issueDate.startsWith(today));

    return {
      activeLoansCount: activeLoans.length,
      overdueLoansCount: overdueLoans.length,
      availableCopiesCount: availableCopies.length,
      totalCopiesCount: localCopies.length,
      issuedTodayCount: issuedToday.length,
      overdueLoans
    };
  }, [localLoans, localCopies]);

  /* -------- RESOLVED DATA -------- */
  const activeLoansList = useMemo(() => {
    let list = localLoans.filter(l => l.status === "ACTIVE");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(l => {
        const copy = localCopies.find(c => c.id === l.copyId);
        const book = initialBooks.find(b => b.id === copy?.bookId);
        const mem = initialMembers.find(m => m.id === l.memberId);
        const memDetail = mem?.memberType === "STUDENT" 
          ? students.find(s => s.id === mem.institutionalId)
          : faculty.find(f => f.id === mem?.institutionalId);
        
        return copy?.barcode.toLowerCase().includes(q) ||
               book?.title.toLowerCase().includes(q) ||
               memDetail?.firstName.toLowerCase().includes(q) ||
               memDetail?.lastName.toLowerCase().includes(q);
      });
    }
    return list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [localLoans, searchQuery, localCopies, initialBooks, initialMembers, students, faculty]);

  const issueMemberResults = useMemo(() => {
    if (!issueMemberSearch.trim()) return [];
    const q = issueMemberSearch.toLowerCase();
    const sResults = students.filter(s => 
      s.firstName.toLowerCase().includes(q) || 
      s.lastName.toLowerCase().includes(q) || 
      s.registrationNumber.toLowerCase().includes(q)
    ).map(s => ({ ...s, type: "STUDENT" as const }));
    
    const fResults = faculty.filter(f => 
      f.firstName.toLowerCase().includes(q) || 
      f.lastName.toLowerCase().includes(q) || 
      f.employeeId.toLowerCase().includes(q)
    ).map(f => ({ ...f, type: "FACULTY" as const }));

    return [...sResults, ...fResults].slice(0, 8);
  }, [issueMemberSearch, students, faculty]);

  const selectedMemberData = useMemo(() => {
    if (!issueSelMemberId) return null;
    const mem = initialMembers.find(m => m.id === issueSelMemberId);
    if (!mem) return null;
    const detail = mem.memberType === "STUDENT" 
      ? students.find(s => s.id === mem.institutionalId)
      : faculty.find(f => f.id === mem.institutionalId);
    return { member: mem, detail };
  }, [issueSelMemberId, initialMembers, students, faculty]);

  const getBookFromCopy = (copyId: string) => {
    const copy = localCopies.find(c => c.id === copyId);
    return initialBooks.find(b => b.id === copy?.bookId);
  };

  const getMemberDetails = (memberId: string) => {
    const mem = initialMembers.find(m => m.id === memberId);
    if (!mem) return { name: "Unknown", id: "", type: "" };
    if (mem.memberType === "STUDENT") {
      const s = students.find(x => x.id === mem.institutionalId);
      return { name: `${s?.firstName} ${s?.lastName}`, id: s?.registrationNumber, type: "Student" };
    } else {
      const f = faculty.find(x => x.id === mem.institutionalId);
      return { name: `${f?.firstName} ${f?.lastName}`, id: f?.employeeId, type: "Faculty" };
    }
  };

  /* -------- ACTIONS -------- */
  const issueMutation = useMutation({
    mutationFn: async (payload: { memberId: string; bookCopyId: string }) => {
      const res = await apiClient.post("/library/issue", payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.success && data.loan) {
        setLocalLoans(prev => [data.loan, ...prev]);
        setLocalCopies(prev => prev.map(c => c.id === variables.bookCopyId ? { ...c, status: "ISSUED" } : c));
        setIssueBarcode("");
        alert("Book issued successfully.");
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to issue book");
    }
  });

  const returnMutation = useMutation({
    mutationFn: async (payload: { loanId: string }) => {
      const res = await apiClient.post("/library/return", payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        const activeLoan = localLoans.find(l => l.id === variables.loanId);
        setLocalLoans(prev => prev.map(l => l.id === variables.loanId ? {
          ...l, 
          status: returnStatus,
          returnDate: new Date().toISOString(),
          acceptedBy: "masteradmin"
        } : l));
        
        if (activeLoan) {
          setLocalCopies(prev => prev.map(c => c.id === activeLoan.copyId ? { 
            ...c, 
            status: returnStatus === "RETURNED" ? "AVAILABLE" : returnStatus 
          } : c));
        }
        
        setReturnBarcode("");
        setReturnStatus("RETURNED");
        alert(`Book marked as ${returnStatus}.`);
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to return book");
    }
  });

  const handleIssueBook = () => {
    if (!issueSelMemberId || !issueBarcode.trim()) return;
    
    const copy = localCopies.find(c => c.barcode.toLowerCase() === issueBarcode.toLowerCase());
    if (!copy) { alert("Book copy not found!"); return; }
    if (copy.status !== "AVAILABLE") { alert(`Book copy is currently ${copy.status}!`); return; }

    const mem = initialMembers.find(m => m.id === issueSelMemberId);
    if (!mem) return;
    
    issueMutation.mutate({ memberId: mem.id, bookCopyId: copy.id });
  };

  const handleReturnBook = () => {
    if (!returnBarcode.trim()) return;
    
    const copy = localCopies.find(c => c.barcode.toLowerCase() === returnBarcode.toLowerCase());
    if (!copy) { alert("Book copy not found!"); return; }
    
    const activeLoan = localLoans.find(l => l.copyId === copy.id && l.status === "ACTIVE");
    if (!activeLoan) { alert("No active loan found for this book copy."); return; }

    // Domain rules might need separate APIs for lost/damaged vs return. 
    // Assuming backend handles normal return, we sync it.
    returnMutation.mutate({ loanId: activeLoan.id });
  };

  /* ========================================================
     RENDER: DASHBOARD VIEW
     ======================================================== */
  if (viewMode === "dashboard") {
    return (
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Circulation Desk</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage library issues, returns, and inventory</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("issue")}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" /> Issue Book
            </button>
            <button
              onClick={() => setViewMode("return")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <BookMarked className="w-4 h-4" /> Return Book
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Book className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Loans</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.activeLoansCount}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Check className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Available</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.availableCopiesCount} <span className="text-sm text-gray-400 font-normal">/ {metrics.totalCopiesCount}</span></p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Issued Today</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.issuedTodayCount}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
             <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-rose-700">{metrics.overdueLoansCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search active loans by member or book..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        {/* Active Loans List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Book Loans</h3>
          </div>
          
          {activeLoansList.length === 0 ? (
            <div className="p-12 text-center">
              <Book className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No active loans found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Book Details</th>
                    <th className="px-5 py-3 font-semibold">Member</th>
                    <th className="px-5 py-3 font-semibold">Issue Date</th>
                    <th className="px-5 py-3 font-semibold">Due Date</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeLoansList.map(loan => {
                    const copy = localCopies.find(c => c.id === loan.copyId);
                    const book = getBookFromCopy(loan.copyId);
                    const memInfo = getMemberDetails(loan.memberId);
                    const isOverdue = new Date(loan.dueDate) < new Date();

                    return (
                      <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-gray-900 line-clamp-1">{book?.title}</p>
                          <p className="text-[11px] text-gray-500 font-mono mt-0.5">Barcode: {copy?.barcode}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{memInfo.name}</p>
                          <p className="text-[11px] text-gray-500">{memInfo.type} · {memInfo.id}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {new Date(loan.issueDate).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-medium ${isOverdue ? 'text-rose-600' : 'text-gray-900'}`}>
                            {new Date(loan.dueDate).toLocaleDateString("en-GB")}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isOverdue ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">OVERDUE</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">ACTIVE</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: ISSUE VIEW
     ======================================================== */
  if (viewMode === "issue") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode("dashboard")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Issue Book</h2>
            <p className="text-xs text-gray-500">Assign a book to a student or faculty member</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-6">
          {/* Step 1: Select Member */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">1. Select Member</label>
            {!selectedMemberData ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student or faculty by name or ID..."
                  value={issueMemberSearch}
                  onChange={e => setIssueMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                {issueMemberSearch.trim() && issueMemberResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {issueMemberResults.map((r: any) => {
                      const mem = initialMembers.find(m => m.institutionalId === r.id);
                      return (
                        <button
                          key={r.id}
                          onClick={() => setIssueSelMemberId(mem?.id || "")}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-semibold">{r.firstName} {r.lastName}</p>
                          <p className="text-[10px] text-gray-500">{r.type} · {r.registrationNumber || r.employeeId}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{selectedMemberData.detail?.firstName} {selectedMemberData.detail?.lastName}</p>
                    <p className="text-[11px] text-gray-600">{selectedMemberData.member.memberType} · Active Loans: {selectedMemberData.member.activeLoansCount}</p>
                  </div>
                </div>
                <button onClick={() => setIssueSelMemberId("")} className="text-xs text-gray-500 hover:text-rose-600 font-semibold underline">
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Scan Book */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">2. Scan Book Barcode</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter or scan book barcode (e.g. MUC-LIB-1001)..."
                value={issueBarcode}
                onChange={e => setIssueBarcode(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              <button
                onClick={handleIssueBook}
                disabled={!issueSelMemberId || !issueBarcode.trim()}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     RENDER: RETURN VIEW
     ======================================================== */
  if (viewMode === "return") {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode("dashboard")} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Return Book</h2>
            <p className="text-xs text-gray-500">Process returned books back to circulation</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Scan Book Barcode *</label>
            <input
              type="text"
              placeholder="Enter or scan book barcode..."
              value={returnBarcode}
              onChange={e => setReturnBarcode(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Condition / Status *</label>
            <select
              value={returnStatus}
              onChange={e => setReturnStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="RETURNED">Good Condition (Returned)</option>
              <option value="DAMAGED">Damaged / Needs Repair</option>
              <option value="LOST">Lost by Member</option>
            </select>
            {returnStatus !== "RETURNED" && (
              <div className="mt-3 bg-amber-50 text-amber-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-amber-200">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Marking a book as {returnStatus} will make it unavailable for future circulation. You may need to apply a fine to the member manually.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleReturnBook}
              disabled={!returnBarcode.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Process Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}




