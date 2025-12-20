"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Zap,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type SummaryLength = "short" | "medium" | "long";

export default function NewSummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState<SummaryLength>("medium");
  const [wordCount, setWordCount] = useState(0);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    const count = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(count);
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({
        title: "Missing Content",
        description: "Please paste some content to summarize.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: content,
          title: title || "Untitled Summary",
          length,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await res.json();

      toast({
        title: "Summary Generated",
        description: "Your summary has been created successfully.",
      });

      router.push(`/dashboard/ai-summary/${data.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full pt-10">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/ai-summary">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Summary</h1>
          <p className="text-muted-foreground">
            Paste text to generate a concise summary.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Input Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium mb-2 block">
              Summary Title (Optional)
            </Label>
            <Input
              id="title"
              placeholder="Give your summary a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for auto-generated title
            </p>
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium mb-2 block">
              Content to Summarize
            </Label>
            <Textarea
              id="content"
              placeholder="Paste your study notes, article text, or any content here..."
              className="min-h-[300px] resize-y p-4 font-mono text-sm"
              value={content}
              onChange={handleContentChange}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {wordCount} words • ~{Math.ceil(wordCount / 200)} min read
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium block">
                Summary Length
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={length === "short" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLength("short")}
                  className="flex-1 rounded-xl"
                >
                  Short
                </Button>
                <Button
                  type="button"
                  variant={length === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLength("medium")}
                  className="flex-1 rounded-xl"
                >
                  Medium
                </Button>
                <Button
                  type="button"
                  variant={length === "long" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLength("long")}
                  className="flex-1 rounded-xl"
                >
                  Long
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {length === "short" && "Quick overview with key points"}
                {length === "medium" && "Balanced summary with main details"}
                {length === "long" &&
                  "Comprehensive summary with in-depth coverage"}
              </p>
            </div>

            <Button
              className="w-full py-6 rounded-xl font-bold transition-all shadow-sm"
              onClick={handleGenerate}
              disabled={loading || !content.trim()}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Summary with AI
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
