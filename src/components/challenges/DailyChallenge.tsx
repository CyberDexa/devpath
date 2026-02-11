// ═══════════════════════════════════════
// SkillRoute — Daily Challenge Component
// Today's coding challenge with timer,
// hints, live editor, and submission
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Flame,
  Calendar,
  Lock,
  Sparkles,
  Play,
  Loader2,
  ArrowRight,
  Star,
  Code2,
} from 'lucide-react';
import { runCode, runTests, type TestSuiteResult } from '../../lib/code-runner';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  starter_code: string;
  language: string;
  test_cases: { input: string; expected: string }[];
  hints: string[];
  xp_reward: number;
  active_date: string;
}

interface DailyChallengeProps {
  userId?: string;
}

// ═══════════════════════════════════════
// Sample challenges (fallback when Supabase unavailable)
// ═══════════════════════════════════════

const SAMPLE_CHALLENGES: Challenge[] = [
  {
    id: 'sample-1',
    title: 'FizzBuzz',
    description: 'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, or the number as a string.',
    difficulty: 'easy',
    category: 'algorithms',
    starter_code: 'function fizzBuzz(n) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '3', expected: 'Fizz' },
      { input: '5', expected: 'Buzz' },
      { input: '15', expected: 'FizzBuzz' },
      { input: '7', expected: '7' },
    ],
    hints: ['Check divisibility with modulo (%)', 'Check 15 first (divisible by both 3 and 5)'],
    xp_reward: 50,
    active_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sample-2',
    title: 'Palindrome Check',
    description: 'Write a function that checks if a string is a palindrome. Ignore case and non-alphanumeric characters.',
    difficulty: 'easy',
    category: 'strings',
    starter_code: 'function isPalindrome(str) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '"racecar"', expected: 'true' },
      { input: '"hello"', expected: 'false' },
      { input: '"A man a plan a canal Panama"', expected: 'true' },
    ],
    hints: ['Convert to lowercase', 'Remove non-alphanumeric with regex', 'Compare to reversed string'],
    xp_reward: 50,
    active_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sample-3',
    title: 'Two Sum',
    description: 'Given an array of numbers and a target, return the indices of two numbers that add up to the target.',
    difficulty: 'medium',
    category: 'algorithms',
    starter_code: 'function twoSum(nums, target) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' },
    ],
    hints: ['Use a hash map for O(n) time', 'Store complement = target - current'],
    xp_reward: 75,
    active_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sample-4',
    title: 'Flatten Array',
    description: 'Write a function that deeply flattens a nested array. Do not use Array.flat().',
    difficulty: 'medium',
    category: 'algorithms',
    starter_code: 'function flatten(arr) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '[[1,2],[3,[4,5]]]', expected: '[1,2,3,4,5]' },
      { input: '[1,[2,[3,[4]]]]', expected: '[1,2,3,4]' },
    ],
    hints: ['Use recursion', 'Check Array.isArray()', 'Spread into new array'],
    xp_reward: 75,
    active_date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'sample-5',
    title: 'Debounce Function',
    description: 'Implement a debounce function that delays invoking a callback until after a specified wait time.',
    difficulty: 'hard',
    category: 'javascript',
    starter_code: 'function debounce(fn, delay) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [{ input: 'debounce test', expected: 'function returned' }],
    hints: ['Use setTimeout and clearTimeout', 'Return a new function', 'Store timer in closure'],
    xp_reward: 100,
    active_date: new Date().toISOString().split('T')[0],
  },
];

// Pick a pseudo-random challenge based on the date
function getTodaySampleChallenge(): Challenge {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return SAMPLE_CHALLENGES[dayOfYear % SAMPLE_CHALLENGES.length];
}

// ═══════════════════════════════════════
// Difficulty badge
// ═══════════════════════════════════════

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: 'bg-teal/10 text-teal border-teal/20',
    medium: 'bg-amber/10 text-amber border-amber/20',
    hard: 'bg-rose/10 text-rose border-rose/20',
  };
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${colors[difficulty as keyof typeof colors] || colors.easy}`}>
      {difficulty}
    </span>
  );
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function DailyChallenge({ userId }: DailyChallengeProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestSuiteResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [challengeStreak, setChallengeStreak] = useState(3); // Sample
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load today's challenge
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        // Try Supabase first
        const { getTodayChallenge } = await import('../../lib/gamification');
        const data = await getTodayChallenge();
        if (data) {
          setChallenge(data as Challenge);
          setCode(data.starter_code);
        } else {
          throw new Error('No challenge found');
        }
      } catch {
        // Fallback to sample
        const sample = getTodaySampleChallenge();
        setChallenge(sample);
        setCode(sample.starter_code);
      }
      setLoading(false);
    };
    loadChallenge();
  }, []);

  // Timer
  useEffect(() => {
    if (!completed && challenge) {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [completed, challenge]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Run tests
  const handleRunTests = useCallback(async () => {
    if (!challenge) return;
    setIsRunning(true);
    setTestResult(null);

    try {
      const testCases = challenge.test_cases.map((tc, i) => ({
        name: `Test ${i + 1}: ${tc.input} → ${tc.expected}`,
        input: tc.input,
        expectedOutput: tc.expected,
      }));

      const result = await runTests(code, challenge.language, testCases);
      setTestResult(result);

      if (result.passed === result.total && result.total > 0) {
        setCompleted(true);
        clearInterval(timerRef.current);

        // Try to submit to Supabase
        try {
          const { submitChallengeAttempt, recordDailyActivity, checkAndAwardBadges } = await import('../../lib/gamification');
          if (userId && challenge.id) {
            await submitChallengeAttempt(userId, challenge.id, code, challenge.language, true, elapsed * 1000);
            await recordDailyActivity(userId, challenge.xp_reward);
            await checkAndAwardBadges(userId);
          }
        } catch { /* offline fallback */ }
      }
    } catch {
      setTestResult({ results: [], passed: 0, failed: 0, total: 0, totalTimeMs: 0 });
    } finally {
      setIsRunning(false);
    }
  }, [code, challenge, userId, elapsed]);

  const revealNextHint = () => {
    if (challenge && hintsRevealed < challenge.hints.length) {
      setHintsRevealed((prev) => prev + 1);
      setShowHints(true);
    }
  };

  // ═══ Loading State ═══
  if (loading) {
    return (
      <div className="bg-surface/50 border border-white/8 rounded-2xl p-8 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-4" />
        <div className="h-4 w-full bg-white/5 rounded mb-2" />
        <div className="h-4 w-2/3 bg-white/5 rounded mb-8" />
        <div className="h-64 bg-white/5 rounded" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-surface/50 border border-white/8 rounded-2xl p-12 text-center">
        <Calendar size={48} className="mx-auto text-dim mb-4" />
        <h3 className="text-xl font-display font-bold text-text mb-2">No Challenge Today</h3>
        <p className="text-dim">Check back tomorrow for a new daily coding challenge!</p>
      </div>
    );
  }

  // ═══ Completed State ═══
  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface/50 border border-teal/20 rounded-2xl overflow-hidden"
      >
        {/* Success header */}
        <div className="relative bg-gradient-to-r from-teal/10 via-teal/5 to-transparent p-8 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,229,160,0.08),transparent_70%)]" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="relative"
          >
            <CheckCircle2 size={56} className="mx-auto text-teal mb-4" />
            <h2 className="text-2xl font-display font-bold text-teal mb-2">Challenge Complete!</h2>
            <p className="text-dim text-sm">You solved "{challenge.title}" in {formatTime(elapsed)}</p>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 border-t border-white/5">
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-teal">{formatTime(elapsed)}</div>
            <div className="text-xs text-dim mt-1">Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-amber">+{challenge.xp_reward}</div>
            <div className="text-xs text-dim mt-1">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-display font-bold text-violet">
              {testResult?.total || 0}/{testResult?.total || 0}
            </div>
            <div className="text-xs text-dim mt-1">Tests Passed</div>
          </div>
        </div>

        {/* Streak */}
        <div className="px-6 pb-6">
          <div className="bg-abyss rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center">
              <Flame size={24} className="text-amber" />
            </div>
            <div>
              <div className="text-sm font-semibold text-text">
                {challengeStreak + 1}-day challenge streak! 🔥
              </div>
              <div className="text-xs text-dim mt-0.5">Keep it going tomorrow for bonus XP</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ═══ Main Challenge View ═══
  return (
    <div className="bg-surface/50 border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center">
            <Zap size={20} className="text-amber" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-display font-bold text-text">{challenge.title}</h2>
              <DifficultyBadge difficulty={challenge.difficulty} />
            </div>
            <div className="flex items-center gap-3 text-xs text-dim mt-0.5">
              <span className="flex items-center gap-1"><Code2 size={10} /> {challenge.category}</span>
              <span className="flex items-center gap-1"><Star size={10} className="text-amber" /> +{challenge.xp_reward} XP</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Challenge streak */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber/5 rounded-lg border border-amber/10">
            <Flame size={14} className="text-amber" />
            <span className="text-xs font-semibold text-amber">{challengeStreak}</span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-abyss rounded-lg border border-white/5">
            <Clock size={14} className="text-dim" />
            <span className="text-sm font-mono text-text">{formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-sm text-dim leading-relaxed">{challenge.description}</p>
      </div>

      {/* Code Editor (textarea fallback — Monaco is used in /playground) */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-56 bg-abyss border border-white/8 rounded-xl p-4 font-mono text-sm text-text resize-none focus:outline-none focus:ring-1 focus:ring-teal/30 focus:border-teal/30 placeholder:text-muted"
            spellCheck={false}
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-muted">
            {challenge.language} • {code.split('\n').length} lines
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 disabled:opacity-50 transition-all"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Run Tests
          </button>

          <button
            onClick={revealNextHint}
            disabled={hintsRevealed >= challenge.hints.length}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber/10 text-amber border border-amber/20 hover:bg-amber/15 disabled:opacity-50 transition-all"
          >
            <Lightbulb size={14} />
            Hint ({hintsRevealed}/{challenge.hints.length})
          </button>
        </div>

        <div className="text-xs text-dim">
          {challenge.test_cases.length} test{challenge.test_cases.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Hints */}
      <AnimatePresence>
        {showHints && hintsRevealed > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/5"
          >
            <div className="px-6 py-3 bg-amber/5 space-y-2">
              {challenge.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Lightbulb size={14} className="text-amber mt-0.5 flex-shrink-0" />
                  <span className="text-amber/80">{hint}</span>
                </div>
              ))}
              {hintsRevealed < challenge.hints.length && (
                <div className="flex items-center gap-2 text-xs text-muted">
                  <Lock size={10} />
                  {challenge.hints.length - hintsRevealed} more hint{challenge.hints.length - hintsRevealed !== 1 ? 's' : ''} available
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results */}
      <AnimatePresence>
        {testResult && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 bg-abyss/50">
              {/* Summary */}
              <div className="flex items-center gap-3 mb-3">
                {testResult.passed === testResult.total && testResult.total > 0 ? (
                  <span className="flex items-center gap-1.5 text-teal font-semibold text-sm">
                    <CheckCircle2 size={16} />
                    All tests passed!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber font-semibold text-sm">
                    <XCircle size={16} />
                    {testResult.passed}/{testResult.total} passed
                  </span>
                )}
                <span className="text-[10px] text-muted ml-auto">{testResult.totalTimeMs}ms</span>
              </div>

              {/* Individual tests */}
              <div className="space-y-1.5">
                {testResult.results.map((test, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      test.passed ? 'bg-teal/5 text-teal' : 'bg-rose/5 text-rose'
                    }`}
                  >
                    {test.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span className="flex-1">{test.name}</span>
                    {!test.passed && test.actual && (
                      <span className="text-muted">Got: {test.actual}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
