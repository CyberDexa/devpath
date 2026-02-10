import { motion } from "framer-motion";
import type { RoadmapData } from "../../data/types";

interface RoadmapCardProps {
  roadmap: RoadmapData;
  index: number;
}

export default function RoadmapCard({ roadmap, index }: RoadmapCardProps) {
  return (
    <motion.a
      href={`/roadmaps/${roadmap.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group block rounded-xl bg-surface border border-white/5 hover:border-teal/20 p-6 transition-all duration-300 hover:shadow-glow"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{roadmap.icon}</span>
        <span className="text-[10px] uppercase tracking-widest font-semibold text-dim bg-elevated px-2 py-0.5 rounded-full">
          {roadmap.category}
        </span>
      </div>

      <h3 className="font-display font-bold text-bright text-lg mb-1.5 group-hover:text-teal transition-colors duration-200">
        {roadmap.title}
      </h3>
      <p className="text-sm text-dim leading-relaxed mb-4 line-clamp-2">
        {roadmap.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-subtle">
            {roadmap.totalNodes} topics
          </span>
          <span className="text-xs text-subtle">
            ~{roadmap.estimatedHours}h
          </span>
        </div>
        <svg
          className="w-4 h-4 text-muted group-hover:text-teal group-hover:translate-x-1 transition-all duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </motion.a>
  );
}
