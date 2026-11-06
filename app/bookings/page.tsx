import { redirect } from "next/navigation";
import { listMyBookings } from "@/lib/data/bookings";
import { createClient } from "@/lib/supabase/server";
import { cancel } from "./actions";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ booked?: string; error?: string }>;
}) {
  const { booked, error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const bookings = await listMyBookings(supabase, data.user.id);
  const now = Date.now();

  return (
    <>
      <h1>My bookings</h1>
      {booked && <p>Booked! See you soon.</p>}
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 && <p className="muted">No bookings yet.</p>}
      <ul className="plain">
        {bookings.map((b) => {
          const canCancel = b.status === "confirmed" && new Date(b.starts_at).getTime() > now;
          return (
            <li key={b.id} className="card">
              <strong>{b.salons?.name ?? "Salon"}</strong> · {b.service} · {b.duration_minutes} min
              <div className="muted">
                {new Date(b.starts_at).toUTCString()} · {b.status}
              </div>
              {canCancel && (
                <form action={cancel.bind(null, b.id)}>
                  <button type="submit">Cancel</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
