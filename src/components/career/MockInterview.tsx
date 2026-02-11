// ═══════════════════════════════════════
// DevPath — Mock Interview Component
// Practice interviews with AI feedback
// ═══════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Play,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageSquare,
  BarChart3,
  Star,
  Loader2,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Plus,
  History,
} from 'lucide-react';
import {
  createMockInterview,
  startMockInterview,
  submitInterviewResponse,
  completeInterview,
  getUserInterviews,
  getInterview,
  type InterviewType,
} from '../../lib/career';

// ═══════════════════════════════════════
// Types
// ═══════════════════════════════════════

interface Props {
  userId: string;
}

type ViewState = 'setup' | 'interview' | 'results' | 'history';

const INTERVIEW_TYPES: { id: InterviewType; name: string; desc: string; icon: typeof Brain; color: string }[] = [
  { id: 'behavioral', name: 'Behavioral', desc: 'STAR method, teamwork, leadership', icon: MessageSquare, color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
  { id: 'technical', name: 'Technical', desc: 'Concepts, architecture, best practices', icon: Brain, color: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30' },
  { id: 'system_design', name: 'System Design', desc: 'Scalability, trade-offs, architecture', icon: Target, color: 'from-violet-500/20 to-violet-600/20 border-violet-500/30' },
  { id: 'coding', name: 'Coding', desc: 'Algorithms, data structures, problems', icon: TrendingUp, color: 'from-amber-500/20 to-amber-600/20 border-amber-500/30' },
  { id: 'mixed', name: 'Full Loop', desc: 'All question types, realistic simulation', icon: Star, color: 'from-rose-500/20 to-rose-600/20 border-rose-500/30' },
];

// ═══════════════════════════════════════
// Main Component
// ═══════════════════════════════════════

export default function MockInterview({ userId }: Props) {
  const [view, setView] = useState<ViewState>('setup');
  const [selectedType, setSelectedType] = useState<InterviewType>('behavioral');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [loading, setLoading] = useState(false);

  // Interview state
  const [interviewId, setInterviewId] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [timeStarted, setTimeStarted] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Results & history
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    loadHistory();
  }, [userId]);

  // Timer
  useEffect(() => {
    if (view !== 'interview') {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timeStarted) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view, timeStarted]);

  async function loadHistory() {
    const data = await getUserInterviews(userId);
    setHistory(data);
  }

  async function handleStart() {
    setLoading(true);
    try {
      const interview = await createMockInterview(userId, {
        type: selectedType,
        targetRole,
        targetCompany,
        questionCount: 5,
      });

      const started = await startMockInterview(interview.id, userId);
      setInterviewId(started.id);
      setQuestions(started.questions || []);
      setCurrentQ(0);
      setResponses({});
      setTimeStarted(Date.now());
      setElapsed(0);
      setView('interview');
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitResponse() {
    const q = questions[currentQ];
    const response = responses[q.id] || '';
    if (response.trim()) {
      try {
        await submitInterviewResponse(interviewId, userId, q.id, response);
      } catch { /* continue */ }
    }

    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
    } else {
      await handleComplete();
    }
  }

  async function handleComplete() {
    setLoading(true);
    clearInterval(timerRef.current);
    try {
      // Submit any remaining responses
      for (const q of questions) {
        if (responses[q.id]?.trim()) {
          try {
            await submitInterviewResponse(interviewId, userId, q.id, responses[q.id]);
          } catch { /* already submitted */ }
        }
      }

      const result = await completeInterview(interviewId, userId);
      setResults(result);
      setView('results');
      loadHistory();
    } catch (err) {
      console.error('Failed to complete:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Setup View ───
  const renderSetup = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mic className="w-7 h-7 text-teal" />
            Mock Interviews
          </h2>
          <p className="text-gray-400 mt-1">Practice with AI-powered interview simulations</p>
        </div>
        <button
          onClick={() => setView('history')}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors text-sm flex items-center gap-2"
        >
          <History className="w-4 h-4" /> History ({history.length})
        </button>
      </div>

      {/* Interview Type */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Choose Interview Type</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTERVIEW_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`p-5 rounded-xl border text-left transition-all ${
                selectedType === t.id
                  ? `bg-gradient-to-br ${t.color} ring-2 ring-teal/50`
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <t.icon className="w-6 h-6 text-teal mb-2" />
              <p className="text-white font-semibold">{t.name}</p>
              <p className="text-gray-400 text-sm mt-1">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Target */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Target Details (Optional)</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Target Company</label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g., Google, Stripe, etc."
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-teal/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={loading}
          className="px-8 py-3.5 bg-teal text-[#0a0a0f] font-bold rounded-xl hover:bg-teal/90 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          Start Interview
        </button>
      </div>
    </div>
  );

  // ─── Interview View ───
  const renderInterview = () => {
    if (questions.length === 0) return null;
    const q = questions[currentQ];
    const isLast = currentQ === questions.length - 1;

    return (
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
          <div>
            <p className="text-white font-semibold capitalize">{selectedType} Interview</p>
            <p className="text-gray-400 text-sm">Question {currentQ + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2 text-teal font-mono text-lg font-bold">
            <Clock className="w-5 h-5" />
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-teal rounded-full"
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white/5 border border-white/10 rounded-xl p-8"
          >
            {/* Question type badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-teal/10 text-teal capitalize">
                {q.type || selectedType}
              </span>
            </div>

            <h3 className="text-white text-xl font-medium mb-6 leading-relaxed">{q.text}</h3>

            <textarea
              value={responses[q.id] || ''}
              onChange={(e) => setResponses((prev) => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Type your answer here. Be specific, use examples, and structure your response clearly..."
              rows={8}
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg p-4 text-sm text-gray-200 resize-none focus:outline-none focus:ring-1 focus:ring-teal/50"
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-gray-500 text-xs">
                {(responses[q.id] || '').length} characters
              </p>
              <p className="text-gray-600 text-xs">
                Tip: Use the STAR method for behavioral questions
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i === currentQ ? 'bg-teal' : responses[questions[i].id] ? 'bg-teal/40' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleSubmitResponse}
            disabled={loading}
            className={`px-6 py-2.5 font-bold rounded-lg transition-colors flex items-center gap-2 ${
              isLast
                ? 'bg-teal text-[#0a0a0f] hover:bg-teal/90'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLast ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Finish Interview
              </>
            ) : (
              <>
                Next Question <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ─── Results View ───
  const renderResults = () => {
    if (!results) return null;
    const feedback = results.ai_feedback || {};
    const score = results.overall_score || 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Score Hero */}
        <div className={`text-center p-10 rounded-2xl border ${
          score >= 70
            ? 'bg-gradient-to-br from-teal/10 to-emerald-500/10 border-teal/30'
            : score >= 40
            ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30'
            : 'bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30'
        }`}>
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${
            score >= 70 ? 'text-teal' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
          }`} />
          <h2 className="text-3xl font-bold text-white mb-2">Interview Complete!</h2>
          <div className="text-5xl font-bold font-mono mt-4 mb-2">
            <span className={score >= 70 ? 'text-teal' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}>
              {score}
            </span>
            <span className="text-gray-500 text-2xl">/100</span>
          </div>
          <p className="text-gray-400">
            {results.duration_seconds ? `Duration: ${formatTime(results.duration_seconds)}` : ''}
          </p>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid sm:grid-cols-2 gap-4">
          {feedback.strengths?.length > 0 && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
              <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Strengths
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-1">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.improvements?.length > 0 && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
              <h3 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((s: string, i: number) => (
                  <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                    <span className="text-amber-400 mt-1">-</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Per-Question Feedback */}
        {feedback.questionFeedback?.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" /> Question-by-Question
            </h3>
            {feedback.questionFeedback.map((qf: any, i: number) => (
              <div key={i} className="py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-sm font-medium">Question {i + 1}</span>
                  <span className={`font-mono font-bold text-sm ${
                    qf.score >= 80 ? 'text-green-400' : qf.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {qf.score}/100
                  </span>
                </div>
                <p className="text-gray-500 text-xs">{qf.feedback}</p>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => { setView('setup'); setResults(null); }}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:bg-white/10 transition-colors"
          >
            New Interview
          </button>
          <button
            onClick={() => setView('history')}
            className="px-6 py-3 bg-teal text-[#0a0a0f] font-bold rounded-xl hover:bg-teal/90 transition-colors flex items-center gap-2"
          >
            <History className="w-5 h-5" /> View History
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── History View ───
  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <History className="w-7 h-7 text-teal" /> Interview History
        </h2>
        <button
          onClick={() => setView('setup')}
          className="px-4 py-2 bg-teal text-[#0a0a0f] font-bold rounded-lg hover:bg-teal/90 transition-colors text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Interview
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Mic className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No interviews yet. Start practicing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((iv) => (
            <div key={iv.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-medium capitalize">{iv.interview_type.replace('_', ' ')}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    iv.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    iv.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {iv.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  {new Date(iv.created_at).toLocaleDateString()}
                  {iv.target_role && ` · ${iv.target_role}`}
                  {iv.duration_seconds && ` · ${formatTime(iv.duration_seconds)}`}
                </p>
              </div>
              {iv.overall_score != null && (
                <span className={`text-2xl font-bold font-mono ${
                  iv.overall_score >= 70 ? 'text-green-400' : iv.overall_score >= 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {iv.overall_score}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {view === 'setup' && renderSetup()}
      {view === 'interview' && renderInterview()}
      {view === 'results' && renderResults()}
      {view === 'history' && renderHistory()}
    </div>
  );
}
