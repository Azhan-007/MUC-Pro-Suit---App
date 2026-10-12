"use client";

import { Role } from "@/types/domain";
import { useState } from "react";
import { Plus, ShieldAlert, Check } from "lucide-react";

interface RolesClientProps {
  initialRoles: Role[];
}

export default function RolesClient({ initialRoles }: RolesClientProps) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Custom Role
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-2">
          <h2 className="text-lg font-semibold mb-4">Create Custom Domain Role</h2>
          <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded border border-border">
            Mock Mode: Backend integration required for custom role creation and persistence.
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/40">
          <h2 className="font-semibold text-sm">System Roles ({roles.length})</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Role Name</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Protection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{role.name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{role.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${role.isSystem ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                      {role.isSystem ? 'System Core' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {role.isSystem ? (
                      <span className="flex items-center gap-1 text-rose-600 text-xs font-medium">
                        <ShieldAlert className="w-3 h-3" /> Immutable
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                        <Check className="w-3 h-3" /> Editable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
