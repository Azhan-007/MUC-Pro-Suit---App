"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Award,
  CreditCard,
  Briefcase,
  Megaphone,
  BookOpen,
  FileText,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentActivityItem } from "@/types/commandCenter";

interface RecentActivityCardProps {
  activity?: RecentActivityItem[];
}

const moduleIconMap: Record<string, React.ElementType> = {
  Events: CalendarDays,
  Certificates: Award,
  Finance: CreditCard,
  Placements: Briefcase,
  Notifications: Megaphone,
  Library: BookOpen,
  Examinations: FileText,
};

const moduleColorMap: Record<string, { bg: string; text: string }> = {
  Events: { bg: "bg-emerald-50 text-emerald-800", text: "text-emerald-800" },
  Certificates: { bg: "bg-teal-50 text-teal-700", text: "text-teal-700" },
  Finance: { bg: "bg-amber-50 text-amber-700", text: "text-amber-700" },
  Placements: { bg: "bg-indigo-50 text-indigo-700", text: "text-indigo-700" },
  Notifications: { bg: "bg-blue-50 text-blue-700", text: "text-blue-700" },
  Library: { bg: "bg-sky-50 text-sky-700", text: "text-sky-700" },
  Examinations: { bg: "bg-rose-50 text-rose-700", text: "text-rose-700" },
};

export function RecentActivityCard({ activity }: RecentActivityCardProps = {}) {
  const items = activity || [];

  return (
    <div className="bg-card rounded-2xl border border-border h-full flex flex-col shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          <h3 className="text-[15px] font-semibold text-foreground">
            Recent Institutional Activity
          </h3>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
          {items.length} records
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 divide-y divide-border overflow-y-auto max-h-[380px]">
        {items.length > 0 ? (
          items.map((item) => {
            const Icon = moduleIconMap[item.module] || Activity;
            const colors = moduleColorMap[item.module] || { bg: "bg-muted text-muted-foreground", text: "text-muted-foreground" };
            const dateObj = new Date(item.timestamp);
            const dateDisplay = isNaN(dateObj.getTime())
              ? item.timestamp
              : dateObj.toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

            const Content = (
              <div className="flex items-start gap-3.5 px-4 lg:px-5 py-3 hover:bg-muted/40 transition-colors group">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 mt-0.5",
                    colors.bg
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", colors.text)}>
                      {item.module}
                    </span>
                    <span className="text-[10.5px] font-medium text-muted-foreground ml-auto shrink-0">
                      {dateDisplay}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {item.description}
                  </p>
                </div>
              </div>
            );

            if (item.targetRoute) {
              return (
                <Link key={item.id} href={item.targetRoute} className="block cursor-pointer">
                  {Content}
                </Link>
              );
            }

            return <div key={item.id}>{Content}</div>;
          })
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No recent institutional activity records found.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground">
          Academic and institutional operational events
        </span>
      </div>
    </div>
  );
}
