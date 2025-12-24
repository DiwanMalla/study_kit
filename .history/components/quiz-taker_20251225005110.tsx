"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  type?: string;
}

interface QuizTakerProps {
  questions: QuizQuestion[];
  studyKitId: string;
  studyKitTitle: string;
  quizTitle: string;
}

export function QuizTaker({
  questions,
  studyKitId,
  studyKitTitle,
  quizTitle,
}: QuizTakerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (quizComplete) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

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
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextAnswer = answers.get(currentIndex + 1);
      setSelectedAnswer(nextAnswer !== undefined ? nextAnswer : null);
      setShowResult(nextAnswer !== undefined);
    } else {
      setQuizComplete(true);
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
      if (answer === questions[questionIndex].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Map());
    setShowResult(false);
    setQuizComplete(false);
    setTimeLeft(15 * 60);
    setFlaggedQuestions(new Set());
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <Brain className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Questions Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
          This quiz doesn't have any questions yet. Try another one or create
          some questions.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground font-bold px-8 py-6 rounded-xl"
        >
          <Link href="/dashboard/quiz">Back to Quiz List</Link>
        </Button>
      </div>
    );
  }

  if (quizComplete) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-4xl mx-auto w-full py-10 px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
            <Trophy
              className={`h-12 w-12 ${
                percentage >= 70 ? "text-yellow-500" : "text-slate-400"
              }`}
            />
          </div>
          <h1 className="text-4xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Here's how you performed in{" "}
            <span className="font-bold text-slate-900 dark:text-white">
              {quizTitle}
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
                {percentage}%
              </h3>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Correct
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white">
                {score}/{questions.length}
              </h3>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                Time Spent
              </p>
              <h3 className="text-5xl font-black text-slate-900 dark:text-white">
                {Math.floor((15 * 60 - timeLeft) / 60)}m
              </h3>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button
            variant="outline"
            onClick={resetQuiz}
            className="px-8 py-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Try Again
          </Button>
          <Button
            asChild
            className="bg-primary text-primary-foreground font-bold px-8 py-6 rounded-xl text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            <Link href="/dashboard/quiz">Back to Quiz List</Link>
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Review Answers</h2>
          {questions.map((q, idx) => {
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
                            {q.options[userAnswer!]}
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
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background p-6 md:p-10 relative flex flex-col">
      <header className="max-w-4xl mx-auto w-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {studyKitTitle}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {quizTitle}
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
            onClick={() => router.push("/dashboard/quiz")}
            title="Exit Quiz"
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
              of {questions.length}
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
              {currentQuestion.options.length === 2 &&
              currentQuestion.options.includes("True")
                ? "True / False"
                : currentQuestion.question.includes("____")
                ? "Fill in the Blanks"
                : currentQuestion.options.length === 1
                ? "Short Answer"
                : "Multiple Choice"}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-yellow-100 dark:border-yellow-900/30">
              5 Points
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
            {currentQuestion.question}
          </h2>
        </div>

        <div className="space-y-4 mb-10">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect =
              showResult && idx === currentQuestion.correctAnswer;
            const isWrong =
              showResult && isSelected && idx !== currentQuestion.correctAnswer;

            let borderClass = "border-transparent";
            let bgClass = "bg-slate-50 dark:bg-black/20";
            let textClass = "text-slate-700 dark:text-slate-300";

            if (isSelected && !showResult) {
              borderClass = "border-primary";
              bgClass = "bg-primary/5 dark:bg-primary/10";
              textClass = "text-slate-900 dark:text-white font-bold";
            } else if (isCorrect) {
              borderClass = "border-green-500";
              bgClass = "bg-green-50 dark:bg-green-900/20";
              textClass = "text-green-700 dark:text-green-400 font-bold";
            } else if (isWrong) {
              borderClass = "border-red-500";
              bgClass = "bg-red-50 dark:bg-red-900/20";
              textClass = "text-red-700 dark:text-red-400 font-bold";
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

        {showResult && currentQuestion.explanation && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-bold">Explanation: </span>
              {currentQuestion.explanation}
            </p>
          </div>
        )}

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
            {!showResult ? (
              <button
                className="flex-1 sm:flex-none px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
              >
                Submit Answer
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                className="flex-1 sm:flex-none px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 group"
                onClick={handleNext}
              >
                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "See Results"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
