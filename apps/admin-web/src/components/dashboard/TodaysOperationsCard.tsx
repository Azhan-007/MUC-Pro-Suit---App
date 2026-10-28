"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  CalendarCheck,
  FileText,
  CalendarDays,
  UserCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { TodaysCollegeOperations } from "@/types/commandCenter";

interface TodaysOperationsCardProps {
  operations?: TodaysCollegeOperations;
}

export function TodaysOperationsCard({ operations }: TodaysOperationsCardProps = {}) {
  // Safe defaults if not passed
  const ops: TodaysCollegeOperations = operations || {
    date: "14 September 2026",
    dayOfWeek: "Monday",
    classesScheduled: 5,
    classesCompleted: 4,
    classesPending: 1,
    attendanceRecordedCount: 4,
    attendancePercentage: 91.2,
    examsTodayCount: 0,
    eventsTodayCount: 0,
    activeFacultyCount: 5,
    facultyOnLeaveCount: 0,
    activeShiftSummary: "Shift I Active (8:00 AM – 12:55 PM)",
  };

  return (
    <div className="bg-card rounded-xl border border-border/80 h-full flex flex-col shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/20">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">
            Today&apos;s College Operations
          </h3>
        </div>
        <span className="text-[10.5px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 rounded-full px-2 py-0.5">
          {ops.dayOfWeek}
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col gap-2.5 min-h-0">
        {/* Active Shift Status Bar */}
        <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-1.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0 flex items-center gap-1.5 text-xs truncate">
              <span className="font-semibold text-foreground truncate">
                {ops.activeShiftSummary}
              </span>
              <span className="text-muted-foreground text-[11px] hidden sm:inline">• 5 Periods (H1–H5)</span>
            </div>
          </div>
          <Link
            href="/master-admin/timetable"
            className="text-[11px] font-semibold text-primary hover:underline shrink-0 flex items-center gap-0.5 ml-2 focus-ring rounded"
          >
            Timetable <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Operational Metrics Grid */}
        <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 min-h-0">
          {/* Tile 1: Classes Scheduled */}
          <div className="rounded-lg border border-border/70 p-2.5 bg-card hover:bg-muted/20 transition-all flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Classes
              </span>
              <div className="h-5.5 w-5.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground my-0.5 leading-none num-tabular">
              {ops.classesScheduled}
            </p>
            <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
              <span>{ops.classesCompleted} done</span> • <span className="text-amber-700 dark:text-amber-400">{ops.classesPending} pend</span>
            </div>
          </div>

          {/* Tile 2: Attendance Rate */}
          <div className="rounded-lg border border-border/70 p-2.5 bg-card hover:bg-muted/20 transition-all flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Attendance
              </span>
              <div className="h-5.5 w-5.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground my-0.5 leading-none num-tabular">
              {ops.attendancePercentage}%
            </p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              {ops.attendanceRecordedCount} logged
            </p>
          </div>

          {/* Tile 3: Faculty Active */}
          <div className="rounded-lg border border-border/70 p-2.5 bg-card hover:bg-muted/20 transition-all flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Faculty
              </span>
              <div className="h-5.5 w-5.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <UserCheck className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground my-0.5 leading-none num-tabular">
              {ops.activeFacultyCount}
            </p>
            <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 truncate">
              All on duty
            </p>
          </div>

          {/* Tile 4: Exams Today */}
          <div className="rounded-lg border border-border/70 p-2.5 bg-card hover:bg-muted/20 transition-all flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Exams Today
              </span>
              <div className="h-5.5 w-5.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground my-0.5 leading-none num-tabular">
              {ops.examsTodayCount}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              {ops.examsTodayCount > 0 ? "In progress" : "None today"}
            </p>
          </div>

          {/* Tile 5: Events Today */}
          <div className="rounded-lg border border-border/70 p-2.5 bg-card hover:bg-muted/20 transition-all flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Events Today
              </span>
              <div className="h-5.5 w-5.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground my-0.5 leading-none num-tabular">
              {ops.eventsTodayCount}
            </p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              {ops.eventsTodayCount > 0 ? "Campus event" : "None today"}
            </p>
          </div>

          {/* Tile 6: Academic Status */}
          <div className="rounded-lg border border-border/70 p-2.5 bg-card hover:bg-muted/20 transition-all flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground">
                Status
              </span>
              <div className="h-5.5 w-5.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className="text-sm sm:text-base font-bold text-foreground my-0.5 leading-none truncate">
              Instructional
            </p>
            <p className="text-[10px] font-medium text-muted-foreground truncate">
              Regular Schedule
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/70 bg-muted/20 mt-auto flex items-center justify-between text-xs">
        <span className="text-muted-foreground text-[11px]">
          Live daily operational heartbeat
        </span>
        <Link
          href="/master-admin/attendance"
          className="font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-[11px] focus-ring rounded"
        >
          Attendance Module <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
