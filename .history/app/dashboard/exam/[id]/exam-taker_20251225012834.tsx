"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trophy,
  Timer,
  X,
  Brain,
  Flag,
  CircleDot,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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
    questions: ExamQuestion[];
  };
}

export function ExamTaker({ exam }: ExamTakerProps) {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [examComplete, setExamComplete] = useState(exam.score !== null);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Questions Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          This exam doesn't have any questions yet.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground font-bold px-8 py-6 rounded-xl"
        >
          <Link href="/dashboard/exam">Back to Exams</Link>
        </Button>
      </div>
    );
  }

  if (!hasStarted && !examComplete) {
    return (
      <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#1a190b] p-6 md:p-10 relative">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-primary/5 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-center relative z-10 py-10">
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
      <div className="max-w-4xl mx-auto w-full py-10 px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
            <Trophy
              className={`h-12 w-12 ${
                score >= 70 ? "text-yellow-500" : "text-slate-400"
              }`}
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">Exam Completed!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Here's how you performed in{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {exam.title}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-surface border-border rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Score
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white">
                {score}%
              </h3>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Correct
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white">
                {correctCount}/{exam.questions.length}
              </h3>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Time Spent
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white">
                {answers.size > 0
                  ? Math.floor((exam.duration * 60 - timeLeft) / 60)
                  : exam.duration}
                m
              </h3>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            asChild
            className="bg-primary text-primary-foreground font-bold px-8 py-6 rounded-xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Link href="/dashboard/exam">Back to Exams</Link>
          </Button>
        </div>

        {answers.size > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Review Answers</h2>
            {exam.questions.map((q, idx) => {
              const userAnswer = answers.get(idx);
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <Card
                  key={q.id}
                  className="bg-surface border-border rounded-2xl overflow-hidden shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 p-1 rounded-full ${
                          isCorrect
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                          {q.question}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div
                            className={`p-4 rounded-xl border ${
                              isCorrect
                                ? "border-green-200 bg-green-50/50 dark:bg-green-900/10"
                                : "border-red-200 bg-red-50/50 dark:bg-red-900/10"
                            }`}
                          >
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                            <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 dark:bg-green-900/10">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                                Correct Answer
                              </p>
                              <p className="font-bold text-green-700 dark:text-green-400">
                                {q.options[q.correctAnswer]}
                              </p>
                            </div>
                          )}
                        </div>
                        {q.explanation && (
                          <div className="mt-4 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Explanation:{" "}
                              </span>
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-10 relative flex flex-col">
      <header className="max-w-4xl mx-auto w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Exam Mode
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {exam.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-mono font-bold shadow-sm border border-red-100 dark:border-red-900/30">
            <Timer className="w-5 h-5" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface rounded-full transition-colors"
            onClick={() => router.push("/dashboard/exam")}
            title="Exit Exam"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full mb-8">
        <div className="flex justify-between items-end text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
          <span className="text-slate-900 dark:text-white">
            Question {currentIndex + 1}{" "}
            <span className="text-slate-400 font-normal">
              of {exam.questions.length}
            </span>
          </span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(249,245,6,0.5)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-sm flex-1 flex flex-col min-h-[400px]">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-100 dark:border-blue-900/30">
              <CircleDot className="w-3.5 h-3.5" />
              {currentQuestion.type === "true_false"
                ? "True / False"
                : currentQuestion.type === "fill_blanks"
                ? "Fill in the Blanks"
                : currentQuestion.type === "short_answer"
                ? "Short Answer"
                : "Multiple Choice"}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              10 Points
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-4 mb-10">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;

            let borderClass = "border-transparent";
            let bgClass = "bg-slate-50 dark:bg-black/20";
            let textClass = "text-slate-700 dark:text-slate-300";

            if (isSelected) {
              borderClass = "border-primary";
              bgClass = "bg-primary/5 dark:bg-primary/10";
              textClass = "text-slate-900 dark:text-white font-bold";
            }

            return (
              <label
                key={idx}
                className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 ${borderClass} ${bgClass} hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-black/30 cursor-pointer transition-all group shadow-sm`}
                onClick={() => handleSelect(idx)}
              >
                <div className="flex items-center justify-center shrink-0 mt-0.5">
                  <div
                    className={`w-6 h-6 rounded-full border-2 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-slate-300"
                    } transition-all flex items-center justify-center`}
                  >
                    {isSelected && (
                      <div className="w-3 h-3 rounded-full bg-primary-foreground"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <span
                    className={`text-lg ${textClass} group-hover:text-slate-900 dark:group-hover:text-white transition-colors`}
                  >
                    {option}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isSelected
                      ? "text-primary"
                      : "text-slate-300 dark:text-slate-600"
                  } group-hover:text-slate-400 px-2`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-auto pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Previous
          </button>
          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                flaggedQuestions.has(currentIndex)
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
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
              <Flag
                className={`w-5 h-5 ${
                  flaggedQuestions.has(currentIndex) ? "fill-current" : ""
                }`}
              />
              Review Later
            </button>
            <button
              className="flex-1 sm:flex-none px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              onClick={() => {
                if (selectedAnswer !== null) {
                  setAnswers(
                    new Map([...answers, [currentIndex, selectedAnswer]])
                  );
                }
                handleNext();
              }}
            >
              {currentIndex < exam.questions.length - 1
                ? "Next Question"
                : "Finish Exam"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
