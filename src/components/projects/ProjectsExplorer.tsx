import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Clock,
  Star,
  Users,
  Code2,
  Flame,
  Trophy,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  BookOpen,
  Play,
  Filter,
  Grid3X3,
  List,
  Terminal,
  Beaker,
  TestTubes,
} from "lucide-react";
import {
  allProjects,
  categoryConfig,
  difficultyConfig,
  type ProjectChallenge,
} from "../../data/projects";

type SortOption = "popular" | "newest" | "rating" | "difficulty-asc" | "difficulty-desc" | "hours-asc" | "hours-desc";
type ViewMode = "grid" | "list";

const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };

export default function ProjectsExplorer() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectChallenge | null>(null);

  const categories = [
    { key: "all", label: "All Projects", icon: "🎯" },
    ...Object.entries(categoryConfig).map(([key, val]) => ({
      key,
      label: val.label,
      icon: val.icon,
    })),
  ];

  const difficulties = [
    { key: "all", label: "All Levels" },
    ...Object.entries(difficultyConfig).map(([key, val]) => ({
      key,
      label: val.label,
    })),
  ];

  const filteredProjects = useMemo(() => {
    let projects = [...allProjects];

    // Search
    if (search) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== "all") {
      projects = projects.filter((p) => p.category === selectedCategory);
    }

    // Difficulty
    if (selectedDifficulty !== "all") {
      projects = projects.filter((p) => p.difficulty === selectedDifficulty);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        projects.sort((a, b) => b.completions - a.completions);
        break;
      case "newest":
        projects.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "rating":
        projects.sort((a, b) => b.rating - a.rating);
        break;
      case "difficulty-asc":
        projects.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case "difficulty-desc":
        projects.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
        break;
      case "hours-asc":
        projects.sort((a, b) => a.estimatedHours - b.estimatedHours);
        break;
      case "hours-desc":
        projects.sort((a, b) => b.estimatedHours - a.estimatedHours);
        break;
    }

    return projects;
  }, [search, selectedCategory, selectedDifficulty, sortBy]);

  const stats = useMemo(
    () => ({
      total: allProjects.length,
      totalCompletions: allProjects.reduce((s, p) => s + p.completions, 0),
      avgRating: (allProjects.reduce((s, p) => s + p.rating, 0) / allProjects.length).toFixed(1),
    }),
    []
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-teal/5 blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-teal text-sm font-medium mb-6"
            >
              <Code2 size={16} />
              {stats.total} Challenges Available
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold text-bright mb-4"
            >
              Build Real{" "}
              <span className="text-gradient">Projects</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-dim mb-8"
            >
              Hands-on coding challenges with built-in tests, AI code review, and a real IDE.
              Ship projects that prove your skills.
            </motion.p>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-8 text-sm"
            >
              <div className="flex items-center gap-2">
                <Users size={16} className="text-teal" />
                <span className="text-soft">{stats.totalCompletions.toLocaleString()} completions</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-amber" />
                <span className="text-soft">{stats.avgRating} avg rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TestTubes size={16} className="text-violet" />
                <span className="text-soft">Automated test suites</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-30 glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Search + Controls */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
              <input
                type="text"
                placeholder="Search projects, technologies, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-white/8 rounded-xl text-text placeholder:text-muted focus:border-teal/40 focus:ring-1 focus:ring-teal/20 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                showFilters
                  ? "bg-teal/10 border-teal/30 text-teal"
                  : "bg-surface border-white/8 text-dim hover:text-text hover:border-white/15"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
            </button>

            <div className="flex items-center bg-surface border border-white/8 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-teal/10 text-teal" : "text-dim hover:text-text"}`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${viewMode === "list" ? "bg-teal/10 text-teal" : "text-dim hover:text-text"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? "bg-teal/10 text-teal border border-teal/20"
                    : "text-dim hover:text-text hover:bg-white/5"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5 mt-4">
                  {/* Difficulty */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-dim">Difficulty:</span>
                    {difficulties.map((d) => (
                      <button
                        key={d.key}
                        onClick={() => setSelectedDifficulty(d.key)}
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          selectedDifficulty === d.key
                            ? "bg-teal/10 text-teal border border-teal/20"
                            : "text-dim hover:text-text hover:bg-white/5"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-sm text-dim">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-surface border border-white/8 rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-teal/40"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="newest">Newest First</option>
                      <option value="rating">Highest Rated</option>
                      <option value="difficulty-asc">Easiest First</option>
                      <option value="difficulty-desc">Hardest First</option>
                      <option value="hours-asc">Shortest First</option>
                      <option value="hours-desc">Longest First</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-dim">
            <span className="text-text font-medium">{filteredProjects.length}</span> projects found
          </p>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project, i) => (
              <ProjectListItem
                key={project.id}
                project={project}
                index={i}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-muted" />
            </div>
            <h3 className="text-lg font-display font-semibold text-text mb-2">No projects found</h3>
            <p className="text-dim">Try adjusting your search or filters</p>
          </div>
        )}
      </section>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════
// Project Card (Grid View)
// ═══════════════════════════════════════
function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: ProjectChallenge;
  index: number;
  onClick: () => void;
}) {
  const diff = difficultyConfig[project.difficulty];
  const cat = categoryConfig[project.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      onClick={onClick}
      className="group relative bg-surface border border-white/6 rounded-2xl overflow-hidden hover:border-teal/20 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-teal/5"
    >
      {/* Top Bar with Language Indicator */}
      <div className="h-1" style={{ backgroundColor: cat.color }} />

      <div className="p-5">
        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: diff.color + "18",
              color: diff.color,
            }}
          >
            {diff.icon} {diff.label}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-dim">
            {cat.icon} {cat.label}
          </span>
          {project.isNew && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet/15 text-violet">
              NEW
            </span>
          )}
          {project.featured && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber/15 text-amber flex items-center gap-1">
              <Sparkles size={10} />
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-bright text-lg mb-2 group-hover:text-teal transition-colors line-clamp-1">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-dim leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-xs bg-raised text-subtle border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-dim border-t border-white/5 pt-3">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {project.estimatedHours}h
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {project.completions.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} className="text-amber" />
            {project.rating}
          </span>
          <span className="flex items-center gap-1">
            <TestTubes size={12} />
            {project.testCases} tests
          </span>
          <span className="ml-auto flex items-center gap-1 text-teal font-medium">
            <Zap size={12} />
            {project.xpReward} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// Project List Item
// ═══════════════════════════════════════
function ProjectListItem({
  project,
  index,
  onClick,
}: {
  project: ProjectChallenge;
  index: number;
  onClick: () => void;
}) {
  const diff = difficultyConfig[project.difficulty];
  const cat = categoryConfig[project.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.2) }}
      onClick={onClick}
      className="group flex items-center gap-4 bg-surface border border-white/6 rounded-xl p-4 hover:border-teal/20 transition-all cursor-pointer"
    >
      {/* Color Indicator */}
      <div
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: cat.color }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-display font-semibold text-bright group-hover:text-teal transition-colors truncate">
            {project.title}
          </h3>
          {project.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet/15 text-violet flex-shrink-0">
              NEW
            </span>
          )}
          {project.featured && (
            <Sparkles size={14} className="text-amber flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-dim truncate">{project.description}</p>
      </div>

      {/* Tags (hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-raised text-subtle">
            {tag}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-dim flex-shrink-0">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: diff.color + "18", color: diff.color }}
        >
          {diff.label}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {project.estimatedHours}h
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {project.completions.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 text-teal font-medium">
          <Zap size={12} />
          {project.xpReward} XP
        </span>
      </div>

      <ArrowRight size={16} className="text-muted group-hover:text-teal transition-colors flex-shrink-0" />
    </motion.div>
  );
}

// ═══════════════════════════════════════
// Project Detail Modal
// ═══════════════════════════════════════
function ProjectDetailModal({
  project,
  onClose,
}: {
  project: ProjectChallenge;
  onClose: () => void;
}) {
  const diff = difficultyConfig[project.difficulty];
  const cat = categoryConfig[project.category];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        className="fixed inset-4 md:inset-x-auto md:inset-y-8 md:max-w-4xl md:mx-auto z-50 bg-surface border border-white/8 rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/5">
          <div className="h-1 absolute top-0 inset-x-0" style={{ backgroundColor: cat.color }} />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-raised flex items-center justify-center text-dim hover:text-text transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: diff.color + "18", color: diff.color }}
            >
              {diff.icon} {diff.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-dim">
              {cat.icon} {cat.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal flex items-center gap-1">
              <Zap size={10} />
              {project.xpReward} XP
            </span>
          </div>

          <h2 className="text-2xl font-display font-bold text-bright mb-2">
            {project.title}
          </h2>
          <p className="text-dim leading-relaxed">{project.description}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Clock, label: "Estimated Time", value: `${project.estimatedHours} hours` },
              { icon: Users, label: "Completions", value: project.completions.toLocaleString() },
              { icon: Star, label: "Rating", value: `${project.rating} / 5.0` },
              { icon: TestTubes, label: "Test Cases", value: `${project.testCases} tests` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-raised/50 rounded-xl p-3 border border-white/5"
              >
                <stat.icon size={16} className="text-teal mb-1.5" />
                <p className="text-xs text-dim">{stat.label}</p>
                <p className="text-sm font-semibold text-text">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
              <BookOpen size={14} className="text-teal" />
              Skills You'll Practice
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-lg text-sm bg-teal/8 text-teal border border-teal/15"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
              <Code2 size={14} className="text-violet" />
              Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg text-sm bg-violet/8 text-violet border border-violet/15"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Starter Code Preview */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
              <Terminal size={14} className="text-amber" />
              Starter Code
            </h4>
            <div className="bg-abyss rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-white/2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose/60" />
                  <div className="w-3 h-3 rounded-full bg-amber/60" />
                  <div className="w-3 h-3 rounded-full bg-teal/60" />
                </div>
                <span className="text-xs text-muted ml-2 font-mono">
                  starter.{project.language === "typescript" ? "tsx" : project.language === "javascript" ? "js" : project.language === "python" ? "py" : project.language}
                </span>
              </div>
              <pre className="p-4 text-sm font-mono text-dim overflow-x-auto leading-relaxed">
                <code>{project.starterCode}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-dim bg-raised border border-white/8 hover:text-text hover:border-white/15 transition-all"
          >
            Close
          </button>
          <a
            href={`/projects/${project.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal text-void hover:bg-teal-dim transition-colors"
          >
            <Play size={16} />
            Start Challenge
          </a>
        </div>
      </motion.div>
    </>
  );
}
