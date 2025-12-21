"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ModelType } from "@/components/model-selector";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ActiveTab = "upload" | "paste";

const MODELS: Array<{ id: ModelType; name: string }> = [
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

export default function NewFlashcardsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>("upload");
  const [setTitle, setSetTitle] = useState("");
  const [language, setLanguage] = useState("English (US)");
  const [model, setModel] = useState<ModelType>("auto");

  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<
    { id: string; name: string } | null
  >(null);

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

  const onFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await handleFileUpload(file);
  };

  const handleGenerate = async () => {
    if (activeTab === "paste") {
      if (!content.trim()) {
        toast({
          title: "Missing Content",
          description: "Please paste some text to generate flashcards.",
          variant: "destructive",
        });
        return;
      }
    }

    if (activeTab === "upload") {
      if (!uploadedFile) {
        toast({
          title: "Missing File",
          description: "Please upload a document first.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === "paste") {
        const res = await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, count: 10, model }),
        });

        if (!res.ok) throw new Error("Failed to generate");

        const data = await res.json();

        toast({
          title: "Flashcards Generated",
          description: "Your flashcard deck has been created successfully.",
        });

        router.push(`/dashboard/flashcards/${data.studyKitId}`);
      } else {
        const res = await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId: uploadedFile!.id, model }),
        });

        if (!res.ok) throw new Error("Failed to process file");
        const data = await res.json();

        toast({
          title: "Study Set Created",
          description: "Your flashcards are ready.",
        });

        router.push(`/dashboard/flashcards/${data.studyKitId}`);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          activeTab === "upload"
            ? "Failed to create flashcards from file. Please try again."
            : "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col h-full px-6 md:px-10 py-6 md:py-10">
      <div className="max-w-4xl mx-auto flex flex-col h-full">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-start gap-5">
            <Link
              href="/dashboard/flashcards"
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-surface border border-border hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group"
            >
              <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Create New Flashcards
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Upload documents or paste text, and let our AI generate the
                perfect study set.
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-6 pb-20">
          {/* Set Details */}
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Set Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <Label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Set Title
                </Label>
                <Input
                  value={setTitle}
                  onChange={(e) => setSetTitle(e.target.value)}
                  placeholder="e.g. Biology - Chapter 5: Photosynthesis"
                  className="w-full bg-transparent border-border rounded-xl px-4 py-3 text-sm focus:ring-primary/20"
                />
              </div>

              <div className="col-span-1">
                <Label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Language
                </Label>
                <div className="relative">
                  <select
                    className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:ring-primary/20 appearance-none cursor-pointer dark:bg-slate-900 shadow-sm pr-10"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <Label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  AI Model
                </Label>
                <div className="relative">
                  <select
                    className="w-full bg-transparent border border-border rounded-xl px-4 py-3 text-sm focus:ring-primary/20 appearance-none cursor-pointer dark:bg-slate-900 shadow-sm pr-10"
                    value={model}
                    onChange={(e) => setModel(e.target.value as ModelType)}
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="flex border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "flex-1 py-4 text-center font-bold transition-colors border-b-2",
                  activeTab === "upload"
                    ? "text-slate-900 dark:text-white border-primary bg-primary/5"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                Upload Document
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={cn(
                  "flex-1 py-4 text-center font-bold transition-colors border-b-2",
                  activeTab === "paste"
                    ? "text-slate-900 dark:text-white border-primary bg-primary/5"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-200"
                )}
              >
                Paste Text
              </button>
            </div>

            <div className="p-6 md:p-10">
              {activeTab === "upload" ? (
                <div>
                  {uploadedFile ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined">
                            description
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[260px]">
                            {uploadedFile.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[16px]">
                              check_circle
                            </span>
                            Ready to process
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                        aria-label="Remove file"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          close
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onFileDrop}
                      className={cn(
                        "border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-black/20 group h-64 hover:border-primary hover:bg-primary/5",
                        (uploading || loading) && "opacity-50 pointer-events-none"
                      )}
                    >
                      <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={onFileInputChange}
                        accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg"
                      />

                      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {uploading ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl">
                            cloud_upload
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                        {uploading
                          ? "Uploading..."
                          : "Click to upload or drag and drop"}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                        Supports PDF, PPTX, DOCX (Max 25MB)
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="mt-6 px-4 py-2 bg-surface border border-border rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-accent transition-colors"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  className="min-h-[300px] bg-transparent border-border rounded-xl px-4 py-3 text-sm font-mono leading-relaxed resize-none focus:ring-primary/20"
                  placeholder="Paste your lecture notes, article text, or code snippets here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href="/dashboard/flashcards"
              className="px-6 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                loading ||
                uploading ||
                (activeTab === "paste" ? !content.trim() : !uploadedFile)
              }
              className={cn(
                "px-8 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2",
                "bg-primary text-primary-foreground shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md",
                (loading || uploading) && "opacity-60 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">
                    auto_awesome
                  </span>
                  Generate Flashcards
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
