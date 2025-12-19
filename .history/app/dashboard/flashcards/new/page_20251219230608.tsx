"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles, Zap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector, ModelType } from "@/components/model-selector";
import { useToast } from "@/hooks/use-toast";

export default function NewFlashcardsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [model, setModel] = useState<ModelType>("auto");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!content) return;

    setLoading(true);

    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count: 10, model }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();

      toast({
        title: "Flashcards Generated",
        description: "Your flashcard deck has been created successfully.",
      });

      router.push(`/study-kit/${data.studyKitId}/flashcards`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/flashcards">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Deck</h1>
          <p className="text-muted-foreground">
            Paste text to generate flashcards.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Input Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your study notes, article text, or any content here..."
            className="min-h-[300px] resize-y p-4 font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
            <div className="w-full sm:w-auto">
              <ModelSelector value={model} onValueChange={setModel} />
            </div>

            <Button
              className="w-full sm:w-auto min-w-[170px]"
              onClick={handleGenerate}
              disabled={loading || !content}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Deck
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
