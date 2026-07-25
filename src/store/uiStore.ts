"use client";

import { create } from "zustand";

type Theme = "light" | "dark";

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  hydrateTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "light",
  sidebarOpen: false,

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    applyThemeClass(next);
    if (typeof window !== "undefined") window.localStorage.setItem("srems_theme", next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    applyThemeClass(theme);
    if (typeof window !== "undefined") window.localStorage.setItem("srems_theme", theme);
    set({ theme });
  },

  hydrateTheme: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("srems_theme") as Theme | null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const theme: Theme = stored ?? (prefersDark ? "dark" : "light");
    applyThemeClass(theme);
    set({ theme });
  },

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
