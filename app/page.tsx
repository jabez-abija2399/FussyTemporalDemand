import Link from "next/link";
import { listSalons } from "@/lib/data/salons";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const salons = await listSalons(await createClient());

  return (
    <>
      <h1>Find a salon</h1>
      {salons.length === 0 && <p className="muted">No salons yet.</p>}
      <ul className="plain">
        {salons.map((salon) => (
          <li key={salon.id} className="card">
            <Link href={`/salons/${salon.id}`}><strong>{salon.name}</strong></Link>
            <div className="muted">{salon.city} · {salon.address}</div>
          </li>
        ))}
      </ul>
    </>
  );
}
