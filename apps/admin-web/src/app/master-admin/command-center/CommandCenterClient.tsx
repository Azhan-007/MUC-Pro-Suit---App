"use client";

import React from "react";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { StatCards } from "@/components/dashboard/StatCards";
import { AttentionCard } from "@/components/dashboard/AttentionCard";
import { TodaysOperationsCard } from "@/components/dashboard/TodaysOperationsCard";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { ModuleSnapshotsCard } from "@/components/dashboard/ModuleSnapshotsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import type { CommandCenterOverview } from "@/types/commandCenter";

interface CommandCenterClientProps {
  overview: CommandCenterOverview;
}

export function CommandCenterClient({ overview }: CommandCenterClientProps) {
  return (
    <div className="flex flex-col gap-6 pt-2 pb-8">
      {/* ── 1. Authoritative College Context & Shift Banner ── */}
      <DashboardGreeting academicContext={overview.academicContext} />

      {/* ── 2. Core KPI Cards ── */}
      <StatCards kpis={overview.kpis} />

      {/* ── 3. Operational Core: Attention Queue + (Today's Operations & Upcoming Feeds) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <AttentionCard items={overview.attentionItems} />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="flex-1 min-h-0">
            <TodaysOperationsCard operations={overview.todaysOperations} />
          </div>
          <div className="flex-1 min-h-0">
            <UpcomingEvents items={overview.upcomingItems} />
          </div>
        </div>
      </div>

      {/* ── 4. Cross-Module Operational Snapshots ── */}
      <ModuleSnapshotsCard snapshots={overview.moduleSnapshots} />

      {/* ── 5. Historical Operational Activity Feed ── */}
      <RecentActivityCard activity={overview.recentActivity} />

      {/* ── 6. High-Frequency Administrative Operations ── */}
      <QuickActions actions={overview.quickActions} />
    </div>
  );
}
