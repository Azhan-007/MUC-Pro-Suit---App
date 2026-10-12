import { BackupService } from "@/services/domain";
import { DatabaseBackup } from "lucide-react";
import BackupClient from "./BackupClient";

export default async function BackupPage() {
  const backups = await BackupService.getAllBackups();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DatabaseBackup className="w-6 h-6 text-primary" />
            Backup & Restore
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system snapshots and disaster recovery operations.
          </p>
        </div>
      </div>

      <BackupClient initialBackups={backups} />
    </div>
  );
}
