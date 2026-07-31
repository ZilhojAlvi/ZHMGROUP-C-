import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password must be at most 128 characters long.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/\d/, "Password must contain at least one number.");

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

const gmailEmailSchema = emailSchema.refine((val) => val.endsWith("@gmail.com"), {
  message: "Only Gmail addresses (ending in @gmail.com) are allowed.",
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+()\-\s\d]{7,20}$/, "Enter a valid phone number.")
  .optional()
  .or(z.literal(""));

export const signupSchema = z
  .object({
    fname: z.string().trim().min(1, "First name is required.").max(60),
    lname: z.string().trim().min(1, "Last name is required.").max(60),
    email: gmailEmailSchema,
    password: passwordSchema,
    phone: phoneSchema,
    role: z.enum(["customer", "agent"]).default("customer"),
    licenceNumber: z.string().trim().max(60).optional(),
    agency: z.string().trim().max(120).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Password is required."),
  })
  .strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: passwordSchema,
  })
  .strict();

export const verifyEmailSchema = z.object({ token: z.string().min(1) }).strict();

export const updateProfileSchema = z
  .object({
    fname: z.string().trim().min(1).max(60).optional(),
    lname: z.string().trim().min(1).max(60).optional(),
    phone: phoneSchema,
    avatarUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
    agency: z.string().trim().max(120).optional(),
  })
  .strict();

export const propertySchema = z.object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(5000),
    type: z.enum(["residential", "commercial", "land"]),
    purpose: z.enum(["sale", "rent"]),
    price: z.number().positive(),
    squareFeet: z.number().int().positive(),
    parkingSpace: z.number().int().min(0).default(0),
    address: z.string().trim().min(3).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    zipCode: z.string().trim().min(1).max(20),
    latitude: z.number(),
    longitude: z.number(),
    images: z.array(z.string().url()).default([]),
    status: z.enum(["available", "booked", "under_review", "sold", "inactive"]).default("available"),
    yearBuilt: z.number().int().min(1800).max(2100),
    taxRate: z.number().min(0).max(100).default(0),
    amenities: z.object({
      parkingSpace: z.number().int().min(0).default(0),
      furnished: z.boolean().default(false),
      petFriendly: z.boolean().default(false),
      pool: z.boolean().default(false),
      gym: z.boolean().default(false),
      security: z.boolean().default(false),
      elevator: z.boolean().default(false),
      internet: z.boolean().default(false),
    }),
    bedrooms: z.number().int().min(0).optional(),
    bathrooms: z.number().int().min(0).optional(),
    propertySubType: z.string().min(1),
    hasGarden: z.boolean().optional(),
    floors: z.number().int().min(0).optional(),
    officeRooms: z.number().int().min(0).optional(),
    zoningType: z.string().optional(),
    loadingDock: z.boolean().optional(),
    facing: z.string().optional(),
    roadWidthFt: z.number().min(0).optional(),
    landUseType: z.string().optional(),
  });

export const propertyUpdateSchema = propertySchema.partial();

export const bookingCreateSchema = z
  .object({
    propertyId: z.string().min(1),
    moveInDate: z.string().min(1),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const bookingStatusSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "cancelled", "completed", "rejected"]),
  })
  .strict();

export const paymentCreateSchema = z
  .object({
    bookingId: z.string().min(1),
    amount: z.number().positive(),
    method: z.enum(["card", "bank_transfer", "mobile_wallet", "cash"]),
    // Required for card/bank_transfer/mobile_wallet (deposit-based) bookings —
    // the date by which the buyer/tenant must complete the full agreement and
    // remaining balance. Ignored for cash-on-visit bookings.
    agreementDate: z.string().min(1).optional(),
    // Customer-selected deposit percentage (1-10). Ignored for cash-on-visit
    // bookings; defaults to 10 server-side when omitted.
    depositPercent: z.number().min(1).max(10).optional(),
  })
  .strict();

export const messageCreateSchema = z
  .object({
    receiverId: z.string().min(1),
    propertyId: z.string().optional(),
    content: z.string().trim().min(1).max(4000),
  })
  .strict();

export const userActiveSchema = z.object({ isActive: z.boolean() }).strict();

export const agentVerifySchema = z.object({ approve: z.boolean() }).strict();

/** Formats the first Zod issue into a user-friendly single-string message. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message || "Invalid request.";
}
