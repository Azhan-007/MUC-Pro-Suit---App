"use client";

import { BackupRecord } from "@/types/domain";
import { useState } from "react";
import { DatabaseBackup, DownloadCloud, History, RotateCcw, AlertTriangle } from "lucide-react";

interface BackupClientProps {
  initialBackups: BackupRecord[];
}

export default function BackupClient({ initialBackups }: BackupClientProps) {
  const [backups, setBackups] = useState<BackupRecord[]>(initialBackups);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleCreateBackup = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newBackup: BackupRecord = {
        id: `bkp-${Date.now()}`,
        name: `Manual Snapshot ${new Date().toLocaleDateString()}`,
        type: "FULL",
        status: "COMPLETED",
        sizeBytes: 154857600,
        createdAt: new Date().toISOString(),
        createdBy: "current-admin"
      };
      setBackups([newBackup, ...backups]);
      setIsSimulating(false);
    }, 2000);
  };

  const handleRestore = (id: string) => {
    alert(`Restore action triggered for backup ${id}. (Mock Mode: No data was actually restored).`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-card p-5 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <DatabaseBackup className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">System Snapshots</h3>
            <p className="text-sm text-muted-foreground">Take a full snapshot of the ERP database.</p>
          </div>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={isSimulating}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSimulating ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <DownloadCloud className="w-4 h-4" />
          )}
          {isSimulating ? "Creating Snapshot..." : "Create Backup"}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">Frontend Mock Mode</p>
          <p className="mt-1">
            Creating a backup will generate a mock record. Restoration actions are simulated and will not mutate real application data.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/40 flex justify-between items-center">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <History className="w-4 h-4" />
            Backup History
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Size</th>
                <th className="px-6 py-3 font-medium">Date Created</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {backups.map((bkp) => (
                <tr key={bkp.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{bkp.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-[10px] font-semibold bg-muted rounded-full tracking-wider">
                      {bkp.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {(bkp.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(bkp.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      bkp.status === "COMPLETED" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {bkp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRestore(bkp.id)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
              {backups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No backups exist.
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
