// ═══════════════════════════════════════
// DevPath — Code Battles Component
// 1v1 timed coding challenges with
// lobby, active battle, and results views
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Clock,
  Users,
  Trophy,
  Loader2,
  Play,
  Plus,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Timer,
  ArrowRight,
  Copy,
  Crown,
  Code2,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { runTests, type TestSuiteResult } from '../../lib/code-runner';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  challenge_title: string;
  challenge_description: string;
  starter_code: string;
  language: string;
  test_cases: { input: string; expected: string }[];
  difficulty: string;
  time_limit_seconds: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  winner_id: string | null;
  xp_reward: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  profiles?: {
    display_name: string;
    username: string;
    avatar_url: string | null;
    level: number;
  };
}

interface CodeBattlesProps {
  userId?: string;
}

type View = 'lobby' | 'battle' | 'results' | 'create';

// ═══════════════════════════════════════
// Sample battle challenges for creation
// ═══════════════════════════════════════

const BATTLE_TEMPLATES = [
  {
    title: 'Array Sum',
    description: 'Write a function that returns the sum of all numbers in an array.',
    starter_code: 'function arraySum(arr) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '[1, 2, 3, 4, 5]', expected: '15' },
      { input: '[-1, 0, 1]', expected: '0' },
      { input: '[100]', expected: '100' },
      { input: '[]', expected: '0' },
    ],
    difficulty: 'easy',
  },
  {
    title: 'String Reversal',
    description: 'Reverse a string without using .reverse() method.',
    starter_code: 'function reverseString(str) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '"hello"', expected: 'olleh' },
      { input: '"world"', expected: 'dlrow' },
      { input: '"a"', expected: 'a' },
      { input: '""', expected: '' },
    ],
    difficulty: 'easy',
  },
  {
    title: 'Find Duplicates',
    description: 'Return an array of elements that appear more than once in the input array.',
    starter_code: 'function findDuplicates(arr) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '[1, 2, 3, 2, 4, 3]', expected: '[2,3]' },
      { input: '[1, 1, 1]', expected: '[1]' },
      { input: '[1, 2, 3]', expected: '[]' },
    ],
    difficulty: 'medium',
  },
  {
    title: 'Matrix Transpose',
    description: 'Transpose a 2D matrix (swap rows and columns).',
    starter_code: 'function transpose(matrix) {\n  // Your code here\n}',
    language: 'javascript',
    test_cases: [
      { input: '[[1,2,3],[4,5,6]]', expected: '[[1,4],[2,5],[3,6]]' },
      { input: '[[1]]', expected: '[[1]]' },
    ],
    difficulty: 'medium',
  },
  {
    title: 'LRU Cache',
    description: 'Implement a Least Recently Used cache with get and put methods. Capacity = 2.',
    starter_code: 'class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n  get(key) {\n    // Your code here\n  }\n  put(key, value) {\n    // Your code here\n  }\n}',
    language: 'javascript',
    test_cases: [
      { input: 'LRU test', expected: 'class with get/put' },
    ],
    difficulty: 'hard',
  },
];

// ═══════════════════════════════════════
// Sample open battles (fallback)
// ═══════════════════════════════════════

const SAMPLE_BATTLES: Battle[] = [
  {
    id: '1', challenger_id: 'u1', opponent_id: null,
    challenge_title: 'Array Sum', challenge_description: 'Sum all numbers in an array.',
    starter_code: 'function arraySum(arr) {\n  // code\n}', language: 'javascript',
    test_cases: [{ input: '[1,2,3]', expected: '6' }],
    difficulty: 'easy', time_limit_seconds: 600,
    status: 'waiting', winner_id: null, xp_reward: 75,
    created_at: new Date(Date.now() - 300000).toISOString(),
    started_at: null, completed_at: null,
    profiles: { display_name: 'Alex Chen', username: 'alexchen', avatar_url: null, level: 12 },
  },
  {
    id: '2', challenger_id: 'u2', opponent_id: null,
    challenge_title: 'Find Duplicates', challenge_description: 'Find duplicate elements in an array.',
    starter_code: 'function findDuplicates(arr) {\n  // code\n}', language: 'javascript',
    test_cases: [{ input: '[1,2,2]', expected: '[2]' }],
    difficulty: 'medium', time_limit_seconds: 900,
    status: 'waiting', winner_id: null, xp_reward: 100,
    created_at: new Date(Date.now() - 600000).toISOString(),
    started_at: null, completed_at: null,
    profiles: { display_name: 'Sarah Kim', username: 'sarahkim', avatar_url: null, level: 8 },
  },
];

// ═══════════════════════════════════════
// Difficulty badge
// ═══════════════════════════════════════

function DiffBadge({ d }: { d: string }) {
  const c: Record<string, string> = {
    easy: 'bg-teal/10 text-teal border-teal/20',
    medium: 'bg-amber/10 text-amber border-amber/20',
    hard: 'bg-rose/10 text-rose border-rose/20',
  };
  return <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${c[d] || c.easy}`}>{d}</span>;
}

// ═══════════════════════════════════════
// Component
// ═══════════════════════════════════════

export default function CodeBattles({ userId }: CodeBattlesProps) {
  const [view, setView] = useState<View>('lobby');
  const [openBattles, setOpenBattles] = useState<Battle[]>([]);
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestSuiteResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Load open battles
  useEffect(() => {
    const loadBattles = async () => {
      try {
        const { getOpenBattles, getActiveBattles } = await import('../../lib/gamification');
        const open = await getOpenBattles();
        setOpenBattles(open as Battle[]);

        if (userId) {
          const active = await getActiveBattles(userId);
          if (active.length > 0) {
            setActiveBattle(active[0] as Battle);
            setCode(active[0].starter_code);
            setView('battle');
          }
        }
      } catch {
        setOpenBattles(SAMPLE_BATTLES);
      }
      setLoading(false);
    };
    loadBattles();
  }, [userId]);

  // Battle timer
  useEffect(() => {
    if (view === 'battle' && activeBattle && !submitted) {
      const startTime = activeBattle.started_at
        ? new Date(activeBattle.started_at).getTime()
        : Date.now();
      const endTime = startTime + activeBattle.time_limit_seconds * 1000;

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleSubmit();
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view, activeBattle, submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleJoinBattle = async (battle: Battle) => {
    try {
      const { joinBattle } = await import('../../lib/gamification');
      if (userId) {
        const updated = await joinBattle(battle.id, userId);
        setActiveBattle(updated as Battle);
      }
    } catch {
      // Fallback — simulate joining
      setActiveBattle({ ...battle, status: 'active', started_at: new Date().toISOString() });
    }
    setCode(battle.starter_code);
    setTimeLeft(battle.time_limit_seconds);
    setView('battle');
  };

  const handleRunTests = useCallback(async () => {
    if (!activeBattle) return;
    setIsRunning(true);
    setTestResult(null);
    try {
      const testCases = activeBattle.test_cases.map((tc, i) => ({
        name: `Test ${i + 1}`,
        input: tc.input,
        expectedOutput: tc.expected,
      }));
      const result = await runTests(code, activeBattle.language, testCases);
      setTestResult(result);
    } catch {
      setTestResult({ results: [], passed: 0, failed: 0, total: 0, totalTimeMs: 0 });
    }
    setIsRunning(false);
  }, [code, activeBattle]);

  const handleSubmit = async () => {
    if (!activeBattle || submitted) return;
    setSubmitted(true);
    clearInterval(timerRef.current);

    // Run final tests
    let finalResult = testResult;
    if (!finalResult) {
      try {
        const testCases = activeBattle.test_cases.map((tc, i) => ({
          name: `Test ${i + 1}`,
          input: tc.input,
          expectedOutput: tc.expected,
        }));
        finalResult = await runTests(code, activeBattle.language, testCases);
        setTestResult(finalResult);
      } catch { /* continue */ }
    }

    // Submit to backend
    try {
      const { submitBattleSolution } = await import('../../lib/gamification');
      if (userId && finalResult) {
        await submitBattleSolution(
          activeBattle.id, userId, code,
          finalResult.passed === finalResult.total,
          finalResult.passed, finalResult.total,
          finalResult.totalTimeMs
        );
      }
    } catch { /* offline */ }

    setView('results');
  };

  const handleCreateBattle = async () => {
    const template = BATTLE_TEMPLATES[selectedTemplate];
    try {
      const { createBattle } = await import('../../lib/gamification');
      if (userId) {
        const battle = await createBattle(
          userId, template.title, template.description,
          template.starter_code, template.language,
          template.test_cases, template.difficulty
        );
        setOpenBattles((prev) => [battle as Battle, ...prev]);
      }
    } catch { /* offline */ }
    setView('lobby');
  };

  // ═══ Loading ═══
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-dim">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading battles...
      </div>
    );
  }

  // ═══ Create Battle View ═══
  if (view === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-text">Create Battle</h2>
          <button onClick={() => setView('lobby')} className="text-sm text-dim hover:text-text transition-colors">
            ← Back to lobby
          </button>
        </div>

        <div className="grid gap-3">
          {BATTLE_TEMPLATES.map((t, i) => (
            <button
              key={i}
              onClick={() => setSelectedTemplate(i)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selectedTemplate === i
                  ? 'bg-teal/5 border-teal/30 ring-1 ring-teal/20'
                  : 'bg-surface/30 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-text">{t.title}</span>
                <DiffBadge d={t.difficulty} />
              </div>
              <p className="text-xs text-dim">{t.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted">
                <span>{t.test_cases.length} tests</span>
                <span>{t.language}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleCreateBattle}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 transition-all"
        >
          <Swords size={16} />
          Create & Wait for Opponent
        </button>
      </div>
    );
  }

  // ═══ Active Battle View ═══
  if (view === 'battle' && activeBattle) {
    const urgentTime = timeLeft < 120;
    return (
      <div className="space-y-4">
        {/* Battle Header */}
        <div className="flex items-center justify-between p-4 bg-surface/50 border border-white/8 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <Swords size={18} className="text-amber" />
              <h2 className="text-lg font-display font-bold text-text">{activeBattle.challenge_title}</h2>
              <DiffBadge d={activeBattle.difficulty} />
            </div>
            <p className="text-xs text-dim mt-1">{activeBattle.challenge_description}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            urgentTime ? 'bg-rose/10 border-rose/30 text-rose animate-pulse' : 'bg-abyss border-white/5 text-text'
          }`}>
            <Timer size={16} />
            <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Code Editor */}
        <div className="bg-surface/50 border border-white/8 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-surface/30 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-dim font-mono">{activeBattle.language}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 disabled:opacity-50 transition-all"
              >
                {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber/10 text-amber border border-amber/20 hover:bg-amber/15 disabled:opacity-50 transition-all"
              >
                <Zap size={12} />
                Submit
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-abyss p-4 font-mono text-sm text-text resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Test Results */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-surface/50 border border-white/8 rounded-xl space-y-2"
            >
              <div className="flex items-center gap-2">
                {testResult.passed === testResult.total ? (
                  <CheckCircle2 size={16} className="text-teal" />
                ) : (
                  <AlertTriangle size={16} className="text-amber" />
                )}
                <span className="text-sm font-semibold text-text">
                  {testResult.passed}/{testResult.total} tests passed
                </span>
                <span className="text-[10px] text-muted ml-auto">{testResult.totalTimeMs}ms</span>
              </div>
              {testResult.results.map((t, i) => (
                <div key={i} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${t.passed ? 'bg-teal/5 text-teal' : 'bg-rose/5 text-rose'}`}>
                  {t.passed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                  {t.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═══ Results View ═══
  if (view === 'results') {
    const won = testResult && testResult.passed === testResult.total;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface/50 border border-white/8 rounded-2xl overflow-hidden"
      >
        <div className={`p-8 text-center ${won ? 'bg-gradient-to-b from-teal/10 to-transparent' : 'bg-gradient-to-b from-amber/10 to-transparent'}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
            {won ? (
              <Crown size={56} className="mx-auto text-amber mb-4" />
            ) : (
              <Shield size={56} className="mx-auto text-dim mb-4" />
            )}
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-text mb-2">
            {won ? 'Victory!' : 'Battle Complete'}
          </h2>
          <p className="text-dim text-sm">
            {won
              ? `You passed all tests! +${activeBattle?.xp_reward || 100} XP`
              : `You passed ${testResult?.passed || 0}/${testResult?.total || 0} tests. +25 XP`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6 border-t border-white/5">
          <div className="text-center">
            <div className="text-xl font-display font-bold text-text">{testResult?.passed || 0}/{testResult?.total || 0}</div>
            <div className="text-xs text-dim mt-1">Tests Passed</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-display font-bold text-amber">+{won ? (activeBattle?.xp_reward || 100) : 25}</div>
            <div className="text-xs text-dim mt-1">XP Earned</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-display font-bold text-text">
              {formatTime(activeBattle ? activeBattle.time_limit_seconds - timeLeft : 0)}
            </div>
            <div className="text-xs text-dim mt-1">Time Taken</div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={() => {
              setView('lobby');
              setActiveBattle(null);
              setTestResult(null);
              setSubmitted(false);
              setCode('');
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 transition-all"
          >
            <ArrowRight size={16} />
            Back to Lobby
          </button>
        </div>
      </motion.div>
    );
  }

  // ═══ Lobby View ═══
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-text flex items-center gap-2">
            <Swords size={22} className="text-amber" />
            Code Battles
          </h2>
          <p className="text-sm text-dim mt-1">Compete 1v1 in timed coding challenges</p>
        </div>
        <button
          onClick={() => setView('create')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-teal/10 text-teal border border-teal/20 hover:bg-teal/15 transition-all"
        >
          <Plus size={14} />
          Create Battle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Battles Won', value: '0', icon: Trophy, color: 'text-amber' },
          { label: 'Win Rate', value: '—', icon: Zap, color: 'text-teal' },
          { label: 'Best Streak', value: '0', icon: Swords, color: 'text-violet' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface/30 border border-white/5 rounded-xl p-4 text-center">
            <stat.icon size={20} className={`mx-auto ${stat.color} mb-2`} />
            <div className="text-lg font-display font-bold text-text">{stat.value}</div>
            <div className="text-xs text-dim">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Open Battles */}
      <div>
        <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
          <Users size={14} className="text-dim" />
          Open Battles ({openBattles.length})
        </h3>

        {openBattles.length === 0 ? (
          <div className="bg-surface/30 border border-white/5 rounded-xl p-8 text-center">
            <Swords size={32} className="mx-auto text-muted mb-3" />
            <p className="text-sm text-dim">No open battles right now.</p>
            <p className="text-xs text-muted mt-1">Create one and wait for a challenger!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {openBattles.map((battle) => (
              <div
                key={battle.id}
                className="flex items-center gap-4 p-4 bg-surface/30 border border-white/5 rounded-xl hover:border-white/10 transition-all"
              >
                {/* Challenger avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber/20 to-rose/20 flex items-center justify-center text-sm font-bold text-amber flex-shrink-0">
                  {(battle.profiles?.display_name || '?')[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-text">{battle.challenge_title}</span>
                    <DiffBadge d={battle.difficulty} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted">
                    <span>by {battle.profiles?.display_name || 'Unknown'}</span>
                    <span>Lv.{battle.profiles?.level || 1}</span>
                    <span className="flex items-center gap-0.5"><Clock size={8} />{Math.floor(battle.time_limit_seconds / 60)}min</span>
                    <span className="flex items-center gap-0.5"><Star size={8} className="text-amber" />+{battle.xp_reward} XP</span>
                  </div>
                </div>

                <button
                  onClick={() => handleJoinBattle(battle)}
                  disabled={battle.challenger_id === userId}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber/10 text-amber border border-amber/20 hover:bg-amber/15 disabled:opacity-30 transition-all"
                >
                  <Swords size={12} />
                  {battle.challenger_id === userId ? 'Waiting...' : 'Accept'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
