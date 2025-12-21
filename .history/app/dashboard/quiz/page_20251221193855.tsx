"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

// Mock data - replace with actual data fetching
const mockQuizzes = [
  {
    id: "1",
    title: "Introduction to Behavioral Science",
    subject: "Psychology",
    questionCount: 25,
    icon: "psychology",
    color: "blue",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "Calculus I: Derivatives & Limits",
    subject: "Math",
    questionCount: 15,
    icon: "functions",
    color: "green",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "European History: 1900-1950",
    subject: "History",
    questionCount: 40,
    icon: "history_edu",
    color: "orange",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Data Structures: Trees & Graphs",
    subject: "Computer Science",
    questionCount: 20,
    icon: "terminal",
    color: "purple",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "5",
    title: "Cellular Respiration & Photosynthesis",
    subject: "Biology",
    questionCount: 30,
    icon: "biotech",
    color: "pink",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; badge: string }> = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
      badge: "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
    },
    orange: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      badge: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
    },
    pink: {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400",
      badge: "bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400",
    },
  };
  return colors[color] || colors.blue;
};

const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
};

export default function QuizPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All Subjects");
  const [sortOrder, setSortOrder] = useState("Newest First");

  return (
    <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto flex flex-col h-full">
      <header className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-3xl md:text-4xl font-black leading-tight tracking-tight">
              AI Quiz <span className="text-primary">Studio</span>
            </h1>
            <p className="text-muted-foreground text-base">
              Generate adaptive quizzes from your materials and test your knowledge.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Generation Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="bg-surface border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50 py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Configure Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Content Source</label>
                <Textarea 
                  placeholder="Paste your text, lecture notes, or specific topics here..." 
                  className="min-h-[200px] bg-background border-border focus-visible:ring-primary/20 resize-none text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">AI Model</label>
                <ModelSelector value={model} onValueChange={setModel} />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !content} 
                className="w-full h-11 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-95 transition-all shadow-lg shadow-primary/20 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 group-hover:fill-current" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats/Info */}
          <div className="bg-surface rounded-2xl border border-border p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              How it works
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                "Input your study material",
                "Choose your preferred AI engine",
                "Answer the generated questions",
                "See instant explanations"
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Quiz Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {quizQuestions.length > 0 ? (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">live_help</span>
                  Practice Session
                </h2>
                {showResults && (
                   <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold border border-primary/20">
                     Score: {calculateScore()} / {quizQuestions.length}
                   </div>
                )}
              </div>

              <div className="flex flex-col gap-6">
                {quizQuestions.map((q, i) => (
                  <Card key={i} className="bg-surface border-border overflow-hidden shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/20">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-sm font-black text-primary/40 leading-none">0{i + 1}</span>
                        <CardTitle className="text-base font-bold flex-1 leading-snug">
                          {q.question}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col gap-3">
                      {q.options.map((opt: string, idx: number) => {
                        const isSelected = selectedAnswers[i] === idx;
                        const isCorrect = q.correctAnswer === idx;
                        const showCorrect = showResults && isCorrect;
                        const showWrong = showResults && isSelected && !isCorrect;

                        return (
                          <div 
                            key={idx} 
                            onClick={() => handleAnswerSelect(i, idx)}
                            className={cn(
                              "p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center group",
                              isSelected 
                                ? "border-primary bg-primary/5" 
                                : "border-border hover:border-border/80 hover:bg-muted/30",
                              showCorrect && "border-green-500 bg-green-500/10",
                              showWrong && "border-destructive bg-destructive/10",
                              showResults && "cursor-default"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors border",
                                isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border group-hover:bg-background"
                              )}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-sm font-medium">{opt}</span>
                            </div>
                            {showCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                          </div>
                        );
                      })}

                      {showResults && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                               <span className="material-symbols-outlined text-[16px]">info</span>
                               Explanation
                            </h4>
                            <p className="text-sm leading-relaxed text-foreground/80">{q.explanation}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!showResults ? (
                <Button 
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="w-full h-14 bg-foreground text-background font-black text-lg rounded-2xl hover:brightness-110 transition-all flex gap-2 items-center justify-center shadow-xl disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  Submit and Reveal Results
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setQuizQuestions([]);
                    setShowResults(false);
                    setSelectedAnswers({});
                  }}
                  variant="outline"
                  className="w-full h-14 border-2 border-border font-bold text-lg rounded-2xl hover:bg-muted transition-all"
                >
                  Clear and Start New Quiz
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-4 border-dashed border-border p-12 text-center bg-surface h-[500px] gap-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-4xl">quiz</span>
              </div>
              <div className="flex flex-col gap-2 max-w-sm">
                <h3 className="text-xl font-black text-foreground">Interactive Quiz Arena</h3>
                <p className="text-sm text-muted-foreground">
                  Paste your notes on the left to generate a personalized practice session. 
                  Our AI will craft 5 custom questions based on your specific material.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-2">
                 <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                    <History className="w-3 h-3" />
                    Results Saved
                 </div>
                 <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                    <Zap className="w-3 h-3" />
                    AI Powered
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
