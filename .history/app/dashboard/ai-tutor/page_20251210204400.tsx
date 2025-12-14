import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AskAI } from "@/components/ask-ai";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export default function AITutorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-muted-foreground">
            One-to-one guidance for tough topics.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            Back to overview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AskAI />
        </div>
        <Card>
          <CardHeader className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>AI tutor tips</CardTitle>
              <p className="text-sm text-muted-foreground">
                Guide the chat to get better answers.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-lg bg-muted p-3">
              Start with context: share the topic, goal, and where you are stuck.
            </div>
            <div className="rounded-lg bg-muted p-3">
              Ask for explanations plus practice: “Explain the concept, then quiz me.”
            </div>
            <div className="rounded-lg bg-muted p-3">
              Provide constraints: “Keep it concise and give one example.”
            </div>
            <div className="rounded-lg bg-muted p-3">
              Coming soon: automatic grounding with your study kits.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
