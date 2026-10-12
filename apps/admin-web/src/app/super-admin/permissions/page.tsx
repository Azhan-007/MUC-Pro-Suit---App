import { PermissionService, RoleService } from "@/services/domain";
import { Key } from "lucide-react";
import PermissionsClient from "./PermissionsClient";

export default async function PermissionsPage() {
  const permissions = await PermissionService.getAllPermissions();
  const roles = await RoleService.getAllRoles();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" />
            Permissions Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure granular RBAC permissions and module access.
          </p>
        </div>
      </div>

      <PermissionsClient permissions={permissions} roles={roles} />
    </div>
  );
}
