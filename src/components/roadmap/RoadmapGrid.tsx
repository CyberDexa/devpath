import { motion } from "framer-motion";
import type { RoadmapData } from "../../data/types";
import RoadmapCard from "./RoadmapCard";

interface RoadmapGridProps {
  roadmaps: RoadmapData[];
}

export default function RoadmapGrid({ roadmaps }: RoadmapGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {roadmaps.map((roadmap, i) => (
        <RoadmapCard key={roadmap.id} roadmap={roadmap} index={i} />
      ))}
    </div>
  );
}
