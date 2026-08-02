import type { Prisma, User, Profile, Property as DbProperty, Booking as DbBooking, Payment as DbPayment, SavedSearch as DbSavedSearch } from "@prisma/client";
import type {
  UserRecord,
  Property,
  ResidentialProperty,
  CommercialProperty,
  LandProperty,
  BookingRecord,
  PaymentRecord,
  SavedSearchRecord,
  PropertyFilters,
} from "@/types";

type UserWithProfile = User & { profile: Profile | null };

/**
 * Maps a DB User+Profile to the frontend UserRecord shape.
 * The `password` field is always redacted — it is never populated from a
 * real hash and must never be sent to the client.
 */
export function mapUser(u: UserWithProfile): UserRecord {
  const base = {
    userId: u.id,
    fname: u.profile?.fname ?? "",
    lname: u.profile?.lname ?? "",
    email: u.email,
    password: "",
    phone: u.profile?.phone ?? "",
    avatarUrl: u.profile?.avatarUrl ?? "",
    createdAt: u.createdAt.toISOString(),
    isActive: u.isActive,
  };

  if (u.role === "agent") {
    return {
      ...base,
      role: "agent",
      licenceNumber: u.profile?.licenceNumber ?? "",
      agency: u.profile?.agency ?? "",
      verificationStatus: u.profile?.verificationStatus ?? "pending",
      rating: u.profile?.rating ?? 0,
      propertiesListed: u.profile?.propertiesListed ?? 0,
    };
  }

  if (u.role === "admin") {
    return {
      ...base,
      role: "admin",
      department: u.profile?.department ?? "",
    };
  }

  return {
    ...base,
    role: "customer",
    savedPropertyIds: [],
  };
}

export function mapProperty(p: DbProperty): Property {
  const amenities = {
    parkingSpace: p.parkingSpace,
    furnished: p.furnished,
    petFriendly: p.petFriendly,
    pool: p.pool,
    gym: p.gym,
    security: p.security,
    elevator: p.elevator,
    internet: p.internet,
  };

  const base = {
    propertyId: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    purpose: p.purpose,
    price: p.price,
    squareFeet: p.squareFeet,
    parkingSpace: p.parkingSpace,
    address: p.address,
    city: p.city,
    state: p.state,
    zipCode: p.zipCode,
    latitude: p.latitude,
    longitude: p.longitude,
    images: p.images,
    amenities,
    status: p.status,
    agentId: p.agentId,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    yearBuilt: p.yearBuilt,
    taxRate: p.taxRate,
  };

  if (p.type === "commercial") {
    return {
      ...base,
      type: "commercial",
      floors: p.floors ?? 0,
      officeRooms: p.officeRooms ?? 0,
      propertySubType: (p.propertySubType as CommercialProperty["propertySubType"]) ?? "office",
      zoningType: p.zoningType ?? "",
      loadingDock: p.loadingDock ?? false,
    };
  }

  if (p.type === "land") {
    return {
      ...base,
      type: "land",
      propertySubType: (p.propertySubType as LandProperty["propertySubType"]) ?? "land",
      facing: (p.facing as LandProperty["facing"]) ?? "north",
      roadWidthFt: p.roadWidthFt ?? 0,
      landUseType: (p.landUseType as LandProperty["landUseType"]) ?? "residential",
    };
  }

  return {
    ...base,
    type: "residential",
    bedrooms: p.bedrooms ?? 0,
    bathrooms: p.bathrooms ?? 0,
    propertySubType: (p.propertySubType as ResidentialProperty["propertySubType"]) ?? "apartment",
    hasGarden: p.hasGarden ?? false,
  };
}

/** Converts the frontend PropertyFormData-ish payload into flattened Prisma create/update input. */
export function propertyInputToPrisma(
  data: Record<string, unknown>
): Prisma.PropertyUncheckedCreateInput {
  const amenities = (data.amenities as Record<string, unknown>) || {};
  return {
    title: data.title as string,
    description: data.description as string,
    type: data.type as "residential" | "commercial" | "land",
    purpose: data.purpose as "sale" | "rent",
    price: data.price as number,
    squareFeet: data.squareFeet as number,
    parkingSpace: (amenities.parkingSpace as number) ?? 0,
    address: data.address as string,
    city: data.city as string,
    state: data.state as string,
    zipCode: data.zipCode as string,
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    images: (data.images as string[]) ?? [],
    status: (data.status as Prisma.PropertyUncheckedCreateInput["status"]) ?? "available",
    yearBuilt: data.yearBuilt as number,
    taxRate: (data.taxRate as number) ?? 0,
    furnished: Boolean(amenities.furnished),
    petFriendly: Boolean(amenities.petFriendly),
    pool: Boolean(amenities.pool),
    gym: Boolean(amenities.gym),
    security: Boolean(amenities.security),
    elevator: Boolean(amenities.elevator),
    internet: Boolean(amenities.internet),
    bedrooms: data.bedrooms as number | undefined,
    bathrooms: data.bathrooms as number | undefined,
    hasGarden: data.hasGarden as boolean | undefined,
    floors: data.floors as number | undefined,
    officeRooms: data.officeRooms as number | undefined,
    zoningType: data.zoningType as string | undefined,
    loadingDock: data.loadingDock as boolean | undefined,
    facing: data.facing as string | undefined,
    roadWidthFt: data.roadWidthFt as number | undefined,
    landUseType: data.landUseType as string | undefined,
    propertySubType: data.propertySubType as string,
    agentId: data.agentId as string,
  };
}

export function mapBooking(b: DbBooking): BookingRecord {
  return {
    bookingId: b.id,
    propertyId: b.propertyId,
    customerId: b.customerId,
    agentId: b.agentId,
    bookingDate: b.bookingDate.toISOString(),
    moveInDate: b.moveInDate.toISOString(),
    status: b.status,
    totalAmount: b.totalAmount,
    notes: b.notes ?? undefined,
    depositAmount: b.depositAmount ?? undefined,
    depositPercent: b.depositPercent ?? undefined,
    agreementDate: b.agreementDate ? b.agreementDate.toISOString() : undefined,
    expiresAt: b.expiresAt ? b.expiresAt.toISOString() : undefined,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

export function mapPayment(p: DbPayment): PaymentRecord {
  return {
    paymentId: p.id,
    bookingId: p.bookingId,
    customerId: p.customerId,
    amount: p.amount,
    paymentDate: p.paymentDate.toISOString(),
    method: p.method,
    status: p.status,
    transactionRef: p.transactionRef,
  };
}

export function mapSavedSearch(s: DbSavedSearch): SavedSearchRecord {
  return {
    savedSearchId: s.id,
    userId: s.userId,
    name: s.name,
    filters: s.filters as unknown as PropertyFilters,
    createdAt: s.createdAt.toISOString(),
  };
}
