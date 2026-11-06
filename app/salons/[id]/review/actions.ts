"use server";

import { redirect } from "next/navigation";
import { reviewsRepo } from "@/lib/data/reviews";
import { submitReview } from "@/lib/reviews";
import { createClient } from "@/lib/supabase/server";

export async function postReview(salonId: string, formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");

  const result = await submitReview(reviewsRepo(supabase), data.user.id, {
    salonId,
    authorName: String(formData.get("authorName") ?? ""),
    rating: Number(formData.get("rating")),
    comment: String(formData.get("comment") ?? ""),
  });

  if (!result.ok) redirect(`/salons/${salonId}/review?error=${encodeURIComponent(result.error)}`);
  redirect(`/salons/${salonId}`);
}
