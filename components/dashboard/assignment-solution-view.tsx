"use client";

import { useState } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Copy,
  RefreshCw,
  Star,
  BookOpen,
  Lightbulb,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentSolutionViewProps {
  title: string;
  solution: string | null;
  status: string;
  modelUsed?: string | null;
  judgeScore?: number | null;
  wordDocUrl?: string | null;
  onCopy: () => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export function AssignmentSolutionView({
  title,
  solution,
  status,
  modelUsed,
  judgeScore,
  wordDocUrl,
  onCopy,
  onRegenerate,
  isRegenerating = false,
}: AssignmentSolutionViewProps) {
  const [activeSection, setActiveSection] = useState<
    "solution" | "explanation" | "references"
  >("solution");
  const [showFullSolution, setShowFullSolution] = useState(false);

  // Parse solution into sections
  const parseSolution = (text: string) => {
    const lines = text.split("\n");
    const sections: Record<string, string[]> = {
      solution: [],
      explanation: [],
      references: [],
    };

    let currentSection = "solution";
    let currentHeading = "";

    for (const line of lines) {
      const trimmed = line.trim();

      // Detect section headings
      if (trimmed.match(/^#{1,6}\s*(solution|answer)\b/i)) {
        currentSection = "solution";
        currentHeading = trimmed;
        continue;
      } else if (trimmed.match(/^#{1,6}\s*(explanation|reasoning)\b/i)) {
        currentSection = "explanation";
        currentHeading = trimmed;
        continue;
      } else if (
        trimmed.match(/^#{1,6}\s*(references|sources|bibliography)\b/i)
      ) {
        currentSection = "references";
        currentHeading = trimmed;
        continue;
      }

      sections[currentSection].push(line);
    }

    return {
      solution: sections.solution.join("\n").trim(),
      explanation: sections.explanation.join("\n").trim(),
      references: sections.references.join("\n").trim(),
    };
  };

  const parsed = solution
    ? parseSolution(solution)
    : { solution: "", explanation: "", references: "" };

  const getQualityBadge = () => {
    if (judgeScore === null || judgeScore === undefined) return null;

    if (judgeScore >= 90) {
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
          <Award className="w-3 h-3 mr-1" />
          Excellent
        </Badge>
      );
    } else if (judgeScore >= 75) {
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
          <Star className="w-3 h-3 mr-1" />
          Good
        </Badge>
      );
    } else if (judgeScore >= 60) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
          <Lightbulb className="w-3 h-3 mr-1" />
          Satisfactory
        </Badge>
      );
    }
    return null;
  };

  if (status === "processing") {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Generating Your Solution...
            </h3>
            <p className="text-muted-foreground max-w-md">
              Our AI is analyzing your assignment and creating a comprehensive,
              submit-ready answer. This usually takes less than a minute.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="p-12 border-destructive/50">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileText className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Generation Failed</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Something went wrong while generating your solution. Please try
              again.
            </p>
            <Button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="rounded-full"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Solution Header Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-primary/5 to-transparent border-primary/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{title}</h2>
              {getQualityBadge()}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {modelUsed && (
                <span className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-medium">{modelUsed}</span>
                </span>
              )}
              {judgeScore !== null && judgeScore !== undefined && (
                <span className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Quality Score: {Math.round(judgeScore)}%
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wordDocUrl && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                asChild
              >
                <a
                  href={wordDocUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Word
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onCopy}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Regenerate
            </Button>
          </div>
        </div>
      </Card>

      {/* Section Tabs */}
      <Card className="p-2">
        <div className="flex gap-2">
          <Button
            variant={activeSection === "solution" ? "default" : "ghost"}
            size="sm"
            className="rounded-full flex-1"
            onClick={() => setActiveSection("solution")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Solution
          </Button>
          {parsed.explanation && (
            <Button
              variant={activeSection === "explanation" ? "default" : "ghost"}
              size="sm"
              className="rounded-full flex-1"
              onClick={() => setActiveSection("explanation")}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Explanation
            </Button>
          )}
          {parsed.references && (
            <Button
              variant={activeSection === "references" ? "default" : "ghost"}
              size="sm"
              className="rounded-full flex-1"
              onClick={() => setActiveSection("references")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              References
            </Button>
          )}
        </div>
      </Card>

      {/* Solution Content */}
      {activeSection === "solution" && (
        <Card className="p-8">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <MarkdownViewer content={parsed.solution} />
          </div>
        </Card>
      )}

      {/* Explanation Content */}
      {activeSection === "explanation" && parsed.explanation && (
        <Card className="p-8">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <MarkdownViewer content={parsed.explanation} />
          </div>
        </Card>
      )}

      {/* References Content */}
      {activeSection === "references" && parsed.references && (
        <Card className="p-8">
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <MarkdownViewer content={parsed.references} />
          </div>
        </Card>
      )}
    </div>
  );
}
