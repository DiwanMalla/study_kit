"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ModelSelector } from "@/components/model-selector";
import { getUserSettings } from "@/app/actions/settings";

type QuizType = "mcq" | "true_false" | "fill_blanks" | "short_answer";
type Difficulty = "easy" | "medium" | "hard";
type ContentSource = "upload" | "paste";

const MODELS = [
  { id: "auto", name: "Auto (Recommended)" },
  { id: "llama-3.1-8b-instant", name: "Fast — Llama 3.1 8B" },
  { id: "llama-3.3-70b-versatile", name: "Balanced — Llama 3.3 70B" },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Reasoning — Llama 4 Scout",
  },
  {
    id: "meta-llama/llama-4-maverick-17b-128e-instruct",
    name: "Best — Llama 4 Maverick",
  },
  { id: "qwen/qwen3-32b", name: "Reasoning — Qwen3 32B" },
  { id: "or:mistralai/devstral-2-2512", name: "Devstral 2 (OpenRouter)" },
  {
    id: "or:kwaipilot/kat-coder-pro-v1",
    name: "KAT-Coder-Pro (OpenRouter)",
  },
  {
    id: "or:tngtech/deepseek-r1t2-chimera",
    name: "DeepSeek R1T2 (OpenRouter)",
  },
];

const SUBJECTS = [
  "Biology",
  "Chemistry",
  "Computer Science",
  "History",
  "Mathematics",
  "Psychology",
  "Literature",
];

export default function NewQuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [quizType, setQuizType] = useState<QuizType>("mcq");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [numQuestions, setNumQuestions] = useState(10);
  const [model, setModel] = useState("auto");
  const [source, setSource] = useState<ContentSource>("upload");
  const [textPreview, setTextPreview] = useState("");
  const [enabledModels, setEnabledModels] = useState<string[] | undefined>(undefined);
  
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserSettings().then((settings) => {
      if (settings?.enabledModels) {
        setEnabledModels(settings.enabledModels);
      }
    });
  }, []);
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUploadedFile({ id: data.id, name: data.name });
      toast({
        title: "File Uploaded",
        description: `${file.name} is ready for processing.`,
      });
    } catch {
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({ title: "Missing Title", description: "Please enter a quiz title.", variant: "destructive" });
      return;
    }
    if (!subject) {
      toast({ title: "Missing Subject", description: "Please select a subject.", variant: "destructive" });
      return;
    }

    if (source === "paste" && !textPreview.trim()) {
      toast({ title: "Missing Content", description: "Please paste some content.", variant: "destructive" });
      return;
    }

    if (source === "upload" && !uploadedFile) {
      toast({ title: "Missing File", description: "Please upload a file.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Logic for quiz generation would go here
      // For now, mirroring flashcard generation logic pattern
      const endpoint = source === "paste" ? "/api/quiz" : "/api/process-quiz";
      const body = source === "paste" 
        ? { content: textPreview, title, subject, type: quizType, difficulty, count: numQuestions, model }
        : { fileId: uploadedFile!.id, title, subject, type: quizType, difficulty, count: numQuestions, model };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Generation failed");
      }

      const data = await res.json();
      
      if (!data.id) {
        throw new Error("Failed to create quiz: No ID returned.");
      }

      toast({ title: "Quiz Generated", description: "Redirecting to your new quiz..." });
      router.push(`/dashboard/quiz/${data.id}`);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate quiz. Please try again.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10 relative">
      <div className="max-w-4xl mx-auto flex flex-col h-full pb-20">
        <header className="mb-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/dashboard/quiz" className="hover:text-foreground transition-colors">Quiz Library</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-medium text-foreground">New Quiz</span>
          </nav>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">Create New Quiz</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure the settings and upload your material to let AI generate a personalized quiz.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-8">
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Quiz Title</label>
                  <input 
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g., Biology Midterm Review"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Subject</label>
                  <select 
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="" disabled>Select a subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Quiz Type */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Quiz Type</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: "mcq", label: "Multiple Choice", icon: "checklist" },
                    { id: "true_false", label: "True / False", icon: "thumbs_up_down" },
                    { id: "fill_blanks", label: "Fill in Blanks", icon: "edit_square" },
                    { id: "short_answer", label: "Short Answer", icon: "short_text" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setQuizType(type.id as QuizType)}
                      className={cn(
                        "h-full p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-2 relative group",
                        quizType === type.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/10" 
                          : "border-border bg-background/30 hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-colors",
                        quizType === type.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                      )}>
                        <span className="material-symbols-outlined">{type.icon}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-bold transition-colors",
                        quizType === type.id ? "text-foreground" : "text-muted-foreground"
                      )}>{type.label}</span>
                      {quizType === type.id && (
                        <div className="absolute top-3 right-3 text-primary">
                          <span className="material-symbols-outlined text-lg filled" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Difficulty Level</label>
                  <div className="flex p-1 bg-background/50 border border-border rounded-xl">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                      <button 
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={cn(
                          "flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize",
                          difficulty === d ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        type="button"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">No. of Questions</label>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">{numQuestions}</span>
                  </div>
                  <div className="relative pt-2">
                    <input 
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                      max="50" min="5" step="5" 
                      type="range" 
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono">
                      <span>5</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">AI Model</label>
                  <ModelSelector
                    value={model}
                    onValueChange={setModel}
                    enabledModels={enabledModels}
                    hideLabel
                    excludeCategories={['image']}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Content Source */}
              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">menu_book</span> Content Source
                  </label>
                  <div className="flex bg-muted p-1 rounded-lg">
                    <button 
                      onClick={() => setSource("upload")}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-md transition-all",
                        source === "upload" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                      type="button"
                    >Upload File</button>
                    <button 
                      onClick={() => setSource("paste")}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        source === "paste" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      )}
                      type="button"
                    >Paste Text</button>
                  </div>
                </div>

                {source === "upload" ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-10 transition-all cursor-pointer group text-center"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={onFileInputChange}
                      accept=".pdf,.docx,.pptx"
                    />
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                      )}
                    </div>
                    {uploadedFile ? (
                      <div>
                        <h3 className="text-sm font-bold text-emerald-600 mb-1 flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-lg">check_circle</span>
                          {uploadedFile.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">File uploaded successfully. Ready to generate!</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-bold text-foreground mb-1">Click to upload or drag and drop</h3>
                        <p className="text-xs text-muted-foreground mb-4">PDF, DOCX, PPTX (Max 10MB)</p>
                        <button className="text-xs font-bold text-primary underline decoration-2 underline-offset-4 hover:text-primary/80" type="button">Browse files</button>
                      </>
                    )}
                  </div>
                ) : (
                  <textarea 
                    className="w-full min-h-[160px] bg-background/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono"
                    placeholder="Paste your lecture notes or study material here..."
                    value={textPreview}
                    onChange={(e) => setTextPreview(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-4 mt-2">
            <Link 
              href="/dashboard/quiz"
              className="w-full md:w-auto px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all text-center"
            >
              Cancel
            </Link>
            <button 
              disabled={loading || uploading}
              onClick={handleGenerate}
              className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
