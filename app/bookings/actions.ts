"use server";

import { redirect } from "next/navigation";
import { cancelBooking } from "@/lib/bookings";
import { bookingsRepo } from "@/lib/data/bookings";
import { createClient } from "@/lib/supabase/server";

export async function cancel(bookingId: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const result = await cancelBooking(bookingsRepo(supabase), data.user.id, bookingId);
  if (!result.ok) redirect(`/bookings?error=${encodeURIComponent(result.error)}`);
  redirect("/bookings");
}
