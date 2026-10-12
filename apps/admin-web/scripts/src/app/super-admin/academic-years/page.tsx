import { Calendar } from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Academic Years
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage academic year cycles.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-8 text-center">
        <p className="text-muted-foreground">Module functionality will be implemented here.</p>
      </div>
    </div>
  );
}
