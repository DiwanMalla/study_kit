"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  studyKitId: string;
  studyKitTitle: string;
  backHref?: string;
}

export function FlashcardStudy({
  flashcards,
  studyKitId,
  studyKitTitle,
  backHref,
}: FlashcardStudyProps) {
  const resolvedBackHref = backHref || `/study-kit/${studyKitId}`;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const goNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const markCompleted = () => {
    setCompleted(new Set([...completed, currentIndex]));
    if (currentIndex < flashcards.length - 1) {
      goNext();
    } else {
      setShowAnswer(false);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(new Set());
  };

  const mastery = useMemo(() => {
    if (flashcards.length === 0) return { label: "", icon: "", iconClass: "" };

    const ratio = completed.size / flashcards.length;
    if (ratio >= 0.75) {
      return {
        label: "High Mastery",
        icon: "trending_up",
        iconClass: "text-emerald-500",
      };
    }
    if (ratio >= 0.4) {
      return {
        label: "Building Mastery",
        icon: "timeline",
        iconClass: "text-blue-500",
      };
    }
    return {
      label: "Getting Started",
      icon: "school",
      iconClass: "text-slate-400",
    };
  }, [completed.size, flashcards.length]);

  const handleGrade = (grade: "again" | "hard" | "good" | "easy") => {
    if (grade === "again") {
      if (currentIndex < flashcards.length - 1) {
        goNext();
      }
      setShowAnswer(false);
      return;
    }
    markCompleted();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setShowAnswer((prev) => !prev);
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }

      if (e.key === "1") {
        handleGrade("again");
        return;
      }
      if (e.key === "2") {
        handleGrade("hard");
        return;
      }
      if (e.key === "3") {
        handleGrade("good");
        return;
      }
      if (e.key === "4") {
        handleGrade("easy");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, flashcards.length]);

  if (flashcards.length === 0) {
    return (
      <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto flex flex-col h-full">
          <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Flashcard Review
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No flashcards available.
            </p>
            <Button className="mt-6" asChild>
              <Link href={resolvedBackHref}>Back</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10 relative flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full flex flex-col h-full">
        <header className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <Link
              href={resolvedBackHref}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-surface border border-border hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                <span className="uppercase tracking-wider text-[10px] font-bold">
                  {studyKitTitle}
                </span>
                <span>•</span>
                <span>{flashcards.length} Cards</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Flashcard Review
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full">
              <span
                className={`material-symbols-outlined ${mastery.iconClass} text-[18px]`}
              >
                {mastery.icon}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {mastery.label}
              </span>
            </div>
            <Button variant="outline" className="rounded-full" onClick={reset}>
              <span className="material-symbols-outlined text-[18px] mr-2">
                refresh
              </span>
              Reset
            </Button>
          </div>
        </header>

        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[400px]">
          <div className="relative w-full max-w-2xl">
            <div
              role="button"
              tabIndex={0}
              aria-label="Flip flashcard"
              onClick={() => setShowAnswer((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setShowAnswer((v) => !v);
              }}
              className="relative w-full h-[450px] cursor-pointer"
              style={{ perspective: "1000px" }}
            >
              <div
                className="absolute inset-0 transition-transform duration-700"
                style={{
                  transformStyle: "preserve-3d",
                  transform: showAnswer ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 w-full h-full bg-surface rounded-3xl border border-border shadow-sm p-8 md:p-12 flex flex-col items-center justify-center text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="absolute top-6 left-6 text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    Question
                  </div>
                  <div className="absolute top-6 right-6">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl">
                      help_outline
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                    {currentCard.question}
                  </h2>
                  <div className="absolute bottom-8 text-slate-400 dark:text-slate-500 text-sm flex items-center gap-2 animate-bounce">
                    <span>Click to flip</span>
                    <span className="material-symbols-outlined text-[16px]">
                      flip_camera_android
                    </span>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 w-full h-full bg-surface rounded-3xl border border-border shadow-sm p-8 md:p-12 flex flex-col items-center justify-center text-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="absolute top-6 left-6 text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    Answer
                  </div>
                  <div className="absolute top-6 right-6">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl">
                      check_circle
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                    {currentCard.answer}
                  </h2>
                  <div className="absolute bottom-8 text-slate-400 dark:text-slate-500 text-sm flex items-center gap-2">
                    <span>Space to flip</span>
                    <span className="material-symbols-outlined text-[16px]">
                      keyboard
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 xl:-translate-x-24 w-12 h-12 items-center justify-center rounded-full bg-surface border border-border text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-border"
              aria-label="Previous"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex === flashcards.length - 1}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 xl:translate-x-24 w-12 h-12 items-center justify-center rounded-full bg-surface border border-border text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm disabled:opacity-40 disabled:hover:text-slate-400 disabled:hover:border-border"
              aria-label="Next"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="mt-8 mb-6 h-24 flex items-center justify-center w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-4 gap-3 w-full">
              <div className="flex flex-col gap-1 group">
                <button
                  type="button"
                  onClick={() => handleGrade("again")}
                  className="h-14 rounded-xl border-2 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-300 transition-all flex items-center justify-center shadow-sm"
                >
                  Again
                </button>
                <span className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium group-hover:text-red-500 transition-colors">
                  &lt; 1 min
                </span>
              </div>
              <div className="flex flex-col gap-1 group">
                <button
                  type="button"
                  onClick={() => handleGrade("hard")}
                  className="h-14 rounded-xl border-2 border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 font-bold hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:border-orange-300 transition-all flex items-center justify-center shadow-sm"
                >
                  Hard
                </button>
                <span className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium group-hover:text-orange-500 transition-colors">
                  2 days
                </span>
              </div>
              <div className="flex flex-col gap-1 group">
                <button
                  type="button"
                  onClick={() => handleGrade("good")}
                  className="h-14 rounded-xl border-2 border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all flex items-center justify-center shadow-sm"
                >
                  Good
                </button>
                <span className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium group-hover:text-blue-500 transition-colors">
                  4 days
                </span>
              </div>
              <div className="flex flex-col gap-1 group">
                <button
                  type="button"
                  onClick={() => handleGrade("easy")}
                  className="h-14 rounded-xl border-2 border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 font-bold hover:bg-green-100 dark:hover:bg-green-900/20 hover:border-green-300 transition-all flex items-center justify-center shadow-sm"
                >
                  Easy
                </button>
                <span className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium group-hover:text-green-500 transition-colors">
                  7 days
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 text-sm text-slate-400 dark:text-slate-500 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface text-xs font-mono">
                1
              </span>
              <span>Again</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface text-xs font-mono">
                2
              </span>
              <span>Hard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface text-xs font-mono">
                3
              </span>
              <span>Good</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center rounded-md border border-border bg-surface text-xs font-mono">
                4
              </span>
              <span>Easy</span>
            </div>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block" />
            <div className="flex items-center gap-2">
              <span className="w-12 h-6 flex items-center justify-center rounded-md border border-border bg-surface text-xs font-mono">
                Space
              </span>
              <span>Show Answer</span>
            </div>
          </div>

          {completed.size === flashcards.length && (
            <div className="mt-10 w-full max-w-2xl">
              <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-8 text-center">
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  All cards completed!
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 mt-2">
                  Great job! You’ve reviewed all flashcards.
                </p>
                <div className="flex gap-4 justify-center mt-6 flex-wrap">
                  <Button variant="outline" onClick={reset}>
                    Study Again
                  </Button>
                  <Button asChild>
                    <Link href={`/study-kit/${studyKitId}/quiz`}>
                      Take Quiz
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
