import type { Result, Review } from "./types";

export const MAX_COMMENT_LENGTH = 500;

export type NewReview = {
  salonId: string;
  authorName: string;
  rating: number;
  comment: string;
};

export interface ReviewsRepo {
  listForSalon(salonId: string): Promise<Review[]>;
  insert(review: Omit<Review, "id" | "created_at">): Promise<Review>;
}

export function validateReview(input: NewReview): string | null {
  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return "Rating must be a whole number from 1 to 5.";
  }
  if (input.authorName.trim().length === 0) return "Add a display name.";
  if (input.comment.trim().length > MAX_COMMENT_LENGTH) {
    return `Keep comments under ${MAX_COMMENT_LENGTH} characters.`;
  }
  return null;
}

/** Average rating rounded to one decimal, or null when there are no reviews. */
export function averageRating(reviews: Pick<Review, "rating">[]): number | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export async function submitReview(
  repo: ReviewsRepo,
  userId: string,
  input: NewReview,
): Promise<Result<Review>> {
  const invalid = validateReview(input);
  if (invalid) return { ok: false, error: invalid };

  const review = await repo.insert({
    salon_id: input.salonId,
    user_id: userId,
    author_name: input.authorName.trim(),
    rating: input.rating,
    comment: input.comment.trim(),
  });
  return { ok: true, value: review };
}
