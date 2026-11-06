import { describe, expect, it, vi } from "vitest";
import { averageRating, submitReview, validateReview, type NewReview, type ReviewsRepo } from "@/lib/reviews";

const input: NewReview = { salonId: "salon-1", authorName: "  Demo Customer  ", rating: 4, comment: " Nice. " };

function mockRepo(): ReviewsRepo {
  return {
    listForSalon: vi.fn(async () => []),
    insert: vi.fn(async (r) => ({ ...r, id: "review-1", created_at: "2026-11-02T08:00:00Z" })),
  };
}

describe("validateReview", () => {
  it("accepts a normal review", () => {
    expect(validateReview(input)).toBeNull();
  });

  it.each([0, 6, 3.5, Number.NaN])("rejects rating %s", (rating) => {
    expect(validateReview({ ...input, rating })).toMatch(/Rating/);
  });

  it("requires a display name", () => {
    expect(validateReview({ ...input, authorName: "   " })).toBe("Add a display name.");
  });

  it("rejects very long comments", () => {
    expect(validateReview({ ...input, comment: "a".repeat(501) })).toMatch(/under 500/);
  });
});

describe("averageRating", () => {
  it("returns null when there are no reviews", () => {
    expect(averageRating([])).toBeNull();
  });

  it("rounds to one decimal", () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(4.3);
  });
});

describe("submitReview", () => {
  it("trims and saves a valid review", async () => {
    const repo = mockRepo();
    const result = await submitReview(repo, "user-1", input);
    expect(result.ok).toBe(true);
    expect(repo.insert).toHaveBeenCalledWith({
      salon_id: "salon-1",
      user_id: "user-1",
      author_name: "Demo Customer",
      rating: 4,
      comment: "Nice.",
    });
  });

  it("does not save an invalid review", async () => {
    const repo = mockRepo();
    const result = await submitReview(repo, "user-1", { ...input, rating: 9 });
    expect(result.ok).toBe(false);
    expect(repo.insert).not.toHaveBeenCalled();
  });
});
