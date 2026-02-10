import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  TrendingUp,
  Clock,
  Star,
  Users,
  BookOpen,
  Code,
  Server,
  Layers,
  Cloud,
  Brain,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import type { RoadmapData } from '../../data/types';

interface ExploreViewProps {
  roadmaps: RoadmapData[];
}

type SortOption = 'popular' | 'newest' | 'topics' | 'alphabetical';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

const categoryIcons: Record<string, React.ReactNode> = {
  frontend: <Code size={16} />,
  backend: <Server size={16} />,
  fullstack: <Layers size={16} />,
  devops: <Cloud size={16} />,
  ai: <Brain size={16} />,
};

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'popular', label: 'Most Popular', icon: <TrendingUp size={14} /> },
  { value: 'newest', label: 'Newest', icon: <Clock size={14} /> },
  { value: 'topics', label: 'Most Topics', icon: <BookOpen size={14} /> },
  { value: 'alphabetical', label: 'A → Z', icon: <Star size={14} /> },
];

const difficultyFilters: { value: DifficultyFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All Levels', color: 'text-[var(--color-silver)]' },
  { value: 'beginner', label: 'Beginner', color: 'text-[var(--color-accent-teal)]' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-[var(--color-amber)]' },
  { value: 'advanced', label: 'Advanced', color: 'text-[var(--color-rose)]' },
];

// Mock popular tags for search suggestions
const popularTags = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Docker',
  'AWS', 'GraphQL', 'Next.js', 'PostgreSQL', 'Kubernetes',
  'Machine Learning', 'System Design', 'REST APIs', 'CI/CD',
];

function SearchSuggestions({ query, onSelect }: { query: string; onSelect: (tag: string) => void }) {
  const filtered = popularTags.filter(tag =>
    tag.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  if (!query || filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] shadow-2xl overflow-hidden"
    >
      <div className="p-2">
        {filtered.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(tag)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-silver)] hover:text-white hover:bg-white/[0.04] transition-colors text-left"
          >
            <Search size={14} className="text-[var(--color-steel)] shrink-0" />
            <span>{tag}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function RoadmapExploreCard({ roadmap, index }: { roadmap: RoadmapData; index: number }) {
  const nodeCount = roadmap.nodes.length;
  const edgeCount = roadmap.edges.length;

  // Derive a mock difficulty and user count
  const difficulty = nodeCount > 12 ? 'Advanced' : nodeCount > 8 ? 'Intermediate' : 'Beginner';
  const diffColor = difficulty === 'Advanced'
    ? 'text-[var(--color-rose)] bg-[var(--color-rose)]/10 border-[var(--color-rose)]/20'
    : difficulty === 'Intermediate'
      ? 'text-[var(--color-amber)] bg-[var(--color-amber)]/10 border-[var(--color-amber)]/20'
      : 'text-[var(--color-accent-teal)] bg-[var(--color-accent-teal)]/10 border-[var(--color-accent-teal)]/20';

  const mockLearners = Math.floor(1000 + Math.random() * 15000);
  const mockRating = (4.2 + Math.random() * 0.7).toFixed(1);

  return (
    <motion.a
      href={`/roadmaps/${roadmap.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group block rounded-2xl border border-[var(--color-charcoal)] bg-[var(--color-obsidian)] hover:border-[var(--color-accent-teal)]/30 transition-all duration-300 overflow-hidden"
    >
      {/* Card header with gradient */}
      <div className="relative h-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${
              roadmap.id.includes('frontend') ? 'rgba(59,130,246,0.15), rgba(168,85,247,0.1)' :
              roadmap.id.includes('backend') ? 'rgba(34,197,94,0.15), rgba(6,182,212,0.1)' :
              roadmap.id.includes('devops') ? 'rgba(249,115,22,0.15), rgba(234,179,8,0.1)' :
              roadmap.id.includes('ai') ? 'rgba(168,85,247,0.15), rgba(236,72,153,0.1)' :
              'rgba(0,229,160,0.15), rgba(59,130,246,0.1)'
            })`,
          }}
        />
        <div className="absolute inset-0 dot-grid opacity-20" />

        {/* Floating icon */}
        <div className="absolute top-4 left-5">
          <span className="text-3xl">{roadmap.icon}</span>
        </div>

        {/* Stats overlay */}
        <div className="absolute bottom-3 right-4 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-[var(--color-silver)] bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
            <Users size={12} />
            {mockLearners.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-[var(--color-amber)] bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
            <Star size={12} />
            {mockRating}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-[var(--color-accent-teal)] transition-colors">
            {roadmap.title}
          </h3>
        </div>

        <p className="text-sm text-[var(--color-steel)] mb-4 line-clamp-2">
          {roadmap.description}
        </p>

        {/* Tags row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={clsx('text-xs px-2.5 py-1 rounded-full border', diffColor)}>
            {difficulty}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--color-charcoal)] text-[var(--color-steel)]">
            {nodeCount} topics
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full border border-[var(--color-charcoal)] text-[var(--color-steel)]">
            {edgeCount} connections
          </span>
        </div>

        {/* Progress bar (mock) */}
        <div className="flex items-center justify-between text-xs text-[var(--color-steel)]">
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} />
            Start learning
          </span>
          <span className="flex items-center gap-1 text-[var(--color-accent-teal)] font-medium group-hover:translate-x-0.5 transition-transform">
            Explore →
          </span>
        </div>
      </div>
    </motion.a>
  );
}

export function ExploreView({ roadmaps }: ExploreViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    roadmaps.forEach((r) => {
      // Derive category from id
      if (r.id.includes('frontend')) cats.add('frontend');
      else if (r.id.includes('backend')) cats.add('backend');
      else if (r.id.includes('fullstack')) cats.add('fullstack');
      else if (r.id.includes('devops')) cats.add('devops');
      else if (r.id.includes('ai')) cats.add('ai');
    });
    return Array.from(cats);
  }, [roadmaps]);

  const filtered = useMemo(() => {
    let result = [...roadmaps];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.nodes.some((n) => n.label.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((r) =>
        selectedCategories.some((cat) => r.id.includes(cat))
      );
    }

    // Sort
    switch (sortBy) {
      case 'topics':
        result.sort((a, b) => b.nodes.length - a.nodes.length);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      // popular/newest use default order
    }

    return result;
  }, [roadmaps, searchQuery, selectedCategories, sortBy]);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
    setDifficulty('all');
    setSortBy('popular');
  }, []);

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || difficulty !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">Explore Roadmaps</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] border border-[var(--color-accent-teal)]/20">
            {roadmaps.length} paths
          </span>
        </div>
        <p className="text-[var(--color-steel)] text-lg">
          Discover structured learning paths crafted by the community
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-steel)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search roadmaps, topics, or technologies..."
            className="w-full bg-[var(--color-obsidian)] border border-[var(--color-charcoal)] rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-[var(--color-steel)] text-base outline-none focus:border-[var(--color-accent-teal)] focus:shadow-[0_0_0_3px_rgba(0,229,160,0.1)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-steel)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && searchQuery && (
            <SearchSuggestions
              query={searchQuery}
              onSelect={(tag) => {
                setSearchQuery(tag);
                setShowSuggestions(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Popular tags */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Sparkles size={14} className="text-[var(--color-accent-teal)] shrink-0" />
        <span className="text-xs text-[var(--color-steel)] shrink-0">Trending:</span>
        {['React', 'Docker', 'TypeScript', 'AI/ML', 'System Design'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSearchQuery(tag)}
            className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-charcoal)] text-[var(--color-silver)] hover:border-[var(--color-accent-teal)]/30 hover:text-[var(--color-accent-teal)] transition-all"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[var(--color-charcoal)]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category pills */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                selectedCategories.includes(cat)
                  ? 'bg-[var(--color-accent-teal)]/10 text-[var(--color-accent-teal)] border-[var(--color-accent-teal)]/20'
                  : 'bg-transparent text-[var(--color-steel)] border-[var(--color-charcoal)] hover:border-[var(--color-steel)] hover:text-white'
              )}
            >
              {categoryIcons[cat]}
              <span className="capitalize">{cat}</span>
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-[var(--color-rose)] hover:bg-[var(--color-rose)]/5 transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-steel)]">Sort by:</span>
          <div className="flex items-center gap-1 bg-[var(--color-abyss)] rounded-lg border border-[var(--color-charcoal)] p-0.5">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  sortBy === opt.value
                    ? 'bg-white/[0.06] text-white'
                    : 'text-[var(--color-steel)] hover:text-white'
                )}
              >
                {opt.icon}
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[var(--color-steel)]">
          Showing <span className="text-white font-medium">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'roadmap' : 'roadmaps'}
          {searchQuery && (
            <span>
              {' '}for "<span className="text-[var(--color-accent-teal)]">{searchQuery}</span>"
            </span>
          )}
        </p>
      </div>

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((roadmap, index) => (
            <RoadmapExploreCard key={roadmap.id} roadmap={roadmap} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-charcoal)] flex items-center justify-center">
            <Search size={24} className="text-[var(--color-steel)]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No roadmaps found</h3>
          <p className="text-sm text-[var(--color-steel)] mb-4">
            Try adjusting your search or filters to find what you're looking for
          </p>
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--color-accent-teal)] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Coming soon section */}
      <div className="mt-16 text-center py-12 rounded-2xl border border-dashed border-[var(--color-charcoal)] bg-[var(--color-obsidian)]/50">
        <Sparkles size={24} className="text-[var(--color-accent-teal)] mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-white mb-2">More Roadmaps Coming Soon</h3>
        <p className="text-sm text-[var(--color-steel)] max-w-md mx-auto mb-5">
          We're building new learning paths for Rust, Go, Cybersecurity, Mobile Development, and more.
          Request a roadmap or contribute your own.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-accent-teal)] text-[var(--color-void)] hover:brightness-110 transition-all">
            Request a Roadmap
          </button>
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-charcoal)] text-[var(--color-silver)] hover:border-[var(--color-steel)] hover:text-white transition-all">
            Contribute
          </button>
        </div>
      </div>
    </div>
  );
}
