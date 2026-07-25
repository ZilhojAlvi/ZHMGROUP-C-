import { BookingRecord, BookingStatus, PaymentRecord, PaymentStatus } from "@/types";

/**
 * BookingModel wraps a BookingRecord with behaviour for confirming/cancelling.
 */
export class BookingModel {
  public readonly bookingId: string;
  public readonly propertyId: string;
  public readonly customerId: string;
  public readonly agentId: string;
  public bookingDate: string;
  public moveInDate: string;
  public status: BookingStatus;
  public totalAmount: number;

  constructor(data: BookingRecord) {
    this.bookingId = data.bookingId;
    this.propertyId = data.propertyId;
    this.customerId = data.customerId;
    this.agentId = data.agentId;
    this.bookingDate = data.bookingDate;
    this.moveInDate = data.moveInDate;
    this.status = data.status;
    this.totalAmount = data.totalAmount;
  }

  /** Moves the booking into confirmed state (agent-approved + paid). */
  confirmBooking(): BookingRecord {
    this.status = "confirmed";
    return this.toRecord();
  }

  /** Cancels the booking, only allowed while pending or confirmed. */
  cancelBooking(): BookingRecord {
    if (this.status === "completed") {
      throw new Error("Completed bookings cannot be cancelled.");
    }
    this.status = "cancelled";
    return this.toRecord();
  }

  toRecord(): BookingRecord {
    return {
      bookingId: this.bookingId,
      propertyId: this.propertyId,
      customerId: this.customerId,
      agentId: this.agentId,
      bookingDate: this.bookingDate,
      moveInDate: this.moveInDate,
      status: this.status,
      totalAmount: this.totalAmount,
      createdAt: this.bookingDate,
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * PaymentModel simulates a payment gateway transaction and verification.
 */
export class PaymentModel {
  public readonly paymentId: string;
  public readonly bookingId: string;
  public amount: number;
  public paymentDate: string;
  public status: PaymentStatus;
  public transactionRef: string;

  constructor(data: PaymentRecord) {
    this.paymentId = data.paymentId;
    this.bookingId = data.bookingId;
    this.amount = data.amount;
    this.paymentDate = data.paymentDate;
    this.status = data.status;
    this.transactionRef = data.transactionRef;
  }

  /**
   * Simulates checking a payment gateway status.
   * In this mock system, any transaction ref starting with "TXN" and a
   * positive amount is treated as verified/successful.
   */
  verifyStatus(): PaymentStatus {
    if (this.amount > 0 && this.transactionRef.startsWith("TXN")) {
      this.status = "success";
    } else {
      this.status = "failed";
    }
    return this.status;
  }
}

/**
 * MaintenanceToolModel - equipment/service used for property upkeep,
 * billed by the hour.
 */
export class MaintenanceToolModel {
  public readonly toolId: string;
  public toolName: string;
  public category: string;
  public workingRate: number;
  public availability: boolean;

  constructor(data: {
    toolId: string;
    toolName: string;
    category: string;
    workingRate: number;
    availability: boolean;
  }) {
    this.toolId = data.toolId;
    this.toolName = data.toolName;
    this.category = data.category;
    this.workingRate = data.workingRate;
    this.availability = data.availability;
  }

  /** Total cost = hourly rate * hours worked. */
  calculateCost(hours: number): number {
    if (hours <= 0) return 0;
    return Math.round(this.workingRate * hours * 100) / 100;
  }
}
