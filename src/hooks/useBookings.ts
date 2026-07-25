"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingRecord } from "@/types";
import { BookingService } from "@/services/BookingService";

export function useBookings(params: { customerId?: string; agentId?: string }) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let results: BookingRecord[] = [];
      if (params.customerId) results = await BookingService.listByCustomer(params.customerId);
      else if (params.agentId) results = await BookingService.listByAgent(params.agentId);
      else results = await BookingService.listAll();
      setBookings(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [params.customerId, params.agentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { bookings, isLoading, error, refetch: load };
}
