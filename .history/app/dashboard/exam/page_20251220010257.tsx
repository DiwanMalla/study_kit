"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  Trophy, 
  Clock, 
  Target, 
  Zap,
  BookOpen,
  Calendar,
  AlertCircle,
  History as HistoryIcon
} from "lucide-react";
import { ModelSelector, ModelType } from "@/components/model-selector";
import { cn } from "@/lib/utils";

export default function ExamPrepPage() {
  const [content, setContent] = useState("");
  const [model, setModel] = useState<ModelType>("auto");
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState<"mock" | "guide">("mock");

  const handleGenerate = async () => {
    if (!content) return;
    setLoading(true);
    // Simulate generation or point to a future endpoint
    setTimeout(() => {
        setLoading(false);
        // We could redirect or show a preview
    }, 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10 flex flex-col gap-8 pb-32">
      <header className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-foreground text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Exam <span className="text-primary">Simulator</span>
            </h1>
            <p className="text-muted-foreground text-base">
              Generate full-length mock exams and comprehensive study guides from your materials.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Aspect: Tool Configuration */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="bg-surface border-border shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50 py-5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Prep Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-foreground">Select Mode</label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setExamType("mock")}
                        className={cn(
                            "flex flex-col gap-2 p-4 rounded-xl border-2 transition-all text-left",
                            examType === "mock" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                        )}
                    >
                        <Zap className={cn("w-5 h-5", examType === "mock" ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <p className="text-sm font-bold">Mock Exam</p>
                            <p className="text-[10px] text-muted-foreground">Full length, timed practice.</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => setExamType("guide")}
                        className={cn(
                            "flex flex-col gap-2 p-4 rounded-xl border-2 transition-all text-left",
                            examType === "guide" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
                        )}
                    >
                        <BookOpen className={cn("w-5 h-5", examType === "guide" ? "text-primary" : "text-muted-foreground")} />
                        <div>
                            <p className="text-sm font-bold">Study Guide</p>
                            <p className="text-[10px] text-muted-foreground">Key concepts & summaries.</p>
                        </div>
                    </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Paste Study Content</label>
                <Textarea 
                  placeholder="Paste your textbooks, notes, or previous exam questions..." 
                  className="min-h-[250px] bg-background border-border focus-visible:ring-primary/20 resize-none text-sm p-4 rounded-xl"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-foreground">Intelligence Engine</label>
                <ModelSelector value={model} onValueChange={setModel} />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !content} 
                className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:brightness-95 transition-all shadow-xl shadow-primary/20 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                    {examType === "mock" ? "Generate Mock Exam" : "Generate Study Guide"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Aspect: Preview/Dashboard */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Readiness Score Card */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 border-l-[6px] border-l-primary/50">
             <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                   <circle className="text-muted/20 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                   <circle className="text-primary stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset="251.2"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black italic">--%</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ready</span>
                </div>
             </div>
             <div className="flex flex-col gap-2 text-center md:text-left">
                <h3 className="text-xl font-black">Exam Readiness Score</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                   Upload your materials to calculate your current readiness. 
                   We analyze your comprehension levels across all generated mock sessions.
                </p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-bold border border-border">
                        <Calendar className="w-3 h-3" /> 0 Scheduled
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-[10px] font-bold border border-border">
                      <HistoryIcon className="w-3 h-3" /> No History
                    </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Clock className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-bold">Timed Environments</h4>
                   <p className="text-xs text-muted-foreground mt-1">Simulate real exam pressure with our countdown engine.</p>
                </div>
             </div>
             <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <Trophy className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-bold">Victory Path</h4>
                   <p className="text-xs text-muted-foreground mt-1">Step-by-step guides on how to improve your weak areas.</p>
                </div>
             </div>
          </div>

          {/* Empty State / Coming Soon Placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 p-12 text-center bg-muted/5">
             <AlertCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
             <h3 className="text-lg font-bold text-muted-foreground/50 italic">Waiting for Input</h3>
             <p className="text-xs text-muted-foreground/40 mt-1">Your exam preparation portal will activate once you provide study content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
