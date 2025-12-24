"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

// Mock data for exams
const exams = [
  {
    id: 1,
    title: "Final Exam: Behavioral Science",
    subject: "Psychology",
    icon: Brain,
    color: "blue",
    status: "completed",
    score: 85,
    questions: 50,
    duration: 90,
    date: "2 days ago",
  },
  {
    id: 2,
    title: "Calculus Midterm Mock",
    subject: "Math",
    icon: FunctionSquare,
    color: "green",
    status: "not-started",
    questions: 30,
    duration: 120,
    date: "Created today",
  },
  {
    id: 3,
    title: "European History Practice",
    subject: "History",
    icon: BookOpen,
    color: "orange",
    status: "in-progress",
    progress: 45,
    questions: 40,
    duration: 60,
    date: "1 week ago",
  },
  {
    id: 4,
    title: "Data Structures Final",
    subject: "Computer Science",
    icon: Code,
    color: "purple",
    status: "not-started",
    questions: 60,
    duration: 180,
    date: "2 weeks ago",
  },
  {
    id: 5,
    title: "Cellular Bio Pop Quiz",
    subject: "Biology",
    icon: FlaskConical,
    color: "pink",
    status: "not-started",
    questions: 15,
    duration: 20,
    date: "1 month ago",
  },
];

export default function ExamPrepPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest First");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const { toast } = useToast();

  const getColorClasses = (color: string) => {
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
          <Button
            className="px-6 py-3 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5" />
            Create New Exam
          </Button>
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
              78%
            </h3>
          </div>
          <div className="ml-auto flex items-center text-green-600 text-xs font-bold bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-0.5" /> +5%
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
              12
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
              24h 30m
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
      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Create New Exam</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" htmlFor="exam-title">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="exam-title"
                placeholder="Enter exam title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div className="flex gap-4 justify-end mt-8">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!newTitle.trim()) {
                    toast({
                      title: "Title must be entered",
                      description: "Please enter a title for the exam.",
                      variant: "destructive",
                    });
                    return;
                  }
                  // Add exam creation logic here
                  setShowCreateModal(false);
                  setNewTitle("");
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {exams.map((exam) => {
          const colors = getColorClasses(exam.color);
          const Icon = exam.icon;

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
                  {exam.subject}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {exam.title}
                </h3>
                {exam.status === "in-progress" && (
                  <>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${exam.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-right">
                      {exam.progress}% Completed
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-6 mt-auto">
                <span className="flex items-center gap-1">
                  <ListOrdered className="w-4 h-4" /> {exam.questions} Qs
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {exam.duration}m
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {exam.date}
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

              {exam.status === "not-started" && (
                <Button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
                  Start Exam <Play className="w-4 h-4" />
                </Button>
              )}

              {exam.status === "in-progress" && (
                <Button className="w-full py-3 rounded-xl bg-primary text-slate-900 font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
                  Continue <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })}

        {/* Create New Card */}
        <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-surface-light dark:hover:bg-surface-dark transition-all cursor-pointer group min-h-[250px]">
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
        </div>
      </div>
    </div>
  );
}
