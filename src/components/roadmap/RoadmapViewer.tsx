import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import type { RoadmapData, RoadmapNode, NodeStatus } from "../../data/types";
import { categoryColors, difficultyConfig } from "../../data/types";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { ZoomIn, ZoomOut, Maximize2, Minus, Cloud, CloudOff } from "lucide-react";
import { useRoadmapProgress } from "../../hooks/useRoadmapProgress";

interface RoadmapViewerProps {
  roadmap: RoadmapData;
}

export default function RoadmapViewer({ roadmap }: RoadmapViewerProps) {
  const {
    nodeStatuses,
    updateNodeStatus,
    toggleNodeStatus,
    loaded,
    isAuthenticated,
  } = useRoadmapProgress(roadmap.id, roadmap.nodes.length);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 2;
  const ZOOM_STEP = 0.15;

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Mouse wheel zoom
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Panning handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only pan on middle-click or when background is clicked
      if (e.button === 1 || (e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).closest(".roadmap-canvas-bg")) {
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [pan],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
  }, [isPanning]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Compute node positions for a vertical flow layout
  const layoutNodes = useMemo(() => {
    const levels: RoadmapNode[][] = [];
    const placed = new Set<string>();
    const nodeMap = new Map(roadmap.nodes.map((n) => [n.id, n]));

    // Find root nodes (no incoming edges)
    const hasIncoming = new Set(roadmap.edges.map((e) => e.to));
    const roots = roadmap.nodes.filter((n) => !hasIncoming.has(n.id));

    // BFS to assign levels
    let queue = roots.map((n) => ({ node: n, level: 0 }));
    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      if (placed.has(node.id)) continue;
      placed.add(node.id);

      if (!levels[level]) levels[level] = [];
      levels[level].push(node);

      // Find children
      const children = roadmap.edges
        .filter((e) => e.from === node.id)
        .map((e) => nodeMap.get(e.to))
        .filter(Boolean) as RoadmapNode[];

      children.forEach((child) => {
        if (!placed.has(child.id)) {
          queue.push({ node: child, level: level + 1 });
        }
      });
    }

    // Assign positions based on levels
    const NODE_WIDTH = 200;
    const NODE_GAP_X = 40;
    const LEVEL_GAP_Y = 100;

    return levels.flatMap((levelNodes, levelIdx) => {
      const totalWidth =
        levelNodes.length * NODE_WIDTH +
        (levelNodes.length - 1) * NODE_GAP_X;
      const startX = -totalWidth / 2;

      return levelNodes.map((node, nodeIdx) => ({
        ...node,
        layoutX: startX + nodeIdx * (NODE_WIDTH + NODE_GAP_X) + NODE_WIDTH / 2,
        layoutY: levelIdx * LEVEL_GAP_Y,
        level: levelIdx,
      }));
    });
  }, [roadmap]);

  // Compute SVG edges between laid-out nodes
  const edgePaths = useMemo(() => {
    const nodePositions = new Map(
      layoutNodes.map((n) => [n.id, { x: n.layoutX, y: n.layoutY }]),
    );

    return roadmap.edges
      .map((edge) => {
        const from = nodePositions.get(edge.from);
        const to = nodePositions.get(edge.to);
        if (!from || !to) return null;

        const startY = from.y + 28;
        const endY = to.y - 28;
        const midY = (startY + endY) / 2;

        return {
          key: `${edge.from}-${edge.to}`,
          d: `M ${from.x} ${startY} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${endY}`,
          fromStatus: nodeStatuses[edge.from] || "not-started",
          toStatus: nodeStatuses[edge.to] || "not-started",
        };
      })
      .filter(Boolean);
  }, [layoutNodes, roadmap.edges, nodeStatuses]);

  // Viewport
  const minX = Math.min(...layoutNodes.map((n) => n.layoutX)) - 130;
  const maxX = Math.max(...layoutNodes.map((n) => n.layoutX)) + 130;
  const maxY = Math.max(...layoutNodes.map((n) => n.layoutY)) + 60;
  const viewWidth = maxX - minX;
  const viewHeight = maxY + 60;

  // Keyboard navigation
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(-1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetView();
          break;
        case 'ArrowDown':
        case 'j': {
          e.preventDefault();
          setFocusedNodeIndex((prev) => {
            const next = Math.min(prev + 1, layoutNodes.length - 1);
            setSelectedNode(layoutNodes[next] || null);
            return next;
          });
          break;
        }
        case 'ArrowUp':
        case 'k': {
          e.preventDefault();
          setFocusedNodeIndex((prev) => {
            const next = Math.max(prev - 1, 0);
            setSelectedNode(layoutNodes[next] || null);
            return next;
          });
          break;
        }
        case 'Enter':
        case ' ': {
          if (focusedNodeIndex >= 0 && focusedNodeIndex < layoutNodes.length) {
            e.preventDefault();
            toggleNodeStatus(layoutNodes[focusedNodeIndex].id);
          }
          break;
        }
        case 'Escape': {
          setSelectedNode(null);
          setFocusedNodeIndex(-1);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedNodeIndex, handleZoomIn, handleZoomOut, handleResetView, layoutNodes, toggleNodeStatus]);

  const completedCount = Object.values(nodeStatuses).filter(
    (s) => s === "completed",
  ).length;
  const progressPercent =
    roadmap.nodes.length > 0
      ? Math.round((completedCount / roadmap.nodes.length) * 100)
      : 0;

  const getNodeStyle = (status: NodeStatus | undefined) => {
    switch (status) {
      case "completed":
        return "border-teal bg-teal/10 shadow-glow";
      case "learning":
        return "border-amber bg-amber/8 shadow-[0_0_20px_rgba(240,160,48,0.15)]";
      default:
        return "border-white/10 bg-surface hover:border-white/20";
    }
  };

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{roadmap.icon}</span>
          <div>
            <h2 className="font-display font-bold text-xl text-bright">
              {roadmap.title}
            </h2>
            <p className="text-sm text-dim">{roadmap.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Cloud sync indicator */}
          <div className="flex items-center gap-1.5" title={isAuthenticated ? 'Progress synced to cloud' : 'Sign in to save progress'}>
            {isAuthenticated ? (
              <Cloud size={14} className="text-teal" />
            ) : (
              <CloudOff size={14} className="text-dim" />
            )}
            <span className="text-xs text-dim">
              {isAuthenticated ? 'Synced' : 'Local only'}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono text-teal font-semibold">
              {progressPercent}%
            </div>
            <div className="text-xs text-dim">
              {completedCount}/{roadmap.nodes.length} done
            </div>
          </div>
          <div className="w-32 h-2 rounded-full bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal to-sky transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Roadmap Canvas */}
      <div
        ref={canvasRef}
        className="relative bg-abyss rounded-2xl border border-white/5 overflow-hidden select-none"
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-[var(--color-obsidian)]/80 backdrop-blur-sm border border-white/[0.08] text-[var(--color-silver)] hover:text-white hover:border-white/20 transition-all"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-[var(--color-obsidian)]/80 backdrop-blur-sm border border-white/[0.08] text-[var(--color-silver)] hover:text-white hover:border-white/20 transition-all"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 rounded-lg bg-[var(--color-obsidian)]/80 backdrop-blur-sm border border-white/[0.08] text-[var(--color-silver)] hover:text-white hover:border-white/20 transition-all"
            title="Reset view"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-md bg-[var(--color-obsidian)]/80 backdrop-blur-sm border border-white/[0.08] text-xs font-mono text-[var(--color-steel)]">
          {Math.round(zoom * 100)}%
        </div>

        <svg
          viewBox={`${minX} -30 ${viewWidth} ${viewHeight}`}
          className="w-full min-w-[600px] roadmap-canvas-bg"
          style={{
            height: `${Math.max(viewHeight + 40, 400)}px`,
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          {/* Edges */}
          {edgePaths.map(
            (edge) =>
              edge && (
                <path
                  key={edge.key}
                  d={edge.d}
                  fill="none"
                  stroke={
                    edge.fromStatus === "completed"
                      ? "#00e5a0"
                      : "rgba(255,255,255,0.08)"
                  }
                  strokeWidth="2"
                  strokeDasharray={
                    edge.fromStatus === "completed" ? "none" : "6 4"
                  }
                  className="transition-all duration-300"
                />
              ),
          )}

          {/* Nodes */}
          {layoutNodes.map((node, i) => {
            const status = nodeStatuses[node.id];
            const isCompleted = status === "completed";
            const isLearning = status === "learning";

            return (
              <g
                key={node.id}
                transform={`translate(${node.layoutX - 90}, ${node.layoutY - 24})`}
                className={clsx('cursor-pointer', layoutNodes.indexOf(node) === focusedNodeIndex && 'focused-node')}
                onClick={() => {
                  setSelectedNode(node);
                  setFocusedNodeIndex(layoutNodes.indexOf(node));
                }}
                role="button"
                tabIndex={0}
              >
                {/* Node Background */}
                <rect
                  width="180"
                  height="48"
                  rx="12"
                  fill={
                    isCompleted
                      ? "rgba(0,229,160,0.08)"
                      : isLearning
                        ? "rgba(240,160,48,0.06)"
                        : "#111118"
                  }
                  stroke={
                    isCompleted
                      ? "#00e5a0"
                      : isLearning
                        ? "#f0a030"
                        : "rgba(255,255,255,0.08)"
                  }
                  strokeWidth={layoutNodes.indexOf(node) === focusedNodeIndex ? "2.5" : "1.5"}
                  className="transition-all duration-300"
                />
                {/* Focus ring for keyboard nav */}
                {layoutNodes.indexOf(node) === focusedNodeIndex && (
                  <rect
                    width="184"
                    height="52"
                    x="-2"
                    y="-2"
                    rx="14"
                    fill="none"
                    stroke="#00e5a0"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                )}

                {/* Status Indicator */}
                <circle
                  cx="24"
                  cy="24"
                  r="8"
                  fill={
                    isCompleted
                      ? "#00e5a0"
                      : isLearning
                        ? "#f0a030"
                        : "rgba(255,255,255,0.06)"
                  }
                  stroke={
                    isCompleted
                      ? "#00e5a0"
                      : isLearning
                        ? "#f0a030"
                        : "rgba(255,255,255,0.12)"
                  }
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
                {isCompleted && (
                  <path
                    d="M20 24 L23 27 L28 21"
                    fill="none"
                    stroke="#050508"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Label */}
                <text
                  x="42"
                  y="20"
                  fill={isCompleted || isLearning ? "#f0f0fa" : "#e0e0ec"}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="'Cabinet Grotesk', system-ui, sans-serif"
                >
                  {node.label.length > 16
                    ? node.label.slice(0, 16) + "…"
                    : node.label}
                </text>

                {/* Difficulty */}
                <text
                  x="42"
                  y="36"
                  fill={
                    node.difficulty === "beginner"
                      ? "#00e5a0"
                      : node.difficulty === "intermediate"
                        ? "#f0a030"
                        : "#f04070"
                  }
                  fontSize="9"
                  fontWeight="500"
                  textTransform="uppercase"
                >
                  {node.difficulty}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-6 rounded-2xl bg-surface border border-white/8 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-bright">
                  {selectedNode.label}
                </h3>
                <p className="text-sm text-dim mt-1">
                  {selectedNode.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-dim hover:text-text transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <Badge
                variant={
                  selectedNode.difficulty === "beginner"
                    ? "teal"
                    : selectedNode.difficulty === "intermediate"
                      ? "amber"
                      : "rose"
                }
                size="sm"
              >
                {difficultyConfig[selectedNode.difficulty]?.label}
              </Badge>
              <Badge variant="default" size="sm">
                ~{Math.round(selectedNode.estimatedMinutes / 60)}h
              </Badge>
              <Badge variant="sky" size="sm">
                {selectedNode.category}
              </Badge>
            </div>

            {/* Resources */}
            {selectedNode.resources.length > 0 && (
              <div className="mb-5">
                <h4 className="text-xs uppercase tracking-wider text-subtle font-semibold mb-3">
                  Resources
                </h4>
                <div className="space-y-2">
                  {selectedNode.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-raised border border-white/5 hover:border-teal/20 transition-all duration-200 group"
                    >
                      <span className="text-xs uppercase font-mono text-dim">
                        {resource.type === "video" ? "🎬" : "📄"}{" "}
                        {resource.type}
                      </span>
                      <span className="text-sm text-text group-hover:text-teal transition-colors">
                        {resource.title}
                      </span>
                      <svg
                        className="ml-auto w-4 h-4 text-muted group-hover:text-teal transition-colors"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status Toggle */}
            <div className="flex gap-2">
              {(
                ["not-started", "learning", "completed"] as NodeStatus[]
              ).map((status) => {
                const isActive =
                  (nodeStatuses[selectedNode.id] || "not-started") ===
                  status;
                return (
                  <Button
                    key={status}
                    variant={isActive ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => {
                      updateNodeStatus(selectedNode.id, status);
                    }}
                  >
                    {status === "not-started"
                      ? "Not Started"
                      : status === "learning"
                        ? "📖 Learning"
                        : "✅ Done"}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/8 border border-white/12" />
          <span className="text-xs text-dim">Not started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber/20 border border-amber" />
          <span className="text-xs text-dim">Learning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal/20 border border-teal" />
          <span className="text-xs text-dim">Completed</span>
        </div>
        <div className="ml-auto text-xs text-muted">
          Click a node to see details • Scroll to zoom • Drag to pan • <kbd className="px-1 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono">↑↓</kbd> navigate
        </div>
      </div>
    </div>
  );
}
