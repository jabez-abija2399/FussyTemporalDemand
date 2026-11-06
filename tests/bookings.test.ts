import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelBooking, createBooking, overlaps, type BookingsRepo, type NewBooking } from "@/lib/bookings";
import type { Booking, Salon } from "@/lib/types";

const NOW = new Date("2026-11-02T08:00:00Z");

const salon: Salon = {
  id: "salon-1",
  name: "Copper & Comb",
  city: "Riverton",
  address: "12 Mill Lane",
  description: "",
  opens_at: 9,
  closes_at: 18,
};

const request: NewBooking = {
  salonId: salon.id,
  service: "Haircut",
  startsAt: "2026-11-03T10:00:00Z",
  durationMinutes: 30,
};

function mockRepo(overrides: Partial<BookingsRepo> = {}): BookingsRepo {
  return {
    getSalon: vi.fn(async () => salon),
    takenSlots: vi.fn(async () => []),
    insert: vi.fn(async (b) => ({ ...b, id: "booking-1", status: "confirmed" as const })),
    findById: vi.fn(async () => null),
    setStatus: vi.fn(async () => {}),
    ...overrides,
  };
}

describe("createBooking", () => {
  let repo: BookingsRepo;
  beforeEach(() => {
    repo = mockRepo();
  });

  it("books a free slot during opening hours", async () => {
    const result = await createBooking(repo, "user-1", request, NOW);
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ user_id: "user-1", starts_at: "2026-11-03T10:00:00.000Z" }),
    });
    expect(repo.insert).toHaveBeenCalledOnce();
  });

  it("rejects an unknown salon", async () => {
    repo = mockRepo({ getSalon: vi.fn(async () => null) });
    expect(await createBooking(repo, "user-1", request, NOW)).toEqual({ ok: false, error: "Salon not found." });
  });

  it("rejects a time in the past", async () => {
    const result = await createBooking(repo, "user-1", { ...request, startsAt: "2026-11-01T10:00:00Z" }, NOW);
    expect(result).toEqual({ ok: false, error: "Bookings must be in the future." });
    expect(repo.insert).not.toHaveBeenCalled();
  });

  it("rejects times that are not on a half-hour boundary", async () => {
    const result = await createBooking(repo, "user-1", { ...request, startsAt: "2026-11-03T10:15:00Z" }, NOW);
    expect(result.ok).toBe(false);
  });

  it("rejects a booking that runs past closing time", async () => {
    const late = { ...request, startsAt: "2026-11-03T17:30:00Z", durationMinutes: 60 };
    expect(await createBooking(repo, "user-1", late, NOW)).toEqual({
      ok: false,
      error: "Copper & Comb is open 9:00–18:00.",
    });
  });

  it("rejects an unknown service", async () => {
    const result = await createBooking(repo, "user-1", { ...request, service: "Tattoo" }, NOW);
    expect(result).toEqual({ ok: false, error: "Pick a service." });
  });

  it("rejects a slot that overlaps an existing booking", async () => {
    repo = mockRepo({
      takenSlots: vi.fn(async () => [{ starts_at: "2026-11-03T09:30:00Z", duration_minutes: 60 }]),
    });
    expect(await createBooking(repo, "user-1", request, NOW)).toEqual({
      ok: false,
      error: "That time is already booked.",
    });
    expect(repo.insert).not.toHaveBeenCalled();
  });
});

describe("overlaps", () => {
  it("treats back-to-back slots as free", () => {
    expect(
      overlaps(
        { starts_at: "2026-11-03T10:00:00Z", duration_minutes: 30 },
        { starts_at: "2026-11-03T10:30:00Z", duration_minutes: 30 },
      ),
    ).toBe(false);
  });
});

describe("cancelBooking", () => {
  const booking: Booking = {
    id: "booking-1",
    salon_id: salon.id,
    user_id: "user-1",
    service: "Haircut",
    starts_at: "2026-11-03T10:00:00Z",
    duration_minutes: 30,
    status: "confirmed",
  };

  it("cancels the user's own upcoming booking", async () => {
    const repo = mockRepo({ findById: vi.fn(async () => booking) });
    expect(await cancelBooking(repo, "user-1", booking.id, NOW)).toEqual({ ok: true, value: null });
    expect(repo.setStatus).toHaveBeenCalledWith(booking.id, "cancelled");
  });

  it("does not let users cancel someone else's booking", async () => {
    const repo = mockRepo({ findById: vi.fn(async () => booking) });
    expect(await cancelBooking(repo, "user-2", booking.id, NOW)).toEqual({ ok: false, error: "Booking not found." });
    expect(repo.setStatus).not.toHaveBeenCalled();
  });

  it("does not cancel bookings that already started", async () => {
    const repo = mockRepo({ findById: vi.fn(async () => booking) });
    const later = new Date("2026-11-03T10:05:00Z");
    expect(await cancelBooking(repo, "user-1", booking.id, later)).toEqual({
      ok: false,
      error: "Past bookings can't be cancelled.",
    });
  });
});
