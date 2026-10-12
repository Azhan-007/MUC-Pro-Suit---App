import { User, Role } from "../types/domain";

export type AppRole = "SUPER_ADMIN" | "MASTER_ADMIN" | "DOMAIN_ADMIN";

// Temporary development utility since authentication is not implemented yet.
// In a real application, this would come from a session provider.
export const getCurrentUserRole = (): AppRole => {
  // We can toggle this for testing different UI states.
  // Defaulting to SUPER_ADMIN for Phase 1 testing.
  return "SUPER_ADMIN";
};

export const hasRole = (role: AppRole): boolean => {
  return getCurrentUserRole() === role;
};

export const canAccessSuperAdmin = (): boolean => {
  return hasRole("SUPER_ADMIN");
};

export const canAccessMasterAdmin = (): boolean => {
  // A Super Admin might be able to view Master Admin, but depending on the strict isolation rules
  // they should stick to their own routes. For strict isolation:
  return hasRole("MASTER_ADMIN"); 
};

// Domain Admin permissions would be checked here eventually based on assigned domains.
export const hasDomainAccess = (domainCode: string): boolean => {
  if (hasRole("MASTER_ADMIN")) return true;
  // if role === DOMAIN_ADMIN, check assignments
  return false;
};
