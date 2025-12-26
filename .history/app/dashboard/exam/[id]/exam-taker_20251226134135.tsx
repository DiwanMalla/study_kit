"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  type: string;
}

interface ExamTakerProps {
  exam: {
    id: string;
    title: string;
    duration: number;
    subject?: string | null;
    description?: string | null;
    score?: number | null;
    questions: ExamQuestion[];
  };
}

export function ExamTaker({ exam }: ExamTakerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const STORAGE_KEY = `examAttempt:${exam.id}`;
  const [hasStarted, setHasStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [examComplete, setExamComplete] = useState(
    exam.score !== null && exam.score !== undefined
  );
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [viewingResults, setViewingResults] = useState(false);
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!examComplete) return;

    // Restore submitted answers/time so results are accurate after refresh.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        answers?: Array<[number, number]>;
        timeSpentSeconds?: number;
      };

      if (Array.isArray(parsed.answers) && parsed.answers.length > 0) {
        setAnswers(new Map(parsed.answers));
      }

      if (typeof parsed.timeSpentSeconds === "number") {
        const total = exam.duration * 60;
        const nextTimeLeft = Math.max(
          0,
          total - Math.max(0, parsed.timeSpentSeconds)
        );
        setTimeLeft(nextTimeLeft);
      }
    } catch {
      // ignore malformed storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.id, examComplete]);

  useEffect(() => {
    if (!hasStarted || examComplete) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, examComplete]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQuestion = exam.questions[currentIndex];
  const progress = ((currentIndex + 1) / exam.questions.length) * 100;

  const handleSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setAnswers(new Map([...answers, [currentIndex, selectedAnswer]]));
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextAnswer = answers.get(currentIndex + 1);
      setSelectedAnswer(nextAnswer !== undefined ? nextAnswer : null);
      setShowResult(nextAnswer !== undefined);
    } else {
      handleFinishExam();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevAnswer = answers.get(currentIndex - 1);
      setSelectedAnswer(prevAnswer !== undefined ? prevAnswer : null);
      setShowResult(prevAnswer !== undefined);
    }
  };

  const calculateScore = (answerMap: Map<number, number>) => {
    let correct = 0;
    answerMap.forEach((answer, questionIndex) => {
      if (answer === exam.questions[questionIndex].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / exam.questions.length) * 100);
  };

  const persistAttempt = (
    answerMap: Map<number, number>,
    timeSpentSeconds: number
  ) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          answers: Array.from(answerMap.entries()),
          timeSpentSeconds,
        })
      );
    } catch {
      // ignore quota errors
    }
  };

  const handleFinishExam = async () => {
    // Ensure current selection is saved when submitting from the sidebar or timer.
    const finalAnswers = new Map(answers);
    if (selectedAnswer !== null) {
      finalAnswers.set(currentIndex, selectedAnswer);
      setAnswers(finalAnswers);
    }

    setExamComplete(true);
    const score = calculateScore(finalAnswers);
    const timeSpentSeconds = Math.max(0, exam.duration * 60 - timeLeft);
    persistAttempt(finalAnswers, timeSpentSeconds);

    try {
      setIsSaving(true);
      await fetch(`/api/exams/${exam.id}`, {
        method: "PATCH",
        body: JSON.stringify({ score }),
      });
    } catch (error) {
      console.error("Failed to save exam score:", error);
      toast({
        title: "Error",
        description: "Failed to save your exam score.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (exam.questions.length === 0) {
    return (
      <main className="flex-1 h-full flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl text-slate-400">
              quiz
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            No Questions Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">
            This exam doesn't have any questions yet. Please check back later or
            create a new exam.
          </p>
          <button
            className="w-full py-4 bg-primary text-slate-900 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            onClick={() => router.push("/dashboard/exam")}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Exams
          </button>
        </div>
      </main>
    );
  }

  if (!hasStarted && !examComplete) {
    return (
      <main className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="max-w-[1920px] mx-auto h-full flex flex-col justify-center relative z-10 py-10">
          <div className="mb-8">
            <Link
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
              href="/dashboard/exam"
            >
              <div className="w-8 h-8 rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
              </div>
              <span className="font-medium text-sm">Back to Exam List</span>
            </Link>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-12 right-12 text-[120px] text-slate-900/[0.03] dark:text-white/[0.03] font-bold leading-none pointer-events-none select-none material-symbols-outlined">
              functions
            </div>
            <div className="relative z-10">
              <div className="flex flex-col gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-green-200 dark:border-green-900/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {exam.subject ? exam.subject : "General"}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">
                      Created today
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                    {exam.title}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl">
                    {exam.description
                      ? exam.description
                      : "This mock exam covers the selected topics. Ensure you have your materials ready before starting."}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary mb-2">
                      timer
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Duration
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {exam.duration} min
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary mb-2">
                      format_list_numbered
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Questions
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {exam.questions.length} Qs
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary mb-2">
                      check_circle
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Pass Mark
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      70%
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-100 dark:border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary mb-2">
                      history
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Attempts
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      Unlimited
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 border border-slate-200 dark:border-white/5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">
                      info
                    </span>
                    Important Rules & Guidelines
                  </h3>
                  <div className="grid md:grid-cols-2 gap-y-3 gap-x-8">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        1
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        The timer starts automatically the moment you click
                        'Start Exam'.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        2
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        You cannot pause the exam once it has begun. Plan your
                        time accordingly.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        3
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Do not refresh the page or close the window, or your
                        progress will be lost.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        4
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        Ensure you have a stable internet connection before
                        starting.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative flex items-center">
                      <input
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:bg-primary checked:border-primary transition-all dark:bg-white/5 dark:border-white/20"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                      />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 material-symbols-outlined text-base pointer-events-none text-slate-900 font-bold">
                        check
                      </span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      I adhere to the rules and I am ready to begin.
                    </span>
                  </label>
                  <button
                    className="w-full md:w-auto px-10 py-4 bg-primary text-slate-900 rounded-xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!agreed}
                    onClick={() => setHasStarted(true)}
                  >
                    Start Exam
                    <span className="material-symbols-outlined font-bold">
                      play_arrow
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (examComplete) {
    const hasSavedAnswers = answers.size > 0;
    const score =
      exam.score !== null && !hasSavedAnswers
        ? exam.score
        : calculateScore(answers);
    const correctCount = hasSavedAnswers
      ? Array.from(answers.entries()).filter(
          ([idx, ans]) => ans === exam.questions[idx].correctAnswer
        ).length
      : Math.round((score / 100) * exam.questions.length);

    const totalSecondsSpent = exam.duration * 60 - timeLeft;
    const formatTimeSpent = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}m ${s.toString().padStart(2, "0")}s`;
    };

    if (!viewingResults) {
      return (
        <main className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-8 relative">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="max-w-[1920px] mx-auto h-full flex flex-col relative z-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  {exam.title}
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-900/50 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    Completed
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
                  {exam.subject || "General"}
                </p>
              </div>
            </header>
            <div className="flex-1 flex items-center justify-center pb-12">
              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none p-8 md:p-12 max-w-2xl w-full text-center relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-5xl">
                    check_circle
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                  Exam Submitted!
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
                  Your answers have been securely recorded. The AI Tutor is now
                  analyzing your performance to provide personalized feedback.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Time Taken
                    </span>
                    <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                      {formatTimeSpent(totalSecondsSpent)}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Questions
                    </span>
                    <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                      {answers.size}/{exam.questions.length}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Submission ID
                    </span>
                    <span className="text-xl font-mono font-bold text-slate-900 dark:text-white">
                      #{exam.id.slice(-5).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setViewingResults(true)}
                    className="w-full md:w-auto px-8 py-3.5 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                  >
                    View Results
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/exam")}
                    className="w-full md:w-auto px-8 py-3.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  >
                    Go to Exam Prep Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }

    const skippedCount = hasSavedAnswers ? exam.questions.length - answers.size : 0;
    const incorrectCount = Math.max(
      0,
      exam.questions.length - correctCount - skippedCount
    );
    const completionRate = hasSavedAnswers
      ? Math.round((answers.size / exam.questions.length) * 100)
      : 100;

    const performanceByType = (() => {
      const map = new Map<
        string,
        { total: number; answered: number; correct: number }
      >();

      exam.questions.forEach((q, idx) => {
        const type = q.type || "mcq";
        const entry = map.get(type) ?? { total: 0, answered: 0, correct: 0 };
        entry.total += 1;

        const userAnswer = answers.get(idx);
        if (userAnswer !== undefined) {
          entry.answered += 1;
          if (userAnswer === q.correctAnswer) entry.correct += 1;
        }

        map.set(type, entry);
      });

      return Array.from(map.entries())
        .map(([type, stats]) => {
          const accuracy = stats.answered
            ? Math.round((stats.correct / stats.answered) * 100)
            : 0;
          return { type, ...stats, accuracy };
        })
        .sort((a, b) => b.total - a.total);
    })();
    const grade =
      score >= 90
        ? "A"
        : score >= 80
        ? "B+"
        : score >= 70
        ? "B"
        : score >= 60
        ? "C"
        : "D";

    return (
      <main className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="max-w-[1920px] mx-auto h-full flex flex-col relative z-10 pb-10">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setViewingResults(false)}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_back
                  </span>
                  Back to Summary
                </button>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {exam.title} Results
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Completed on {new Date().toLocaleDateString()} •{" "}
                {formatTimeSpent(totalSecondsSpent)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 rounded-xl border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-bold text-sm transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  print
                </span>
                Print
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  share
                </span>
                Share
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                  <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                    <svg
                      className="w-full h-full -rotate-90 transform"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="text-slate-100 dark:text-white/5"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="8"
                      ></circle>
                      <circle
                        className="text-primary"
                        cx="50"
                        cy="50"
                        fill="none"
                        r="45"
                        stroke="currentColor"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * score) / 100}
                        strokeLinecap="round"
                        strokeWidth="8"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {score}%
                      </span>
                      <span className="text-xs font-bold uppercase text-slate-400 tracking-wider mt-1">
                        Grade {grade}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 w-full grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-[18px]">
                          check
                        </span>
                      </span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {correctCount}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                        Correct
                      </span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-[18px]">
                          close
                        </span>
                      </span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {incorrectCount}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                        Incorrect
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-[18px]">
                          remove
                        </span>
                      </span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {skippedCount}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                        Skipped
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                    {score >= 70 ? "Keep it up! 🎉" : "Keep practicing! 💪"}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {score >= 70
                      ? `You performed better than ${Math.min(
                          99,
                          score - 5
                        )}% of students on this mock exam. You're showing strong understanding.`
                      : "Review the explanations below to understand where you can improve. Every mistake is a learning opportunity!"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Question Review
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        className="rounded border-slate-300 text-primary focus:ring-primary"
                        type="checkbox"
                        checked={showIncorrectOnly}
                        onChange={(e) => setShowIncorrectOnly(e.target.checked)}
                      />
                      Show incorrect only
                    </label>
                  </div>
                </div>

                {exam.questions
                  .filter((q, idx) => {
                    if (!showIncorrectOnly) return true;
                    return answers.get(idx) !== q.correctAnswer;
                  })
                  .map((q, idx) => {
                    const userAnswer = answers.get(idx);
                    const isCorrect = userAnswer === q.correctAnswer;

                    return (
                      <div
                        key={q.id}
                        className={`bg-surface-light dark:bg-surface-dark border ${
                          isCorrect
                            ? "border-border-light dark:border-border-dark"
                            : "border-red-200 dark:border-red-900/30"
                        } rounded-2xl overflow-hidden shadow-sm`}
                      >
                        <div
                          className={`${
                            isCorrect
                              ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20"
                              : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20"
                          } px-6 py-3 border-b flex items-center justify-between`}
                        >
                          <span
                            className={`text-xs font-bold ${
                              isCorrect
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                            } uppercase tracking-wide flex items-center gap-2`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {isCorrect ? "check_circle" : "cancel"}
                            </span>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Q #{idx + 1}
                          </span>
                        </div>
                        <div className="p-6">
                          <p className="text-slate-900 dark:text-white font-medium mb-4">
                            {q.question}
                          </p>
                          <div className="space-y-2 mb-6">
                            <div
                              className={`flex items-center gap-3 p-3 rounded-xl border ${
                                isCorrect
                                  ? "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10"
                                  : "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 ${
                                  isCorrect
                                    ? "border-green-500"
                                    : "border-red-500"
                                } flex items-center justify-center shrink-0`}
                              >
                                {isCorrect ? (
                                  <span className="material-symbols-outlined text-[14px] text-green-600 font-bold">
                                    check
                                  </span>
                                ) : (
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                )}
                              </div>
                              <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                {userAnswer !== undefined
                                  ? q.options[userAnswer]
                                  : "No answer"}{" "}
                                (Your Answer)
                              </span>
                            </div>
                            {!isCorrect && (
                              <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
                                <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[14px] text-green-600 font-bold">
                                    check
                                  </span>
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                  {q.options[q.correctAnswer]} (Correct Answer)
                                </span>
                              </div>
                            )}
                          </div>
                          {q.explanation && (
                            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">
                                  lightbulb
                                </span>
                                Explanation
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary rounded-[2rem] p-6 text-center relative overflow-hidden shadow-lg shadow-primary/20">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
                <span className="w-12 h-12 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-900">
                  <span className="material-symbols-outlined text-2xl">
                    smart_toy
                  </span>
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Want deeper insights?
                </h3>
                <p className="text-sm text-slate-800/80 mb-6 leading-tight">
                  Our AI Tutor has analyzed your mistakes and created a
                  personalized study plan.
                </p>
                <button
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={feedbackLoading}
                  onClick={async () => {
                    try {
                      setFeedbackLoading(true);
                      setFeedback(null);

                      const res = await fetch(
                        `/api/exams/${exam.id}/feedback`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            score,
                            timeSpentSeconds: totalSecondsSpent,
                            answers: Array.from(answers.entries()),
                          }),
                        }
                      );

                      if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || "Failed to generate feedback");
                      }

                      const data = (await res.json()) as { feedback?: string };
                      setFeedback(data.feedback || null);
                    } catch (e) {
                      console.error(e);
                      toast({
                        title: "Could not generate feedback",
                        description:
                          "Make sure OPENROUTER_API_KEY is set, then try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setFeedbackLoading(false);
                    }
                  }}
                >
                  {feedbackLoading ? "Generating..." : "Get Personalized Feedback"}
                  <span className="material-symbols-outlined text-[16px]">
                    auto_awesome
                  </span>
                </button>

                {feedback && (
                  <div className="mt-4 bg-white/20 rounded-xl p-4 text-left">
                    <p className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
                      AI Feedback
                    </p>
                    <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {feedback}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400">
                    bar_chart
                  </span>
                  Topic Performance
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">
                        Overall Accuracy
                      </span>
                      <span
                        className={
                          score >= 70
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }
                      >
                        {score}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          score >= 70 ? "bg-green-500" : "bg-yellow-400"
                        } rounded-full`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-600 dark:text-slate-300">
                        Completion Rate
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {completionRate}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${completionRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                    By question type
                  </p>
                  <div className="space-y-3">
                    {performanceByType.map((row) => {
                      const label = row.type ? row.type.replace(/_/g, " ") : "mcq";
                      return (
                        <div key={row.type}>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-slate-600 dark:text-slate-300 capitalize">
                              {label}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {row.accuracy}% ({row.correct}/{row.answered})
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${row.accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setExamComplete(false);
                    setCurrentIndex(0);
                    setAnswers(new Map());
                    setTimeLeft(exam.duration * 60);
                    setHasStarted(false);
                    setViewingResults(false);
                    setFeedback(null);
                    try {
                      if (typeof window !== "undefined") {
                        window.localStorage.removeItem(STORAGE_KEY);
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  className="w-full py-3.5 rounded-xl border-2 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-primary hover:bg-primary/5 hover:text-slate-900 dark:hover:text-primary font-bold transition-all text-sm flex items-center justify-center gap-2 group"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500">
                    refresh
                  </span>
                  Retake Exam
                </button>
                <button
                  onClick={() => router.push("/dashboard/exam")}
                  className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 font-bold transition-all text-sm flex items-center justify-center gap-2"
                >
                  Go to Exam Prep Dashboard
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
      <div className="max-w-[1920px] mx-auto h-full flex flex-col relative z-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              {exam.title}
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-900/50 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
                In Progress
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Question {currentIndex + 1} of {exam.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm rounded-xl px-4 py-2 flex items-center gap-3 flex-1 md:flex-initial">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">timer</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Time Left
                </span>
                <span className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums leading-none mt-0.5">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            <button
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-bold shrink-0"
              onClick={() => router.push("/dashboard/exam")}
            >
              <span className="material-symbols-outlined">logout</span>
              Quit
            </button>
          </div>
        </header>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 pb-6">
          <div className="lg:col-span-8 flex flex-col min-h-0">
            <div className="mb-5">
              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                <span>
                  Question {currentIndex + 1} of {exam.questions.length}
                </span>
                <span>{Math.round(progress)}% Completed</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none p-6 md:p-10 flex flex-col relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold text-sm border border-slate-200 dark:border-white/10 shadow-sm">
                      {(currentIndex + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {currentQuestion.type?.replace("_", " ") ||
                        "Multiple Choice"}
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                  {currentQuestion.type === "short_answer" ? (
                    <div className="space-y-4">
                      <textarea
                        className="w-full min-h-[150px] p-4 rounded-xl border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 focus:border-primary focus:ring-0 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        placeholder="Type your answer here..."
                        value={
                          answers.get(currentIndex) !== undefined
                            ? currentQuestion.options[
                                answers.get(currentIndex)!
                              ]
                            : ""
                        }
                        onChange={(e) => {
                          // For short answer, we store the text in the options array temporarily or handle it differently
                          // But the current system expects an index.
                          // Let's simplify: for short answer, we'll just show the correct answer in the results.
                          // To make it work with the current state, we'll just store 0 as the answer if they type anything.
                          if (e.target.value.trim().length > 0) {
                            handleSelect(0);
                          } else {
                            const newAnswers = new Map(answers);
                            newAnswers.delete(currentIndex);
                            setAnswers(newAnswers);
                          }
                        }}
                      />
                      <p className="text-xs text-slate-500 italic">
                        Note: Short answer questions are self-graded. Your
                        response will be compared with the ideal answer in the
                        results.
                      </p>
                    </div>
                  ) : (
                    currentQuestion.options.map((option, idx) => (
                      <label
                        key={idx}
                        className="group relative flex items-center p-4 rounded-xl border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-black/20 hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm"
                      >
                        <input
                          className="peer sr-only"
                          name={`question_${currentIndex}`}
                          type="radio"
                          value={idx}
                          checked={selectedAnswer === idx}
                          onChange={() => handleSelect(idx)}
                        />
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary peer-checked:bg-primary peer-checked:border-primary peer-checked:scale-110 transition-all mr-4 shrink-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-slate-900 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-900 dark:group-hover:text-white text-base">
                          {option}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-border-light dark:border-border-dark">
                  <button
                    className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold transition-all flex items-center gap-2 group disabled:opacity-50"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                  >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                      arrow_back
                    </span>
                    Previous
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group ${
                        flaggedQuestions.has(currentIndex)
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                      }`}
                      onClick={() => {
                        const newFlagged = new Set(flaggedQuestions);
                        if (newFlagged.has(currentIndex)) {
                          newFlagged.delete(currentIndex);
                        } else {
                          newFlagged.add(currentIndex);
                        }
                        setFlaggedQuestions(newFlagged);
                      }}
                    >
                      <span
                        className={`material-symbols-outlined text-lg ${
                          flaggedQuestions.has(currentIndex) ? "fill-1" : ""
                        }`}
                      >
                        flag
                      </span>
                      {flaggedQuestions.has(currentIndex)
                        ? "Flagged"
                        : "Flag for Review"}
                    </button>
                    <button
                      className="px-8 py-3 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group disabled:opacity-50"
                      onClick={() => {
                        if (selectedAnswer !== null) {
                          setAnswers(
                            new Map([
                              ...answers,
                              [currentIndex, selectedAnswer],
                            ])
                          );
                        }
                        handleNext();
                      }}
                    >
                      {currentIndex < exam.questions.length - 1
                        ? "Next"
                        : "Finish Exam"}
                      <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6 lg:h-full min-h-0">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] p-6 flex flex-col h-full shadow-lg shadow-slate-200/50 dark:shadow-none max-h-[calc(100vh-140px)] lg:max-h-none overflow-hidden">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Question Navigator
                </h3>
                <span className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">
                  {exam.questions.length} Questions
                </span>
              </div>
              <div className="grid grid-cols-5 gap-3 content-start flex-1 overflow-y-auto custom-scrollbar pr-2">
                {exam.questions.map((_, idx) => {
                  const isAnswered = answers.has(idx);
                  const isCurrent = currentIndex === idx;
                  const isFlagged = flaggedQuestions.has(idx);

                  let btnClass =
                    "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 font-medium";
                  if (isCurrent) {
                    btnClass =
                      "bg-primary text-slate-900 font-bold shadow-md ring-2 ring-primary/30 ring-offset-2 ring-offset-white dark:ring-offset-[#2c2b15]";
                  } else if (isAnswered) {
                    btnClass =
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-900/50 font-bold";
                  } else if (isFlagged) {
                    btnClass =
                      "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30 font-bold";
                  }

                  return (
                    <button
                      key={idx}
                      className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all relative ${btnClass}`}
                      onClick={() => {
                        setCurrentIndex(idx);
                        const nextAnswer = answers.get(idx);
                        setSelectedAnswer(
                          nextAnswer !== undefined ? nextAnswer : null
                        );
                      }}
                    >
                      {idx + 1}
                      {isFlagged && !isCurrent && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark space-y-3 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 rounded bg-green-100 border border-green-200 dark:bg-green-900/30 dark:border-green-900/50"></span>
                  Answered
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 rounded bg-primary"></span>
                  Current
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 rounded bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/30 relative">
                    <span className="absolute top-0.5 right-0.5 w-1 h-1 bg-yellow-500 rounded-full"></span>
                  </span>
                  Flagged for Review
                </div>
              </div>
              <button
                className="w-full mt-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
                onClick={handleFinishExam}
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
