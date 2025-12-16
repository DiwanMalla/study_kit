"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Plus, Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModelSelector, ModelType } from "@/components/model-selector";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";

export default function FlashcardsPage() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [model, setModel] = useState<ModelType>("auto");
  const [loading, setLoading] = useState(false);

  type GeneratedCard = {
    question: string;
    answer: string;
  };

  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);

  const handleGenerate = async () => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count: 10, model }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setGeneratedCards(data.flashcards);
      setOpen(false); // Close dialog or keep open to show result?
      // For now let's just log or show in a separate view.
      // Ideally we should save these.
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flash Cards</h1>
          <p className="text-muted-foreground">
            Review and master your study material.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Deck
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Flashcards</DialogTitle>
              <DialogDescription>
                Paste your notes below to generate flashcards using AI.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Paste notes here..."
                  className="h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              <ModelSelector value={model} onValueChange={setModel} />
              <Button
                onClick={handleGenerate}
                disabled={loading || !content}
                className="w-full"
              >
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

      {generatedCards.length > 0 && (
        <div className="mb-8 p-6 border rounded-xl bg-muted/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Generated {generatedCards.length} Cards
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {generatedCards.map((card, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Card {i + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Question
                    </p>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed [&_p]:my-2 [&_pre]:overflow-x-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeHighlight]}
                        >
                          {String(card.question || "")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Answer
                    </p>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed [&_p]:my-2 [&_pre]:overflow-x-auto">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeHighlight]}
                        >
                          {String(card.answer || "")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards */}
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Biology Deck {i}
              </CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">20 Cards</div>
              <p className="text-xs text-muted-foreground">
                Last reviewed 2 days ago
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
