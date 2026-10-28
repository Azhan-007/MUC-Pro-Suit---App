"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, role, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSignOut = () => {
    logout();
    router.replace("/login");
  };

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Administrator"
    : "Administrator";
  const displayEmail = user?.email || "admin@muc.edu.in";
  const roleText = role === "SUPER_ADMIN" ? "Super Admin" : role === "MASTER_ADMIN" ? "Master Admin" : "User";
  const initials = user
    ? (`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.trim() || user.firstName?.slice(0, 2) || "AD").toUpperCase()
    : "AD";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-card ring-1 ring-border/80 hover:ring-2 hover:ring-emerald-500/30 transition-all duration-150 focus-ring cursor-pointer"
        aria-label="User Profile"
        title={`${displayName} (${roleText})`}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-inner">
          {initials}
        </div>
        {/* Active Stage Indicator */}
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-md animate-in fade-in-0 zoom-in-95 duration-150 z-50">
          {/* Profile info */}
          <div className="px-3 py-2 border-b border-border/70 mb-1">
            <p className="text-xs font-bold text-foreground truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400">{roleText} • Active</span>
            </div>
          </div>

          {/* Sign out */}
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 rounded-lg transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 cursor-pointer focus-ring"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
