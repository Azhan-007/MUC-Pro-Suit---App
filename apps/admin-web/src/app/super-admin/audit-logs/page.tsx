import { AuditLogService } from "@/services/domain";
import { History } from "lucide-react";
import AuditLogsClient from "./AuditLogsClient";

export default async function AuditLogsPage() {
  const logs = await AuditLogService.getAllLogs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and review critical platform changes and actions.
          </p>
        </div>
      </div>

      <AuditLogsClient initialLogs={logs} />
    </div>
  );
}
