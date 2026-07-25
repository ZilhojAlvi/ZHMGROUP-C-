"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/** Convenience hook: hydrates the session once and exposes auth state/actions. */
export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.isHydrated) store.hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return store;
}
