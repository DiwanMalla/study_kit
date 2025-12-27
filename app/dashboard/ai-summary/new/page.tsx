"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Sparkles,
  FileText,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type SummaryLength = "short" | "medium" | "long";

import { ModelSelector } from "@/components/model-selector";
import { getUserSettings } from "@/app/actions/settings";
import { useEffect } from "react";



export default function NewSummaryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [length, setLength] = useState<SummaryLength>("medium");
  const [model, setModel] = useState("auto");
  const [audience, setAudience] = useState("University Student");
  const [enabledModels, setEnabledModels] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    getUserSettings().then((settings) => {
      if (settings?.enabledModels) {
        setEnabledModels(settings.enabledModels);
      }
    });
  }, []);

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        description: `${file.name} is ready for summarization.`,
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!content.trim() && !uploadedFile) {
      toast({
        title: "Missing Content",
        description: "Please paste content or upload a file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/summaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceText: content,
          fileId: uploadedFile?.id,
          title: title.trim(),
          length,
          model,
          audience,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await res.json();
      toast({
        title: "Summary Generated",
        description: "Your summary has been created successfully.",
      });
      router.push(`/dashboard/ai-summary/${data.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate summary.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col h-full px-6 md:px-10 py-6 md:py-10">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-5">
          <Link
            href="/dashboard/ai-summary"
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group"
          >
            <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform text-[20px]">
              arrow_back
            </span>
          </Link>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              New Summary
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Create a concise AI-powered summary from your study materials.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 pb-32">
        {/* Left Column: Details & Configuration */}
        <div className="space-y-8">
          {/* Summary Details */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <span className="material-symbols-outlined">edit_document</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Summary Details
              </h2>
            </div>

            <div className="space-y-6">
              <div className="text-left">
                <Label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Title (Optional)
                </Label>
                <Input
                  className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-primary/20"
                  placeholder="e.g. Introduction to Organic Chemistry"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-left">
                  <Label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                    AI Model
                  </Label>
                  <div className="relative">
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
                <div className="text-left">
                  <Label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                    Audience
                  </Label>
                  <div className="relative">
                    <select
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-primary/20 appearance-none cursor-pointer shadow-sm pr-10"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                    >
                      <option value="University Student">
                        University Student
                      </option>
                      <option value="High School">High School</option>
                      <option value="General Audience">General Audience</option>
                      <option value="Expert">Expert</option>
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
          </div>

          {/* Length Selection */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm text-left">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined">straighten</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Summary Length
              </h2>
            </div>

            <div className="flex gap-3">
              {(["short", "medium", "long"] as SummaryLength[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLength(l)}
                  className={cn(
                    "flex-1 rounded-xl py-4 font-bold capitalize transition-all border flex flex-col items-center justify-center gap-1",
                    length === l
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/50 hover:text-primary"
                  )}
                >
                  <span className="text-sm">{l}</span>
                  <span
                    className={cn(
                      "text-[10px] font-normal",
                      length === l ? "text-white/80" : "text-slate-400"
                    )}
                  >
                    {l === "short" && "~150 words"}
                    {l === "medium" && "~300 words"}
                    {l === "long" && "~600 words"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Content Source */}
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-sm text-left flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <span className="material-symbols-outlined">description</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Source Material
              </h2>
            </div>

            <div className="space-y-6 flex-grow flex flex-col">
              <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <Label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                    Paste Text
                  </Label>
                  <span className="text-xs text-slate-400 font-medium">
                    Max 50k chars
                  </span>
                </div>
                <Textarea
                  className="w-full flex-grow min-h-[200px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-mono leading-relaxed resize-none focus:ring-primary/20"
                  placeholder="Paste your lecture notes or article text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={!!uploadedFile}
                />
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              <div>
                <Label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                  Upload Document
                </Label>

                {uploadedFile ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                          {uploadedFile.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                          <CheckCircle2 className="h-3 w-3" />
                          Ready to process
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all cursor-pointer hover:border-primary hover:bg-primary/5 group flex flex-col items-center justify-center text-center bg-white/50 dark:bg-slate-950/50",
                      uploading && "opacity-50 pointer-events-none"
                    )}
                  >
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg"
                    />
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      {uploading ? (
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {uploading ? "Uploading..." : "Click to upload"}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      PDF, PPTX, or Images. Max 25MB.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 px-4 md:px-0 z-50 pointer-events-none">
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 flex justify-end pointer-events-auto">
          <Button
            className="w-full md:w-auto min-w-[300px] h-16 bg-primary hover:bg-primary/90 text-white text-lg font-bold rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 border-none"
            onClick={handleGenerate}
            disabled={
              loading || uploading || (!content.trim() && !uploadedFile)
            }
          >
            {loading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
