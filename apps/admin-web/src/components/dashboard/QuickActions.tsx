"use client";

import React from "react";
import Link from "next/link";
import {
  UserPlus,
  CalendarCheck,
  CreditCard,
  Clock,
  FileText,
  Award,
  Megaphone,
  CalendarDays,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickActionItem } from "@/types/commandCenter";

interface QuickActionsProps {
  actions?: QuickActionItem[];
}

const iconMap: Record<string, React.ElementType> = {
  UserPlus,
  CalendarCheck,
  CreditCard,
  Clock,
  FileText,
  Award,
  Megaphone,
  CalendarDays,
};

export function QuickActions({ actions }: QuickActionsProps = {}) {
  const items = actions && actions.length > 0 ? actions : null;

  return (
    <div className="bg-card rounded-xl border border-border/80 h-full flex flex-col shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4.5 py-3.5 border-b border-border/70 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">
            Frequent Operations
          </h3>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          Master Admin Direct Actions
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 p-3.5 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {items
            ? items.map((action) => {
                const Icon = iconMap[action.iconName] || Zap;
                return (
                  <Link
                    key={action.id}
                    href={action.targetRoute}
                    className="flex flex-col items-center justify-center text-center gap-2 p-3 sm:p-3.5 lg:p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/30 hover:border-primary/30 transition-all group shadow-2xs hover:shadow-xs cursor-pointer focus-ring"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl mb-0.5 border transition-transform duration-150 group-hover:scale-105 shadow-2xs",
                        action.accentClass
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 w-full px-1">
                      <span className="text-xs lg:text-[13px] font-bold text-foreground block leading-tight group-hover:text-primary transition-colors truncate">
                        {action.label}
                      </span>
                      {action.description && (
                        <span className="text-[10.5px] text-muted-foreground block mt-0.5 truncate max-w-full">
                          {action.description}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            : (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground">
                  No quick actions configured.
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
