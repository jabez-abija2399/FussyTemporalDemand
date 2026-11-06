export type Salon = {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
  opens_at: number;
  closes_at: number;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  salon_id: string;
  user_id: string;
  service: string;
  starts_at: string;
  duration_minutes: number;
  status: BookingStatus;
};

export type Review = {
  id: string;
  salon_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
