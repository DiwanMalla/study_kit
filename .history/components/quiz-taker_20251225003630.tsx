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
  CircleDot
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

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
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
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
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No quiz questions available.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/quiz">Back to Quiz List</Link>
        </Button>
      </div>
    );
  }

  if (quizComplete) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/quiz">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{quizTitle}</h1>
            <p className="text-muted-foreground">Results</p>
          </div>
        </div>

        <Card className="text-center">
          <CardContent className="py-12">
            <Trophy
              className={`h-16 w-16 mx-auto mb-4 ${
                percentage >= 70 ? "text-yellow-500" : "text-muted-foreground"
              }`}
            />
            <h2 className="text-4xl font-bold mb-2">{percentage}%</h2>
            <p className="text-xl text-muted-foreground mb-6">
              You got {score} out of {questions.length} correct
            </p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={resetQuiz}>
                Try Again
              </Button>
              <Button asChild>
                <Link href="/dashboard/quiz">Back to Quiz List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review Answers */}
        <Card>
          <CardHeader>
            <CardTitle>Review Your Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, idx) => {
              const userAnswer = answers.get(idx);
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={q.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-2">
                      <p className="font-medium">{q.question}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">
                          Your answer:{" "}
                        </span>
                        <span
                          className={
                            isCorrect ? "text-green-600" : "text-red-600"
                          }
                        >
                          {q.options[userAnswer!]}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Correct answer:{" "}
                          </span>
                          <span className="text-green-600">
                            {q.options[q.correctAnswer]}
                          </span>
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-sm text-muted-foreground">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/quiz">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{studyKitTitle}</h1>
          <p className="text-muted-foreground">{quizTitle}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let className = "w-full justify-start text-left h-auto py-4 px-4";

            if (showResult) {
              if (idx === currentQuestion.correctAnswer) {
                className +=
                  " bg-green-100 dark:bg-green-900 border-green-500 hover:bg-green-100";
              } else if (idx === selectedAnswer) {
                className +=
                  " bg-red-100 dark:bg-red-900 border-red-500 hover:bg-red-100";
              }
            } else if (idx === selectedAnswer) {
              className += " border-primary bg-primary/10";
            }

            return (
              <Button
                key={idx}
                variant="outline"
                className={className}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
              >
                <span className="mr-3 font-bold">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Explanation */}
      {showResult && currentQuestion.explanation && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm">
              <span className="font-medium">Explanation: </span>
              {currentQuestion.explanation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex justify-end gap-4">
        {!showResult ? (
          <Button onClick={handleSubmit} disabled={selectedAnswer === null}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex < questions.length - 1
              ? "Next Question"
              : "See Results"}
          </Button>
        )}
      </div>
    </div>
  );
}
