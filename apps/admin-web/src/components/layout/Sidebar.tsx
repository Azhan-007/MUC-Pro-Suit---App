"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Shield, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { superAdminNavigation, masterAdminNavigation } from "@/data/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { motion, AnimatePresence } from "motion/react";

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const { user } = useAuthStore();

  const isSuperAdmin = pathname.startsWith("/super-admin");
  const navigationGroups = isSuperAdmin ? superAdminNavigation : masterAdminNavigation;

  const sidebarContent = (
    <aside
      className={cn(
        "flex h-full w-[var(--sidebar-width)] flex-col bg-gradient-to-b from-[#0da87a] via-[#059669] to-[#047e5b] text-white shadow-lg border-r border-emerald-500/40"
      )}
    >
      {/* ── Brand ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/15">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#047857] shadow-sm ring-1 ring-white/30">
          <span className="text-sm font-black leading-none">M</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-[13px] font-bold tracking-tight text-white truncate">
              MUC PRO SUITE
            </h1>
            <span className="text-[8.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/20 text-white tracking-wider border border-white/25">
              BETA
            </span>
          </div>
          <p className="text-[11px] font-medium text-emerald-100/85 leading-tight truncate">
            Mazharul Uloom College
          </p>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-7 last:mb-0">
            <p className="px-3 mb-2 text-[10.5px] font-bold tracking-wider uppercase text-emerald-100/70">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/super-admin/command-center" &&
                    item.href !== "/master-admin/command-center" &&
                    pathname.startsWith(item.href + "/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3.5 px-3 py-2 text-sm rounded-xl transition-all duration-150",
                      isActive
                        ? "bg-white text-[#047857] font-semibold shadow-md"
                        : "text-emerald-50/85 hover:text-white hover:bg-white/15"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-[#047857]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive
                          ? "text-[#047857]"
                          : "text-emerald-100/75 group-hover:text-white"
                      )}
                      strokeWidth={isActive ? 2.2 : 1.75}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="border-t border-white/15 px-5 py-4 bg-black/10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-white text-[#047857] font-bold flex items-center justify-center shadow-sm">
            <span className="text-[11px]">
              {user ? `${user.firstName[0]}${user.lastName[0]}` : "AD"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : (isSuperAdmin ? "Super Admin User" : "Master Admin User")}
            </p>
            <p className="text-[11px] text-emerald-100/80 truncate leading-tight">
              {isSuperAdmin ? "Super Admin" : "Master Admin"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop Sidebar (static) ─────────────────────── */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* ── Mobile Sidebar (drawer overlay) ──────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <button
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-[-44px] h-8 w-8 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
