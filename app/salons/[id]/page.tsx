import Link from "next/link";
import { notFound } from "next/navigation";
import { DURATIONS, SERVICES } from "@/lib/bookings";
import { reviewsRepo } from "@/lib/data/reviews";
import { getSalon } from "@/lib/data/salons";
import { averageRating } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { bookSlot } from "./actions";

export default async function SalonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const salon = await getSalon(supabase, id);
  if (!salon) notFound();

  const reviews = await reviewsRepo(supabase).listForSalon(salon.id);
  const average = averageRating(reviews);

  return (
    <>
      <h1>{salon.name}</h1>
      <p className="muted">
        {salon.address}, {salon.city} · Open {salon.opens_at}:00–{salon.closes_at}:00
      </p>
      <p>{salon.description}</p>
      <p>
        {average === null ? "Not rated yet" : `★ ${average} (${reviews.length} reviews)`}
        {" · "}
        <Link href={`/salons/${salon.id}/review`}>Leave a review</Link>
      </p>

      <h2>Book a slot</h2>
      <form action={bookSlot.bind(null, salon.id)}>
        <label>
          Service
          <select name="service">
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Duration
          <select name="duration">
            {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
          </select>
        </label>
        <label>
          Date and time
          <input type="datetime-local" name="startsAt" step={1800} required />
        </label>
        <button type="submit">Book</button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  );
}
