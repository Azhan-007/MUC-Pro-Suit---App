import { RoleService } from "@/services/domain";
import { Shield } from "lucide-react";
import RolesClient from "./RolesClient";

export default async function RolesPage() {
  const roles = await RoleService.getAllRoles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Roles Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure system roles and hierarchical structures.
          </p>
        </div>
      </div>

      <RolesClient initialRoles={roles} />
    </div>
  );
}
