"use client";

import { Permission, Role } from "@/types/domain";
import { useState } from "react";
import { Shield } from "lucide-react";

interface PermissionsClientProps {
  permissions: Permission[];
  roles: Role[];
}

export default function PermissionsClient({ permissions, roles }: PermissionsClientProps) {
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.id || "");

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          Configure Role:
        </label>
        <select
          className="border border-border rounded-lg bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/40">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            RBAC Permission Matrix
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-8">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <div key={moduleName}>
                <h3 className="text-sm font-bold text-foreground mb-3 pb-2 border-b border-border">
                  {moduleName}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/10">
                      <div className="mt-0.5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          checked={selectedRole === "role-1"} // SUPER_ADMIN has everything mocked
                          readOnly
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{perm.code}</p>
                        <p className="text-xs text-muted-foreground mt-1">{perm.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
