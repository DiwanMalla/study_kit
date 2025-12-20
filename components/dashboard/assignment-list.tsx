"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Paperclip,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FlaskConical,
  History,
  Calculator,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AssignmentDeleteButton } from "@/app/dashboard/assignment-helper/assignment-delete-button";

interface AssignmentWithFiles {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: Date;
  files: any[];
}

interface AssignmentListProps {
  initialAssignments: AssignmentWithFiles[];
}

export function AssignmentList({ initialAssignments }: AssignmentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  const filteredAssignments = useMemo(() => {
    return initialAssignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && assignment.status !== "completed") ||
        (filter === "completed" && assignment.status === "completed");

      return matchesSearch && matchesFilter;
    });
  }, [initialAssignments, searchQuery, filter]);

  const stats = useMemo(() => {
    const completed = initialAssignments.filter(
      (a) => a.status === "completed"
    ).length;
    const pending = initialAssignments.length - completed;
    return { completed, pending };
  }, [initialAssignments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "processing":
        return <Clock className="w-3.5 h-3.5" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-orange-400";
      default:
        return "bg-slate-400";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50";
      case "processing":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getSubjectIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("chem")) return <FlaskConical className="w-6 h-6" />;
    if (t.includes("hist")) return <History className="w-6 h-6" />;
    if (t.includes("math") || t.includes("calc"))
      return <Calculator className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const getSubjectColorClass = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("chem"))
      return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30";
    if (t.includes("hist"))
      return "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30";
    if (t.includes("math") || t.includes("calc"))
      return "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30";
    return "bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-900/30";
  };

  return (
    <div className="w-full flex flex-col h-full py-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Assignment Helper
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Organize your coursework, track deadlines, and get AI assistance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              className="pl-10 pr-4 py-2.5 rounded-full w-64 shadow-sm"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button asChild className="rounded-full font-bold shadow-md">
            <Link href="/dashboard/assignment-helper/new">
              <Plus className="mr-2 h-4 w-4" />
              New Assignment
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b pb-4">
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
              filter === "all"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
              filter === "pending"
                ? "bg-background shadow-sm text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
              filter === "completed"
                ? "bg-background shadow-sm text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Done
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
            {stats.completed} Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>{" "}
            {stats.pending} Pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 pb-20">
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No assignments found.</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-card border rounded-xl p-5 hover:border-primary/50 transition-all group cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div
                className={cn(
                  "absolute top-0 left-0 w-1 h-full",
                  getStatusColor(assignment.status)
                )}
              ></div>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3 pl-2">
                <Link
                  href={`/dashboard/assignment-helper/${assignment.id}`}
                  className="flex items-start gap-4 flex-1"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                      getSubjectIcon(assignment.title) &&
                        getSubjectColorClass(assignment.title)
                    )}
                  >
                    {getSubjectIcon(assignment.title)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {assignment.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-2 line-clamp-2">
                      {assignment.description || "No description provided."}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-3 shrink-0 pl-16 md:pl-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border",
                      getStatusBadgeClass(assignment.status)
                    )}
                  >
                    {getStatusIcon(assignment.status)}
                    <span className="capitalize">
                      {assignment.status === "processing"
                        ? "In Progress"
                        : assignment.status === "completed"
                        ? "Done"
                        : assignment.status}
                    </span>
                  </Badge>
                  <AssignmentDeleteButton assignmentId={assignment.id} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-xs text-muted-foreground pt-3 border-t pl-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">
                    {format(new Date(assignment.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  <span>
                    {assignment.files.length} file
                    {assignment.files.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic</span>
                </div>
                <Link
                  href={`/dashboard/assignment-helper/${assignment.id}`}
                  className="flex items-center gap-1.5 ml-auto text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Open Assignment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
