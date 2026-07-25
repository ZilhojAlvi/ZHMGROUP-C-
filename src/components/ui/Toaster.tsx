"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 3800,
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          border: "1px solid rgba(148,163,184,0.18)",
          borderRadius: "12px",
          fontSize: "13px",
          boxShadow: "0 10px 30px rgba(10,22,48,0.12)",
        },
        success: { iconTheme: { primary: "#4f7238", secondary: "#fff" } },
        error: { iconTheme: { primary: "#e11d48", secondary: "#fff" } },
      }}
    />
  );
}
