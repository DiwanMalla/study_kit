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
    score?: number | null;
    questions: ExamQuestion[];
  };
}

export function ExamTaker({ exam }: ExamTakerProps) {
  const router = useRouter();
  const { toast } = useToast();
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

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, questionIndex) => {
      if (answer === exam.questions[questionIndex].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / exam.questions.length) * 100);
  };

  const handleFinishExam = async () => {
    setExamComplete(true);
    const score = calculateScore();

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
        <div className="max-w-[1600px] mx-auto h-full flex flex-col justify-center relative z-10 py-10">
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
                      {exam.subject || "General"}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">
                      Created today
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                    {exam.title}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl">
                    This mock exam covers the selected topics. Ensure you have
                    your materials ready before starting.
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
    const score =
      exam.score !== null && answers.size === 0 ? exam.score : calculateScore();
    const correctCount =
      answers.size > 0
        ? Array.from(answers.entries()).filter(
            ([idx, ans]) => ans === exam.questions[idx].correctAnswer
          ).length
        : Math.round((score / 100) * exam.questions.length);

    return (
      <main className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-8 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
              <span className="material-symbols-outlined text-5xl text-primary fill-1">
                trophy
              </span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Exam Completed!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Great job! Here's how you performed in{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {exam.title}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">
                Final Score
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums relative z-10">
                {score}%
              </h3>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">
                Correct Answers
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums relative z-10">
                {correctCount}/{exam.questions.length}
              </h3>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] p-8 text-center shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 relative z-10">
                Time Spent
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white tabular-nums relative z-10">
                {answers.size > 0
                  ? Math.floor((exam.duration * 60 - timeLeft) / 60)
                  : exam.duration}
                m
              </h3>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              className="px-10 py-4 bg-primary text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
              onClick={() => router.push("/dashboard/exam")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Back to Dashboard
            </button>
            <button
              className="px-10 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3"
              onClick={() => {
                setExamComplete(false);
                setCurrentIndex(0);
                setAnswers(new Map());
                setTimeLeft(exam.duration * 60);
                setHasStarted(false);
              }}
            >
              <span className="material-symbols-outlined">refresh</span>
              Retake Exam
            </button>
          </div>

          {answers.size > 0 && (
            <div className="space-y-8 max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Review Answers
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
              </div>

              {exam.questions.map((q, idx) => {
                const userAnswer = answers.get(idx);
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[2rem] p-8 shadow-lg shadow-slate-200/30 dark:shadow-none relative overflow-hidden"
                  >
                    <div className="flex items-start gap-6 relative z-10">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl fill-1">
                          {isCorrect ? "check_circle" : "cancel"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-slate-900 dark:text-white mb-6 leading-relaxed">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div
                            className={`p-5 rounded-2xl border ${
                              isCorrect
                                ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10"
                                : "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
                            }`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                              Your Answer
                            </p>
                            <p
                              className={`font-bold ${
                                isCorrect
                                  ? "text-green-700 dark:text-green-400"
                                  : "text-red-700 dark:text-red-400"
                              }`}
                            >
                              {userAnswer !== undefined
                                ? q.options[userAnswer]
                                : "No answer"}
                            </p>
                          </div>
                          {!isCorrect && (
                            <div className="p-5 rounded-2xl border border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                Correct Answer
                              </p>
                              <p className="font-bold text-green-700 dark:text-green-400">
                                {q.options[q.correctAnswer]}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#1a190b] p-6 md:p-8 relative">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
      <div className="max-w-7xl mx-auto h-full flex flex-col relative z-10">
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
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold text-sm mb-4 border border-slate-200 dark:border-white/10 shadow-sm">
                    {(currentIndex + 1).toString().padStart(2, "0")}
                  </span>
                  <h2 className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                  {currentQuestion.options.map((option, idx) => (
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
                  ))}
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
