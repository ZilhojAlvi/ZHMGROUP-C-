import {
  AgentRecord,
  AgentVerificationStatus,
  AdminRecord,
  CustomerRecord,
  Property,
  BookingRecord,
  SystemReport,
} from "@/types";

/**
 * IAuthenticatable - contract every user of the system must fulfil.
 */
export interface IAuthenticatable {
  login(password: string): boolean;
  logout(): void;
}

/**
 * Abstract base class representing a system User.
 * Concrete roles (Customer, Agent, Admin) extend this class,
 * demonstrating inheritance + polymorphism as required by the OOP model.
 */
export abstract class User implements IAuthenticatable {
  public readonly userId: string;
  public fname: string;
  public lname: string;
  public email: string;
  protected password: string;
  public phone: string;
  public isActive: boolean;
  private sessionActive = false;

  constructor(params: {
    userId: string;
    fname: string;
    lname: string;
    email: string;
    password: string;
    phone: string;
    isActive?: boolean;
  }) {
    this.userId = params.userId;
    this.fname = params.fname;
    this.lname = params.lname;
    this.email = params.email;
    this.password = params.password;
    this.phone = params.phone;
    this.isActive = params.isActive ?? true;
  }

  get fullName(): string {
    return `${this.fname} ${this.lname}`;
  }

  /** Validates credentials and opens a session. */
  login(password: string): boolean {
    if (!this.isActive) return false;
    if (this.password !== password) return false;
    this.sessionActive = true;
    return true;
  }

  /** Ends the active session. */
  logout(): void {
    this.sessionActive = false;
  }

  get isLoggedIn(): boolean {
    return this.sessionActive;
  }

  /** Every role must describe its own dashboard route. */
  abstract get dashboardRoute(): string;
  abstract get role(): "customer" | "agent" | "admin";
}

/**
 * Customer - can search properties, create bookings and view booking history.
 */
export class Customer extends User {
  public savedPropertyIds: string[];

  constructor(params: CustomerRecord) {
    super(params);
    this.savedPropertyIds = params.savedPropertyIds ?? [];
  }

  get role(): "customer" {
    return "customer";
  }

  get dashboardRoute(): string {
    return "/dashboard/customer";
  }

  /** Filters a property catalogue by keyword against title/city/address. */
  searchProperty(catalogue: Property[], keyword: string): Property[] {
    const q = keyword.trim().toLowerCase();
    if (!q) return catalogue;
    return catalogue.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  }

  /** Creates a booking request in "pending" status. */
  createBooking(
    property: Property,
    moveInDate: string,
    bookingIdFactory: () => string
  ): BookingRecord {
    const now = new Date().toISOString();
    return {
      bookingId: bookingIdFactory(),
      propertyId: property.propertyId,
      customerId: this.userId,
      agentId: property.agentId,
      bookingDate: now,
      moveInDate,
      status: "pending",
      totalAmount: property.price,
      createdAt: now,
      updatedAt: now,
    };
  }

  /** Returns this customer's booking history, most recent first. */
  viewHistory(allBookings: BookingRecord[]): BookingRecord[] {
    return allBookings
      .filter((b) => b.customerId === this.userId)
      .sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
  }
}

/**
 * Agent - manages property listings and approves customer bookings.
 */
export class Agent extends User {
  public licenceNumber: string;
  public agency: string;
  public verificationStatus: AgentVerificationStatus;
  public rating: number;

  constructor(params: AgentRecord) {
    super(params);
    this.licenceNumber = params.licenceNumber;
    this.agency = params.agency;
    this.verificationStatus = params.verificationStatus;
    this.rating = params.rating;
  }

  get role(): "agent" {
    return "agent";
  }

  get dashboardRoute(): string {
    return "/dashboard/agent";
  }

  /** Builds a brand new property record owned by this agent. */
  addProperty(data: Omit<Property, "propertyId" | "agentId" | "createdAt" | "updatedAt">, idFactory: () => string): Property {
    const now = new Date().toISOString();
    return {
      ...data,
      propertyId: idFactory(),
      agentId: this.userId,
      createdAt: now,
      updatedAt: now,
    } as Property;
  }

  /** Returns a shallow-merged, updated copy of a property this agent owns. */
  updateProperty(existing: Property, updates: Partial<Property>): Property {
    if (existing.agentId !== this.userId) {
      throw new Error("Agent may only update properties they own.");
    }
    return {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as Property;
  }

  /** Approves (confirms) or rejects a pending booking. */
  approveBooking(booking: BookingRecord, approve: boolean): BookingRecord {
    return {
      ...booking,
      status: approve ? "confirmed" : "rejected",
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Admin - manages users, verifies agents, generates system-wide reports.
 */
export class Admin extends User {
  public department: string;

  constructor(params: AdminRecord) {
    super(params);
    this.department = params.department;
  }

  get role(): "admin" {
    return "admin";
  }

  get dashboardRoute(): string {
    return "/dashboard/admin";
  }

  /** Activates or deactivates a user account. */
  manageUsers(user: { isActive: boolean }, activate: boolean): { isActive: boolean } {
    return { ...user, isActive: activate };
  }

  /** Marks an agent as verified or rejected. */
  verifyAgent(agent: AgentRecord, approve: boolean): AgentRecord {
    return {
      ...agent,
      verificationStatus: approve ? "verified" : "rejected",
    };
  }

  /** Aggregates platform-wide statistics into a SystemReport. */
  generateSystemReport(data: {
    users: (CustomerRecord | AgentRecord | AdminRecord)[];
    properties: Property[];
    bookings: BookingRecord[];
    payments: { amount: number; status: string; paymentDate: string }[];
  }): SystemReport {
    const { users, properties, bookings, payments } = data;

    const totalCustomers = users.filter((u) => u.role === "customer").length;
    const totalAgents = users.filter((u) => u.role === "agent").length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;
    const verifiedAgents = users.filter(
      (u): u is AgentRecord => u.role === "agent" && u.verificationStatus === "verified"
    ).length;
    const pendingAgents = users.filter(
      (u): u is AgentRecord => u.role === "agent" && u.verificationStatus === "pending"
    ).length;

    const residentialCount = properties.filter((p) => p.type === "residential").length;
    const commercialCount = properties.filter((p) => p.type === "commercial").length;
    const landCount = properties.filter((p) => p.type === "land").length;
    const availableProperties = properties.filter((p) => p.status === "available").length;
    const bookedProperties = properties.filter((p) => p.status === "booked").length;

    const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
    const pendingBookings = bookings.filter((b) => b.status === "pending").length;
    const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

    const totalRevenue = payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyMap = new Map<string, number>();
    payments
      .filter((p) => p.status === "success")
      .forEach((p) => {
        const month = new Date(p.paymentDate).toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        });
        monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + p.amount);
      });

    const bookingsByStatus = ["pending", "confirmed", "cancelled", "completed", "rejected"].map(
      (status) => ({
        status,
        count: bookings.filter((b) => b.status === status).length,
      })
    );

    return {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      totalCustomers,
      totalAgents,
      totalAdmins,
      verifiedAgents,
      pendingAgents,
      totalProperties: properties.length,
      residentialCount,
      commercialCount,
      landCount,
      availableProperties,
      bookedProperties,
      totalBookings: bookings.length,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      monthlyRevenue: Array.from(monthlyMap.entries()).map(([month, revenue]) => ({
        month,
        revenue,
      })),
      bookingsByStatus,
      propertiesByType: [
        { type: "Residential", count: residentialCount },
        { type: "Commercial", count: commercialCount },
        { type: "Land", count: landCount },
      ],
    };
  }
}
