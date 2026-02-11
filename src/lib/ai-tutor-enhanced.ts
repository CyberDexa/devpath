// ═══════════════════════════════════════
// DevPath — Enhanced AI Tutor Service
// Context-aware tutoring with skill graph integration
// ═══════════════════════════════════════

import { sendTutorMessage, type ChatMessage } from "./ai-tutor";
import type { SkillSummary } from "./adaptive-learning";
import type { RoadmapNode } from "../data/types";

export interface TutorContext {
  roadmapId?: string;
  roadmapTitle?: string;
  currentNodeId?: string;
  currentNodeLabel?: string;
  currentNodeDescription?: string;
  skills?: SkillSummary[];
  recentTopics?: string[];
  userLevel?: number;
}

/**
 * Build a context-aware system prompt injection based on user's current state
 */
function buildContextPrompt(context: TutorContext): string {
  const parts: string[] = [];

  if (context.roadmapTitle) {
    parts.push(
      `The student is currently studying the **${context.roadmapTitle}** roadmap.`
    );
  }

  if (context.currentNodeLabel && context.currentNodeDescription) {
    parts.push(
      `They are currently focused on: **${context.currentNodeLabel}** — ${context.currentNodeDescription}.`
    );
  }

  if (context.skills && context.skills.length > 0) {
    const strong = context.skills
      .filter((s) => s.status === "strong")
      .map((s) => s.nodeLabel);
    const weak = context.skills
      .filter((s) => s.status === "weak")
      .map((s) => s.nodeLabel);
    const moderate = context.skills
      .filter((s) => s.status === "moderate")
      .map((s) => s.nodeLabel);

    if (strong.length > 0) {
      parts.push(`Strong areas: ${strong.join(", ")}.`);
    }
    if (moderate.length > 0) {
      parts.push(`Moderate knowledge: ${moderate.join(", ")}.`);
    }
    if (weak.length > 0) {
      parts.push(
        `Areas needing improvement: ${weak.join(", ")}. Focus explanations on building up these skills.`
      );
    }
  }

  if (context.userLevel) {
    const levelDesc =
      context.userLevel <= 5
        ? "beginner"
        : context.userLevel <= 15
          ? "intermediate"
          : context.userLevel <= 30
            ? "advanced"
            : "expert";
    parts.push(
      `The student is level ${context.userLevel} (${levelDesc}). Adjust explanation depth accordingly.`
    );
  }

  if (context.recentTopics && context.recentTopics.length > 0) {
    parts.push(
      `Recently studied topics: ${context.recentTopics.join(", ")}.`
    );
  }

  if (parts.length === 0) return "";

  return `\n\n--- Student Context ---\n${parts.join("\n")}\n--- End Context ---\n\nUse this context to personalize your responses. Reference their current topic, acknowledge their strengths, and provide extra detail on weak areas. Don't mention this context directly — weave it naturally into your teaching.`;
}

/**
 * Enhanced tutoring with context injection
 */
export async function sendContextualTutorMessage(
  messages: ChatMessage[],
  context: TutorContext,
  provider: "anthropic" | "openai" | "auto" = "auto"
): Promise<string> {
  const contextPrompt = buildContextPrompt(context);

  if (contextPrompt) {
    // Inject context as a system message at the beginning
    const enhancedMessages: ChatMessage[] = [
      { role: "system", content: contextPrompt },
      ...messages,
    ];
    return sendTutorMessage(enhancedMessages, provider);
  }

  return sendTutorMessage(messages, provider);
}

/**
 * Generate a personalized learning plan using AI
 */
export async function generateLearningPlan(
  context: TutorContext & {
    goalDescription?: string;
    availableMinutesPerDay?: number;
    timelineWeeks?: number;
    allNodes?: RoadmapNode[];
  },
  provider: "anthropic" | "openai" | "auto" = "auto"
): Promise<string> {
  const skills = context.skills || [];
  const allNodes = context.allNodes || [];

  const skillMap = skills
    .map(
      (s) =>
        `- ${s.nodeLabel}: ${s.status} (${Math.round(s.proficiency * 100)}% proficiency)`
    )
    .join("\n");

  const nodeList = allNodes
    .map((n) => `- ${n.id}: ${n.label} (${n.difficulty}, ~${n.estimatedMinutes}min)`)
    .join("\n");

  const prompt = `Create a personalized learning plan for this student.

**Roadmap**: ${context.roadmapTitle || "Unknown"}
**Goal**: ${context.goalDescription || "Complete the roadmap"}
**Available time**: ${context.availableMinutesPerDay || 60} minutes/day
**Timeline**: ${context.timelineWeeks || 12} weeks

**Current skill assessment**:
${skillMap || "No assessment data yet"}

**Available topics**:
${nodeList || "No topic list available"}

**Instructions**:
1. Order the topics based on prerequisites and the student's current skill levels
2. Skip or briefly review topics they already know well
3. Spend more time on weak areas
4. Group related topics together
5. Include review/practice sessions
6. Be realistic about time estimates

Format your response as a structured weekly plan in markdown with:
- Week-by-week breakdown
- Daily time allocation
- Specific topics per week
- Practice exercises
- Review checkpoints`;

  const messages: ChatMessage[] = [
    { role: "user", content: prompt },
  ];

  return sendTutorMessage(messages, provider);
}

/**
 * Get AI-powered topic explanation tailored to student's level
 */
export async function explainTopic(
  nodeLabel: string,
  nodeDescription: string,
  context: TutorContext,
  provider: "anthropic" | "openai" | "auto" = "auto"
): Promise<string> {
  const level =
    context.userLevel && context.userLevel > 15
      ? "advanced"
      : context.userLevel && context.userLevel > 5
        ? "intermediate"
        : "beginner";

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: `Explain "${nodeLabel}" (${nodeDescription}) for a ${level} developer. Include:
1. What it is and why it matters
2. Key concepts to understand
3. A practical code example
4. Common pitfalls
5. How it connects to other topics they might know

Keep it concise but thorough.`,
    },
  ];

  const contextPrompt = buildContextPrompt(context);
  if (contextPrompt) {
    messages.unshift({ role: "system", content: contextPrompt });
  }

  return sendTutorMessage(messages, provider);
}
