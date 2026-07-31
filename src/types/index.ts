// ============================================================================
// SRMS Core Type Definitions
// ============================================================================

export type Role = "customer" | "agent" | "admin";

export type PropertyType = "residential" | "commercial" | "land";

export type PropertyStatus = "available" | "booked" | "under_review" | "sold" | "inactive";

export type ListingPurpose = "sale" | "rent";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rejected";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type PaymentMethod = "card" | "bank_transfer" | "mobile_wallet" | "cash";

export type AgentVerificationStatus = "pending" | "verified" | "rejected";

export type NotificationType = "success" | "error" | "info" | "warning";

// ----------------------------------------------------------------------------
// User hierarchy (data shapes mirroring the OOP class hierarchy in lib/oop)
// ----------------------------------------------------------------------------

export interface BaseUserRecord {
  userId: string;
  fname: string;
  lname: string;
  email: string;
  password: string; // always redacted ("") on the client — real bcrypt hash lives only in the database
  phone: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export interface CustomerRecord extends BaseUserRecord {
  role: "customer";
  savedPropertyIds: string[];
}

export interface AgentRecord extends BaseUserRecord {
  role: "agent";
  licenceNumber: string;
  agency: string;
  verificationStatus: AgentVerificationStatus;
  rating: number;
  propertiesListed: number;
}

export interface AdminRecord extends BaseUserRecord {
  role: "admin";
  department: string;
}

export type UserRecord = CustomerRecord | AgentRecord | AdminRecord;

// ----------------------------------------------------------------------------
// Property hierarchy
// ----------------------------------------------------------------------------

export interface PropertyAmenities {
  parkingSpace: number;
  furnished: boolean;
  petFriendly: boolean;
  pool: boolean;
  gym: boolean;
  security: boolean;
  elevator: boolean;
  internet: boolean;
}

export interface PropertyBase {
  propertyId: string;
  title: string;
  description: string;
  type: PropertyType;
  purpose: ListingPurpose;
  price: number;
  squareFeet: number;
  parkingSpace: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  images: string[];
  amenities: PropertyAmenities;
  status: PropertyStatus;
  agentId: string;
  createdAt: string;
  updatedAt: string;
  yearBuilt: number;
  taxRate: number; // percentage applied in calculateTax()
}

export interface ResidentialProperty extends PropertyBase {
  type: "residential";
  bedrooms: number;
  bathrooms: number;
  propertySubType: "apartment" | "house" | "villa" | "condo" | "townhouse";
  hasGarden: boolean;
}

export interface CommercialProperty extends PropertyBase {
  type: "commercial";
  floors: number;
  officeRooms: number;
  propertySubType: "office" | "retail" | "warehouse" | "restaurant" | "industrial";
  zoningType: string;
  loadingDock: boolean;
}

export interface LandProperty extends PropertyBase {
  type: "land";
  propertySubType: "land" | "plot";
  facing: "north" | "south" | "east" | "west" | "north-east" | "north-west" | "south-east" | "south-west";
  roadWidthFt: number;
  landUseType: "residential" | "commercial" | "agricultural";
}

export type Property = ResidentialProperty | CommercialProperty | LandProperty;

// ----------------------------------------------------------------------------
// Booking / Payment
// ----------------------------------------------------------------------------

export interface BookingRecord {
  bookingId: string;
  propertyId: string;
  customerId: string;
  agentId: string;
  bookingDate: string;
  moveInDate: string;
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  /** For deposit-based bookings (card/bank_transfer/mobile_wallet): the amount actually charged now (~10% of totalAmount). */
  depositAmount?: number;
  /** The deposit percentage charged (5–10). */
  depositPercent?: number;
  /** Date by which the full sale/rental agreement + remaining balance must be completed. Deposit-based bookings only. */
  agreementDate?: string;
  /** Cash-on-visit bookings only: the booking auto-cancels if not followed up on by this time (7 days from creation). */
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  paymentId: string;
  bookingId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string;
}

// ----------------------------------------------------------------------------
// Maintenance Tool
// ----------------------------------------------------------------------------

export interface MaintenanceToolRecord {
  toolId: string;
  toolName: string;
  category: string;
  workingRate: number; // cost per hour
  availability: boolean;
}

// ----------------------------------------------------------------------------
// Misc / UI-support types
// ----------------------------------------------------------------------------

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
}

export interface PropertyFilters {
  keyword?: string;
  type?: PropertyType | "all";
  purpose?: ListingPurpose | "all";
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  minSquareFeet?: number;
  status?: PropertyStatus | "all";
  sortBy?: "price_asc" | "price_desc" | "newest" | "size_desc";
}

export interface SystemReport {
  generatedAt: string;
  totalUsers: number;
  totalCustomers: number;
  totalAgents: number;
  totalAdmins: number;
  verifiedAgents: number;
  pendingAgents: number;
  totalProperties: number;
  residentialCount: number;
  commercialCount: number;
  landCount: number;
  availableProperties: number;
  bookedProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  propertiesByType: { type: string; count: number }[];
}

export interface AuthSession {
  userId: string;
  role: Role;
  fname: string;
  lname: string;
  email: string;
}
