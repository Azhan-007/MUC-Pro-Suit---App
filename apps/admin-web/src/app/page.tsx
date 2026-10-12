"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (role === "SUPER_ADMIN") {
      router.replace("/super-admin/command-center");
    } else if (role === "MASTER_ADMIN") {
      router.replace("/master-admin/command-center");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
