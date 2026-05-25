import { create } from "zustand";
import type { AuthUser } from "./auth.schema";

export type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

type AuthStore = {
  user: AuthUser | null;
  authStatus: AuthStatus;
  setChecking: () => void;
  setAuthenticated: (user: AuthUser) => void;
  setAnonymous: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  authStatus: "idle",
  setChecking: () => set({ authStatus: "checking" }),
  setAuthenticated: (user) => set({ authStatus: "authenticated", user }),
  setAnonymous: () => set({ authStatus: "anonymous", user: null }),
}));
