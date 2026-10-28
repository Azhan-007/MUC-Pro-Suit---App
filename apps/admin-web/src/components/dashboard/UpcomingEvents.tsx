"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CalendarDays, ArrowRight, ChevronRight } from "lucide-react";
import type { UpcomingItem } from "@/types/commandCenter";

interface UpcomingEventsProps {
  items?: UpcomingItem[];
}

const typeStyles: Record<string, string> = {
  EXAMINATION: "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60",
  FEE: "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60",
  EVENT: "bg-emerald-50 text-emerald-800 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60",
  PLACEMENT: "bg-indigo-50 text-indigo-700 border-indigo-200/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60",
  ACADEMIC: "bg-violet-50 text-violet-700 border-violet-200/70 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60",
  CERTIFICATE: "bg-teal-50 text-teal-700 border-teal-200/70 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60",
};

export function UpcomingEvents({ items }: UpcomingEventsProps = {}) {
  const displayItems = items && items.length > 0 ? items : null;

  return (
    <div className="bg-card rounded-xl border border-border/80 h-full flex flex-col shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-muted/20">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">
            Upcoming Deadlines &amp; Events
          </h3>
        </div>
        <Link
          href="/master-admin/events"
          className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer focus-ring rounded"
        >
          View Calendar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Events / Deadlines List — dynamically fills available height */}
      <div className="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">
        {displayItems ? (
          displayItems.map((item) => {
            const dateObj = new Date(item.date);
            const month = dateObj.toLocaleDateString("en-IN", { month: "short" });
            const dayNum = dateObj.getDate();
            // Clean up repetitive prefixes like "Event: " or "Exam: "
            const cleanTitle = item.title.replace(/^(Event|Exam):\s*/i, "");

            return (
              <Link
                key={item.id}
                href={item.targetRoute}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border/60 transition-all group cursor-pointer focus-ring"
              >
                {/* Calendar Date Block */}
                <div className="flex flex-col items-center justify-center shrink-0 w-9.5 h-9.5 rounded-lg bg-primary/5 border border-primary/15 group-hover:border-primary/25 group-hover:bg-primary/10 transition-colors">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-primary leading-none mb-0.5">
                    {month}
                  </span>
                  <span className="text-sm font-extrabold text-foreground leading-none num-tabular">
                    {dayNum}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                    {cleanTitle}
                  </p>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider border",
                        typeStyles[item.type] || "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.type}
                    </span>

                    {item.statusBadge && (
                      <span className="text-[8.5px] font-medium text-muted-foreground bg-muted/80 px-1.5 py-0.2 rounded border border-border/50">
                        {item.statusBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Due Status & Arrow */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                      item.daysRemaining === 0
                        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300"
                        : item.daysRemaining === 1
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                        : item.daysRemaining <= 7
                        ? "bg-amber-50/70 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300"
                        : "bg-muted/70 text-muted-foreground border-border/60"
                    )}
                  >
                    {item.daysRemaining === 0
                      ? "Today"
                      : item.daysRemaining === 1
                      ? "Tomorrow"
                      : `${item.daysRemaining}d left`}
                  </span>

                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No upcoming events.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/70 bg-muted/20 mt-auto flex items-center justify-between text-xs shrink-0">
        <span className="text-[11px] text-muted-foreground">
          Chronologically sorted across academic modules
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground">
          {displayItems ? displayItems.length : 0} items
        </span>
      </div>
    </div>
  );
}
