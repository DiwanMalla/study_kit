"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  TrendingUp,
  CheckCircle2,
  Timer,
  ListOrdered,
  Clock,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Play,
  RotateCcw,
  Brain,
  FunctionSquare,
  BookOpen,
  Code,
  FlaskConical,
  GraduationCap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Exam = {
    id: string;
    title: string;
    subject: string | null;
    status: string;
    score: number | null;
    difficulty: string;
    duration: number;
    createdAt: Date;
    questions: { id: string }[];
};

export function ExamList({ initialExams }: { initialExams: Exam[] }) {
  const [exams, setExams] = useState(initialExams);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/exams/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete exam");

      setExams(exams.filter((exam) => exam.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (exam.subject && exam.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
      if (sortBy === "Newest First") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "Oldest First") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return a.title.localeCompare(b.title);
  });

  const getColorClasses = (subject: string | null) => {
     // Start with default
     let color = "blue";
     const s = subject?.toLowerCase() || "";
     if (s.includes("math")) color = "green";
     if (s.includes("history")) color = "orange";
     if (s.includes("computer") || s.includes("code")) color = "purple";
     if (s.includes("bio")) color = "pink";

    const colors: Record<string, { bg: string; text: string; badge: string }> =
      {
        blue: {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          badge:
            "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400",
        },
        green: {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          badge:
            "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400",
        },
        orange: {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-600 dark:text-orange-400",
          badge:
            "bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400",
        },
        purple: {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-600 dark:text-purple-400",
          badge:
            "bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400",
        },
        pink: {
          bg: "bg-pink-100 dark:bg-pink-900/30",
          text: "text-pink-600 dark:text-pink-400",
          badge:
            "bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400",
        },
      };
    return colors[color] || colors.blue;
  };

  const getIcon = (subject: string | null) => {
      const s = subject?.toLowerCase() || "";
      if (s.includes("math")) return FunctionSquare;
      if (s.includes("history")) return BookOpen;
      if (s.includes("computer") || s.includes("code")) return Code;
      if (s.includes("bio")) return FlaskConical;
      if (s.includes("psych")) return Brain;
      return GraduationCap;
  }

  // Calculate stats
  const completed = exams.filter(e => e.status === "completed");
  const avgScore = completed.length > 0 
    ? Math.round(completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length) 
    : 0;
  const totalTime = completed.reduce((acc, curr) => acc + (curr.duration || 0), 0); // Mock duration accumulation

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Exam Preparation
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create study plans, take mock exams, and analyze your performance.
            </p>
          </div>
        </div>
        <div>
          <Link href="/dashboard/exam/new">
            <Button
                className="px-6 py-3 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Create New Exam
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Avg. Score
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {avgScore}%
            </h3>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Exams Done
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {completed.length}
            </h3>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Study Time
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.floor(totalTime / 60)}h {totalTime % 60}m
            </h3>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            className="pl-12 bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark rounded-xl h-12"
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredExams.map((exam) => {
          const colors = getColorClasses(exam.subject);
          const Icon = getIcon(exam.subject);
          const questionCount = exam.questions.length;

          return (
            <div
              key={exam.id}
              className={`bg-surface-light dark:bg-surface-dark border ${
                exam.status === "in-progress"
                  ? "border-2 border-primary/20"
                  : "border-border-light dark:border-border-dark"
              } rounded-3xl p-6 shadow-sm hover:border-primary transition-colors group relative flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  {exam.status === "completed" && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded dark:bg-green-900/30 dark:text-green-400">
                      Score: {exam.score}%
                    </span>
                  )}
                  {exam.status === "in-progress" && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                      In Progress
                    </span>
                  )}
                   {exam.status === "generating" && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded dark:bg-blue-900/30 dark:text-blue-400 animate-pulse">
                      Generating...
                    </span>
                  )}
                  <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {exam.status !== "completed" && (
                      <button
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span
                  className={`inline-block px-2 py-1 ${colors.badge} text-[10px] font-bold uppercase tracking-wider rounded-md mb-2`}
                >
                  {exam.subject || "General"}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {exam.title}
                </h3>
               
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6 mt-auto">
                <span className="flex items-center gap-1">
                  <ListOrdered className="w-4 h-4" /> {questionCount} Qs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {exam.duration}m
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true })}
                </span>
              </div>

              {exam.status === "completed" && (
                <Button
                  variant="outline"
                  className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Review Results <Eye className="w-4 h-4" />
                </Button>
              )}

              {(exam.status === "draft" || exam.status === "ready" || exam.status === "not-started") && (
                <Link href={`/dashboard/exam/${exam.id}`} className="w-full">
                    <Button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
                        Start Exam <Play className="w-4 h-4" />
                    </Button>
                </Link>
              )}

              {exam.status === "in-progress" && (
                <Link href={`/dashboard/exam/${exam.id}`} className="w-full">
                    <Button className="w-full py-3 rounded-xl bg-primary text-slate-900 font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
                    Continue <RotateCcw className="w-4 h-4" />
                    </Button>
                </Link>
              )}
            </div>
          );
        })}

        {/* Create New Card */}
        <Link 
            href="/dashboard/exam/new"
            className="border-2 border-dashed border-border-light dark:border-border-dark rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-surface-light dark:hover:bg-surface-dark transition-all cursor-pointer group min-h-[250px]"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors flex items-center justify-center mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Create New Mock Exam
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set up a custom exam with specific topics, duration, and question
            count.
          </p>
        </Link>
      </div>
    </div>
  );
}
