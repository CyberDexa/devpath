// ═══════════════════════════════════════
// DevPath — Core Type Definitions
// ═══════════════════════════════════════

export interface Resource {
  title: string;
  url: string;
  type: "article" | "video" | "course" | "book" | "tool" | "podcast";
}

export interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  category:
    | "foundation"
    | "language"
    | "framework"
    | "tooling"
    | "styling"
    | "quality"
    | "optimization"
    | "infrastructure"
    | "architecture"
    | "specialization";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  position: { x: number; y: number };
  resources: Resource[];
}

export interface RoadmapEdge {
  from: string;
  to: string;
}

export interface RoadmapData {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "role" | "skill" | "best-practice";
  difficulty: string;
  estimatedHours: number;
  totalNodes: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export type NodeStatus =
  | "not-started"
  | "learning"
  | "completed"
  | "skipped";

export interface UserProgress {
  roadmapId: string;
  nodeStatuses: Record<string, NodeStatus>;
  startedAt: string;
  lastActivityAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
  xp: number;
  level: number;
  streak: number;
  roadmapProgress: UserProgress[];
}

// Category color mapping
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  foundation: { bg: "bg-sky/10", text: "text-sky", border: "border-sky/20" },
  language: { bg: "bg-violet/10", text: "text-violet", border: "border-violet/20" },
  framework: { bg: "bg-teal/10", text: "text-teal", border: "border-teal/20" },
  tooling: { bg: "bg-amber/10", text: "text-amber", border: "border-amber/20" },
  styling: { bg: "bg-rose/10", text: "text-rose", border: "border-rose/20" },
  quality: { bg: "bg-teal/10", text: "text-teal-dim", border: "border-teal-dim/20" },
  optimization: { bg: "bg-amber/10", text: "text-amber-dim", border: "border-amber-dim/20" },
  infrastructure: { bg: "bg-sky/10", text: "text-sky", border: "border-sky/20" },
  architecture: { bg: "bg-violet/10", text: "text-violet", border: "border-violet/20" },
  specialization: { bg: "bg-rose/10", text: "text-rose", border: "border-rose/20" },
};

// Difficulty badges
export const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "text-teal" },
  intermediate: { label: "Intermediate", color: "text-amber" },
  advanced: { label: "Advanced", color: "text-rose" },
};
