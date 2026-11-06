import { notFound, redirect } from "next/navigation";
import { getSalon } from "@/lib/data/salons";
import { MAX_COMMENT_LENGTH } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";
import { postReview } from "./actions";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const salon = await getSalon(supabase, id);
  if (!salon) notFound();

  return (
    <>
      <h1>Review {salon.name}</h1>
      <form action={postReview.bind(null, salon.id)}>
        <label>
          Display name
          <input name="authorName" required maxLength={60} />
        </label>
        <label>
          Rating
          <select name="rating" defaultValue="5">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
          </select>
        </label>
        <label>
          Comment (optional)
          <textarea name="comment" rows={4} maxLength={MAX_COMMENT_LENGTH} />
        </label>
        <button type="submit">Post review</button>
        {error && <p className="error">{error}</p>}
      </form>
    </>
  );
}
