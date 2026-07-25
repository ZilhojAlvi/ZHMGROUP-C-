"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Building2, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AuthService } from "@/services/AuthService";
import { validatePassword } from "@/utils/validators";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const check = validatePassword(password);
    if (!check.valid) newErrors.password = check.message!;
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!token) {
      toast.error("Missing or invalid reset link.");
      return;
    }

    setIsLoading(true);
    try {
      await AuthService.resetPassword(token, password);
      toast.success("Password reset — please sign in.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password.");
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

        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-navy-400">Choose a strong new password for your account.</p>

        {!token && (
          <p className="mt-4 rounded-xl border border-rose-300/50 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            This reset link is missing its token. Please use the link from your email, or request a new one.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="New password"
            type="password"
            leftIcon={<Lock size={15} />}
            value={password}
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
            hint={!errors.password ? "8+ chars, upper & lowercase, number" : undefined}
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            leftIcon={<Lock size={15} />}
            value={confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Reset password <ArrowRight size={16} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-400">
          <Link href="/login" className="font-semibold text-brand-500 hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
