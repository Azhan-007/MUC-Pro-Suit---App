import { Database } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            Global Configuration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System-wide configurable values.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">Module functionality will be implemented here.</p>
      </div>
    </div>
  );
}
