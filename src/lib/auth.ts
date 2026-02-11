// ═══════════════════════════════════════
// SkillRoute — Authentication Utilities
// ═══════════════════════════════════════

import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

// ── Sign Up ──
export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) throw error;

  // Create profile after successful signup
  if (data.user) {
    const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      display_name: displayName,
      username,
    });
  }

  return data;
}

// ── Sign In with Email ──
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// ── Sign In with OAuth (GitHub / Google) ──
export async function signInWithOAuth(provider: "github" | "google") {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// ── Sign Out ──
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = "/";
}

// ── Get Current Session ──
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── Get Current User ──
export async function getUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── Reset Password ──
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw error;
}

// ── Update Password ──
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
}

// ── Update Profile ──
export async function updateProfile(
  userId: string,
  updates: {
    display_name?: string;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    github_username?: string;
    twitter_handle?: string;
    avatar_url?: string;
  }
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Get Profile ──
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

// ── Subscribe to Auth Changes ──
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
