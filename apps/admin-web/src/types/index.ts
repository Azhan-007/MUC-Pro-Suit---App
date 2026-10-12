import type { LucideIcon } from "lucide-react";

/* ─── Navigation ───────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/* ─── Dashboard ────────────────────────────────────────────── */

export interface StatCardData {
  label: string;
  value: string;
  subtitle: string;
  trend: "up" | "down" | "neutral" | "attention";
  icon: LucideIcon;
  accentClass: string;
}

export type ActionPriority = "urgent" | "high" | "medium" | "low";

export type ActionCategory =
  | "attendance"
  | "finance"
  | "examination"
  | "academic"
  | "faculty";

export interface ActionItemData {
  id: string;
  category: ActionCategory;
  title: string;
  description: string;
  priority: ActionPriority;
  timestamp: string;
  action: string;
}

export interface AttendanceDataPoint {
  day: string;
  rate: number;
}

export interface FeeCollectionData {
  totalExpected: number;
  collected: number;
  pending: number;
  overdue: number;
  collectionPercent: number;
}

export interface UpcomingEventData {
  id: string;
  date: string;
  dayNum: string;
  month: string;
  title: string;
  type: "deadline" | "exam" | "event" | "holiday";
  daysLeft: number;
}

export interface QuickActionData {
  label: string;
  icon: LucideIcon;
  accentClass: string;
}

export * from "./commandCenter";
