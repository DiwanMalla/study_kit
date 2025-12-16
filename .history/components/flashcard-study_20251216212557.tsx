"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, RotateCcw, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  studyKitId: string;
  studyKitTitle: string;
}

export function FlashcardStudy({
  flashcards,
  studyKitId,
  studyKitTitle,
}: FlashcardStudyProps) {
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
    goNext();
  };

  const reset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompleted(new Set());
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No flashcards available.</p>
        <Button className="mt-4" asChild>
          <Link href={`/study-kit/${studyKitId}`}>Back to Study Kit</Link>
        </Button>
      </div>
    );
  }

  const renderMarkdown = (content: string) => (
    <div className="prose prose-base md:prose-lg dark:prose-invert max-w-none text-left leading-relaxed [&_p]:my-3 [&_li]:my-1 [&_ul]:my-3 [&_ol]:my-3 [&_h1]:my-4 [&_h2]:my-4 [&_h3]:my-3 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_blockquote]:my-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/study-kit/${studyKitId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{studyKitTitle}</h1>
          <p className="text-muted-foreground">Flashcards</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span>{completed.size} completed</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <Card
        className={`min-h-[380px] cursor-pointer transition-all duration-300 ${
          showAnswer ? "bg-primary/5" : ""
        } ${completed.has(currentIndex) ? "border-green-500" : ""}`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <CardContent className="flex flex-col items-center justify-center min-h-[380px] p-8 md:p-10">
          <div className="w-full flex items-center justify-between gap-4 mb-6">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
            {showAnswer ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
            {showAnswer ? "Answer" : "Question"} • Click to flip
          </div>

            <div className="text-xs text-muted-foreground">
              {currentIndex + 1}/{flashcards.length}
            </div>
          </div>

          <div className="w-full">
            {showAnswer
              ? renderMarkdown(currentCard.answer)
              : renderMarkdown(currentCard.question)}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <Button
          variant="default"
          onClick={markCompleted}
          disabled={completed.has(currentIndex)}
        >
          {completed.has(currentIndex) ? "Completed ✓" : "Mark as Known"}
        </Button>

        <Button
          variant="outline"
          onClick={goNext}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Completion */}
      {completed.size === flashcards.length && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-500">
          <CardContent className="py-6 text-center">
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
              🎉 All cards completed!
            </h3>
            <p className="text-green-600 dark:text-green-400 mt-2">
              Great job! You&apos;ve reviewed all flashcards.
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <Button variant="outline" onClick={reset}>
                Study Again
              </Button>
              <Button asChild>
                <Link href={`/study-kit/${studyKitId}/quiz`}>Take Quiz</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
