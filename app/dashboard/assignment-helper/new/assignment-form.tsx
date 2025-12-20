"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Check if Label exists
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

export function AssignmentForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.description) {
        formData.append("description", values.description);
      }
      
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/assignments", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create assignment");
      }

      const assignment = await response.json();

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });

      // Trigger AI processing in background (or separate call) if we want immediate start
      // For now, the backend marks it as 'processing' and we can just go to the view page.
      // We might want to trigger the solve endpoint explicitly if not done in create.
      // In my implementation of POST /api/assignments, I didn't trigger solve.
      // So I should trigger it here.
      
      try {
          await fetch(`/api/assignments/${assignment.id}/solve`, { method: "POST" });
      } catch (e) {
          console.error("Failed to trigger solve", e);
      }

      router.push(`/dashboard/assignment-helper/${assignment.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full flex flex-col h-full space-y-8 py-6">
      <header className="flex items-center justify-between gap-6 mb-2">
        <div className="flex items-center gap-5">
          <Link
            href="/dashboard/assignment-helper"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Assignment</h1>
            <p className="text-sm text-muted-foreground mt-1">Fill in the details below to get AI assistance</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-full text-muted-foreground hover:bg-muted font-medium text-sm transition-all"
          >
            Cancel
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <div className="mb-5">
              <Label className="block text-sm font-bold mb-2">Assignment Title</Label>
              <Input
                className="w-full bg-muted/30 border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Introduction to Thermodynamics"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-[10px] text-destructive mt-1 font-bold uppercase tracking-tight">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <Label className="block text-sm font-bold">Instructions</Label>
                <button 
                  type="button"
                  className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Optimize with AI
                </button>
              </div>
              <div className="border border-border rounded-xl overflow-hidden bg-muted/30 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <div className="flex items-center gap-1 p-2 border-b border-border bg-surface">
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Bold">
                    <span className="material-symbols-outlined text-[18px]">format_bold</span>
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Italic">
                    <span className="material-symbols-outlined text-[18px]">format_italic</span>
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Underline">
                    <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                  </button>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Bullet List">
                    <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                  </button>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Numbered List">
                    <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                  </button>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <button type="button" className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors" title="Link">
                    <span className="material-symbols-outlined text-[18px]">link</span>
                  </button>
                </div>
                <textarea
                  className="w-full h-48 p-4 bg-transparent border-none focus:ring-0 text-sm leading-relaxed resize-none"
                  placeholder="Type or paste your assignment instructions here..."
                  {...form.register("description")}
                ></textarea>
              </div>
            </div>

            <div>
              <Label className="block text-sm font-bold mb-2">Attached Files</Label>
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>
                <p className="text-sm font-bold">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, or Images (Max 10MB)</p>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={onFileChange}
                  accept=".pdf,.docx,.txt,image/*"
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border group">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          {file.name.toLowerCase().endsWith(".pdf") ? "picture_as_pdf" : "description"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm overflow-hidden relative">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              AI Configuration
            </h2>

            <div className="mb-6">
              <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Select Model
              </Label>
              <div className="space-y-3">
                <label className="relative flex items-start gap-3 p-3 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer transition-all">
                  <input type="radio" checked readOnly className="mt-1 accent-primary" />
                  <div>
                    <span className="block text-sm font-bold">Academic Pro</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      Best for detailed, cited solutions. Perfect for complex assignments.
                    </span>
                  </div>
                </label>
                <label className="relative flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-all opacity-60">
                  <input type="radio" disabled className="mt-1" />
                  <div>
                    <span className="block text-sm font-bold">Fast Solver</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5 leading-tight">
                      Quick answers for simple questions.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <Label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Subject
              </Label>
              <div className="relative">
                <select className="w-full bg-muted/30 border border-border rounded-xl p-3 text-sm font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>General</option>
                  <option>Physics</option>
                  <option selected>Chemistry</option>
                  <option>Biology</option>
                  <option>Mathematics</option>
                  <option>Computer Science</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xl">
                  unfold_more
                </span>
              </div>
            </div>

            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full py-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] border-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Create Assignment
                </>
              )}
            </Button>
          </div>

          <div className="bg-primary/10 rounded-xl p-4 border border-primary/20 flex gap-3">
            <span className="material-symbols-outlined text-primary shrink-0">info</span>
            <p className="text-[11px] text-foreground leading-relaxed">
              <span className="font-bold">Pro Tip:</span> Uploading the grading rubric along with the instructions helps the AI generate a more accurate solution tailored to your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
