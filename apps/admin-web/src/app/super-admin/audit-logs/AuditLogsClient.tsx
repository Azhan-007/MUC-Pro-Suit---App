"use client";

import { AuditLog } from "@/types/domain";
import { useState } from "react";
import { Search, Filter, Calendar } from "lucide-react";

interface AuditLogsClientProps {
  initialLogs: AuditLog[];
}

export default function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs] = useState<AuditLog[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.actorId + " " + log.action + " " + log.entityType + " " + log.entityId)
      .toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "ALL" || log.entityType === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const uniqueModules = Array.from(new Set(logs.map(l => l.entityType)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            className="border border-border rounded-lg bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="ALL">All Entities</option>
            {uniqueModules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 ml-auto text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last 30 Days</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
          <h2 className="font-semibold text-sm">System Audit Trail ({filteredLogs.length} events)</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Actor</th>
                <th className="px-6 py-3 font-medium">Action</th>
                <th className="px-6 py-3 font-medium">Target Entity</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
                <th className="px-6 py-3 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium">{log.actorId}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs uppercase tracking-wider rounded bg-primary/10 text-primary font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {log.entityType} <span className="font-mono text-xs ml-1 bg-muted px-1 py-0.5 rounded border border-border">{log.entityId}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-muted-foreground max-w-[200px] truncate">
                    {log.newValue ? log.newValue : "-"}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No logs found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
