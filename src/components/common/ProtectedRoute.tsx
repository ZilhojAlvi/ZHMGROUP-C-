"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/ui/Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  allow: Role[];
}

/**
 * Guards a page so only authenticated users whose role is in `allow`
 * may view it. Unauthenticated users are sent to /login; authenticated
 * users of the wrong role are sent to their own dashboard.
 */
export function ProtectedRoute({ children, allow }: ProtectedRouteProps) {
  const { session, isHydrated, hydrate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [isHydrated, hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(session.role)) {
      router.replace(`/dashboard/${session.role}`);
    }
  }, [isHydrated, session, allow, router]);

  if (!isHydrated || !session || !allow.includes(session.role)) {
    return <PageLoader label="Checking access..." />;
  }

  return <>{children}</>;
}
