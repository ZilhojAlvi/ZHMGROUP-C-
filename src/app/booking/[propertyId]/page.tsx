"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { CheckCircle2, Download, MapPin, ShieldAlert, ArrowLeft } from "lucide-react";
import { BookingRecord, PaymentMethod, PaymentRecord, Property } from "@/types";
import { PropertyService } from "@/services/PropertyService";
import { BookingService } from "@/services/BookingService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Spinner";
import { BookingCalendar } from "@/features/booking/BookingCalendar";
import { PaymentSimulator } from "@/features/booking/PaymentSimulator";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";

const STEPS = ["Availability", "Payment", "Receipt"];

function BookingFlow() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const router = useRouter();
  const { session } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const found = await PropertyService.getById(propertyId);
      setProperty(found ?? null);
      setIsLoading(false);
    })();
  }, [propertyId]);

  if (isLoading) return <PageLoader label="Preparing booking..." />;

  if (!property) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto mb-3 text-navy-300" size={36} />
        <h1 className="font-display text-xl font-bold text-navy-900 dark:text-white">
          Property not found
        </h1>
        <Button className="mt-5" onClick={() => router.push("/properties")}>
          Back to listings
        </Button>
      </div>
    );
  }

  if (property.status !== "available" && step === 0 && !booking) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <ShieldAlert className="mx-auto mb-3 text-amber-400" size={36} />
        <h1 className="font-display text-xl font-bold text-navy-900 dark:text-white">
          This property isn&apos;t available
        </h1>
        <p className="mt-2 text-sm text-navy-400">
          It may already be booked or under review. Explore similar listings instead.
        </p>
        <Button className="mt-5" onClick={() => router.push("/properties")}>
          Browse other properties
        </Button>
      </div>
    );
  }

  const handleConfirmAvailability = async () => {
    if (!selectedDate) {
      toast.error("Please select a move-in date first.");
      return;
    }
    if (!session) return;
    setIsSubmitting(true);
    try {
      const created = await BookingService.createBooking({
        property,
        customerId: session.userId,
        moveInDate: new Date(selectedDate).toISOString(),
        notes: notes || undefined,
      });
      setBooking(created);
      setStep(1);
      toast.success("Property reserved — proceed to payment.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (method: PaymentMethod) => {
    if (!booking || !session) return;
    setIsSubmitting(true);
    try {
      const result = await BookingService.processPayment({
        bookingId: booking.bookingId,
        customerId: session.userId,
        amount: booking.totalAmount,
        method,
      });
      setPayment(result);
      if (result.status === "success") {
        setBooking({ ...booking, status: "confirmed" });
        toast.success("Payment verified — booking confirmed!");
        setStep(2);
      } else {
        toast.error("Payment could not be verified. Please try again.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-navy-400 hover:text-brand-500"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2 animate-fade-up">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                  ? "bg-gradient-to-br from-brand-600 to-navy-700 text-white shadow-md"
                  : "bg-surface-muted text-navy-400"
              }`}
            >
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-navy-800 dark:text-white" : "text-navy-400"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-0.5 flex-1 bg-surface-muted" />}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {step === 0 && (
            <div className="space-y-5 animate-fade-up">
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold text-navy-900 dark:text-white">
                  Choose your move-in date
                </h2>
                <p className="mt-1 text-sm text-navy-400">
                  Availability is checked instantly against existing bookings.
                </p>
                <div className="mt-5">
                  <BookingCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
                </div>
              </Card>
              <Card className="p-6">
                <Textarea
                  label="Notes for the agent (optional)"
                  placeholder="e.g. Requesting an early walkthrough, financing pending, etc."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Card>
              <Button size="lg" fullWidth isLoading={isSubmitting} onClick={handleConfirmAvailability}>
                Confirm availability & continue
              </Button>
            </div>
          )}

          {step === 1 && booking && (
            <div className="animate-fade-up">
              <PaymentSimulator amount={booking.totalAmount} isProcessing={isSubmitting} onSubmit={handlePayment} />
            </div>
          )}

          {step === 2 && booking && payment && (
            <div className="space-y-5 animate-scale-in">
              <Card className="overflow-hidden p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15">
                  <CheckCircle2 size={30} />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-navy-900 dark:text-white">
                  Booking confirmed!
                </h2>
                <p className="mt-1 text-sm text-navy-400">
                  A receipt has been generated below. Track this booking anytime from your history.
                </p>
              </Card>

              <Card className="p-6" id="receipt">
                <div className="flex items-center justify-between border-b border-dashed border-black/10 dark:border-white/10 pb-4">
                  <div>
                    <p className="text-xs text-navy-400">Receipt</p>
                    <p className="font-mono text-sm font-semibold text-navy-800 dark:text-white">
                      {payment.transactionRef}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    Paid
                  </span>
                </div>
                <div className="space-y-3 py-4 text-sm">
                  <Row label="Property" value={property.title} />
                  <Row label="Booking ID" value={booking.bookingId} />
                  <Row label="Move-in date" value={formatDate(booking.moveInDate)} />
                  <Row label="Payment method" value={payment.method.replace("_", " ")} />
                  <Row label="Payment date" value={formatDateTime(payment.paymentDate)} />
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-black/10 dark:border-white/10 pt-4">
                  <span className="text-sm font-medium text-navy-500">Amount paid</span>
                  <span className="font-display text-xl font-bold text-navy-900 dark:text-white">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => window.print()}>
                  <Download size={15} /> Download / print receipt
                </Button>
                <Button fullWidth onClick={() => router.push("/bookings/history")}>
                  View booking history
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Property summary sidebar */}
        <Card className="h-fit p-5 animate-fade-up">
          <div className="relative h-36 w-full overflow-hidden rounded-xl">
            <Image src={property.images[0]} alt={property.title} fill sizes="320px" className="object-cover" />
          </div>
          <h3 className="mt-3 font-display text-base font-semibold text-navy-900 dark:text-white">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-navy-400">
            <MapPin size={12} /> {property.address}, {property.city}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-4">
            <span className="text-sm text-navy-500">
              {property.purpose === "rent" ? "Monthly rent" : "Sale price"}
            </span>
            <span className="font-display text-lg font-bold text-navy-900 dark:text-white">
              {formatCurrency(property.price)}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy-400">{label}</span>
      <span className="font-medium capitalize text-navy-800 dark:text-white">{value}</span>
    </div>
  );
}

export default function BookingPage() {
  return (
    <ProtectedRoute allow={["customer"]}>
      <BookingFlow />
    </ProtectedRoute>
  );
}
