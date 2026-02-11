// ═══════════════════════════════════════
// DevPath — Skill Assessment Quiz Component
// Diagnostic quiz that evaluates proficiency per roadmap topic
// ═══════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Zap,
  Trophy,
  BarChart3,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import type { QuizQuestion } from "../../data/quiz-questions";
import {
  getDiagnosticQuestions,
  getQuestionsForRoadmap,
} from "../../data/quiz-questions";

interface SkillAssessmentProps {
  roadmapId: string;
  roadmapTitle: string;
  onComplete?: (results: QuizResult) => void;
  mode?: "diagnostic" | "practice" | "review";
  questions?: QuizQuestion[];
}

export interface QuizResult {
  roadmapId: string;
  answers: AnswerRecord[];
  score: number;
  total: number;
  percentage: number;
  nodeScores: Record<
    string,
    { correct: number; total: number; proficiency: number }
  >;
  timeMs: number;
}

interface AnswerRecord {
  questionId: string;
  nodeId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  timeMs: number;
  explanation: string;
}

type Phase = "intro" | "quiz" | "review" | "results";

export default function SkillAssessment({
  roadmapId,
  roadmapTitle,
  onComplete,
  mode = "diagnostic",
  questions: externalQuestions,
}: SkillAssessmentProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Load questions
  useEffect(() => {
    if (externalQuestions && externalQuestions.length > 0) {
      setQuestions(externalQuestions);
    } else {
      const count = mode === "diagnostic" ? 10 : 5;
      const qs = getDiagnosticQuestions(roadmapId, count);
      setQuestions(qs);
    }
  }, [roadmapId, mode, externalQuestions]);

  // Timer
  useEffect(() => {
    if (phase === "quiz") {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - quizStartTime);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, quizStartTime]);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0
      ? ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100
      : 0;

  const startQuiz = useCallback(() => {
    const now = Date.now();
    setQuizStartTime(now);
    setStartTime(now);
    setPhase("quiz");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (showExplanation || !currentQuestion) return;
      setSelectedAnswer(answer);
      setShowExplanation(true);

      const timeMs = Date.now() - startTime;
      const correct = answer === currentQuestion.correctAnswer;

      const record: AnswerRecord = {
        questionId: currentQuestion.id,
        nodeId: currentQuestion.nodeId,
        question: currentQuestion.question,
        userAnswer: answer,
        correctAnswer: currentQuestion.correctAnswer,
        correct,
        timeMs,
        explanation: currentQuestion.explanation,
      };

      setAnswers((prev) => [...prev, record]);
    },
    [currentQuestion, showExplanation, startTime]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setStartTime(Date.now());
    } else {
      // Quiz complete — calculate results
      const finalAnswers = [
        ...answers,
      ];
      const score = finalAnswers.filter((a) => a.correct).length;
      const total = finalAnswers.length;
      const totalTime = Date.now() - quizStartTime;

      // Calculate per-node scores
      const nodeScores: Record<
        string,
        { correct: number; total: number; proficiency: number }
      > = {};
      for (const a of finalAnswers) {
        if (!nodeScores[a.nodeId]) {
          nodeScores[a.nodeId] = { correct: 0, total: 0, proficiency: 0 };
        }
        nodeScores[a.nodeId].total++;
        if (a.correct) nodeScores[a.nodeId].correct++;
      }
      for (const nodeId of Object.keys(nodeScores)) {
        const ns = nodeScores[nodeId];
        ns.proficiency = ns.total > 0 ? ns.correct / ns.total : 0;
      }

      const quizResult: QuizResult = {
        roadmapId,
        answers: finalAnswers,
        score,
        total,
        percentage: total > 0 ? Math.round((score / total) * 100) : 0,
        nodeScores,
        timeMs: totalTime,
      };

      setResult(quizResult);
      setPhase("results");
      if (timerRef.current) clearInterval(timerRef.current);
      onComplete?.(quizResult);
    }
  }, [currentIndex, questions, answers, quizStartTime, roadmapId, onComplete]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Intro Phase ──
  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="text-accent" size={32} />
          </div>

          <h2 className="text-2xl font-bold text-text mb-2">
            {mode === "diagnostic"
              ? "Skill Assessment"
              : mode === "review"
                ? "Review Quiz"
                : "Practice Quiz"}
          </h2>
          <p className="text-text-muted mb-6">
            {mode === "diagnostic"
              ? `Test your knowledge across ${roadmapTitle} topics. We'll identify your strengths and areas to improve.`
              : `Practice questions from the ${roadmapTitle} roadmap.`}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-canvas rounded-xl p-4">
              <Target size={20} className="text-accent mx-auto mb-2" />
              <div className="text-lg font-bold text-text">
                {questions.length}
              </div>
              <div className="text-xs text-text-muted">Questions</div>
            </div>
            <div className="bg-canvas rounded-xl p-4">
              <Clock size={20} className="text-amber-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-text">
                ~{Math.ceil(questions.length * 0.5)}m
              </div>
              <div className="text-xs text-text-muted">Estimated</div>
            </div>
            <div className="bg-canvas rounded-xl p-4">
              <Zap size={20} className="text-violet-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-text">
                {mode === "diagnostic" ? "Adaptive" : "Mixed"}
              </div>
              <div className="text-xs text-text-muted">Difficulty</div>
            </div>
          </div>

          {mode === "diagnostic" && (
            <p className="text-sm text-text-muted/70 mb-6">
              Your results will personalize your learning path and schedule
              review sessions for topics that need practice.
            </p>
          )}

          <button
            onClick={startQuiz}
            className="px-8 py-3 bg-accent text-canvas font-semibold rounded-xl hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
          >
            Start Assessment
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Quiz Phase ──
  if (phase === "quiz" && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-text-muted">
              {currentIndex + 1}/{questions.length}
            </span>
            <span
              className={clsx(
                "px-2 py-0.5 text-xs font-medium rounded-full",
                currentQuestion.difficulty === "beginner" &&
                  "bg-teal-500/10 text-teal-400",
                currentQuestion.difficulty === "intermediate" &&
                  "bg-amber-500/10 text-amber-400",
                currentQuestion.difficulty === "advanced" &&
                  "bg-rose-500/10 text-rose-400"
              )}
            >
              {currentQuestion.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Clock size={14} />
            <span className="text-sm font-mono">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-border rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-surface border border-border rounded-2xl p-8 mb-4">
              {/* Question type badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-md">
                  {currentQuestion.questionType === "multiple_choice"
                    ? "Multiple Choice"
                    : currentQuestion.questionType === "true_false"
                      ? "True / False"
                      : "Code Output"}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-text mb-6 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showResult = showExplanation;

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      disabled={showExplanation}
                      className={clsx(
                        "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3",
                        !showResult &&
                          !isSelected &&
                          "border-border bg-canvas hover:border-accent/50 hover:bg-accent/5",
                        !showResult &&
                          isSelected &&
                          "border-accent bg-accent/10",
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
                          "border-border/50 bg-canvas/50 opacity-50"
                      )}
                    >
                      <span
                        className={clsx(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                          !showResult && "bg-border/50 text-text-muted",
                          showResult &&
                            isCorrect &&
                            "bg-teal-500 text-white",
                          showResult &&
                            isSelected &&
                            !isCorrect &&
                            "bg-rose-500 text-white"
                        )}
                      >
                        {showResult && isCorrect ? (
                          <CheckCircle2 size={14} />
                        ) : showResult && isSelected && !isCorrect ? (
                          <XCircle size={14} />
                        ) : (
                          letter
                        )}
                      </span>
                      <span
                        className={clsx(
                          "text-sm leading-relaxed",
                          showResult && isCorrect
                            ? "text-teal-400 font-medium"
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

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className={clsx(
                      "border rounded-2xl p-6 mb-4",
                      selectedAnswer === currentQuestion.correctAnswer
                        ? "bg-teal-500/5 border-teal-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      {selectedAnswer === currentQuestion.correctAnswer ? (
                        <>
                          <CheckCircle2
                            size={18}
                            className="text-teal-400"
                          />
                          <span className="font-semibold text-teal-400">
                            Correct!
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} className="text-rose-400" />
                          <span className="font-semibold text-rose-400">
                            Not quite
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 bg-accent text-canvas font-semibold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <ChevronRight size={18} />
                      </>
                    ) : (
                      <>
                        See Results
                        <Trophy size={18} />
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

  // ── Results Phase ──
  if (phase === "results" && result) {
    const percentage = result.percentage;
    const gradeColor =
      percentage >= 80
        ? "text-teal-400"
        : percentage >= 60
          ? "text-amber-400"
          : "text-rose-400";
    const gradeLabel =
      percentage >= 80
        ? "Excellent"
        : percentage >= 60
          ? "Good"
          : percentage >= 40
            ? "Needs Work"
            : "Keep Learning";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Score Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 mb-6 text-center">
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-24 h-24 rounded-full border-4 border-accent/20 flex items-center justify-center mx-auto mb-4 relative"
            >
              <svg className="absolute inset-0 w-24 h-24 -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-border"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="44"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="text-accent"
                  strokeDasharray={2 * Math.PI * 44}
                  initial={{
                    strokeDashoffset: 2 * Math.PI * 44,
                  }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 44 * (1 - percentage / 100),
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <span className={clsx("text-2xl font-bold", gradeColor)}>
                {percentage}%
              </span>
            </motion.div>

            <h2 className={clsx("text-xl font-bold mb-1", gradeColor)}>
              {gradeLabel}
            </h2>
            <p className="text-text-muted text-sm">
              {result.score} of {result.total} correct in{" "}
              {formatTime(result.timeMs)}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-canvas rounded-xl p-3">
              <div className="text-lg font-bold text-teal-400">
                {result.answers.filter((a) => a.correct).length}
              </div>
              <div className="text-xs text-text-muted">Correct</div>
            </div>
            <div className="bg-canvas rounded-xl p-3">
              <div className="text-lg font-bold text-rose-400">
                {result.answers.filter((a) => !a.correct).length}
              </div>
              <div className="text-xs text-text-muted">Incorrect</div>
            </div>
            <div className="bg-canvas rounded-xl p-3">
              <div className="text-lg font-bold text-accent">
                {formatTime(result.timeMs)}
              </div>
              <div className="text-xs text-text-muted">Time</div>
            </div>
          </div>
        </div>

        {/* Per-Node Breakdown */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            Topic Breakdown
          </h3>

          <div className="space-y-3">
            {Object.entries(result.nodeScores).map(([nodeId, ns]) => {
              const pct = Math.round(ns.proficiency * 100);
              const color =
                pct >= 80
                  ? "bg-teal-500"
                  : pct >= 50
                    ? "bg-amber-500"
                    : "bg-rose-500";
              return (
                <div key={nodeId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text capitalize">
                      {nodeId.replace(/^(fe-|be-|do-|ai-|fs-)/, "").replace(/-/g, " ")}
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {ns.correct}/{ns.total}
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className={clsx("h-full rounded-full", color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review section */}
        {result.answers.some((a) => !a.correct) && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-violet-400" />
              Questions to Review
            </h3>

            <div className="space-y-4">
              {result.answers
                .filter((a) => !a.correct)
                .map((a, i) => (
                  <div
                    key={i}
                    className="bg-canvas rounded-xl p-4 border border-border/50"
                  >
                    <p className="text-sm text-text mb-2">{a.question}</p>
                    <div className="flex items-start gap-2 text-xs">
                      <XCircle
                        size={14}
                        className="text-rose-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-rose-400/80">
                        Your answer: {a.userAnswer}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs mt-1">
                      <CheckCircle2
                        size={14}
                        className="text-teal-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-teal-400/80">
                        Correct: {a.correctAnswer}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted/70 mt-2 leading-relaxed">
                      {a.explanation}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setPhase("intro");
              setResult(null);
              setAnswers([]);
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setShowExplanation(false);
              // Reload questions for fresh diagnostic
              const qs = getDiagnosticQuestions(roadmapId, 10);
              setQuestions(qs);
            }}
            className="flex-1 py-3 border border-border text-text rounded-xl hover:bg-surface transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Retake Quiz
          </button>
          <a
            href={`/roadmaps/${roadmapId}`}
            className="flex-1 py-3 bg-accent text-canvas font-semibold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            Continue Learning
            <ArrowRight size={16} />
          </a>
        </div>
      </motion.div>
    );
  }

  // Fallback loading
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
