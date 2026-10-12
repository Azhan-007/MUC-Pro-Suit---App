"use client";

import React from "react";
import Link from "next/link";
import {
  CreditCard,
  BookOpen,
  Briefcase,
  Award,
  ArrowUpRight,
} from "lucide-react";
import type { ModuleSnapshots } from "@/types/commandCenter";

interface ModuleSnapshotsCardProps {
  snapshots?: ModuleSnapshots;
}

function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function ModuleSnapshotsCard({ snapshots }: ModuleSnapshotsCardProps = {}) {
  const snap = snapshots || {
    finance: {
      totalAssessed: 36000,
      collected: 28000,
      pending: 5500,
      overdue: 5500,
      collectionPercentage: 78,
      targetRoute: "/master-admin/fees",
    },
    library: {
      totalBooks: 2,
      totalCopies: 5,
      availableCopies: 3,
      activeLoans: 1,
      overdueLoans: 1,
      pendingClearances: 1,
      targetRoute: "/master-admin/library",
    },
    placements: {
      activeDrives: 1,
      registeredStudents: 2,
      placedStudents: 1,
      offersCount: 1,
      targetRoute: "/master-admin/placements",
    },
    certificates: {
      pendingRequests: 1,
      issuedCount: 1,
      totalTypes: 3,
      targetRoute: "/master-admin/certificates",
    },
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Module Snapshots
        </h3>
        <span className="text-xs text-muted-foreground">
          Core ERP operational summaries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* ── Finance Snapshot ── */}
        <Link
          href={snap.finance.targetRoute}
          className="bg-card rounded-2xl border border-border p-4 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-border/80 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Finance &amp; Dues
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-1 border-t border-border/70 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(snap.finance.collected)} ({snap.finance.collectionPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-medium text-foreground">
                {formatCurrency(snap.finance.pending)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-bold text-rose-600">
                {formatCurrency(snap.finance.overdue)}
              </span>
            </div>
          </div>
        </Link>

        {/* ── Library Snapshot ── */}
        <Link
          href={snap.library.targetRoute}
          className="bg-card rounded-2xl border border-border p-4 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-border/80 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-100 text-sky-700">
                <BookOpen className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Library System
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-1 border-t border-border/70 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Copies</span>
              <span className="font-bold text-sky-700">
                {snap.library.availableCopies} of {snap.library.totalCopies}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Loans</span>
              <span className="font-medium text-foreground">
                {snap.library.activeLoans}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overdue Loans</span>
              <span className="font-bold text-amber-700">
                {snap.library.overdueLoans} {snap.library.overdueLoans === 1 ? "loan" : "loans"}
              </span>
            </div>
          </div>
        </Link>

        {/* ── Placements Snapshot ── */}
        <Link
          href={snap.placements.targetRoute}
          className="bg-card rounded-2xl border border-border p-4 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-border/80 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Placements
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-1 border-t border-border/70 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Drives</span>
              <span className="font-bold text-indigo-700">
                {snap.placements.activeDrives} Scheduled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registered</span>
              <span className="font-medium text-foreground">
                {snap.placements.registeredStudents} Students
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Placed</span>
              <span className="font-bold text-emerald-700">
                {snap.placements.placedStudents} ({snap.placements.offersCount} {snap.placements.offersCount === 1 ? "offer" : "offers"})
              </span>
            </div>
          </div>
        </Link>

        {/* ── Certificates Snapshot ── */}
        <Link
          href={snap.certificates.targetRoute}
          className="bg-card rounded-2xl border border-border p-4 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-border/80 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                <Award className="h-4.5 w-4.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Certificates
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-1 border-t border-border/70 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Review</span>
              <span className="font-bold text-rose-600">
                {snap.certificates.pendingRequests} Requests
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Issued</span>
              <span className="font-medium text-foreground">
                {snap.certificates.issuedCount} Certificates
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Credential Types</span>
              <span className="font-medium text-foreground">
                {snap.certificates.totalTypes} Types
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
