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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Status</h3>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center">
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400 num-tabular">Healthy</p>
          <p className="text-xs text-muted-foreground mt-1">Uptime: 99.99%</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Database</h3>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-blue-600 dark:text-blue-400 num-tabular">Connected</p>
          <p className="text-xs text-muted-foreground mt-1">Latency: 12ms</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Sessions</h3>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground num-tabular">124</p>
          <p className="text-xs text-muted-foreground mt-1">Across 3 domains</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4.5 shadow-xs flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Alerts</h3>
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold mt-2 text-rose-600 dark:text-rose-400 num-tabular">0</p>
          <p className="text-xs text-muted-foreground mt-1">No active threats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden flex flex-col">
          <div className="px-5 py-3.5 border-b border-border/70 bg-muted/20">
            <h2 className="font-bold text-sm text-foreground">Recent Audit Activity</h2>
          </div>
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-muted/30 border-b border-border/60">
                <tr>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Actor ID</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-xs text-muted-foreground num-tabular">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-semibold text-xs text-foreground">{log.actorId}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md bg-muted/70 text-foreground font-semibold border border-border/60">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {log.entityType} ({log.entityId})
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs text-muted-foreground">
                      No recent activity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-foreground mb-4">Server Resources</h2>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Cpu className="w-4 h-4 text-muted-foreground" />
                    CPU Load
                  </div>
                  <span className="text-xs font-bold text-muted-foreground num-tabular">24%</span>
                </div>
                <div className="w-full bg-muted/70 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    Memory Usage
                  </div>
                  <span className="text-xs font-bold text-muted-foreground num-tabular">4.2 GB / 16 GB</span>
                </div>
                <div className="w-full bg-muted/70 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '26%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    Storage
                  </div>
                  <span className="text-xs font-bold text-muted-foreground num-tabular">128 GB / 500 GB</span>
                </div>
                <div className="w-full bg-muted/70 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 mt-4 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Server region: IN-South</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">All nodes nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
