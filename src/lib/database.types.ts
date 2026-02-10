// ═══════════════════════════════════════
// DevPath — Supabase Database Types
// Auto-generated types for the database schema
// ═══════════════════════════════════════

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          github_username: string | null;
          twitter_handle: string | null;
          xp: number;
          level: number;
          streak: number;
          longest_streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          github_username?: string | null;
          twitter_handle?: string | null;
          xp?: number;
          level?: number;
          streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          github_username?: string | null;
          twitter_handle?: string | null;
          xp?: number;
          level?: number;
          streak?: number;
          longest_streak?: number;
          updated_at?: string;
        };
      };
      roadmap_progress: {
        Row: {
          id: string;
          user_id: string;
          roadmap_id: string;
          node_statuses: Record<string, "not-started" | "learning" | "completed" | "skipped">;
          started_at: string;
          last_activity_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          roadmap_id: string;
          node_statuses?: Record<string, string>;
          started_at?: string;
          last_activity_at?: string;
          completed_at?: string | null;
        };
        Update: {
          node_statuses?: Record<string, string>;
          last_activity_at?: string;
          completed_at?: string | null;
        };
      };
      project_submissions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          code: string;
          language: string;
          status: "submitted" | "running" | "passed" | "failed";
          test_results: Record<string, unknown> | null;
          ai_review: string | null;
          xp_earned: number;
          submitted_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          code: string;
          language: string;
          status?: string;
          test_results?: Record<string, unknown> | null;
          ai_review?: string | null;
          xp_earned?: number;
          submitted_at?: string;
          completed_at?: string | null;
        };
        Update: {
          code?: string;
          status?: string;
          test_results?: Record<string, unknown> | null;
          ai_review?: string | null;
          xp_earned?: number;
          completed_at?: string | null;
        };
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: "roadmap" | "project" | "streak" | "community" | "special";
          requirement: Record<string, unknown>;
          xp_reward: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          requirement: Record<string, unknown>;
          xp_reward?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          requirement?: Record<string, unknown>;
          xp_reward?: number;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: never;
      };
      activity_log: {
        Row: {
          id: string;
          user_id: string;
          action: "roadmap_started" | "node_completed" | "project_submitted" | "project_passed" | "badge_earned" | "streak_updated" | "level_up";
          metadata: Record<string, unknown>;
          xp_gained: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          metadata?: Record<string, unknown>;
          xp_gained?: number;
          created_at?: string;
        };
        Update: never;
      };
      ai_tutor_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          messages: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          messages?: Array<{ role: string; content: string; timestamp: string }>;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          messages?: Array<{ role: string; content: string; timestamp: string }>;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
