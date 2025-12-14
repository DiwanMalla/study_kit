import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedAskAI } from "@/components/ask-ai";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export default function AITutorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
          <p className="text-muted-foreground">
            Advanced AI tutoring with conversation history and specialized modes.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">
            Back to overview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-4">
          <EnhancedAskAI />
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Enhanced Features</CardTitle>
            <p className="text-sm text-muted-foreground">
              New capabilities to supercharge your learning.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <strong>Conversation History:</strong> All your chats are automatically
            saved. Access past conversations anytime from the sidebar.
          </div>
          <div className="rounded-lg bg-muted p-3">
            <strong>Subject Modes:</strong> Choose from Mathematics, Science,
            Programming, and more for specialized tutoring.
          </div>
          <div className="rounded-lg bg-muted p-3">
            <strong>Learning Styles:</strong> Switch between Explain, Practice, and
            Quiz modes to match your learning needs.
          </div>
          <div className="rounded-lg bg-muted p-3">
            <strong>Rich Formatting:</strong> Code syntax highlighting, math
            equations (LaTeX), and markdown support for better explanations.
          </div>
          <div className="rounded-lg bg-muted p-3">
            <strong>Export Conversations:</strong> Download your study sessions as
            markdown files for offline review.
          </div>
          <div className="rounded-lg bg-muted p-3">
            <strong>Smart Search:</strong> Quickly find past conversations using the
            search bar in the sidebar.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
