// ═══════════════════════════════════════
// SkillRoute — Project Editor with Submission
// Wraps MonacoIDE with Supabase persistence
// ═══════════════════════════════════════

import { useState, useEffect } from 'react';
import MonacoIDE from '../ide/MonacoIDE';
import { supabase } from '../../lib/supabase';
import { submitProject, logActivity } from '../../lib/data';

interface ProjectEditorProps {
  projectId: string;
  initialCode?: string;
  language?: string;
  fileName?: string;
  xpReward?: number;
}

export default function ProjectEditor({
  projectId,
  initialCode = '// Start coding here\n',
  language = 'javascript',
  fileName = 'solution.js',
  xpReward = 100,
}: ProjectEditorProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (code: string) => {
    if (!userId) {
      setSubmitMessage('Sign in to submit your solution and earn XP.');
      setTimeout(() => setSubmitMessage(''), 4000);
      return;
    }

    setSubmitting(true);
    try {
      await submitProject(userId, projectId, code, language);

      // Log the activity
      await logActivity(userId, 'project_submission', `Submitted solution for ${projectId}`, {
        project_id: projectId,
        xp: xpReward,
      }).catch(() => {});

      setSubmitted(true);
      setSubmitMessage(`Solution submitted! +${xpReward} XP earned 🎉`);
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (err: any) {
      setSubmitMessage(err?.message || 'Failed to submit. Please try again.');
      setTimeout(() => setSubmitMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <MonacoIDE
        projectId={projectId}
        initialCode={initialCode}
        language={language}
        fileName={fileName}
        onSubmit={handleSubmit}
      />

      {/* Submission toast */}
      {submitMessage && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg border transition-all duration-300 ${
            submitted
              ? 'bg-[var(--color-accent-teal)]/10 border-[var(--color-accent-teal)]/30 text-[var(--color-accent-teal)]'
              : 'bg-[var(--color-accent-amber)]/10 border-[var(--color-accent-amber)]/30 text-[var(--color-accent-amber)]'
          }`}
        >
          {submitMessage}
        </div>
      )}
    </div>
  );
}
