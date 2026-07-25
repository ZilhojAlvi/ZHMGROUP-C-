"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthService } from "@/services/AuthService";
import { validateEmail } from "@/utils/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const check = validateEmail(email);
    if (!check.valid) {
      setError(check.message);
      return;
    }
    setError(undefined);
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 brand-gradient opacity-[0.06]" />
      <Card variant="glass" className="relative w-full max-w-md p-8 animate-fade-up">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
            <Building2 size={20} />
          </span>
          <span className="font-display text-xl font-bold text-navy-900 dark:text-white">SRMS</span>
        </div>

        {sent ? (
          <>
            <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-navy-400">
              If an account exists for <span className="font-medium">{email}</span>, we&apos;ve
              sent a password reset link. It expires in 1 hour.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
              Forgot your password?
            </h1>
            <p className="mt-1 text-sm text-navy-400">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input
                label="Email address"
                type="email"
                leftIcon={<Mail size={15} />}
                value={email}
                error={error}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Send reset link <ArrowRight size={16} />
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-navy-400">
          <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-brand-500 hover:underline">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
