"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AuthService } from "@/services/AuthService";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    AuthService.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 brand-gradient opacity-[0.06]" />
      <Card variant="glass" className="relative w-full max-w-md p-8 text-center animate-fade-up">
        <div className="mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
          <Building2 size={20} />
        </div>

        {status === "loading" && <Loader2 className="mx-auto mb-4 animate-spin text-brand-500" size={40} />}
        {status === "success" && <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={40} />}
        {status === "error" && <XCircle className="mx-auto mb-4 text-rose-500" size={40} />}

        <h1 className="font-display text-xl font-bold text-navy-900 dark:text-white">
          {status === "loading" ? "Verifying email" : status === "success" ? "Email verified!" : "Verification failed"}
        </h1>
        <p className="mt-2 text-sm text-navy-400">{message}</p>

        <Link
          href="/login"
          className="mt-6 inline-block font-semibold text-brand-500 hover:underline"
        >
          Go to sign in
        </Link>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
