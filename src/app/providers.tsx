"use client";

import { ReactNode, useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: ReactNode }) {
  const hydrateTheme = useUIStore((s) => s.hydrateTheme);
  const hydrateAuth = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrateTheme();
    hydrateAuth();
  }, [hydrateTheme, hydrateAuth]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
