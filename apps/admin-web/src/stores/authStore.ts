import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/domain";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: "SUPER_ADMIN" | "MASTER_ADMIN" | null;
  login: (user: User, role: "SUPER_ADMIN" | "MASTER_ADMIN") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      role: null,
      login: (user, role) => set({ isAuthenticated: true, user, role }),
      logout: () => set({ isAuthenticated: false, user: null, role: null }),
    }),
    {
      name: "muc-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
