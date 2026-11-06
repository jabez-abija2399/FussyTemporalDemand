import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewsRepo } from "@/lib/reviews";

export function reviewsRepo(db: SupabaseClient): ReviewsRepo {
  return {
    async listForSalon(salonId) {
      const { data, error } = await db.from("reviews").select("*").eq("salon_id", salonId);
      if (error) throw error;
      return data;
    },
    async insert(review) {
      const { data, error } = await db.from("reviews").insert(review).select().single();
      if (error) throw error;
      return data;
    },
  };
}
