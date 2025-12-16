"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";
import {
  Loader2,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface File {
  id: string;
  name: string;
  url: string;
  size: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  status: string;
  solution: string | null;
  createdAt: Date;
  files: File[];
}

export function AssignmentSolution({
  initialAssignment,
}: {
  initialAssignment: Assignment;
}) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment>(initialAssignment);
  const [isRetrying, setIsRetrying] = useState(false);

  const formatCreatedAt = (value: unknown) => {
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return "";
    // Deterministic formatting across server/client to avoid hydration mismatches.
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const splitSolutionAndExplanation = (text: string | null) => {
    const raw = (text || "").replace(/\r\n/g, "\n").trim();
    if (!raw) {
      return { solution: "", explanation: "" };
    }

    const lines = raw.split("\n");
    const findHeadingIndex = (re: RegExp) =>
      lines.findIndex((l) => re.test(l.trim()));

    const solutionHeading = /^#{1,6}\s*(solution|answer)\b/i;
    const explanationHeading = /^#{1,6}\s*(explanation|reasoning)\b/i;

    const solutionIdx = findHeadingIndex(solutionHeading);
    const explanationIdx = findHeadingIndex(explanationHeading);

    const stripFirstHeadingLine = (block: string, re: RegExp) => {
      const blockLines = block.split("\n");
      if (blockLines.length > 0 && re.test(blockLines[0]?.trim() || "")) {
        return blockLines.slice(1).join("\n").trim();
      }
      return block.trim();
    };

    // If we can find both headings, split by their order.
    if (solutionIdx !== -1 && explanationIdx !== -1) {
      const firstIdx = Math.min(solutionIdx, explanationIdx);
      const secondIdx = Math.max(solutionIdx, explanationIdx);
      const firstBlock = lines.slice(firstIdx, secondIdx).join("\n");
      const secondBlock = lines.slice(secondIdx).join("\n");

      if (solutionIdx < explanationIdx) {
        return {
          solution: stripFirstHeadingLine(firstBlock, solutionHeading),
          explanation: stripFirstHeadingLine(secondBlock, explanationHeading),
        };
      }

      // Rare case: Explanation appears before Solution
      return {
        solution: stripFirstHeadingLine(secondBlock, solutionHeading),
        explanation: stripFirstHeadingLine(firstBlock, explanationHeading),
      };
    }

    // If only one heading exists, do a best-effort split.
    if (solutionIdx !== -1) {
      const solutionBlock = lines.slice(solutionIdx).join("\n");
      return {
        solution: stripFirstHeadingLine(solutionBlock, solutionHeading),
        explanation: "",
      };
    }

    if (explanationIdx !== -1) {
      const before = lines.slice(0, explanationIdx).join("\n").trim();
      const explanationBlock = lines.slice(explanationIdx).join("\n");
      return {
        solution: before,
        explanation: stripFirstHeadingLine(
          explanationBlock,
          explanationHeading
        ),
      };
    }

    // Fallback: no recognizable headings
    return { solution: raw, explanation: "" };
  };

  const { solution, explanation } = splitSolutionAndExplanation(
    assignment.solution
  );

  const retrySolve = async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    try {
      setAssignment((prev) => ({
        ...prev,
        status: "processing",
        solution: null,
      }));
      const res = await fetch(`/api/assignments/${assignment.id}/solve`, {
        method: "POST",
      });
      if (!res.ok) {
        setAssignment((prev) => ({ ...prev, status: "error" }));
      }
    } catch (e) {
      console.error("Retry solve failed", e);
      setAssignment((prev) => ({ ...prev, status: "error" }));
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (assignment.status === "processing") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/assignments/${assignment.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status !== "processing") {
              setAssignment(data);
              router.refresh();
            }
          }
        } catch (error) {
          console.error("Error polling assignment status", error);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [assignment.status, assignment.id, router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/assignment-helper">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold leading-tight">
                {assignment.title}
              </h1>
              <StatusBadge status={assignment.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              Created on {formatCreatedAt(assignment.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
              <CardDescription>Instructions and attachments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Instructions</h3>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {assignment.description ||
                      "No specific instructions provided."}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Files ({assignment.files.length})
                </h3>
                {assignment.files.length > 0 ? (
                  <div className="space-y-2">
                    {assignment.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start gap-2 rounded-lg border p-3 hover:bg-muted/50"
                      >
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No files attached.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {assignment.status === "processing" ? (
            <Card>
              <CardHeader>
                <CardTitle>Generating</CardTitle>
                <CardDescription>
                  Reading your instructions and files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <h3 className="text-lg font-medium">
                    Analyzing Assignment...
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    We are reviewing everything to generate a full solution and
                    explanation. This may take a minute.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : assignment.status === "error" ? (
            <Card>
              <CardHeader>
                <CardTitle>Generation Failed</CardTitle>
                <CardDescription>
                  Something went wrong while generating your answer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                  <p className="text-sm text-muted-foreground max-w-md">
                    Try again — if it keeps failing, reduce file size or add
                    clearer instructions.
                  </p>
                  <Button
                    variant="outline"
                    onClick={retrySolve}
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      "Retry"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Solution</CardTitle>
                  <CardDescription>Final answer you can submit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed [&_pre]:overflow-x-auto">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex, rehypeHighlight]}
                    >
                      {(solution || assignment.solution || "").trim()}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Explanation</CardTitle>
                  <CardDescription>How the solution works</CardDescription>
                </CardHeader>
                <CardContent>
                  {explanation.trim() ? (
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none leading-relaxed [&_pre]:overflow-x-auto">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                      >
                        {explanation}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No separate explanation section was found in the AI
                      output.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <Badge
        variant="default"
        className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Done
      </Badge>
    );
  }
  if (status === "processing") {
    return (
      <Badge
        variant="secondary"
        className="bg-blue-500/10 text-blue-600 border-blue-500/20"
      >
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Processing
      </Badge>
    );
  }
  return (
    <Badge
      variant="destructive"
      className="bg-red-500/10 text-red-600 border-red-500/20"
    >
      <AlertCircle className="w-3 h-3 mr-1" />
      Error
    </Badge>
  );
}
