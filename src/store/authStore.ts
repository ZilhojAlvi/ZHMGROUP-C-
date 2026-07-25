"use client";

import { create } from "zustand";
import { AuthSession } from "@/types";
import { AuthService, SignupPayload } from "@/services/AuthService";

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthSession>;
  signup: (payload: SignupPayload) => Promise<{ fname: string; email: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: false,
  isHydrated: false,
  error: null,

  /** Asks the server (httpOnly cookie) who's logged in — replaces the old localStorage read. */
  hydrate: async () => {
    const session = await AuthService.fetchSession();
    set({ session, isHydrated: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await AuthService.login(email, password);
      set({ session, isLoading: false, isHydrated: true });
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  signup: async (payload: SignupPayload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await AuthService.signup(payload);
      // No session is created on signup — the account must be email-verified first.
      set({ isLoading: false });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed.";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({ session: null });
  },

  clearError: () => set({ error: null }),
}));
