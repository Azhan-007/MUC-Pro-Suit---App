/**
 * ─── MASTER ADMIN COMMAND CENTER VIEW MODEL TYPES ───────────────────────────
 *
 * Strongly typed operational aggregates for the Master Admin Command Center.
 * These types normalize domain data from across all ERP modules into a single
 * backend-ready view model without duplicating core entity models.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface AcademicShiftInfo {
  shiftId: "SHIFT_I" | "SHIFT_II";
  name: string;
  timing: string;
  type: string; // "Aided Programs" | "Self-Financing Programs"
  programsCount: number;
  isActive: boolean;
}

export interface AcademicContextData {
  currentDateFormatted: string; // e.g. "14 September 2026"
  dayName: string; // e.g. "Monday"
  timeString: string; // e.g. "12:18 PM"
  academicYear: string; // e.g. "2026-27"
  academicYearStatus: string; // "ACTIVE"
  semesterTerm: string; // "Odd Term"
  semesterNumber: number; // 1
  semesterType: "ODD" | "EVEN";
  academicStatus: string; // e.g. "Instructional Session Active"
  activeShiftStatus: string; // "Shift I Active" | "Shift II Active" | "Shifts I & II Concluded"
  activeShiftKey: "SHIFT_I" | "SHIFT_II" | "BOTH" | "UPCOMING_SHIFT_I" | "CONCLUDED";
  shifts: AcademicShiftInfo[];
}

export interface CommandCenterKpi {
  id: string;
  label: string;
  value: string | number;
  subtitle: string;
  trend?: "up" | "down" | "neutral" | "attention";
  trendValue?: string;
  accent: "violet" | "emerald" | "amber" | "rose";
  targetRoute: string;
}

export type AttentionModule =
  | "ATTENDANCE"
  | "FINANCE"
  | "EXAMINATION"
  | "CERTIFICATES"
  | "LIBRARY"
  | "PLACEMENTS"
  | "FACULTY"
  | "EVENTS"
  | "NOTIFICATIONS";

export type AttentionPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export interface AttentionItem {
  id: string;
  module: AttentionModule;
  priority: AttentionPriority;
  title: string;
  description: string;
  timestamp: string;
  actionLabel: string;
  targetRoute: string;
}

export interface TodaysCollegeOperations {
  date: string;
  dayOfWeek: string;
  classesScheduled: number;
  classesCompleted: number;
  classesPending: number;
  attendanceRecordedCount: number;
  attendancePercentage: number;
  examsTodayCount: number;
  eventsTodayCount: number;
  activeFacultyCount: number;
  facultyOnLeaveCount: number;
  activeShiftSummary: string;
}

export interface UpcomingItem {
  id: string;
  type: "EXAMINATION" | "FEE" | "EVENT" | "PLACEMENT" | "ACADEMIC" | "CERTIFICATE";
  title: string;
  date: string;
  formattedDate: string;
  daysRemaining: number;
  sourceModule: string;
  targetRoute: string;
  statusBadge?: string;
}

export interface RecentActivityItem {
  id: string;
  module: string;
  action: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  targetRoute?: string;
}

export interface ModuleSnapshots {
  finance: {
    totalAssessed: number;
    collected: number;
    pending: number;
    overdue: number;
    collectionPercentage: number;
    targetRoute: string;
  };
  library: {
    totalBooks: number;
    totalCopies: number;
    availableCopies: number;
    activeLoans: number;
    overdueLoans: number;
    pendingClearances: number;
    targetRoute: string;
  };
  placements: {
    activeDrives: number;
    registeredStudents: number;
    placedStudents: number;
    offersCount: number;
    targetRoute: string;
  };
  certificates: {
    pendingRequests: number;
    issuedCount: number;
    totalTypes: number;
    targetRoute: string;
  };
}

export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  targetRoute: string;
  iconName: string;
  accentClass: string;
}

export interface CommandCenterOverview {
  academicContext: AcademicContextData;
  kpis: CommandCenterKpi[];
  attentionItems: AttentionItem[];
  todaysOperations: TodaysCollegeOperations;
  upcomingItems: UpcomingItem[];
  recentActivity: RecentActivityItem[];
  moduleSnapshots: ModuleSnapshots;
  quickActions: QuickActionItem[];
}
