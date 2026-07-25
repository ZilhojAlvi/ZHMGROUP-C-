"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Home, User2, Mail, Phone, Award, Building, ShieldCheck, KeyRound } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/authStore";
import { UserService } from "@/services/UserService";
import { UserRecord } from "@/types";
import { initials, formatDate } from "@/utils/formatters";
import { validatePhone, validateRequired } from "@/utils/validators";
import { ROLE_LABELS } from "@/utils/constants";

function getLinks(role?: string): SidebarLink[] {
  if (role === "admin")
    return [
      { label: "Overview", href: "/dashboard/admin", icon: Home },
      { label: "My Profile", href: "/profile", icon: User2 },
    ];
  if (role === "agent")
    return [
      { label: "Overview", href: "/dashboard/agent", icon: Home },
      { label: "Manage Properties", href: "/agent/properties", icon: Building },
      { label: "My Profile", href: "/profile", icon: User2 },
    ];
  return [
    { label: "Overview", href: "/dashboard/customer", icon: Home },
    { label: "My Profile", href: "/profile", icon: User2 },
  ];
}

function ProfileInner() {
  const { session } = useAuthStore();
  const [record, setRecord] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ fname: "", lname: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      if (!session) return;
      setIsLoading(true);
      const r = await UserService.getById(session.userId);
      if (r) {
        setRecord(r);
        setForm({ fname: r.fname, lname: r.lname, phone: r.phone });
      }
      setIsLoading(false);
    })();
  }, [session]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!record) return;
    const newErrors: Record<string, string> = {};
    const fnameCheck = validateRequired(form.fname, "First name");
    if (!fnameCheck.valid) newErrors.fname = fnameCheck.message!;
    const phoneCheck = validatePhone(form.phone);
    if (!phoneCheck.valid) newErrors.phone = phoneCheck.message!;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    try {
      const updated = await UserService.updateProfile(record.userId, form);
      setRecord(updated);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !record) return <PageLoader label="Loading profile..." />;

  return (
    <DashboardShell links={getLinks(session?.role)} title="My Profile" subtitle="Manage your personal information.">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 text-center lg:col-span-1">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl brand-gradient text-2xl font-bold text-white shadow-lg shadow-brand-600/25">
            {initials(record.fname, record.lname)}
          </div>
          <h3 className="mt-4 font-display text-lg font-bold text-navy-900 dark:text-white">
            {record.fname} {record.lname}
          </h3>
          <p className="text-sm text-navy-400">{record.email}</p>
          <div className="mt-3 flex justify-center">
            <Badge color="brand">{ROLE_LABELS[record.role]}</Badge>
          </div>

          <div className="mt-6 space-y-3 border-t border-black/5 dark:border-white/10 pt-5 text-left text-sm">
            <div className="flex items-center gap-2 text-navy-500 dark:text-slate-300">
              <Phone size={14} /> {record.phone}
            </div>
            <div className="flex items-center gap-2 text-navy-500 dark:text-slate-300">
              <Mail size={14} /> {record.email}
            </div>
            <div className="flex items-center gap-2 text-navy-500 dark:text-slate-300">
              <KeyRound size={14} /> Joined {formatDate(record.createdAt)}
            </div>
            {record.role === "agent" && (
              <>
                <div className="flex items-center gap-2 text-navy-500 dark:text-slate-300">
                  <Award size={14} /> Licence {record.licenceNumber}
                </div>
                <div className="flex items-center gap-2 text-navy-500 dark:text-slate-300">
                  <ShieldCheck size={14} />
                  <span className="capitalize">{record.verificationStatus}</span> · {record.agency}
                </div>
              </>
            )}
            {record.role === "admin" && (
              <div className="flex items-center gap-2 text-navy-500 dark:text-slate-300">
                <Building size={14} /> {record.department}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-5 font-display text-base font-semibold text-navy-900 dark:text-white">
            Edit Information
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="First name"
                required
                value={form.fname}
                error={errors.fname}
                onChange={(e) => setForm((f) => ({ ...f, fname: e.target.value }))}
              />
              <Input
                label="Last name"
                value={form.lname}
                onChange={(e) => setForm((f) => ({ ...f, lname: e.target.value }))}
              />
            </div>
            <Input label="Email address" value={record.email} disabled hint="Email address cannot be changed. Contact support if you need to update it." />
            <Input
              label="Phone number"
              required
              value={form.phone}
              error={errors.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving}>
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute allow={["customer", "agent", "admin"]}>
      <ProfileInner />
    </ProtectedRoute>
  );
}
