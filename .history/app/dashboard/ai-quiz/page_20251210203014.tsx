import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function AIQuizPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Quiz</h1>
          <p className="text-muted-foreground">Generate adaptive quizzes to test yourself.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            Back to overview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Quiz builder</CardTitle>
            <p className="text-sm text-muted-foreground">Adaptive question generation. Coming soon.</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
            <p className="font-medium">Quiz generation is in development.</p>
            <p className="text-sm">You'll be able to create practice tests directly from your study kits.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
