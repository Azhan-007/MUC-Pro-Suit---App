"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("SUPER_ADMIN" | "MASTER_ADMIN")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // If not authenticated, go to login
    if (!isAuthenticated || !role) {
      router.replace("/login");
      return;
    }

    // If role is not allowed for this route
    if (!allowedRoles.includes(role)) {
      // Redirect to their own dashboard
      if (role === "SUPER_ADMIN") {
        router.replace("/super-admin/command-center");
      } else if (role === "MASTER_ADMIN") {
        router.replace("/master-admin/command-center");
      }
      return;
    }

    setIsAuthorized(true);
  }, [isAuthenticated, role, allowedRoles, router]);

  // Prevent flashing content while checking
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
