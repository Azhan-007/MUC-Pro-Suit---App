import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  Clock,
  FileText,
  BarChart3,
  CreditCard,
  Library,
  Briefcase,
  Award,
  Megaphone,
  PieChart,
  Settings,
  Shield,
  Key,
  Calendar,
  Activity,
  History,
  AlertTriangle,
  Database,
  Bell,
  Mail,
  LineChart,
  ActivitySquare
} from "lucide-react";
import type { NavGroup } from "@/types";

export const superAdminNavigation: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Command Center", href: "/super-admin/command-center", icon: LayoutDashboard },
    ],
  },
  {
    label: "Access Control",
    items: [
      { label: "Users", href: "/super-admin/users", icon: Users },
      { label: "Roles", href: "/super-admin/roles", icon: Shield },
      { label: "Permissions", href: "/super-admin/permissions", icon: Key },
    ],
  },
  {
    label: "Monitoring & Security",
    items: [
      { label: "Audit Logs", href: "/super-admin/audit-logs", icon: History },
      { label: "Backups", href: "/super-admin/backups", icon: Database },
    ],
  }
];

export const masterAdminNavigation: NavGroup[] = [
  {
    label: "College Operations",
    items: [
      { label: "Command Center", href: "/master-admin/command-center", icon: LayoutDashboard },
    ],
  },
  {
    label: "Master Management",
    items: [
      { label: "Students", href: "/master-admin/students", icon: Users },
      { label: "Faculty", href: "/master-admin/faculty", icon: GraduationCap },
      { label: "Departments", href: "/master-admin/departments", icon: Building2 },
      { label: "Courses", href: "/master-admin/courses", icon: BookOpen },
      { label: "Subjects", href: "/master-admin/subjects", icon: BookOpen },
      { label: "Classes", href: "/master-admin/classes", icon: Building2 },
    ],
  },
  {
    label: "Academic Management",
    items: [
      { label: "Attendance", href: "/master-admin/attendance", icon: CalendarCheck },
      { label: "Timetable", href: "/master-admin/timetable", icon: Clock },
      { label: "Examinations", href: "/master-admin/examinations", icon: FileText },
      { label: "Results", href: "/master-admin/results", icon: BarChart3 },
    ],
  },
  {
    label: "Financial Management",
    items: [
      { label: "Fees", href: "/master-admin/fees", icon: CreditCard },
      { label: "Fee Collection", href: "/master-admin/fee-collection", icon: CreditCard },
      { label: "Scholarships", href: "/master-admin/scholarships", icon: Award },
      { label: "Fines", href: "/master-admin/fines", icon: AlertTriangle },
    ],
  },
  {
    label: "Campus Services",
    items: [
      { label: "Library", href: "/master-admin/library", icon: Library },
      { label: "Placements", href: "/master-admin/placements", icon: Briefcase },
      { label: "Events", href: "/master-admin/events", icon: Calendar },
      { label: "Certificates", href: "/master-admin/certificates", icon: Award },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Announcements", href: "/master-admin/announcements", icon: Megaphone },
      { label: "Notifications", href: "/master-admin/notifications", icon: Bell },
      { label: "Circulars", href: "/master-admin/circulars", icon: FileText },
    ],
  },
  {
    label: "Reports & Analytics",
    items: [
      { label: "Reports", href: "/master-admin/reports", icon: PieChart },
    ],
  },
];
