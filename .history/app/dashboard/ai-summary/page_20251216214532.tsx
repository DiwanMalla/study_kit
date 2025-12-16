"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { FileText, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { ModelSelector, ModelType } from "@/components/model-selector";
import { MarkdownViewer } from "@/components/markdown-viewer";

export default function AISummaryPage() {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelType>("auto");

  const handleGenerate = async () => {
    if (!content) return;

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, model }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 container mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Summary</h1>
          <p className="text-muted-foreground">
            Generate concise summaries from your materials.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Back to overview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Input Content
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <Textarea 
                    placeholder="Paste your study notes or text here..." 
                    className="flex-1 resize-none p-4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <div className="space-y-4">
                    <ModelSelector value={model} onValueChange={setModel} />
                    <Button 
                        className="w-full" 
                        onClick={handleGenerate} 
                        disabled={loading || !content}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Summary...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Summary
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card className="md:h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle>Generated Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                {summary ? (
              <div className="rounded-lg border bg-muted/20 p-4 md:p-6">
                <div className="mx-auto max-w-2xl">
                  <MarkdownViewer
                    content={summary}
                    className="text-[15px] md:text-base leading-relaxed"
                  />
                </div>
              </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
                        <FileText className="h-12 w-12 mb-4 opacity-50" />
                        <p>Your summary will appear here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
