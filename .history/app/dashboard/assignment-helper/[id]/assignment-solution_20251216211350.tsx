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
import { Loader2, FileText, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export function AssignmentSolution({ initialAssignment }: { initialAssignment: Assignment }) {
    const router = useRouter();
    const [assignment, setAssignment] = useState<Assignment>(initialAssignment);
    const [isRetrying, setIsRetrying] = useState(false);

    const retrySolve = async () => {
        if (isRetrying) return;
        setIsRetrying(true);
        try {
            setAssignment((prev) => ({ ...prev, status: "processing", solution: null }));
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
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/assignment-helper">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{assignment.title}</h1>
                        <StatusBadge status={assignment.status} />
                    </div>
                    <p className="text-muted-foreground text-sm">Created on {new Date(assignment.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Instructions</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {assignment.description || "No specific instructions provided."}
                                </p>
                            </div>
                            
                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2">Files ({assignment.files.length})</h3>
                                {assignment.files.length > 0 ? (
                                    <div className="space-y-2">
                                        {assignment.files.map(file => (
                                            <a 
                                                key={file.id} 
                                                href={file.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted text-sm text-primary underline-offset-4 hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                <span className="truncate">{file.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No files attached.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="min-h-[500px]">
                        <CardHeader>
                            <CardTitle>Solution & Explanation</CardTitle>
                            <CardDescription>Generated by AI Assistant</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assignment.status === "processing" ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <h3 className="text-lg font-medium">Analyzing Assignment...</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        We are reviewing the files and instructions to generate a comprehensive solution. This may take a minute.
                                    </p>
                                </div>
                            ) : assignment.status === "error" ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center text-red-500">
                                    <AlertCircle className="h-10 w-10" />
                                    <h3 className="text-lg font-medium">Generation Failed</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        Something went wrong while processing your assignment. Please try again.
                                    </p>
                                    <Button variant="outline" onClick={retrySolve} disabled={isRetrying}>
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
                            ) : (
                                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm, remarkMath]}
                                        rehypePlugins={[rehypeKatex, rehypeHighlight]}
                                    >
                                        {assignment.solution || ""}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Done
      </Badge>
    );
  }
  if (status === "processing") {
    return (
      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        Processing
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
      <AlertCircle className="w-3 h-3 mr-1" />
      Error
    </Badge>
  );
}
