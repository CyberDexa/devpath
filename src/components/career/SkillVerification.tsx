// ═══════════════════════════════════════
// SkillRoute — Skill Verification Component
// Proctored challenges to verify skills
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  Loader2,
  Code2,
  ListChecks,
  MessageSquare,
  AlertTriangle,
  Trophy,
} from 'lucide-react';
import {
  getVerificationChallenge,
  startVerification,
  submitVerification,
  getUserVerifications,
  type VerificationChallenge,
  type VerificationQuestion,
} from '../../lib/career';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

type VerificationView = 'select' | 'challenge' | 'results' | 'history';

interface Props {
  userId: string;
}

// ═══════════════════════════════════════
// Roadmap Options
// ═══════════════════════════════════════

const ROADMAPS = [
  { id: 'frontend', name: 'Frontend Development', icon: '🎨', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' },
  { id: 'backend', name: 'Backend Development', icon: '⚙️', color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' },
];

const DIFFICULTIES = [
  { id: 'beginner', name: 'Beginner', desc: 'Fundamentals & basics', time: '20 min', color: 'text-green-400' },
  { id: 'intermediate', name: 'Intermediate', desc: 'Applied knowledge', time: '30 min', color: 'text-yellow-400' },
  { id: 'advanced', name: 'Advanced', desc: 'Expert-level mastery', time: '40 min', color: 'text-red-400' },
];

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function SkillVerification({ userId }: Props) {
  const [view, setView] = useState<VerificationView>('select');
  const [selectedRoadmap, setSelectedRoadmap] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [challenge, setChallenge] = useState<VerificationChallenge | null>(null);
  const [verificationId, setVerificationId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Load history
  useEffect(() => {
    loadHistory();
  }, [userId]);

  async function loadHistory() {
    const data = await getUserVerifications(userId);
    setHistory(data);
  }

  // Timer
  useEffect(() => {
    if (view !== 'challenge' || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [view, timeLeft > 0]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Start verification
  async function handleStart() {
    if (!selectedRoadmap || !selectedDifficulty) return;
    setLoading(true);

    try {
      const c = await getVerificationChallenge(selectedRoadmap, selectedDifficulty);
      if (!c) throw new Error('Challenge not available');

      const v = await startVerification(userId, selectedRoadmap, selectedRoadmap, selectedDifficulty);
      setChallenge(c);
      setVerificationId(v.id);
      setTimeLeft(c.timeLimit);
      setCurrentQuestion(0);
      setResponses({});
      setView('challenge');
    } catch (err) {
      console.error('Failed to start verification:', err);
    } finally {
      setLoading(false);
    }
  }

  // Submit
  async function handleSubmit() {
    clearInterval(timerRef.current);
    setLoading(true);

    try {
      const result = await submitVerification(verificationId, userId, responses);
      setResults(result);
      setView('results');
      loadHistory();
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setLoading(false);
    }
  }

  const updateResponse = useCallback((questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // ─── Selection View ───
  const renderSelection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-teal" />
            Skill Verification
          </h2>
          <p className="text-gray-400 mt-1">Prove your skills with proctored challenges and earn verified certificates</p>
        </div>
        <button
          onClick={() => setView('history')}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm"
        >
          View History ({history.length})
        </button>
      </div>

      {/* Select Roadmap */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Choose a Skill Area</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {ROADMAPS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoadmap(r.id)}
              className={`p-5 rounded-xl border text-left transition-all ${
                selectedRoadmap === r.id
                  ? `bg-gradient-to-br ${r.color} ring-2 ring-teal/50`
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <span className="text-2xl">{r.icon}</span>
              <p className="text-white font-semibold mt-2">{r.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Select Difficulty */}
      <AnimatePresence>
        {selectedRoadmap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Select Difficulty</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDifficulty(d.id)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    selectedDifficulty === d.id
                      ? 'bg-teal/10 border-teal/30 ring-2 ring-teal/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                  }`}
                >
                  <p className={`font-semibold ${d.color}`}>{d.name}</p>
                  <p className="text-gray-400 text-sm mt-1">{d.desc}</p>
                  <p className="text-gray-500 text-xs mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {d.time}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Button */}
      <AnimatePresence>
        {selectedRoadmap && selectedDifficulty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-8 py-3.5 bg-teal text-[#0a0a0f] font-bold rounded-xl hover:bg-teal/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              Begin Verification
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─── Challenge View ───
  const renderChallenge = () => {
    if (!challenge) return null;
    const q = challenge.questions[currentQuestion];
    const total = challenge.questions.length;
    const isLast = currentQuestion === total - 1;
    const isFirst = currentQuestion === 0;
    const isTimeLow = timeLeft < 60;

    return (
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
          <div>
            <h3 className="text-white font-semibold">{challenge.title}</h3>
            <p className="text-gray-400 text-sm">
              Question {currentQuestion + 1} of {total}
            </p>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${isTimeLow ? 'text-red-400 animate-pulse' : 'text-teal'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-teal rounded-full"
            animate={{ width: `${((currentQuestion + 1) / total) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              {q.type === 'multiple_choice' && <><ListChecks className="w-3.5 h-3.5" /> Multiple Choice</>}
              {q.type === 'code_challenge' && <><Code2 className="w-3.5 h-3.5" /> Code Challenge</>}
              {q.type === 'short_answer' && <><MessageSquare className="w-3.5 h-3.5" /> Short Answer</>}
              <span className="ml-auto text-teal">{q.points} pts</span>
            </div>

            <h4 className="text-white text-lg font-medium mb-5">{q.question}</h4>

            {/* Multiple Choice */}
            {q.type === 'multiple_choice' && q.options && (
              <div className="space-y-3">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateResponse(q.id, opt)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      responses[q.id] === opt
                        ? 'bg-teal/10 border-teal/40 text-white'
                        : 'bg-white/3 border-white/10 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Code Challenge */}
            {q.type === 'code_challenge' && (
              <div>
                <textarea
                  value={responses[q.id] || q.starterCode || ''}
                  onChange={(e) => updateResponse(q.id, e.target.value)}
                  className="w-full h-48 bg-[#0a0a0f] border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50"
                  spellCheck={false}
                />
                {q.testCases && q.testCases.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500">
                    <p className="font-semibold mb-1">Test Cases:</p>
                    {q.testCases.map((tc, i) => (
                      <p key={i} className="font-mono">
                        Input: {tc.input} → Expected: {tc.expected}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Short Answer */}
            {q.type === 'short_answer' && (
              <textarea
                value={responses[q.id] || ''}
                onChange={(e) => updateResponse(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full h-28 bg-[#0a0a0f] border border-white/10 rounded-lg p-4 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion((c) => Math.max(0, c - 1))}
            disabled={isFirst}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Question dots */}
          <div className="flex gap-1.5">
            {challenge.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentQuestion
                    ? 'bg-teal'
                    : responses[challenge.questions[i].id]
                    ? 'bg-teal/40'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Submit
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion((c) => Math.min(total - 1, c + 1))}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // ─── Results View ───
  const renderResults = () => {
    if (!results) return null;
    const passed = results.passed;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className={`text-center p-10 rounded-2xl border ${
          passed
            ? 'bg-gradient-to-br from-teal/10 to-emerald-500/10 border-teal/30'
            : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
        }`}>
          {passed ? (
            <Trophy className="w-16 h-16 text-teal mx-auto mb-4" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          )}
          <h2 className="text-3xl font-bold text-white mb-2">
            {passed ? 'Verification Passed!' : 'Not Quite Yet'}
          </h2>
          <p className="text-gray-400">
            {passed
              ? 'Congratulations! Your certificate has been issued.'
              : 'Keep practicing and try again when you\'re ready.'}
          </p>
          <div className="mt-6 inline-flex items-center gap-3">
            <span className={`text-4xl font-bold font-mono ${passed ? 'text-teal' : 'text-red-400'}`}>
              {Math.round(results.percentScore)}%
            </span>
            <span className="text-gray-500 text-sm">(70% to pass)</span>
          </div>
        </div>

        {/* Question Breakdown */}
        {results.graded && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-semibold">Question Breakdown</h3>
            {Object.entries(results.graded).map(([qId, grade]: [string, any]) => (
              <div key={qId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  {grade.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-gray-300 text-sm">{qId}</span>
                </div>
                <span className={`text-sm font-mono ${grade.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {grade.score}/{grade.maxScore}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={() => { setView('select'); setResults(null); }}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
          >
            Try Again
          </button>
          {passed && (
            <a
              href="/certificates"
              className="px-6 py-3 bg-teal text-[#0a0a0f] font-bold rounded-xl hover:bg-teal/90 transition-colors flex items-center gap-2"
            >
              <Award className="w-5 h-5" /> View Certificate
            </a>
          )}
        </div>
      </motion.div>
    );
  };

  // ─── History View ───
  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-teal" />
          Verification History
        </h2>
        <button
          onClick={() => setView('select')}
          className="px-4 py-2 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors text-sm"
        >
          New Verification
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No verifications yet. Take your first challenge!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((v) => (
            <div key={v.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-medium capitalize">
                  {v.roadmap_id} — {v.difficulty}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {new Date(v.created_at).toLocaleDateString()} · {v.time_taken_seconds ? `${Math.floor(v.time_taken_seconds / 60)}m` : '—'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold font-mono ${
                  v.status === 'passed' ? 'text-green-400' : v.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {v.score != null ? `${Math.round(v.score)}%` : '—'}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  v.status === 'passed'
                    ? 'bg-green-500/10 text-green-400'
                    : v.status === 'failed'
                    ? 'bg-red-500/10 text-red-400'
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {view === 'select' && renderSelection()}
      {view === 'challenge' && renderChallenge()}
      {view === 'results' && renderResults()}
      {view === 'history' && renderHistory()}
    </div>
  );
}
