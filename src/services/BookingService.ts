import { BookingRecord, BookingStatus, PaymentMethod, PaymentRecord, Property } from "@/types";
import { apiGet, apiPost, apiPatch } from "@/lib/apiClient";

export const BookingService = {
  async listAll(): Promise<BookingRecord[]> {
    const { bookings } = await apiGet<{ bookings: BookingRecord[] }>("/api/bookings");
    return bookings;
  },

  async listByCustomer(_customerId: string): Promise<BookingRecord[]> {
    // The API scopes results to the authenticated user automatically.
    const { bookings } = await apiGet<{ bookings: BookingRecord[] }>("/api/bookings");
    return bookings;
  },

  async listByAgent(_agentId: string): Promise<BookingRecord[]> {
    const { bookings } = await apiGet<{ bookings: BookingRecord[] }>("/api/bookings");
    return bookings;
  },

  /** Step 1 of the booking flow: create a pending booking after availability check. */
  async createBooking(params: {
    property: Property;
    customerId: string;
    moveInDate: string;
    notes?: string;
  }): Promise<BookingRecord> {
    const { booking } = await apiPost<{ booking: BookingRecord }>("/api/bookings", {
      propertyId: params.property.propertyId,
      moveInDate: params.moveInDate,
      notes: params.notes,
    });
    return booking;
  },

  async updateStatus(bookingId: string, status: BookingStatus): Promise<BookingRecord> {
    const { booking } = await apiPatch<{ booking: BookingRecord }>(`/api/bookings/${bookingId}`, {
      status,
    });
    return booking;
  },

  /** Step 2: process payment for a booking via the payments API. */
  async processPayment(params: {
    bookingId: string;
    customerId: string;
    amount: number;
    method: PaymentMethod;
  }): Promise<PaymentRecord> {
    const { payment } = await apiPost<{ payment: PaymentRecord }>("/api/payments", {
      bookingId: params.bookingId,
      amount: params.amount,
      method: params.method,
    });
    return payment;
  },

  async cancelBooking(bookingId: string): Promise<BookingRecord> {
    return this.updateStatus(bookingId, "cancelled");
  },
};
