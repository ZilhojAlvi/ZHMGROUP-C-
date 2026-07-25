"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Home, Building2, PlusCircle, Pencil, Trash2, User2, Calculator } from "lucide-react";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DashboardShell, SidebarLink } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyForm, PropertyFormValues } from "@/features/property/PropertyForm";
import { useAuthStore } from "@/store/authStore";
import { PropertyService } from "@/services/PropertyService";
import { Property } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { PROPERTY_STATUS_COLORS } from "@/utils/constants";

const links: SidebarLink[] = [
  { label: "Overview", href: "/dashboard/agent", icon: Home },
  { label: "Manage Properties", href: "/agent/properties", icon: Building2 },
  { label: "My Profile", href: "/profile", icon: User2 },
];

function buildPropertyPayload(session: { userId: string }, values: PropertyFormValues) {
  const base = {
    title: values.title,
    description: values.description,
    purpose: values.purpose,
    price: values.price,
    squareFeet: values.squareFeet,
    parkingSpace: values.parkingSpace,
    address: values.address,
    city: values.city,
    state: "Dhaka Division",
    zipCode: "1000",
    latitude: 23.78,
    longitude: 90.4,
    images: [values.imageUrl],
    amenities: {
      parkingSpace: values.parkingSpace,
      furnished: false,
      petFriendly: false,
      pool: false,
      gym: false,
      security: true,
      elevator: false,
      internet: true,
    },
    status: "available" as const,
    agentId: session.userId,
    yearBuilt: new Date().getFullYear(),
    taxRate: values.taxRate,
  };

  if (values.type === "residential") {
    return {
      ...base,
      type: "residential" as const,
      bedrooms: values.bedrooms,
      bathrooms: values.bathrooms,
      propertySubType: "apartment" as const,
      hasGarden: false,
    };
  }
  if (values.type === "land") {
    return {
      ...base,
      type: "land" as const,
      propertySubType: "land" as const,
      facing: values.facing,
      roadWidthFt: values.roadWidthFt,
      landUseType: values.landUseType,
    };
  }
  return {
    ...base,
    type: "commercial" as const,
    floors: values.floors,
    officeRooms: values.officeRooms,
    propertySubType: "office" as const,
    zoningType: "Commercial",
    loadingDock: false,
  };
}

function AgentPropertiesInner() {
  const { session } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    if (!session) return;
    setIsLoading(true);
    const list = await PropertyService.listByAgent(session.userId);
    setProperties(list);
    setIsLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Property) => {
    setEditing(p);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PropertyFormValues) => {
    if (!session) return;
    setIsSubmitting(true);
    try {
      const payload = buildPropertyPayload(session, values);
      if (editing) {
        await PropertyService.update(editing.propertyId, payload as Partial<Property>);
        toast.success("Property updated");
      } else {
        await PropertyService.create(payload as Omit<Property, "propertyId" | "createdAt" | "updatedAt">);
        toast.success("Property added");
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error("Something went wrong while saving the property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await PropertyService.remove(deleteTarget.propertyId);
      toast.success("Property removed");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Could not remove property.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardShell
      links={links}
      title="Manage Properties"
      subtitle="Add, update, and remove your property listings."
    >
      <div className="mb-5 flex justify-end">
        <Button onClick={openAdd}>
          <PlusCircle size={16} /> Add property
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building2 size={22} />}
          title="No properties yet"
          description="Add your first listing to start receiving bookings from customers."
          action={<Button onClick={openAdd}>Add property</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-navy-400">
              <tr>
                <th className="px-4 py-3 text-left">Property</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Est. Tax</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {properties.map((p) => (
                <tr key={p.propertyId} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <td className="max-w-[240px] truncate px-4 py-3 font-medium text-navy-800 dark:text-white">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 capitalize text-navy-500">{p.type}</td>
                  <td className="px-4 py-3 text-navy-500">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-navy-500">
                    <span className="inline-flex items-center gap-1">
                      <Calculator size={12} /> {formatCurrency(PropertyService.calculateTax(p))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={PROPERTY_STATUS_COLORS[p.status] as never} className="capitalize">
                      {p.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-2 text-navy-400 hover:bg-brand-500/10 hover:text-brand-600"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="rounded-lg p-2 text-navy-400 hover:bg-rose-500/10 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit property" : "Add a new property"}
        size="lg"
      >
        <PropertyForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove this property?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={isDeleting} onClick={handleDelete}>
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-500 dark:text-slate-300">
          <b>{deleteTarget?.title}</b> will be permanently removed from your listings. This cannot be undone.
        </p>
      </Modal>
    </DashboardShell>
  );
}

export default function AgentPropertiesPage() {
  return (
    <ProtectedRoute allow={["agent"]}>
      <AgentPropertiesInner />
    </ProtectedRoute>
  );
}
