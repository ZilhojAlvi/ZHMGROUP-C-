"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Minimal shape of the Google Identity Services API this component uses.
interface GoogleCredentialResponse {
  credential: string;
}
interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      text?: "signin_with" | "signup_with" | "continue_with";
    }
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleSignInButtonProps {
  /** Copy shown in the button, mirrors Google's own `text` prop. */
  mode?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleSignInButton({ mode = "signin_with" }: GoogleSignInButtonProps) {
  const router = useRouter();
  const { loginWithGoogle } = useAuthStore();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded || !GOOGLE_CLIENT_ID || !buttonRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      ux_mode: "popup",
      callback: async (response: GoogleCredentialResponse) => {
        try {
          const session = await loginWithGoogle(response.credential);
          toast.success(`Welcome, ${session.fname}!`);
          router.push(`/dashboard/${session.role}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Google sign-in failed.";
          toast.error(message);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      width: 320,
      text: mode,
    });
  }, [scriptLoaded, mode, loginWithGoogle, router]);

  if (!GOOGLE_CLIENT_ID) {
    // Fails loudly in dev so the missing env var isn't silently ignored.
    return (
      <div className="rounded-xl border border-dashed border-navy-300 px-3 py-2 text-center text-xs text-navy-400">
        Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google Sign-In.
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="flex justify-center" ref={buttonRef} />
    </>
  );
}
