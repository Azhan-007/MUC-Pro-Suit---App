"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  GraduationCap,
  CalendarCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommandCenterKpi } from "@/types/commandCenter";

interface StatCardsProps {
  kpis?: CommandCenterKpi[];
}

const iconMap: Record<string, React.ElementType> = {
  "kpi-students": Users,
  "kpi-faculty": GraduationCap,
  "kpi-attendance": CalendarCheck,
  "kpi-attention": AlertCircle,
};

const accentConfig: Record<string, { bg: string; text: string }> = {
  violet: { bg: "bg-violet-50 border-violet-100", text: "text-violet-600" },
  emerald: { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" },
  amber: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700" },
  rose: { bg: "bg-rose-50 border-rose-100", text: "text-rose-600" },
};

export function StatCards({ kpis }: StatCardsProps = {}) {
  // If authoritative domain KPIs are supplied, render them
  if (kpis && kpis.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = iconMap[kpi.id] || Users;
          const config = accentConfig[kpi.accent] || accentConfig.emerald;
          const TrendIcon =
            kpi.trend === "up"
              ? TrendingUp
              : kpi.trend === "down"
                ? TrendingDown
                : Minus;

          const CardContent = (
            <div className="bg-card rounded-2xl border border-border p-4 lg:p-5 flex flex-col justify-between shadow-xs hover:shadow-sm hover:border-border/80 transition-all h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13.5px] font-medium text-muted-foreground/90">
                  {kpi.label}
                </span>
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-[14px] border",
                    config.bg,
                    config.text
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-3xl font-bold tracking-tight text-foreground leading-none">
                  {kpi.value}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  {kpi.trend && kpi.trend !== "attention" && kpi.trend !== "neutral" && (
                    <TrendIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        kpi.trend === "up" ? "text-emerald-600" : "text-rose-600"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "text-[11px] font-medium truncate",
                      kpi.trend === "up"
                        ? "text-emerald-700"
                        : kpi.trend === "attention"
                          ? "text-rose-600 font-semibold"
                          : "text-muted-foreground"
                    )}
                    title={kpi.subtitle}
                  >
                    {kpi.subtitle}
                  </span>
                </div>
              </div>
            </div>
          );

          if (kpi.targetRoute && kpi.targetRoute !== "#") {
            return (
              <Link key={kpi.id} href={kpi.targetRoute} className="block transition-transform hover:-translate-y-0.5">
                {CardContent}
              </Link>
            );
          }

          return <div key={kpi.id}>{CardContent}</div>;
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
      No KPI data available.
    </div>
  );
}
