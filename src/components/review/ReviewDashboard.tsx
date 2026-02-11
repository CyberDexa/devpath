// ═══════════════════════════════════════
// DevPath — Review Dashboard Component
// Spaced repetition review queue + stats
// ═══════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  BarChart3,
  Calendar,
  Trophy,
  Zap,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Target,
  TrendingUp,
} from "lucide-react";
import clsx from "clsx";
import type { QuizQuestion } from "../../data/quiz-questions";
import { allQuizQuestions } from "../../data/quiz-questions";
import {
  type ReviewItem,
  getDueItems,
  getReviewStats,
  sm2,
  answerToQuality,
} from "../../lib/spaced-repetition";

interface ReviewDashboardProps {
  roadmapId?: string;
}

interface MockReviewItem extends ReviewItem {
  question?: QuizQuestion;
}

type View = "dashboard" | "session";

export default function ReviewDashboard({ roadmapId }: ReviewDashboardProps) {
  const [view, setView] = useState<View>("dashboard");
  const [reviewItems, setReviewItems] = useState<MockReviewItem[]>([]);
  const [dueItems, setDueItems] = useState<MockReviewItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    Array<{ correct: boolean; quality: number }>
  >([]);
  const [startTime, setStartTime] = useState(0);

  // Generate review items from quiz questions (client-side for now)
  useEffect(() => {
    const relevant = roadmapId
      ? allQuizQuestions.filter((q) => q.roadmapId === roadmapId)
      : allQuizQuestions;

    // Simulate review items - in production, fetch from Supabase
    const items: MockReviewItem[] = relevant.map((q, i) => {
      const daysOffset = Math.floor(Math.random() * 5) - 2;
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysOffset);

      return {
        id: `review-${q.id}`,
        userId: "",
        roadmapId: q.roadmapId,
        nodeId: q.nodeId,
        questionId: q.id,
        easinessFactor: 2.5 - Math.random() * 0.8,
        interval: Math.max(1, Math.floor(Math.random() * 14)),
        repetitions: Math.floor(Math.random() * 5),
        nextReviewAt: nextReview,
        lastReviewAt: i % 3 === 0 ? null : new Date(Date.now() - 86400000 * (i + 1)),
        lastQuality: i % 3 === 0 ? null : Math.floor(Math.random() * 3 + 3),
        question: q,
      };
    });

    setReviewItems(items);
    setDueItems(getDueItems(items));
  }, [roadmapId]);

  const stats = getReviewStats(reviewItems);
  const currentItem = dueItems[currentIndex];

  const startSession = useCallback(() => {
    if (dueItems.length === 0) return;
    setView("session");
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setSessionResults([]);
    setStartTime(Date.now());
  }, [dueItems]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (showResult || !currentItem?.question) return;
      setSelectedAnswer(answer);
      setShowResult(true);

      const correct = answer === currentItem.question.correctAnswer;
      const timeMs = Date.now() - startTime;
      const quality = answerToQuality(correct, timeMs);

      // Apply SM-2
      const result = sm2(
        quality,
        currentItem.easinessFactor,
        currentItem.interval,
        currentItem.repetitions
      );

      // Update the item locally
      setReviewItems((items) =>
        items.map((item) =>
          item.id === currentItem.id
            ? {
                ...item,
                ...result,
                lastReviewAt: new Date(),
                lastQuality: quality,
              }
            : item
        )
      );

      setSessionResults((prev) => [...prev, { correct, quality }]);
    },
    [currentItem, showResult, startTime]
  );

  const nextItem = useCallback(() => {
    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(Date.now());
    } else {
      // Session complete
      setView("dashboard");
      // Refresh due items
      setDueItems(getDueItems(reviewItems));
    }
  }, [currentIndex, dueItems, reviewItems]);

  // ── Review Session View ──
  if (view === "session" && currentItem?.question) {
    const q = currentItem.question;
    const progress =
      dueItems.length > 0
        ? ((currentIndex + (showResult ? 1 : 0)) / dueItems.length) * 100
        : 0;
    const sessionCorrect = sessionResults.filter((r) => r.correct).length;

    return (
      <div className="max-w-2xl mx-auto">
        {/* Session header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("dashboard")}
              className="text-text-muted hover:text-text transition-colors text-sm"
            >
              ← Back
            </button>
            <span className="text-sm font-mono text-text-muted">
              {currentIndex + 1}/{dueItems.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span className="text-teal-400">{sessionCorrect} ✓</span>
            <span className="text-rose-400">
              {sessionResults.length - sessionCorrect} ✗
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-border rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Review strength indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full",
              currentItem.repetitions >= 5
                ? "bg-teal-500/10 text-teal-400"
                : currentItem.repetitions >= 2
                  ? "bg-amber-500/10 text-amber-400"
                  : "bg-rose-500/10 text-rose-400"
            )}
          >
            {currentItem.repetitions >= 5
              ? "Well known"
              : currentItem.repetitions >= 2
                ? "Learning"
                : "New / Weak"}
          </span>
          <span className="text-xs text-text-muted/60">
            Interval: {currentItem.interval}d | EF:{" "}
            {currentItem.easinessFactor.toFixed(2)}
          </span>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
              <p className="text-sm text-accent/60 mb-3 capitalize">
                {q.nodeId.replace(/^(fe-|be-|do-|ai-|fs-)/, "").replace(/-/g, " ")}
              </p>
              <h3 className="text-lg font-semibold text-text mb-6">
                {q.question}
              </h3>

              <div className="space-y-2.5">
                {q.options.map((option, i) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === q.correctAnswer;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult}
                      className={clsx(
                        "w-full text-left p-3.5 rounded-xl border transition-all text-sm",
                        !showResult &&
                          "border-border bg-canvas hover:border-accent/50",
                        showResult &&
                          isCorrect &&
                          "border-teal-500 bg-teal-500/10",
                        showResult &&
                          isSelected &&
                          !isCorrect &&
                          "border-rose-500 bg-rose-500/10",
                        showResult &&
                          !isSelected &&
                          !isCorrect &&
                          "border-border/30 opacity-40"
                      )}
                    >
                      <span
                        className={clsx(
                          showResult && isCorrect
                            ? "text-teal-400"
                            : showResult && isSelected && !isCorrect
                              ? "text-rose-400"
                              : "text-text"
                        )}
                      >
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result & explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div
                    className={clsx(
                      "border rounded-xl p-4 mb-4 text-sm",
                      selectedAnswer === q.correctAnswer
                        ? "bg-teal-500/5 border-teal-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {selectedAnswer === q.correctAnswer ? (
                        <CheckCircle2 size={16} className="text-teal-400" />
                      ) : (
                        <XCircle size={16} className="text-rose-400" />
                      )}
                      <span
                        className={
                          selectedAnswer === q.correctAnswer
                            ? "text-teal-400 font-medium"
                            : "text-rose-400 font-medium"
                        }
                      >
                        {selectedAnswer === q.correctAnswer
                          ? "Correct!"
                          : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-text-muted/80 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>

                  <button
                    onClick={nextItem}
                    className="w-full py-3 bg-accent text-canvas font-semibold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {currentIndex < dueItems.length - 1 ? (
                      <>
                        Next <ChevronRight size={16} />
                      </>
                    ) : (
                      <>
                        Finish Session <Trophy size={16} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ── Dashboard View ──
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Brain className="text-accent" size={24} />
            Review Dashboard
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Spaced repetition keeps knowledge fresh
          </p>
        </div>
        {dueItems.length > 0 && (
          <button
            onClick={startSession}
            className="px-6 py-2.5 bg-accent text-canvas font-semibold rounded-xl hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Zap size={16} />
            Review Now ({dueItems.length})
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Target size={20} className="text-accent" />}
          label="Due Now"
          value={stats.due}
          accent={stats.due > 0 ? "text-accent" : "text-text"}
        />
        <StatCard
          icon={<Calendar size={20} className="text-violet-400" />}
          label="Coming Tomorrow"
          value={stats.upcoming}
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-teal-400" />}
          label="Retention"
          value={`${stats.retention}%`}
          accent="text-teal-400"
        />
        <StatCard
          icon={<Trophy size={20} className="text-amber-400" />}
          label="Mastered"
          value={stats.mastered}
          accent="text-amber-400"
        />
      </div>

      {/* Mastery Breakdown */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Strength Distribution */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            Knowledge Strength
          </h3>

          <div className="space-y-4">
            <StrengthBar
              label="Mastered"
              count={stats.mastered}
              total={stats.total}
              color="bg-teal-500"
            />
            <StrengthBar
              label="Learning"
              count={stats.learning}
              total={stats.total}
              color="bg-amber-500"
            />
            <StrengthBar
              label="Struggling"
              count={stats.struggling}
              total={stats.total}
              color="bg-rose-500"
            />
            <StrengthBar
              label="New"
              count={
                stats.total - stats.mastered - stats.learning - stats.struggling
              }
              total={stats.total}
              color="bg-border"
            />
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            Review Schedule
          </h3>

          {dueItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2
                size={32}
                className="text-teal-400 mx-auto mb-3"
              />
              <p className="text-text font-medium">All caught up!</p>
              <p className="text-sm text-text-muted mt-1">
                No reviews due right now. Check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {dueItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-canvas rounded-xl border border-border/50"
                >
                  <div>
                    <p className="text-sm text-text capitalize">
                      {item.nodeId
                        .replace(/^(fe-|be-|do-|ai-|fs-)/, "")
                        .replace(/-/g, " ")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.repetitions === 0
                        ? "First review"
                        : `${item.repetitions} successful reviews`}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded-full",
                      item.easinessFactor >= 2.3
                        ? "bg-teal-500/10 text-teal-400"
                        : item.easinessFactor >= 1.8
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-rose-500/10 text-rose-400"
                    )}
                  >
                    EF {item.easinessFactor.toFixed(1)}
                  </span>
                </div>
              ))}
              {dueItems.length > 6 && (
                <p className="text-xs text-text-muted text-center pt-2">
                  +{dueItems.length - 6} more items
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {stats.total === 0 && (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <BookOpen size={40} className="text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            No review items yet
          </h3>
          <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
            Complete a skill assessment on any roadmap to start building your
            review queue. Missed questions are automatically scheduled for
            spaced review.
          </p>
          <a
            href="/roadmaps"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-canvas rounded-xl font-semibold hover:bg-accent/90 transition-colors"
          >
            Explore Roadmaps
            <ArrowRight size={16} />
          </a>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent = "text-text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="mb-2">{icon}</div>
      <div className={clsx("text-2xl font-bold", accent)}>{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}

function StrengthBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-text">{label}</span>
        <span className="text-xs font-mono text-text-muted">{count}</span>
      </div>
      <div className="h-2 bg-border/50 rounded-full overflow-hidden">
        <motion.div
          className={clsx("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
