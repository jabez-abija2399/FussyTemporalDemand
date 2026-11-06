"use server";

import { redirect } from "next/navigation";
import { createBooking } from "@/lib/bookings";
import { bookingsRepo } from "@/lib/data/bookings";
import { createClient } from "@/lib/supabase/server";

export async function bookSlot(salonId: string, formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const result = await createBooking(bookingsRepo(supabase), data.user.id, {
    salonId,
    service: String(formData.get("service")),
    // The form sends a local "YYYY-MM-DDTHH:mm"; this early version treats it as UTC.
    startsAt: `${formData.get("startsAt")}:00Z`,
    durationMinutes: Number(formData.get("duration")),
  });

  if (!result.ok) redirect(`/salons/${salonId}?error=${encodeURIComponent(result.error)}`);
  redirect("/bookings?booked=1");
}
