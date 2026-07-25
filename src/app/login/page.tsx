"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Building2, Lock, Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { AuthService } from "@/services/AuthService";
import { validateEmail, validateRequired } from "@/utils/validators";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(email);
    const passCheck = validateRequired(password, "Password");
    const newErrors: Record<string, string> = {};
    if (!emailCheck.valid) newErrors.email = emailCheck.message!;
    if (!passCheck.valid) newErrors.password = passCheck.message!;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setNeedsVerification(false);
    try {
      const session = await login(email, password);
      toast.success(`Welcome back, ${session.fname}!`);
      router.push(`/dashboard/${session.role}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      toast.error(message);
      if (message.toLowerCase().includes("verify your email")) setNeedsVerification(true);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await AuthService.resendVerification(email);
      toast.success("Verification email sent — check your inbox.");
    } catch {
      toast.error("Could not resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 brand-gradient opacity-[0.06]" />
      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

      <div className="relative grid w-full max-w-4xl gap-8 lg:grid-cols-2">
        <Card variant="glass" className="order-2 p-8 animate-fade-up lg:order-1">
          <div className="mb-6 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
              <Building2 size={20} />
            </span>
            <span className="font-display text-xl font-bold text-navy-900 dark:text-white">SRMS</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-navy-400">
            Sign in to manage your properties, bookings, and profile.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={15} />}
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock size={15} />}
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-sm font-medium text-brand-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Sign in <ArrowRight size={16} />
            </Button>

            {needsVerification && (
              <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                Your email isn&apos;t verified yet.{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="font-semibold underline disabled:opacity-60"
                >
                  {resending ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-navy-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-brand-500 hover:underline">
              Create one
            </Link>
          </p>
        </Card>

        <div className="order-1 flex flex-col justify-center gap-4 lg:order-2">
          <h2 className="font-display text-xl font-bold text-navy-900 dark:text-white">
            Welcome to SRMS
          </h2>
          <p className="text-sm text-navy-400">
            Sign in with your email and password to search properties, manage
            bookings, and track your favorites. Don&apos;t have an account
            yet? Creating one only takes a minute.
          </p>
        </div>
      </div>
    </div>
  );
}
