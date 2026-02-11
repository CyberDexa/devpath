// ═══════════════════════════════════════
// SkillRoute — Project Portfolio Component
// Showcases completed projects with code
// previews, stats, and sharing
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Code2,
  Star,
  Clock,
  Eye,
  Share2,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  Zap,
  Filter,
  Grid3X3,
  List,
  Loader2,
  FolderOpen,
  Lock,
  Globe,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getUserSubmissions } from '../../lib/data';
import { allProjects, difficultyConfig, categoryConfig, type ProjectChallenge } from '../../data/projects';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Submission {
  id: string;
  project_id: string;
  code: string;
  language: string;
  submitted_at: string;
  score?: number;
}

interface PortfolioProject {
  submission: Submission;
  project: ProjectChallenge;
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function Portfolio() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('Developer');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // ── Auth check ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserName(
          session.user.user_metadata?.display_name ||
            session.user.email?.split('@')[0] ||
            'Developer'
        );
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      if (session?.user) {
        setUserName(
          session.user.user_metadata?.display_name ||
            session.user.email?.split('@')[0] ||
            'Developer'
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load submissions ──
  useEffect(() => {
    if (!userId) return;

    const loadSubmissions = async () => {
      try {
        const submissions = await getUserSubmissions(userId);
        // Match submissions to projects
        const items: PortfolioProject[] = [];
        const seen = new Set<string>();

        for (const sub of submissions || []) {
          if (seen.has(sub.project_id)) continue; // latest only
          seen.add(sub.project_id);
          const project = allProjects.find((p) => p.id === sub.project_id);
          if (project) {
            items.push({ submission: sub, project });
          }
        }

        setPortfolioItems(items);
      } catch (err) {
        console.error('Failed to load submissions:', err);
      }
    };

    loadSubmissions();
  }, [userId]);

  // ── Compute stats ──
  const totalXP = portfolioItems.reduce((sum, item) => sum + item.project.xpReward, 0);
  const categories = new Set(portfolioItems.map((i) => i.project.category));
  const avgDifficulty =
    portfolioItems.length > 0
      ? portfolioItems.reduce(
          (sum, item) =>
            sum +
            { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[item.project.difficulty],
          0
        ) / portfolioItems.length
      : 0;

  // ── Filter ──
  const filtered =
    filterCategory === 'all'
      ? portfolioItems
      : portfolioItems.filter((i) => i.project.category === filterCategory);

  // ── Share ──
  const handleShare = (item: PortfolioProject) => {
    const url = `${window.location.origin}/projects/${item.project.id}?shared=${userId}`;
    setShareUrl(url);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Not signed in ──
  if (!loading && !userId) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet/10 border border-violet/20 mb-6">
          <Trophy size={28} className="text-violet" />
        </div>
        <h2 className="text-2xl font-display font-bold text-bright mb-3">
          Your Project Portfolio
        </h2>
        <p className="text-dim mb-8 max-w-md mx-auto">
          Sign in to view your completed projects, track progress, and share your work with others.
        </p>
        <a
          href="/login"
          className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold bg-teal text-void hover:bg-teal-dim transition-all shadow-glow"
        >
          Sign In to View Portfolio
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* ── Header Stats ── */}
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-bright mb-2">
          {userName}'s Portfolio
        </h1>
        <p className="text-dim mb-6">Completed projects and coding achievements</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Trophy,
              label: 'Projects Completed',
              value: portfolioItems.length,
              color: 'teal',
            },
            {
              icon: Zap,
              label: 'Total XP Earned',
              value: totalXP.toLocaleString(),
              color: 'amber',
            },
            {
              icon: Grid3X3,
              label: 'Categories',
              value: categories.size,
              color: 'sky',
            },
            {
              icon: TrendingUp,
              label: 'Avg. Difficulty',
              value:
                avgDifficulty === 0
                  ? '-'
                  : avgDifficulty < 1.5
                  ? 'Beginner'
                  : avgDifficulty < 2.5
                  ? 'Intermediate'
                  : avgDifficulty < 3.5
                  ? 'Advanced'
                  : 'Expert',
              color: 'violet',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-surface border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={`text-${stat.color}`} />
                <span className="text-xs text-muted">{stat.label}</span>
              </div>
              <div className="text-xl font-display font-bold text-bright">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-dim" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-raised border border-white/8 rounded-lg px-3 py-1.5 text-sm text-text"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-surface border border-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded ${
              view === 'grid' ? 'bg-teal/10 text-teal' : 'text-dim hover:text-text'
            } transition-all`}
          >
            <Grid3X3 size={14} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded ${
              view === 'list' ? 'bg-teal/10 text-teal' : 'text-dim hover:text-text'
            } transition-all`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <FolderOpen size={40} className="mx-auto text-muted mb-4" />
          <h3 className="text-lg font-display font-semibold text-text mb-2">
            {portfolioItems.length === 0
              ? 'No completed projects yet'
              : 'No projects in this category'}
          </h3>
          <p className="text-dim text-sm mb-6">
            {portfolioItems.length === 0
              ? 'Start coding challenges to build your portfolio!'
              : 'Try a different filter to see your projects.'}
          </p>
          {portfolioItems.length === 0 && (
            <a
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 transition-all"
            >
              Browse Projects <ChevronRight size={14} />
            </a>
          )}
        </div>
      )}

      {/* ── Grid View ── */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, i) => {
            const diff = difficultyConfig[item.project.difficulty];
            const cat = categoryConfig[item.project.category];
            const codePreview = item.submission.code.split('\n').slice(0, 6).join('\n');

            return (
              <motion.div
                key={item.submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-teal/15 transition-all"
              >
                {/* Code preview */}
                <div className="h-32 bg-abyss border-b border-white/5 px-4 py-3 overflow-hidden relative">
                  <pre className="text-[10px] leading-relaxed font-mono text-dim/60 whitespace-pre overflow-hidden">
                    {codePreview}
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-abyss pointer-events-none" />

                  {/* View button */}
                  <button
                    onClick={() => setSelectedProject(item)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/90 text-xs font-medium text-text border border-white/10">
                      <Eye size={12} /> View Code
                    </span>
                  </button>
                </div>

                {/* Project info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${diff.color}15`,
                        color: diff.color,
                      }}
                    >
                      {diff.icon} {diff.label}
                    </span>
                    <span className="text-[10px] text-muted">
                      {cat.icon} {cat.label}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-text text-sm mb-1.5 group-hover:text-teal transition-colors">
                    {item.project.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-muted mt-3">
                    <span className="flex items-center gap-1">
                      <Zap size={10} className="text-amber" />
                      {item.project.xpReward} XP
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(item.submission.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                    <a
                      href={`/projects/${item.project.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal/8 text-teal hover:bg-teal/12 transition-all"
                    >
                      <Code2 size={12} />
                      Open
                    </a>
                    <button
                      onClick={() => handleShare(item)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-dim hover:text-text hover:bg-white/8 transition-all"
                    >
                      <Share2 size={12} />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── List View ── */}
      {view === 'list' && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            const diff = difficultyConfig[item.project.difficulty];
            const cat = categoryConfig[item.project.category];

            return (
              <motion.div
                key={item.submission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 bg-surface border border-white/5 rounded-xl px-5 py-3 hover:border-teal/15 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-semibold text-text text-sm truncate group-hover:text-teal transition-colors">
                      {item.project.title}
                    </h3>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0"
                      style={{
                        backgroundColor: `${diff.color}15`,
                        color: diff.color,
                      }}
                    >
                      {diff.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>
                      {cat.icon} {cat.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={10} className="text-amber" />
                      {item.project.xpReward} XP
                    </span>
                    <span>
                      {new Date(item.submission.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedProject(item)}
                    className="p-1.5 rounded-lg text-dim hover:text-teal hover:bg-teal/5 transition-all"
                    title="View code"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleShare(item)}
                    className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all"
                    title="Share"
                  >
                    <Share2 size={14} />
                  </button>
                  <a
                    href={`/projects/${item.project.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal/8 text-teal hover:bg-teal/12 transition-all"
                  >
                    Open <ExternalLink size={10} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Code Preview Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[80vh] bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-surface/80">
                <div>
                  <h3 className="font-display font-bold text-bright">
                    {selectedProject.project.title}
                  </h3>
                  <span className="text-xs text-muted">
                    Submitted{' '}
                    {new Date(selectedProject.submission.submitted_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProject.submission.code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-dim hover:text-text bg-white/5 hover:bg-white/8 transition-all"
                  >
                    {copied ? <Check size={12} className="text-teal" /> : <Copy size={12} />}
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="p-1 rounded-lg text-dim hover:text-text hover:bg-white/5 transition-all"
                  >
                    <span className="sr-only">Close</span>✕
                  </button>
                </div>
              </div>

              {/* Modal body (code) */}
              <div className="flex-1 overflow-y-auto bg-abyss">
                <pre className="p-5 text-sm font-mono text-dim leading-relaxed whitespace-pre-wrap break-all">
                  <code>{selectedProject.submission.code}</code>
                </pre>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/5 bg-surface/80 text-xs text-muted">
                <span>
                  {selectedProject.submission.language} • {selectedProject.submission.code.split('\n').length} lines
                </span>
                <a
                  href={`/projects/${selectedProject.project.id}`}
                  className="flex items-center gap-1 text-teal hover:underline"
                >
                  Open in editor <ExternalLink size={10} />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Share toast ── */}
      <AnimatePresence>
        {copied && shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal/10 border border-teal/20 text-sm text-teal shadow-lg"
          >
            <Check size={14} />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
