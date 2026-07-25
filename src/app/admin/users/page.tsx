"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Home, UserCog, FileBarChart, ShieldCheck, Search, CheckCircle2, XCircle, Ban, Power } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserService } from "@/services/UserService";
import { UserRecord } from "@/types";
import { formatDate, initials } from "@/utils/formatters";
import { ROLE_LABELS } from "@/utils/constants";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/admin", icon: Home },
  { label: "User Management", href: "/admin/users", icon: UserCog },
  { label: "Reports", href: "/admin/reports", icon: FileBarChart },
  { label: "My Profile", href: "/profile", icon: ShieldCheck },
];

function AdminUsersInner() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const all = await UserService.list();
    setUsers(all);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesKeyword =
        !keyword ||
        `${u.fname} ${u.lname} ${u.email}`.toLowerCase().includes(keyword.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesKeyword && matchesRole;
    });
  }, [users, keyword, roleFilter]);

  const toggleActive = async (user: UserRecord) => {
    setBusyId(user.userId);
    try {
      await UserService.setActive(user.userId, !user.isActive);
      toast.success(user.isActive ? "User deactivated" : "User activated");
      load();
    } catch {
      toast.error("Could not update user status.");
    } finally {
      setBusyId(null);
    }
  };

  const verifyAgent = async (user: UserRecord, approve: boolean) => {
    setBusyId(user.userId);
    try {
      await UserService.verifyAgent(user.userId, approve);
      toast.success(approve ? "Agent verified" : "Agent verification rejected");
      load();
    } catch {
      toast.error("Could not update agent verification.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell links={links} title="User Management" subtitle="Manage accounts and verify licensed agents.">
      <Card className="p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              leftIcon={<Search size={15} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { label: "All roles", value: "all" },
                { label: "Customers", value: "customer" },
                { label: "Agents", value: "agent" },
                { label: "Admins", value: "admin" },
              ]}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<UserCog size={22} />} title="No users found" description="Try a different search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-navy-400">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {filtered.map((u) => (
                  <tr key={u.userId} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg brand-gradient text-xs font-bold text-white shrink-0">
                          {initials(u.fname, u.lname)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-navy-800 dark:text-white">
                            {u.fname} {u.lname}
                          </p>
                          <p className="truncate text-xs text-navy-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="brand">{ROLE_LABELS[u.role]}</Badge>
                      {u.role === "agent" && (
                        <Badge
                          className="ml-1.5 capitalize"
                          color={u.verificationStatus === "verified" ? "emerald" : u.verificationStatus === "pending" ? "amber" : "rose"}
                        >
                          {u.verificationStatus}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge color={u.isActive ? "emerald" : "rose"}>{u.isActive ? "Active" : "Deactivated"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {u.role === "agent" && u.verificationStatus === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              isLoading={busyId === u.userId}
                              onClick={() => verifyAgent(u, true)}
                            >
                              <CheckCircle2 size={13} /> Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="!text-rose-500 !border-rose-300"
                              isLoading={busyId === u.userId}
                              onClick={() => verifyAgent(u, false)}
                            >
                              <XCircle size={13} /> Reject
                            </Button>
                          </>
                        )}
                        {u.role !== "admin" && (
                          <Button
                            size="sm"
                            variant={u.isActive ? "outline" : "primary"}
                            className={u.isActive ? "!text-rose-500 !border-rose-300" : ""}
                            isLoading={busyId === u.userId}
                            onClick={() => toggleActive(u)}
                          >
                            {u.isActive ? <Ban size={13} /> : <Power size={13} />}
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardShell>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allow={["admin"]}>
      <AdminUsersInner />
    </ProtectedRoute>
  );
}
