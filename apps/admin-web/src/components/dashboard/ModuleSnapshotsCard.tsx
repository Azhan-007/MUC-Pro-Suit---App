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
          className="bg-card rounded-xl border border-border/80 p-4 lg:p-4.5 flex flex-col justify-between shadow-xs hover:border-primary/30 hover:shadow-sm transition-all duration-150 group focus-ring"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                Finance &amp; Dues
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Collected</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 num-tabular">
                {formatCurrency(snap.finance.collected)} ({snap.finance.collectionPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-semibold text-foreground num-tabular">
                {formatCurrency(snap.finance.pending)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overdue</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 num-tabular">
                {formatCurrency(snap.finance.overdue)}
              </span>
            </div>
          </div>
        </Link>

        {/* ── Library Snapshot ── */}
        <Link
          href={snap.library.targetRoute}
          className="bg-card rounded-xl border border-border/80 p-4 lg:p-4.5 flex flex-col justify-between shadow-xs hover:border-primary/30 hover:shadow-sm transition-all duration-150 group focus-ring"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/60 text-sky-700 dark:text-sky-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                Library System
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Copies</span>
              <span className="font-bold text-sky-700 dark:text-sky-400 num-tabular">
                {snap.library.availableCopies} of {snap.library.totalCopies}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Loans</span>
              <span className="font-semibold text-foreground num-tabular">
                {snap.library.activeLoans}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Overdue Loans</span>
              <span className="font-bold text-amber-700 dark:text-amber-400 num-tabular">
                {snap.library.overdueLoans} {snap.library.overdueLoans === 1 ? "loan" : "loans"}
              </span>
            </div>
          </div>
        </Link>

        {/* ── Placements Snapshot ── */}
        <Link
          href={snap.placements.targetRoute}
          className="bg-card rounded-xl border border-border/80 p-4 lg:p-4.5 flex flex-col justify-between shadow-xs hover:border-primary/30 hover:shadow-sm transition-all duration-150 group focus-ring"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                Placements
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Drives</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-400 num-tabular">
                {snap.placements.activeDrives} Scheduled
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registered</span>
              <span className="font-semibold text-foreground num-tabular">
                {snap.placements.registeredStudents} Students
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Placed</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 num-tabular">
                {snap.placements.placedStudents} ({snap.placements.offersCount} {snap.placements.offersCount === 1 ? "offer" : "offers"})
              </span>
            </div>
          </div>
        </Link>

        {/* ── Certificates Snapshot ── */}
        <Link
          href={snap.certificates.targetRoute}
          className="bg-card rounded-xl border border-border/80 p-4 lg:p-4.5 flex flex-col justify-between shadow-xs hover:border-primary/30 hover:shadow-sm transition-all duration-150 group focus-ring"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900/60 text-teal-700 dark:text-teal-400">
                <Award className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-bold text-foreground">
                Certificates
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pending Review</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 num-tabular">
                {snap.certificates.pendingRequests} Requests
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Issued</span>
              <span className="font-semibold text-foreground num-tabular">
                {snap.certificates.issuedCount} Certificates
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Credential Types</span>
              <span className="font-semibold text-foreground num-tabular">
                {snap.certificates.totalTypes} Types
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
