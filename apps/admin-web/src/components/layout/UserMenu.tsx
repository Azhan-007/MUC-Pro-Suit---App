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

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const displayEmail = user?.email || "guest@muc.edu.in";
  const roleText = role === "SUPER_ADMIN" ? "Super Admin" : role === "MASTER_ADMIN" ? "Master Admin" : "User";
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "G";

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-xs ring-1 ring-border hover:ring-2 hover:ring-emerald-500/40 hover:shadow-sm transition-all duration-150 focus:outline-none cursor-pointer"
        aria-label="User Profile"
        title={`${displayName} (${roleText})`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs shadow-inner">
          {initials}
        </div>
        {/* Active Stage Indicator */}
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card shadow-xs" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-emerald-950/5 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
          {/* Profile info */}
          <div className="px-3 py-2.5 border-b border-border/60 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-emerald-700">{roleText} • Active</span>
            </div>
          </div>

          {/* Sign out */}
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 rounded-xl transition-colors hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
