"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Building2, Mail, Lock, User, Phone, ArrowRight, Home as HomeIcon, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils/cn";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
} from "@/utils/validators";

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [role, setRole] = useState<"customer" | "agent">("customer");
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenceNumber: "",
    agency: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const checks: [string, { valid: boolean; message?: string }][] = [
      ["fname", validateRequired(form.fname, "First name")],
      ["lname", validateRequired(form.lname, "Last name")],
      ["email", validateEmail(form.email)],
      ["phone", validatePhone(form.phone)],
      ["password", validatePassword(form.password)],
    ];
    checks.forEach(([key, result]) => {
      if (!result.valid) newErrors[key] = result.message!;
    });
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (role === "agent" && !form.licenceNumber.trim()) {
      newErrors.licenceNumber = "Licence number is required for agents.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const result = await signup({
        fname: form.fname,
        lname: form.lname,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role,
        licenceNumber: form.licenceNumber || undefined,
        agency: form.agency || undefined,
      });
      toast.success(`Account created, ${result.fname}! Check your email to verify your address.`, {
        duration: 6000,
      });
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed.");
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 brand-gradient opacity-[0.06]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />

      <Card variant="glass" className="relative w-full max-w-lg p-8 animate-fade-up">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white">
            <Building2 size={20} />
          </span>
          <span className="font-display text-xl font-bold text-navy-900 dark:text-white">SRMS</span>
        </div>

        <h1 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-navy-400">Join as a customer or a listing agent.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {(
            [
              { id: "customer", label: "Customer", icon: HomeIcon, desc: "Search & book" },
              { id: "agent", label: "Agent", icon: Briefcase, desc: "List & manage" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRole(opt.id)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all",
                role === opt.id
                  ? "border-brand-500 bg-brand-500/10"
                  : "border-black/10 dark:border-white/10 hover:border-brand-300"
              )}
            >
              <opt.icon size={18} className="text-brand-500" />
              <span className="text-sm font-semibold text-navy-800 dark:text-white">{opt.label}</span>
              <span className="text-xs text-navy-400">{opt.desc}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              leftIcon={<User size={15} />}
              value={form.fname}
              error={errors.fname}
              onChange={(e) => update("fname", e.target.value)}
              required
            />
            <Input
              label="Last name"
              value={form.lname}
              error={errors.lname}
              onChange={(e) => update("lname", e.target.value)}
              required
            />
          </div>
          <Input
            label="Email address"
            type="email"
            leftIcon={<Mail size={15} />}
            value={form.email}
            error={errors.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            label="Phone number"
            leftIcon={<Phone size={15} />}
            placeholder="+880 1XXX-XXXXXX"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />

          {role === "agent" && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <Input
                label="Licence number"
                value={form.licenceNumber}
                error={errors.licenceNumber}
                onChange={(e) => update("licenceNumber", e.target.value)}
                required
              />
              <Input
                label="Agency (optional)"
                value={form.agency}
                onChange={(e) => update("agency", e.target.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Password"
              type="password"
              leftIcon={<Lock size={15} />}
              value={form.password}
              error={errors.password}
              onChange={(e) => update("password", e.target.value)}
              hint={!errors.password ? "8+ chars, upper & lowercase, number" : undefined}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              leftIcon={<Lock size={15} />}
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              required
            />
          </div>

          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Create account <ArrowRight size={16} />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-500 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
