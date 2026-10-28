"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { UserMenu } from "./UserMenu";

/** Map route segment to clean page title */
function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() || "";
  const titleMap: Record<string, string> = {
    "master-admin": "Command Center",
    "super-admin": "Command Center",
    "command-center": "Command Center",
    students: "Students Register",
    faculty: "Faculty Directory",
    courses: "Courses & Programs",
    classes: "Classes & Sections",
    subjects: "Subjects & Curriculum",
    departments: "Academic Departments",
    attendance: "Attendance Records",
    timetable: "Class Timetable",
    examinations: "Examinations",
    results: "Results & Grades",
    fees: "Fee Management",
    "fee-collection": "Fee Collection",
    fines: "Fines & Penalties",
    scholarships: "Scholarships",
    library: "Library System",
    placements: "Training & Placements",
    events: "College Events",
    circulars: "Circulars",
    notifications: "Notification Center",
    reports: "Analytics & Reports",
    certificates: "Certificates",
    announcements: "Announcements",
    "audit-logs": "Audit Logs",
    roles: "Role Permissions",
    security: "Security Settings",
  };
  return titleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function TopHeader() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  const isCommandCenter =
    pathname === "/master-admin/command-center" ||
    pathname === "/super-admin/command-center" ||
    pathname === "/master-admin" ||
    pathname === "/super-admin";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 lg:px-6 bg-card/95 backdrop-blur-md border-b border-border/80 text-foreground transition-all">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-card border border-border text-foreground hover:bg-muted/70 transition-colors cursor-pointer focus-ring"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        {/* Page Title */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm lg:text-[15px] font-bold text-foreground tracking-tight">
            {title}
          </h2>
          <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            Beta
          </span>
        </div>
      </div>

      {/* Action buttons portal target & User Menu (Profile icon ONLY on Command navbar) */}
      <div className="flex items-center gap-2.5">
        <div id="navbar-actions" className="flex items-center gap-2" />
        {isCommandCenter && <UserMenu />}
      </div>
    </header>
  );
}
