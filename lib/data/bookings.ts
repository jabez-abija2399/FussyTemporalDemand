import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingsRepo } from "@/lib/bookings";
import type { Booking } from "@/lib/types";
import { getSalon } from "./salons";

export function bookingsRepo(db: SupabaseClient): BookingsRepo {
  return {
    getSalon: (id) => getSalon(db, id),
    async takenSlots(salonId, from, to) {
      const { data, error } = await db.rpc("taken_slots", {
        p_salon_id: salonId,
        p_from: from.toISOString(),
        p_to: to.toISOString(),
      });
      if (error) throw error;
      return data;
    },
    async insert(booking) {
      const { data, error } = await db.from("bookings").insert(booking).select().single();
      if (error) throw error;
      return data;
    },
    async findById(id) {
      const { data, error } = await db.from("bookings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
    async setStatus(id, status) {
      const { error } = await db.from("bookings").update({ status }).eq("id", id);
      if (error) throw error;
    },
  };
}

export type BookingWithSalon = Booking & { salons: { name: string } | null };

export async function listMyBookings(db: SupabaseClient, userId: string): Promise<BookingWithSalon[]> {
  const { data, error } = await db
    .from("bookings")
    .select("*, salons(name)")
    .eq("user_id", userId)
    .order("starts_at");
  if (error) throw error;
  return data;
}
