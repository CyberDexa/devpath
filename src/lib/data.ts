// ═══════════════════════════════════════
// SkillRoute — Data Access Layer
// CRUD operations for all entities
// ═══════════════════════════════════════

import { supabase } from "./supabase";

// ═══════════════════════════════════════
// Roadmap Progress
// ═══════════════════════════════════════

export async function getUserRoadmapProgress(userId: string) {
  const { data, error } = await supabase
    .from("roadmap_progress")
    .select("*")
    .eq("user_id", userId)
    .order("last_activity_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRoadmapProgress(userId: string, roadmapId: string) {
  const { data, error } = await supabase
    .from("roadmap_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("roadmap_id", roadmapId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
  return data;
}

export async function upsertRoadmapProgress(
  userId: string,
  roadmapId: string,
  nodeStatuses: Record<string, string>
) {
  const { data, error } = await supabase
    .from("roadmap_progress")
    .upsert(
      {
        user_id: userId,
        roadmap_id: roadmapId,
        node_statuses: nodeStatuses,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: "user_id,roadmap_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// Project Submissions
// ═══════════════════════════════════════

export async function getUserSubmissions(userId: string) {
  const { data, error } = await supabase
    .from("project_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function submitProject(
  userId: string,
  projectId: string,
  code: string,
  language: string
) {
  const { data, error } = await supabase
    .from("project_submissions")
    .insert({
      user_id: userId,
      project_id: projectId,
      code,
      language,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// Badges
// ═══════════════════════════════════════

export async function getAllBadges() {
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("category");

  if (error) throw error;
  return data;
}

export async function getUserBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("*, badges(*)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════
// Activity Log
// ═══════════════════════════════════════

export async function getUserActivity(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function logActivity(
  userId: string,
  action: string,
  metadata: Record<string, unknown> = {},
  xpGained = 0
) {
  const { error } = await supabase.from("activity_log").insert({
    user_id: userId,
    action,
    metadata,
    xp_gained: xpGained,
  });

  if (error) throw error;

  // Update user XP
  if (xpGained > 0) {
    await addXp(userId, xpGained);
  }
}

// ═══════════════════════════════════════
// XP & Level System
// ═══════════════════════════════════════

const XP_PER_LEVEL = 1000; // XP needed doubles each level
function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export async function addXp(userId: string, amount: number) {
  // Fetch current profile
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("xp, level")
    .eq("id", userId)
    .single();

  if (fetchError) throw fetchError;

  const newXp = (profile?.xp || 0) + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > (profile?.level || 1);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ xp: newXp, level: newLevel })
    .eq("id", userId);

  if (updateError) throw updateError;

  // Log level up
  if (leveledUp) {
    await supabase.from("activity_log").insert({
      user_id: userId,
      action: "level_up",
      metadata: { from: profile?.level, to: newLevel },
      xp_gained: 0,
    });
  }

  return { xp: newXp, level: newLevel, leveledUp };
}

// ═══════════════════════════════════════
// AI Tutor Conversations
// ═══════════════════════════════════════

export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from("ai_tutor_conversations")
    .select("id, title, model, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getConversation(conversationId: string) {
  const { data, error } = await supabase
    .from("ai_tutor_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
}

export async function createConversation(
  userId: string,
  title: string,
  messages: Array<{ role: string; content: string; timestamp: string }>
) {
  const { data, error } = await supabase
    .from("ai_tutor_conversations")
    .insert({ user_id: userId, title, messages })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateConversation(
  conversationId: string,
  messages: Array<{ role: string; content: string; timestamp: string }>
) {
  const { error } = await supabase
    .from("ai_tutor_conversations")
    .update({ messages })
    .eq("id", conversationId);

  if (error) throw error;
}

// ═══════════════════════════════════════
// Leaderboard
// ═══════════════════════════════════════

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, username, avatar_url, xp, level, streak")
    .order("xp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
