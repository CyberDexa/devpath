// ═══════════════════════════════════════
// SkillRoute — Phase 2 Data Access Layer
// Quiz, Skills, Review, Learning Plans
// ═══════════════════════════════════════

import { supabase } from "./supabase";
import { sm2, answerToQuality } from "./spaced-repetition";

// ═══════════════════════════════════════
// Quiz Attempts
// ═══════════════════════════════════════

export interface QuizAttemptQuestion {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  timeMs: number;
}

export async function saveQuizAttempt(
  userId: string,
  roadmapId: string,
  quizType: "diagnostic" | "review" | "practice",
  questions: QuizAttemptQuestion[]
) {
  const score = questions.filter((q) => q.correct).length;
  const total = questions.length;
  const percentage = total > 0 ? (score / total) * 100 : 0;

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: userId,
      roadmap_id: roadmapId,
      quiz_type: quizType,
      questions: questions as unknown as Record<string, unknown>[],
      score,
      total,
      percentage: Math.round(percentage * 100) / 100,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizAttempts(
  userId: string,
  roadmapId?: string
) {
  let query = supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (roadmapId) {
    query = query.eq("roadmap_id", roadmapId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLatestDiagnostic(
  userId: string,
  roadmapId: string
) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId)
    .eq("quiz_type", "diagnostic")
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// User Skills
// ═══════════════════════════════════════

export async function getUserSkills(
  userId: string,
  roadmapId?: string
) {
  let query = supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", userId);

  if (roadmapId) {
    query = query.eq("roadmap_id", roadmapId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertUserSkill(
  userId: string,
  roadmapId: string,
  nodeId: string,
  proficiency: number,
  confidence: number
) {
  const { data: existing } = await supabase
    .from("user_skills")
    .select("times_tested")
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId)
    .eq("node_id", nodeId)
    .maybeSingle();

  const timesTested = (existing?.times_tested ?? 0) + 1;

  const { data, error } = await supabase
    .from("user_skills")
    .upsert(
      {
        user_id: userId,
        roadmap_id: roadmapId,
        node_id: nodeId,
        proficiency: Math.round(proficiency * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        times_tested: timesTested,
        last_tested_at: new Date().toISOString(),
      },
      { onConflict: "user_id,roadmap_id,node_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update skills after a quiz attempt.
 * Groups answers by node and calculates proficiency.
 */
export async function updateSkillsFromQuiz(
  userId: string,
  roadmapId: string,
  answers: Array<{
    nodeId: string;
    correct: boolean;
    timeMs: number;
  }>
) {
  // Group by node
  const nodeMap = new Map<string, typeof answers>();
  for (const a of answers) {
    const list = nodeMap.get(a.nodeId) || [];
    list.push(a);
    nodeMap.set(a.nodeId, list);
  }

  const results: Array<{
    nodeId: string;
    proficiency: number;
    confidence: number;
  }> = [];

  for (const [nodeId, nodeAnswers] of nodeMap) {
    const correct = nodeAnswers.filter((a) => a.correct).length;
    const total = nodeAnswers.length;
    const proficiency = total > 0 ? correct / total : 0;
    // Confidence increases with more questions answered
    const confidence = Math.min(1, total / 5);

    await upsertUserSkill(userId, roadmapId, nodeId, proficiency, confidence);
    results.push({ nodeId, proficiency, confidence });
  }

  return results;
}

// ═══════════════════════════════════════
// Review Items (Spaced Repetition)
// ═══════════════════════════════════════

export async function getUserReviewItems(
  userId: string,
  roadmapId?: string
) {
  let query = supabase
    .from("review_items")
    .select("*")
    .eq("user_id", userId);

  if (roadmapId) {
    query = query.eq("roadmap_id", roadmapId);
  }

  const { data, error } = await query.order("next_review_at", {
    ascending: true,
  });
  if (error) throw error;
  return data;
}

export async function getDueReviewItems(
  userId: string,
  limit = 20
) {
  const { data, error } = await supabase
    .from("review_items")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createReviewItem(
  userId: string,
  roadmapId: string,
  nodeId: string,
  questionId: string
) {
  const { data, error } = await supabase
    .from("review_items")
    .upsert(
      {
        user_id: userId,
        roadmap_id: roadmapId,
        node_id: nodeId,
        question_id: questionId,
        easiness_factor: 2.5,
        interval: 1,
        repetitions: 0,
        next_review_at: new Date().toISOString(),
      },
      { onConflict: "user_id,question_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Process a review answer using SM-2 algorithm
 */
export async function processReviewAnswer(
  reviewItemId: string,
  correct: boolean,
  timeMs: number
) {
  // Fetch current item
  const { data: item, error: fetchError } = await supabase
    .from("review_items")
    .select("*")
    .eq("id", reviewItemId)
    .single();

  if (fetchError) throw fetchError;

  const quality = answerToQuality(correct, timeMs);
  const result = sm2(
    quality,
    item.easiness_factor,
    item.interval,
    item.repetitions
  );

  const { error: updateError } = await supabase
    .from("review_items")
    .update({
      easiness_factor: result.easinessFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      next_review_at: result.nextReviewAt.toISOString(),
      last_review_at: new Date().toISOString(),
      last_quality: quality,
    })
    .eq("id", reviewItemId);

  if (updateError) throw updateError;

  return { ...result, quality };
}

/**
 * After a quiz, enqueue missed questions for review
 */
export async function enqueueForReview(
  userId: string,
  roadmapId: string,
  answers: Array<{
    questionId: string;
    nodeId: string;
    correct: boolean;
  }>
) {
  // Add incorrect + borderline correct answers to review queue
  const toReview = answers.filter((a) => !a.correct);

  for (const item of toReview) {
    await createReviewItem(userId, roadmapId, item.nodeId, item.questionId);
  }

  return toReview.length;
}

// ═══════════════════════════════════════
// Learning Plans
// ═══════════════════════════════════════

export async function getUserLearningPlan(
  userId: string,
  roadmapId: string
) {
  const { data, error } = await supabase
    .from("learning_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveLearningPlan(
  userId: string,
  roadmapId: string,
  plan: {
    title: string;
    goal?: string;
    timelineWeeks: number;
    nodeOrder: string[];
    dailyMinutes: number;
  }
) {
  const { data, error } = await supabase
    .from("learning_plans")
    .upsert(
      {
        user_id: userId,
        roadmap_id: roadmapId,
        title: plan.title,
        goal: plan.goal,
        timeline_weeks: plan.timelineWeeks,
        node_order: plan.nodeOrder,
        daily_minutes: plan.dailyMinutes,
        is_active: true,
        generated_by: "ai",
      },
      { onConflict: "user_id,roadmap_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// Skill Assessment Summary
// ═══════════════════════════════════════

export interface SkillSummary {
  nodeId: string;
  nodeLabel: string;
  proficiency: number; // 0-1
  confidence: number; // 0-1
  status: "strong" | "moderate" | "weak" | "untested";
  reviewsDue: number;
}

export function calculateSkillStatus(
  proficiency: number,
  confidence: number
): "strong" | "moderate" | "weak" | "untested" {
  if (confidence < 0.2) return "untested";
  if (proficiency >= 0.8) return "strong";
  if (proficiency >= 0.5) return "moderate";
  return "weak";
}
