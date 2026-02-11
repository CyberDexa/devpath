// ═══════════════════════════════════════
// SkillRoute — Shared Project Viewer
// Public view of a shared project solution
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  User,
  Calendar,
  Zap,
  Share2,
  ArrowLeft,
  Loader2,
  LinkIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { allProjects, difficultyConfig, categoryConfig } from '../../data/projects';

interface SharedViewProps {
  projectId: string;
}

export default function SharedProjectView({ projectId }: SharedViewProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [sharedBy, setSharedBy] = useState<string>('Anonymous');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const project = allProjects.find((p) => p.id === projectId);
  const diff = project ? difficultyConfig[project.difficulty] : null;
  const cat = project ? categoryConfig[project.category] : null;

  useEffect(() => {
    const loadShared = async () => {
      try {
        // Get the shared user ID from URL params
        const url = new URL(window.location.href);
        const sharedUserId = url.searchParams.get('shared');

        if (!sharedUserId) {
          setError('No shared project found. This link may be invalid.');
          setLoading(false);
          return;
        }

        // Fetch the submission
        const { data, error: fetchError } = await supabase
          .from('project_submissions')
          .select('*')
          .eq('user_id', sharedUserId)
          .eq('project_id', projectId)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError || !data) {
          setError('This shared project could not be found.');
          setLoading(false);
          return;
        }

        setSubmission(data);

        // Fetch user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', sharedUserId)
          .single();

        if (profile?.display_name) {
          setSharedBy(profile.display_name);
        }
      } catch (err) {
        setError('Failed to load shared project.');
      } finally {
        setLoading(false);
      }
    };

    loadShared();
  }, [projectId]);

  const copyCode = () => {
    if (submission?.code) {
      navigator.clipboard.writeText(submission.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-teal" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose/10 border border-rose/20 mb-6">
          <LinkIcon size={28} className="text-rose/60" />
        </div>
        <h2 className="text-xl font-display font-bold text-bright mb-3">
          {error || 'Project not found'}
        </h2>
        <p className="text-dim mb-6">
          The shared link may be invalid or the project has been removed.
        </p>
        <a
          href="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 transition-all"
        >
          <ArrowLeft size={14} /> Browse Projects
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-dim mb-6">
        <a href="/projects" className="hover:text-teal transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Projects
        </a>
        <span className="text-muted">/</span>
        <span className="text-text">{project.title}</span>
        <span className="text-muted">/</span>
        <span className="text-teal">Shared View</span>
      </div>

      {/* Shared badge */}
      <div className="flex items-center gap-3 px-4 py-3 bg-violet/5 border border-violet/15 rounded-xl mb-6">
        <Share2 size={16} className="text-violet" />
        <div className="flex-1">
          <span className="text-sm text-text">
            Shared by <strong className="text-violet">{sharedBy}</strong>
          </span>
          {submission && (
            <span className="text-xs text-muted ml-2">
              {new Date(submission.submitted_at).toLocaleDateString()}
            </span>
          )}
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/5 text-dim hover:text-text hover:bg-white/8 transition-all"
        >
          {copiedLink ? <Check size={12} className="text-teal" /> : <LinkIcon size={12} />}
          {copiedLink ? 'Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* Project info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {diff && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${diff.color}15`,
                color: diff.color,
              }}
            >
              {diff.icon} {diff.label}
            </span>
          )}
          {cat && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-dim">
              {cat.icon} {cat.label}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal">
            ⚡ {project.xpReward} XP
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-bright mb-2">{project.title}</h1>
        <p className="text-dim">{project.description}</p>
      </div>

      {/* Code viewer */}
      {submission && (
        <div className="bg-abyss border border-white/8 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-surface/50 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose/50" />
                <div className="w-3 h-3 rounded-full bg-amber/50" />
                <div className="w-3 h-3 rounded-full bg-teal/50" />
              </div>
              <span className="text-xs font-mono text-dim">
                solution.{submission.language === 'typescript' ? 'tsx' : submission.language === 'javascript' ? 'js' : submission.language === 'python' ? 'py' : submission.language}
              </span>
              <span className="text-[10px] text-muted uppercase tracking-wider">
                {submission.language}
              </span>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-dim hover:text-text bg-white/5 hover:bg-white/8 transition-all"
            >
              {copied ? <Check size={12} className="text-teal" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Code */}
          <div className="overflow-y-auto max-h-[500px]">
            <pre className="p-5 text-sm font-mono leading-relaxed">
              {submission.code.split('\n').map((line: string, i: number) => (
                <div key={i} className="flex">
                  <span className="w-8 text-right pr-4 text-muted/40 select-none text-xs leading-relaxed">
                    {i + 1}
                  </span>
                  <span className="text-dim whitespace-pre-wrap break-all">{line || ' '}</span>
                </div>
              ))}
            </pre>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-surface/30 border-t border-white/5 text-[11px] text-muted">
            <span>{submission.code.split('\n').length} lines • {submission.code.length} chars</span>
            <span>{submission.language}</span>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-dim text-sm mb-4">Want to try this challenge yourself?</p>
        <a
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-teal text-void hover:bg-teal-dim transition-all shadow-glow"
        >
          <Code2 size={16} />
          Open in Editor
        </a>
      </div>
    </div>
  );
}
