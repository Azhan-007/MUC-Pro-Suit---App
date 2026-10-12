"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck,
  CreditCard,
  FileText,
  Users,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Megaphone,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionModule, AttentionPriority } from "@/types/commandCenter";

interface AttentionCardProps {
  items?: AttentionItem[];
}

type FilterTab = "ALL" | "CRITICAL" | "APPROVALS" | "OPERATIONS";

const moduleConfig: Record<
  AttentionModule,
  {
    icon: React.ElementType;
    badgeBg: string;
    label: string;
  }
> = {
  ATTENDANCE: {
    icon: CalendarCheck,
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    label: "Attendance",
  },
  FINANCE: {
    icon: CreditCard,
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    label: "Finance",
  },
  EXAMINATION: {
    icon: FileText,
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    label: "Exam",
  },
  CERTIFICATES: {
    icon: Award,
    badgeBg: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20",
    label: "Certificate",
  },
  LIBRARY: {
    icon: BookOpen,
    badgeBg: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20",
    label: "Library",
  },
  PLACEMENTS: {
    icon: Briefcase,
    badgeBg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    label: "Placement",
  },
  FACULTY: {
    icon: Users,
    badgeBg: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
    label: "Faculty",
  },
  EVENTS: {
    icon: CalendarDays,
    badgeBg: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20",
    label: "Event",
  },
  NOTIFICATIONS: {
    icon: Megaphone,
    badgeBg: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    label: "Notice",
  },
};

const priorityConfig: Record<
  AttentionPriority,
  {
    bar: string;
    badge: string;
    dot: string;
    label: string;
  }
> = {
  URGENT: {
    bar: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
    dot: "bg-rose-500",
    label: "Urgent",
  },
  HIGH: {
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
    dot: "bg-amber-500",
    label: "High",
  },
  MEDIUM: {
    bar: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60",
    dot: "bg-sky-500",
    label: "Medium",
  },
  LOW: {
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    dot: "bg-slate-400",
    label: "Routine",
  },
};

export function AttentionCard({ items }: AttentionCardProps = {}) {
  const allItems = useMemo(() => items || [], [items]);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Categorization helpers
  const criticalItems = useMemo(
    () => allItems.filter((i) => i.priority === "URGENT" || i.priority === "HIGH"),
    [allItems]
  );

  const approvalItems = useMemo(
    () =>
      allItems.filter(
        (i) =>
          i.module === "EVENTS" ||
          i.module === "CERTIFICATES" ||
          i.module === "ATTENDANCE" ||
          i.actionLabel.toLowerCase().includes("resolve") ||
          i.actionLabel.toLowerCase().includes("authorize") ||
          i.actionLabel.toLowerCase().includes("process")
      ),
    [allItems]
  );

  const operationItems = useMemo(
    () =>
      allItems.filter(
        (i) =>
          i.module === "EXAMINATION" ||
          i.module === "LIBRARY" ||
          i.module === "PLACEMENTS" ||
          i.module === "NOTIFICATIONS"
      ),
    [allItems]
  );

  // Tab filtered results
  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case "CRITICAL":
        return criticalItems;
      case "APPROVALS":
        return approvalItems;
      case "OPERATIONS":
        return operationItems;
      case "ALL":
      default:
        return allItems;
    }
  }, [activeTab, allItems, criticalItems, approvalItems, operationItems]);

  // If not expanded, show top 4 items to ensure no awkward scrolling or sliced elements
  const displayedItems = isExpanded ? filteredItems : filteredItems.slice(0, 4);
  const hiddenCount = filteredItems.length - displayedItems.length;

  const urgentCount = allItems.filter((i) => i.priority === "URGENT").length;

  return (
    <div className="bg-card rounded-2xl border border-border h-full flex flex-col shadow-xs overflow-hidden transition-all duration-200">
      {/* ─── 1. Header ─── */}
      <div className="px-5 py-4 border-b border-border/80 bg-muted/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-foreground tracking-tight">
                  Requires Your Attention
                </h3>
                {allItems.length > 0 && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">
                Priority sorted operational queue requiring Master Admin action
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {urgentCount > 0 && (
              <span className="text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 animate-pulse">
                {urgentCount} Urgent
              </span>
            )}
            <span className="text-xs font-semibold text-muted-foreground bg-muted/80 rounded-full px-2.5 py-0.5 border border-border/60">
              {allItems.length} actionable
            </span>
          </div>
        </div>

        {/* ─── 2. Filter Pills ─── */}
        <div className="flex items-center gap-1.5 mt-3.5 pt-3 border-t border-border/60 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              activeTab === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "ALL"
                  ? "bg-primary-foreground/20 text-primary-foreground font-bold"
                  : "bg-border text-muted-foreground"
              )}
            >
              {allItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CRITICAL")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              activeTab === "CRITICAL"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>🚨 Urgent & High</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "CRITICAL"
                  ? "bg-white/25 text-white font-bold"
                  : "bg-border text-muted-foreground"
              )}
            >
              {criticalItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("APPROVALS")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              activeTab === "APPROVALS"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>⚡ Approvals</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "APPROVALS"
                  ? "bg-white/25 text-white font-bold"
                  : "bg-border text-muted-foreground"
              )}
            >
              {approvalItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("OPERATIONS")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer",
              activeTab === "OPERATIONS"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>📋 Operations</span>
            <span
              className={cn(
                "text-[10px] px-1.5 py-0.2 rounded-full",
                activeTab === "OPERATIONS"
                  ? "bg-white/25 text-white font-bold"
                  : "bg-border text-muted-foreground"
              )}
            >
              {operationItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* ─── 3. Cardlet List ─── */}
      <div
        className={cn(
          "flex-1 p-4 space-y-2.5 transition-all",
          isExpanded ? "max-h-[580px] overflow-y-auto pr-2" : ""
        )}
      >
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => {
            const config = moduleConfig[item.module] || moduleConfig.ATTENDANCE;
            const priority = priorityConfig[item.priority] || priorityConfig.MEDIUM;
            const Icon = config.icon;

            return (
              <Link
                key={item.id}
                href={item.targetRoute}
                className="relative block rounded-xl border border-border/80 bg-card hover:bg-muted/30 hover:border-primary/40 hover:shadow-xs transition-all p-3.5 pl-4 group"
              >
                {/* Urgency Color Accent Indicator on the Left Edge */}
                <div
                  className={cn(
                    "absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all group-hover:w-1.5",
                    priority.bar
                  )}
                />

                <div className="flex flex-col gap-2">
                  {/* Top Line: Module Chip + Priority + Due / Timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border",
                          config.badgeBg
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </span>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                          priority.badge
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full shrink-0", priority.dot)}
                        />
                        {priority.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
                      <Clock className="h-3 w-3 text-muted-foreground/70" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>

                  {/* Middle Line: Title and Description */}
                  <div>
                    <h4 className="text-[13.5px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Line: Right-Aligned Action Chip */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-0.5">
                    <span className="text-[11px] text-muted-foreground/80 font-medium">
                      Requires Master Admin sign-off
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {item.actionLabel}
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Queue is clear for this category
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              No outstanding items requiring immediate action under this filter.
            </p>
          </div>
        )}
      </div>

      {/* ─── 4. Functional Footer ─── */}
      <div className="px-5 py-3 border-t border-border bg-muted/20 mt-auto flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          Showing {displayedItems.length} of {filteredItems.length} items
          {hiddenCount > 0 && ` (${hiddenCount} more hidden)`}
        </span>

        {filteredItems.length > 4 ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-muted"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                View All {filteredItems.length} Items <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        ) : (
          <span className="text-[11.5px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> All items prioritized
          </span>
        )}
      </div>
    </div>
  );
}
