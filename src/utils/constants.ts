export const APP_NAME = "SRMS";
export const APP_FULL_NAME = "Smart Real Estate Management System";

export const CITIES = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi"];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
];

export const ROLE_LABELS: Record<string, string> = {
  customer: "Customer",
  agent: "Agent",
  admin: "Administrator",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: "amber",
  confirmed: "emerald",
  cancelled: "rose",
  completed: "sky",
  rejected: "rose",
};

export const PROPERTY_STATUS_COLORS: Record<string, string> = {
  available: "emerald",
  booked: "amber",
  under_review: "sky",
  sold: "slate",
  inactive: "rose",
};
