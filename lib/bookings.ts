import type { Booking, Result, Salon } from "./types";

export const SERVICES = ["Haircut", "Colour", "Beard trim", "Blow-dry"] as const;
export const DURATIONS = [30, 60, 90] as const;
const SLOT_MINUTES = 30;

export type Slot = Pick<Booking, "starts_at" | "duration_minutes">;

export type NewBooking = {
  salonId: string;
  service: string;
  startsAt: string;
  durationMinutes: number;
};

export interface BookingsRepo {
  getSalon(id: string): Promise<Salon | null>;
  takenSlots(salonId: string, from: Date, to: Date): Promise<Slot[]>;
  insert(booking: Omit<Booking, "id" | "status">): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  setStatus(id: string, status: Booking["status"]): Promise<void>;
}

export function validateBooking(input: NewBooking, salon: Salon, now: Date): string | null {
  const start = new Date(input.startsAt);
  if (Number.isNaN(start.getTime())) return "Pick a valid date and time.";
  if (!(SERVICES as readonly string[]).includes(input.service)) return "Pick a service.";
  if (!(DURATIONS as readonly number[]).includes(input.durationMinutes)) return "Pick a valid duration.";
  if (start <= now) return "Bookings must be in the future.";
  if (start.getUTCMinutes() % SLOT_MINUTES !== 0 || start.getUTCSeconds() !== 0) {
    return "Bookings start on the hour or half hour.";
  }

  const startHour = start.getUTCHours() + start.getUTCMinutes() / 60;
  const endHour = startHour + input.durationMinutes / 60;
  if (startHour < salon.opens_at || endHour > salon.closes_at) {
    return `${salon.name} is open ${salon.opens_at}:00–${salon.closes_at}:00.`;
  }
  return null;
}

export function overlaps(a: Slot, b: Slot): boolean {
  const aStart = new Date(a.starts_at).getTime();
  const bStart = new Date(b.starts_at).getTime();
  const aEnd = aStart + a.duration_minutes * 60_000;
  const bEnd = bStart + b.duration_minutes * 60_000;
  return aStart < bEnd && bStart < aEnd;
}

export async function createBooking(
  repo: BookingsRepo,
  userId: string,
  input: NewBooking,
  now = new Date(),
): Promise<Result<Booking>> {
  const salon = await repo.getSalon(input.salonId);
  if (!salon) return { ok: false, error: "Salon not found." };

  const invalid = validateBooking(input, salon, now);
  if (invalid) return { ok: false, error: invalid };

  const start = new Date(input.startsAt);
  const dayStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
  const taken = await repo.takenSlots(salon.id, dayStart, dayEnd);

  const wanted: Slot = { starts_at: start.toISOString(), duration_minutes: input.durationMinutes };
  if (taken.some((slot) => overlaps(slot, wanted))) {
    return { ok: false, error: "That time is already booked." };
  }

  const booking = await repo.insert({
    salon_id: salon.id,
    user_id: userId,
    service: input.service,
    starts_at: wanted.starts_at,
    duration_minutes: input.durationMinutes,
  });
  return { ok: true, value: booking };
}

export async function cancelBooking(
  repo: BookingsRepo,
  userId: string,
  bookingId: string,
  now = new Date(),
): Promise<Result<null>> {
  const booking = await repo.findById(bookingId);
  if (!booking || booking.user_id !== userId) return { ok: false, error: "Booking not found." };
  if (booking.status === "cancelled") return { ok: false, error: "Booking is already cancelled." };
  if (new Date(booking.starts_at) <= now) return { ok: false, error: "Past bookings can't be cancelled." };

  await repo.setStatus(booking.id, "cancelled");
  return { ok: true, value: null };
}
