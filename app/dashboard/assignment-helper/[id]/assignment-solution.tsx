"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/assignments/${assignment.id}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        router.push("/dashboard/assignment-helper");
      } else {
        setIsDeleting(false);
        setShowDeleteDialog(false);
        alert("Failed to delete assignment.");
      }
    } catch (e) {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      alert("Failed to delete assignment.");
    }
  };

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
      return { solution: "", explanation: "", references: "" };
    }

    const lines = raw.split("\n");
    const findHeadingIndex = (re: RegExp) =>
      lines.findIndex((l) => re.test(l.trim()));

    const solutionHeading = /^#{1,6}\s*(solution|answer)\b/i;
    const explanationHeading = /^#{1,6}\s*(explanation|reasoning)\b/i;
    const referencesHeading = /^#{1,6}\s*(references|sources|bibliography)\b/i;

    const solutionIdx = findHeadingIndex(solutionHeading);
    const explanationIdx = findHeadingIndex(explanationHeading);
    const referencesIdx = findHeadingIndex(referencesHeading);

    const stripFirstHeadingLine = (block: string, re: RegExp) => {
      const blockLines = block.split("\n");
      if (blockLines.length > 0 && re.test(blockLines[0]?.trim() || "")) {
        return blockLines.slice(1).join("\n").trim();
      }
      return block.trim();
    };

    // Collect all found sections with their indices
    const sections = [
      { id: "solution", idx: solutionIdx, re: solutionHeading },
      { id: "explanation", idx: explanationIdx, re: explanationHeading },
      { id: "references", idx: referencesIdx, re: referencesHeading },
    ]
      .filter((s) => s.idx !== -1)
      .sort((a, b) => a.idx - b.idx);

    const result: Record<string, string> = {
      solution: "",
      explanation: "",
      references: "",
    };

    if (sections.length === 0) {
      result.solution = raw;
      return result;
    }

    for (let i = 0; i < sections.length; i++) {
      const current = sections[i];
      const next = sections[i + 1];
      const block = lines
        .slice(current.idx, next ? next.idx : undefined)
        .join("\n");
      result[current.id] = stripFirstHeadingLine(block, current.re);
    }

    // If solution is empty but we have text before the first heading, use that as solution
    if (!result.solution && sections[0].idx > 0) {
      result.solution = lines.slice(0, sections[0].idx).join("\n").trim();
    }

    return result;
  };

  const { solution, explanation, references } = splitSolutionAndExplanation(
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
    <div className="w-full flex flex-col h-full space-y-8 py-6">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/assignment-helper"
            className="mt-1 w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors border border-border"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {assignment.title}
              </h1>
              <StatusBadge status={assignment.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  calendar_today
                </span>
                {formatCreatedAt(assignment.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">
                  school
                </span>
                Applied Science
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="destructive"
            className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 transition-all border-none shadow-sm shadow-red-500/20"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeleting}
          >
            <span className="material-symbols-outlined text-[18px]">
              delete
            </span>
            Delete Assignment
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        {/* Left Column: Side Panels */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Assignment Description */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm overflow-hidden relative group">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
              <span className="material-symbols-outlined text-primary text-[20px]">
                assignment
              </span>
              Assignment
            </h2>
            <div className="text-muted-foreground text-sm leading-relaxed mb-6">
              <p>{assignment.description || "No description provided."}</p>
            </div>
            {assignment.files.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Attached Files
                </p>
                <div className="flex flex-col gap-2">
                  {assignment.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/50 transition-all group/file"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          {file.name.toLowerCase().endsWith(".pdf")
                            ? "picture_as_pdf"
                            : "description"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate group-hover/file:text-primary transition-colors">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-muted-foreground opacity-0 group-hover/file:opacity-100 transition-opacity">
                        download
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Section (Placeholder) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
              <span className="material-symbols-outlined text-indigo-500 text-[20px]">
                code
              </span>
              Code Snippets
            </h2>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 mb-3">
                <span className="material-symbols-outlined">code_off</span>
              </div>
              <p className="text-xs text-muted-foreground italic font-medium">
                No code snippets available.
              </p>
            </div>
          </div>

          {/* References Section */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
              <span className="material-symbols-outlined text-blue-500 text-[20px]">
                bookmark
              </span>
              References
            </h2>
            {references ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                <MarkdownViewer content={references} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/40 mb-3">
                  <span className="material-symbols-outlined">
                    bookmark_border
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic font-medium">
                  No references available.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area: AI Solution */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {assignment.status === "processing" ? (
            <div className="bg-surface border border-border rounded-xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-3xl">
                  psychology
                </span>
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Generating Solution...
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI is currently analyzing your instructions and documents
                  to create a detailed answer. This usually takes less than a
                  minute.
                </p>
              </div>
            </div>
          ) : assignment.status === "error" ? (
            <div className="bg-surface border border-border rounded-xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl">
                  error
                </span>
              </div>
              <div className="max-w-md">
                <h3 className="text-xl font-bold mb-2 tracking-tight">
                  Generation Failed
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Something went wrong while generating your answer. This might
                  be due to complex instructions or large files.
                </p>
                <Button
                  variant="outline"
                  onClick={retrySolve}
                  disabled={isRetrying}
                  className="rounded-full px-8 py-6 font-bold uppercase tracking-wider text-xs"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-sm flex flex-col h-full min-h-[600px]">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md z-10 rounded-t-xl">
                <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                  <span className="material-symbols-outlined text-primary text-[24px]">
                    psychology
                  </span>
                  AI Solution
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-muted"
                    title="Copy to clipboard"
                    onClick={() => {
                      navigator.clipboard.writeText(assignment.solution || "");
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      content_copy
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-muted"
                    title="Regenerate"
                    onClick={retrySolve}
                    disabled={isRetrying}
                  >
                    <span
                      className={cn(
                        "material-symbols-outlined text-[20px]",
                        isRetrying && "animate-spin text-primary"
                      )}
                    >
                      refresh
                    </span>
                  </Button>
                </div>
              </div>

              <div className="p-8 md:p-10 flex-1">
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground">
                  {/* We split solution for the new design but here we just render them together or separated as before */}
                  <div className="mb-10">
                    <h4 className="text-foreground font-bold text-lg mb-4 uppercase tracking-tighter flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                      Final Answer
                    </h4>
                    <MarkdownViewer
                      content={(solution || assignment.solution || "").trim()}
                      className="text-base leading-relaxed bg-muted/20 p-6 rounded-2xl border border-border/50"
                    />
                  </div>

                  {explanation.trim() && (
                    <div className="mt-12 pt-12 border-t border-dashed border-border">
                      <h4 className="text-foreground font-bold text-lg mb-4 uppercase tracking-tighter flex items-center gap-2 text-indigo-500">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        Explanation & Reasoning
                      </h4>
                      <MarkdownViewer
                        content={explanation}
                        className="text-base leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Delete Assignment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">
                "{assignment.title}"
              </span>
              ? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="rounded-full px-6 py-6 font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full px-8 py-6 font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
            >
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold flex items-center gap-1 border border-green-500/20">
        <span className="material-symbols-outlined text-[14px]">
          check_circle
        </span>
        Done
      </span>
    );
  }
  if (status === "processing") {
    return (
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1 border border-primary/20">
        <span className="material-symbols-outlined text-[14px] animate-spin">
          refresh
        </span>
        Processing
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold flex items-center gap-1 border border-destructive/20">
      <span className="material-symbols-outlined text-[14px]">error</span>
      Error
    </span>
  );
}
