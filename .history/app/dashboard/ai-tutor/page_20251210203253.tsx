import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Chat workspace</CardTitle>
            <p className="text-sm text-muted-foreground">
              Live AI tutoring experience coming soon.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
            <p className="font-medium">Interactive AI tutor is on the way.</p>
            <p className="text-sm">
              We are building a guided chat with context from your study kits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
