import type { CapacityInfo } from "@/types";

export function getCapacityStatus(
  capacity: number,
  booked: number,
  isBlocked: boolean
): CapacityInfo["status"] {
  if (isBlocked) return "blocked";
  const remaining = capacity - booked;
  if (remaining <= 0) return "full";
  if (remaining <= 2 || booked / capacity >= 0.66) return "almost-full";
  return "available";
}

export function calculateRemaining(capacity: number, bookings: { guest_count: number }[]) {
  const booked = bookings.reduce((sum, b) => sum + b.guest_count, 0);
  return { booked, remaining: capacity - booked };
}

export function capacityColor(status: CapacityInfo["status"]) {
  switch (status) {
    case "full":
    case "blocked":
      return "bg-red-500 text-white";
    case "almost-full":
      return "bg-amber-400 text-black";
    case "available":
      return "bg-emerald-500 text-white";
  }
}

export function capacityLabel(status: CapacityInfo["status"]) {
  switch (status) {
    case "full":
      return "Full";
    case "blocked":
      return "Blocked";
    case "almost-full":
      return "Almost Full";
    case "available":
      return "Available";
  }
}
