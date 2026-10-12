import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <TopHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[1560px] px-4 py-5 lg:px-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
