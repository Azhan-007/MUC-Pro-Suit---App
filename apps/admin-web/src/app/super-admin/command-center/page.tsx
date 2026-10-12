import { AuditLogService } from "@/services/domain";
import { Activity, Server, Users, ShieldAlert, Database, Cpu } from "lucide-react";

export default async function SuperAdminCommandCenter() {
  const auditLogs = await AuditLogService.getAllLogs();
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Platform Command Center
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor system health, active sessions, and global security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-600">Healthy</p>
          <p className="text-xs text-muted-foreground mt-1">Uptime: 99.99%</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Database</h3>
            <Database className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-blue-600">Connected</p>
          <p className="text-xs text-muted-foreground mt-1">Latency: 12ms</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Active Sessions</h3>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold mt-2">124</p>
          <p className="text-xs text-muted-foreground mt-1">Across 3 domains</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">Security Alerts</h3>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold mt-2 text-rose-600">0</p>
          <p className="text-xs text-muted-foreground mt-1">No active threats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-muted/40">
            <h2 className="font-semibold text-sm">Recent Audit Activity</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                <tr>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Actor ID</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                  <th className="px-6 py-3 font-medium">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-xs">{log.actorId}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 text-[10px] uppercase tracking-wider rounded bg-muted/50 text-foreground font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      {log.entityType} ({log.entityId})
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm p-5">
          <h2 className="font-semibold text-sm mb-4">Server Resources</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  CPU Load
                </div>
                <span className="text-xs text-muted-foreground">24%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Server className="w-4 h-4 text-muted-foreground" />
                  Memory Usage
                </div>
                <span className="text-xs text-muted-foreground">4.2 GB / 16 GB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '26%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  Storage
                </div>
                <span className="text-xs text-muted-foreground">128 GB / 500 GB</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
