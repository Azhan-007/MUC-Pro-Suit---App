const fs = require('fs');
const path = require('path');

const masterRoutes = [
  // already done: students, faculty, departments, courses, subjects, classes, attendance, timetable, examinations, results, assignments, fees, fee-collection, scholarships, fines, library, placements, hostel, events, certificates, announcements, notifications, circulars, reports
];

const superRoutes = [
  'system-settings', 'academic-years', 'semesters', 'global-config',
  'activity-logs', 'error-logs', 'backups',
  'system-notifications', 'email-templates', 'push-notifications',
  'analytics', 'usage', 'performance'
];

function createPage(base, route, icon, title, desc) {
  const dir = path.join(__dirname, 'src', 'app', base, route);
  fs.mkdirSync(dir, { recursive: true });
  
  const content = `import { ${icon} } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <${icon} className="w-6 h-6 text-primary" />
            ${title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ${desc}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">Module functionality will be implemented here.</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}

// Generate super admin routes
const superMap = {
  'system-settings': ['Settings', 'System Settings', 'Platform-level configurations.'],
  'academic-years': ['Calendar', 'Academic Years', 'Manage academic year cycles.'],
  'semesters': ['Clock', 'Semesters', 'Manage semester configurations.'],
  'global-config': ['Database', 'Global Configuration', 'System-wide configurable values.'],
  'activity-logs': ['Activity', 'Activity Logs', 'General system activity tracking.'],
  'error-logs': ['AlertTriangle', 'Error Logs', 'Application and system errors.'],
  'backups': ['Database', 'Backups & Restore', 'Manage platform backup snapshots.'],
  'system-notifications': ['Bell', 'System Notifications', 'Platform-level notification management.'],
  'email-templates': ['Mail', 'Email Templates', 'Manage transactional email formats.'],
  'push-notifications': ['Megaphone', 'Push Notifications', 'Manage push alerts.'],
  'analytics': ['LineChart', 'System Analytics', 'Platform-wide analytics.'],
  'usage': ['ActivitySquare', 'Usage Statistics', 'System utilization tracking.'],
  'performance': ['Activity', 'Performance Monitoring', 'Platform performance metrics.']
};

for (const [route, [icon, title, desc]] of Object.entries(superMap)) {
  createPage('super-admin', route, icon, title, desc);
}

console.log("Remaining shells created.");
