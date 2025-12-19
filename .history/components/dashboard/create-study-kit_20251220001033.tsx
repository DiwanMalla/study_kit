"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  ChevronDown,
  Upload,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ModelSelector, ModelType } from "@/components/model-selector";

export function CreateStudyKit() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [model, setModel] = useState<ModelType>("auto");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus("");
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setStatus("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setStatus("Uploading file...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // Upload file
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const uploadedFile = await uploadRes.json();
      setIsUploading(false);
      setIsProcessing(true);
      setStatus("Processing with AI... This may take a moment.");

      // Process file to create study kit
      const processRes = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: uploadedFile.id, model }),
      });

      if (!processRes.ok) throw new Error("Processing failed");

      const result = await processRes.json();
      setStatus("Study kit created!");

      // Redirect to the study kit
      setTimeout(() => {
        router.push(`/study-kit/${result.studyKitId}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatus("Something went wrong. Please try again.");
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const isLoading = isUploading || isProcessing;

  return (
    <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-6 shadow-sm flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Create New Study Kit
          </h3>
          <p className="text-muted-foreground text-sm">
            Upload your lecture notes to generate flashcards, summaries, and
            quizzes.
          </p>
        </div>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
          New
        </span>
      </div>

      <div
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={cn(
          "group transition-all border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5",
          isLoading && "opacity-50 cursor-not-allowed",
          selectedFile && !isLoading && "border-primary/50 bg-primary/5"
        )}
      >
        <div className="p-4 bg-muted rounded-full">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : status.includes("created") ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <Upload className="h-8 w-8 text-primary" />
          )}
        </div>

        <div className="text-center">
          {status ? (
            <p className="text-sm font-medium">{status}</p>
          ) : selectedFile ? (
            <p className="text-sm font-medium text-primary">
              Selected: {selectedFile.name}
            </p>
          ) : (
            <>
              <h3 className="text-lg font-semibold">
                Upload your study material
              </h3>
              <p className="text-sm text-muted-foreground">
                PDF, PPTX, or Images (max 10MB)
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.pptx,image/*"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-muted-foreground mb-2 block ml-1">
            Select AI Model
          </label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isLoading}
              className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-sm focus:ring-primary focus:ring-2 text-foreground appearance-none disabled:opacity-50"
            >
              <option value="auto">Standard Model (Fast)</option>
              <option value="best">Deep Learning (Detailed)</option>
              <option value="fast">Exam Prep V2 (Beta)</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 text-muted-foreground pointer-events-none w-4 h-4" />
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !selectedFile}
          className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-full hover:brightness-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {isLoading ? "Generating..." : "Generate Kit"}
        </button>
      </div>
    </div>
  );
}
