"use client";

import { User } from "@/types/domain";
import { useState } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";

interface UsersClientProps {
  initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredUsers = users.filter((u) =>
    (u.firstName + " " + u.lastName + " " + u.username + " " + u.email)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New System User
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm mb-2">
          <h2 className="text-lg font-semibold mb-4">Create New Platform User</h2>
          <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded border border-border">
            Mock Mode: Backend integration required for actual account creation and secure password hashing.
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/40">
          <h2 className="font-semibold text-sm">Active Accounts ({filteredUsers.length})</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Username</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Last Login</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{user.username}</td>
                  <td className="px-6 py-4">{user.firstName} {user.lastName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      user.status === "ACTIVE" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-rose-100 text-rose-700"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No users found matching your search.
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
