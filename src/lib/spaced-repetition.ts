// ═══════════════════════════════════════
// DevPath — Spaced Repetition Engine
// SM-2 algorithm implementation for optimal review scheduling
// ═══════════════════════════════════════

/**
 * SM-2 Algorithm (SuperMemo 2)
 * Determines when to next review an item based on recall quality.
 *
 * Quality ratings:
 * 5 — Perfect: instant recall
 * 4 — Correct: after hesitation
 * 3 — Correct: with difficulty
 * 2 — Incorrect: but felt close
 * 1 — Incorrect: remembered upon seeing answer
 * 0 — Complete blackout
 */

export interface ReviewItem {
  id: string;
  userId: string;
  roadmapId: string;
  nodeId: string;
  questionId: string | null;
  easinessFactor: number; // >= 1.3
  interval: number; // days until next review
  repetitions: number; // consecutive correct answers
  nextReviewAt: Date;
  lastReviewAt: Date | null;
  lastQuality: number | null; // 0-5
}

export interface SM2Result {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

/**
 * Core SM-2 algorithm
 * @param quality - User's recall quality (0-5)
 * @param prevEF - Previous easiness factor
 * @param prevInterval - Previous interval in days
 * @param prevRepetitions - Previous consecutive correct repetitions
 * @returns Updated SM-2 parameters
 */
export function sm2(
  quality: number,
  prevEF: number,
  prevInterval: number,
  prevRepetitions: number
): SM2Result {
  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  let ef = prevEF;
  let interval: number;
  let repetitions: number;

  if (quality >= 3) {
    // Correct response
    repetitions = prevRepetitions + 1;

    switch (repetitions) {
      case 1:
        interval = 1;
        break;
      case 2:
        interval = 6;
        break;
      default:
        interval = Math.round(prevInterval * ef);
    }

    // Update easiness factor
    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // Incorrect response — reset
    repetitions = 0;
    interval = 1;
  }

  // EF must never go below 1.3
  ef = Math.max(1.3, ef);

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { easinessFactor: ef, interval, repetitions, nextReviewAt };
}

/**
 * Convert quiz answer correctness + time to a quality rating (0-5)
 * @param correct - Whether the answer was correct
 * @param timeMs - Time taken to answer in milliseconds
 * @param avgTimeMs - Average time for this difficulty level
 */
export function answerToQuality(
  correct: boolean,
  timeMs: number,
  avgTimeMs = 15000
): number {
  if (!correct) {
    // Incorrect: rate based on if they knew the concept
    return timeMs < avgTimeMs * 0.5 ? 1 : 0;
  }

  // Correct: rate based on speed
  const ratio = timeMs / avgTimeMs;
  if (ratio < 0.3) return 5; // Very fast — perfect recall
  if (ratio < 0.6) return 4; // Fast — good recall
  if (ratio < 1.0) return 3; // Normal — correct with some thought
  return 3; // Slow but correct
}

/**
 * Get items due for review
 * @param items - All review items
 * @param maxItems - Maximum items to return
 */
export function getDueItems(
  items: ReviewItem[],
  maxItems = 20
): ReviewItem[] {
  const now = new Date();
  return items
    .filter((item) => new Date(item.nextReviewAt) <= now)
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt).getTime() -
        new Date(b.nextReviewAt).getTime()
    )
    .slice(0, maxItems);
}

/**
 * Calculate review statistics
 */
export function getReviewStats(items: ReviewItem[]) {
  const now = new Date();
  const due = items.filter((i) => new Date(i.nextReviewAt) <= now).length;
  const upcoming = items.filter((i) => {
    const reviewDate = new Date(i.nextReviewAt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return reviewDate > now && reviewDate <= tomorrow;
  }).length;

  const avgEF =
    items.length > 0
      ? items.reduce((sum, i) => sum + i.easinessFactor, 0) / items.length
      : 2.5;

  const mastered = items.filter(
    (i) => i.repetitions >= 5 && i.easinessFactor >= 2.5
  ).length;
  const learning = items.filter(
    (i) => i.repetitions > 0 && i.repetitions < 5
  ).length;
  const struggling = items.filter(
    (i) => i.easinessFactor < 1.8
  ).length;

  return {
    total: items.length,
    due,
    upcoming,
    mastered,
    learning,
    struggling,
    avgDifficulty: Math.round((1 - (avgEF - 1.3) / (2.5 - 1.3)) * 100),
    retention: items.length > 0
      ? Math.round(
          (items.filter((i) => (i.lastQuality ?? 0) >= 3).length /
            Math.max(items.filter((i) => i.lastQuality !== null).length, 1)) *
            100
        )
      : 100,
  };
}

/**
 * Estimate proficiency for a node based on review history
 * Returns 0-1 proficiency score
 */
export function estimateProficiency(
  items: ReviewItem[]
): number {
  if (items.length === 0) return 0;

  const scores = items.map((item) => {
    // Weight by recency and quality
    const daysSinceReview = item.lastReviewAt
      ? (Date.now() - new Date(item.lastReviewAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    const recencyWeight = Math.exp(-daysSinceReview / 30); // Decay over 30 days
    const qualityScore = ((item.lastQuality ?? 0) / 5);
    const repetitionBonus = Math.min(item.repetitions / 5, 1) * 0.3;
    const efBonus = ((item.easinessFactor - 1.3) / (2.5 - 1.3)) * 0.2;

    return (qualityScore * 0.5 + repetitionBonus + efBonus) * recencyWeight;
  });

  return Math.min(
    1,
    scores.reduce((sum, s) => sum + s, 0) / scores.length
  );
}
