"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { GraduationCap, ArrowRight, Loader2, Sparkles, Plus } from "lucide-react";
import { ModelSelector, ModelType } from "@/components/model-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AIQuizPage() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [model, setModel] = useState<ModelType>("auto");
  const [loading, setLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count: 5, model }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setQuizQuestions(data.questions);
      setOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 container mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Quiz</h1>
          <p className="text-muted-foreground">
            Generate adaptive quizzes to test yourself.
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
            <Link href="/dashboard">
                <ArrowRight className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Quiz
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Generate Quiz</DialogTitle>
                        <DialogDescription>
                            Paste your study material below to generate a quiz.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Content</Label>
                            <Textarea 
                                placeholder="Paste content here..." 
                                className="h-[200px]"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                        <ModelSelector value={model} onValueChange={setModel} />
                        <Button onClick={handleGenerate} disabled={loading || !content} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>

      {quizQuestions.length > 0 ? (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center">
                <Sparkles className="mr-2 h-4 w-4 text-primary" /> Generated Quiz
            </h2>
            <div className="grid gap-6">
                {quizQuestions.map((q, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle className="text-base">
                                <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                                {q.question}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            {q.options.map((opt: string, idx: number) => (
                                <div 
                                    key={idx} 
                                    className={`p-3 rounded-md border text-sm ${
                                        idx === q.correctAnswer 
                                        ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300" 
                                        : "bg-muted/50"
                                    }`}
                                >
                                    <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                                </div>
                            ))}
                            <div className="mt-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                <span className="font-semibold">Explanation:</span> {q.explanation}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      ) : (
        <Card>
            <CardContent className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted p-12 text-center text-muted-foreground bg-muted/10 h-[400px]">
                <GraduationCap className="h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium text-lg">No quizzes generated yet</p>
                <p className="text-sm mt-2 max-w-sm">
                    Click "Create Quiz" to generate questions from your study materials using standard or advanced AI models.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
