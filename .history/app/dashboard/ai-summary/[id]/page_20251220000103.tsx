import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { SummaryActions } from "./summary-actions";

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { id } = await params;

  const summary = await db.summary.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!summary) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/ai-summary">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight line-clamp-1">
              {summary.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(summary.createdAt), "PPP p")}
            </div>
          </div>
        </div>

        <SummaryActions
          summaryId={summary.id}
          summaryText={summary.summaryText}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Source Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {summary.sourceText}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-primary/20 shadow-sm">
          <CardHeader className="bg-primary/5 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <MarkdownViewer content={summary.summaryText} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
