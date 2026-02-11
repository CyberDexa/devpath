// ═══════════════════════════════════════
// SkillRoute — Skill Graph Visualization
// Radar chart showing proficiency across topics
// ═══════════════════════════════════════

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  Award,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import type { RoadmapNode } from "../../data/types";
import { calculateSkillStatus, type SkillSummary } from "../../lib/adaptive-learning";

interface SkillGraphProps {
  roadmapId: string;
  roadmapTitle: string;
  nodes: RoadmapNode[];
  skills?: Record<string, { proficiency: number; confidence: number }>;
}

export default function SkillGraph({
  roadmapId,
  roadmapTitle,
  nodes,
  skills = {},
}: SkillGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Build skill summary for each node
  const skillSummaries: SkillSummary[] = useMemo(
    () =>
      nodes.map((node) => {
        const skill = skills[node.id];
        const proficiency = skill?.proficiency ?? 0;
        const confidence = skill?.confidence ?? 0;
        return {
          nodeId: node.id,
          nodeLabel: node.label,
          proficiency,
          confidence,
          status: calculateSkillStatus(proficiency, confidence),
          reviewsDue: 0,
        };
      }),
    [nodes, skills]
  );

  // Stats
  const strong = skillSummaries.filter((s) => s.status === "strong").length;
  const moderate = skillSummaries.filter((s) => s.status === "moderate").length;
  const weak = skillSummaries.filter((s) => s.status === "weak").length;
  const untested = skillSummaries.filter((s) => s.status === "untested").length;
  const avgProficiency =
    skillSummaries.length > 0
      ? skillSummaries.reduce((sum, s) => sum + s.proficiency, 0) /
        skillSummaries.length
      : 0;

  // Radar chart calculations
  const radarSize = 280;
  const center = radarSize / 2;
  const maxRadius = center - 40;
  const angleStep =
    skillSummaries.length > 0
      ? (2 * Math.PI) / skillSummaries.length
      : 0;

  const radarPoints = skillSummaries.map((s, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = s.proficiency * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (maxRadius + 25) * Math.cos(angle),
      labelY: center + (maxRadius + 25) * Math.sin(angle),
      ...s,
    };
  });

  const radarPath =
    radarPoints.length > 2
      ? radarPoints
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ") + " Z"
      : "";

  // Grid circles
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-accent">
            {Math.round(avgProficiency * 100)}%
          </div>
          <div className="text-xs text-text-muted">Avg Proficiency</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-teal-400">{strong}</div>
          <div className="text-xs text-text-muted">Strong</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{moderate}</div>
          <div className="text-xs text-text-muted">Moderate</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-rose-400">{weak}</div>
          <div className="text-xs text-text-muted">Weak</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-text-muted">{untested}</div>
          <div className="text-xs text-text-muted">Untested</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Target size={18} className="text-accent" />
            Skill Radar
          </h3>

          {skillSummaries.length > 2 ? (
            <div className="flex justify-center">
              <svg
                width={radarSize}
                height={radarSize}
                viewBox={`0 0 ${radarSize} ${radarSize}`}
              >
                {/* Grid circles */}
                {gridLevels.map((level) => (
                  <circle
                    key={level}
                    cx={center}
                    cy={center}
                    r={maxRadius * level}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-border"
                    strokeDasharray={level < 1 ? "3 3" : undefined}
                  />
                ))}

                {/* Grid labels */}
                {gridLevels.map((level) => (
                  <text
                    key={`label-${level}`}
                    x={center + 4}
                    y={center - maxRadius * level + 12}
                    className="fill-text-muted"
                    fontSize="8"
                    opacity="0.5"
                  >
                    {Math.round(level * 100)}%
                  </text>
                ))}

                {/* Axis lines */}
                {radarPoints.map((p, i) => {
                  const angle =
                    i * angleStep - Math.PI / 2;
                  return (
                    <line
                      key={`axis-${i}`}
                      x1={center}
                      y1={center}
                      x2={center + maxRadius * Math.cos(angle)}
                      y2={center + maxRadius * Math.sin(angle)}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-border"
                    />
                  );
                })}

                {/* Filled area */}
                <motion.path
                  d={radarPath}
                  fill="rgba(0, 229, 160, 0.1)"
                  stroke="rgba(0, 229, 160, 0.6)"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />

                {/* Data points */}
                {radarPoints.map((p, i) => (
                  <motion.circle
                    key={`point-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    className={clsx(
                      p.status === "strong"
                        ? "fill-teal-400"
                        : p.status === "moderate"
                          ? "fill-amber-400"
                          : p.status === "weak"
                            ? "fill-rose-400"
                            : "fill-text-muted/30"
                    )}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="1"
                    initial={{ r: 0 }}
                    animate={{ r: 4 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setSelectedNode(p.nodeId)}
                    onMouseLeave={() => setSelectedNode(null)}
                  />
                ))}

                {/* Labels */}
                {radarPoints.map((p, i) => (
                  <text
                    key={`text-${i}`}
                    x={p.labelX}
                    y={p.labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={clsx(
                      "text-[9px]",
                      selectedNode === p.nodeId
                        ? "fill-text font-medium"
                        : "fill-text-muted"
                    )}
                  >
                    {p.nodeLabel.length > 12
                      ? p.nodeLabel.slice(0, 11) + "…"
                      : p.nodeLabel}
                  </text>
                ))}
              </svg>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted text-sm">
              Complete a skill assessment to see your radar chart
            </div>
          )}
        </div>

        {/* Skill List */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-accent" />
            Topic Proficiency
          </h3>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {skillSummaries.map((skill) => (
              <div
                key={skill.nodeId}
                className={clsx(
                  "p-3 rounded-xl border transition-colors",
                  selectedNode === skill.nodeId
                    ? "bg-accent/5 border-accent/30"
                    : "bg-canvas border-border/50 hover:border-border"
                )}
                onMouseEnter={() => setSelectedNode(skill.nodeId)}
                onMouseLeave={() => setSelectedNode(null)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text font-medium">
                    {skill.nodeLabel}
                  </span>
                  <StatusBadge status={skill.status} />
                </div>
                <div className="h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <motion.div
                    className={clsx(
                      "h-full rounded-full",
                      skill.status === "strong"
                        ? "bg-teal-500"
                        : skill.status === "moderate"
                          ? "bg-amber-500"
                          : skill.status === "weak"
                            ? "bg-rose-500"
                            : "bg-border"
                    )}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.round(skill.proficiency * 100)}%`,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-text-muted/60">
                    Confidence:{" "}
                    {Math.round(skill.confidence * 100)}%
                  </span>
                  <span className="text-[10px] font-mono text-text-muted/60">
                    {Math.round(skill.proficiency * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {weak + untested > 0 && (
        <div className="bg-surface border border-accent/20 rounded-2xl p-6">
          <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
            <Zap size={18} className="text-accent" />
            Recommended Next Steps
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {skillSummaries
              .filter((s) => s.status === "weak" || s.status === "untested")
              .slice(0, 4)
              .map((skill) => (
                <div
                  key={skill.nodeId}
                  className="flex items-center gap-3 p-3 bg-canvas rounded-xl border border-border/50"
                >
                  <div
                    className={clsx(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      skill.status === "weak"
                        ? "bg-rose-500/10"
                        : "bg-border/50"
                    )}
                  >
                    {skill.status === "weak" ? (
                      <TrendingUp size={14} className="text-rose-400" />
                    ) : (
                      <Brain size={14} className="text-text-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-text font-medium">
                      {skill.nodeLabel}
                    </p>
                    <p className="text-xs text-text-muted">
                      {skill.status === "weak"
                        ? "Needs practice"
                        : "Take assessment"}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "strong" | "moderate" | "weak" | "untested";
}) {
  const config = {
    strong: { label: "Strong", color: "bg-teal-500/10 text-teal-400" },
    moderate: { label: "Moderate", color: "bg-amber-500/10 text-amber-400" },
    weak: { label: "Weak", color: "bg-rose-500/10 text-rose-400" },
    untested: { label: "Untested", color: "bg-border text-text-muted" },
  };

  const { label, color } = config[status];
  return (
    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded-md font-medium", color)}>
      {label}
    </span>
  );
}
