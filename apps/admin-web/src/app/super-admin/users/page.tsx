import { UserService } from "@/services/domain";
import { Users } from "lucide-react";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const users = await UserService.getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Platform Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage system access, user accounts, and assignments.
          </p>
        </div>
      </div>

      <UsersClient initialUsers={users} />
    </div>
  );
}
