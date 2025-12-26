"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// Removed unused imports from @mui/icons-material and sonner
// import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft as ArrowLeftIcon,
  Zap as BoltIcon,
  Upload as CloudUploadIcon,
  Info as InfoIcon,
  Library as LibraryBooksIcon,
  Lightbulb as LightbulbIcon,
  Timer as TimerIcon,
  Sliders as TuneIcon,
  Sparkles as AutoAwesomeIcon,
  FileText as DescriptionIcon,
  ChevronUp as ExpandLessIcon,
  ChevronDown as ExpandMoreIcon,
  CheckSquare as CheckBoxIcon,
  ListRestart as RuleIcon,
  FilePen as EditNoteIcon,
  Check as CheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  model: z.string().default("llama-3.3-70b-versatile"), // Default to best open model
  difficulty: z.string().default("medium"),
  questionCount: z.number().min(5).max(100).default(20),
  duration: z.number().min(5).default(45),
  questionTypes: z
    .array(z.string())
    .min(1, "Select at least one question type"),
  sourceText: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      model: "llama-3.3-70b-versatile",
      difficulty: "medium",
      questionCount: 20,
      duration: 45,
      questionTypes: ["mcq"],
      sourceText: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (activeTab === "upload" && !file && !values.sourceText) {
      toast({
        title: "No content provided",
        description: "Please upload a file or paste text content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let content = values.sourceText || "";

      // If file upload (mock for now, ideally read file content or upload to blob)
      if (activeTab === "upload" && file) {
        // In a real app we'd upload specific file types.
        // For now let's assume we read text client side or upload to an endpoint that parses it.
        // I'll leave a placeholder for extraction logic, or just warn if empty.
        // Assuming we can pass raw text for now.
        // TODO: Implement file parsing
        toast({
          title: "File parsing not implemented",
          description: "Please use paste text for now.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // 1. Create Exam Shell
      const examRes = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          // subject: values.subject, // Removed as it's not in form schema
          model: values.model,
          difficulty: values.difficulty,
          duration: values.duration,
        }),
      });

      if (!examRes.ok) throw new Error("Failed to create exam");
      const exam = await examRes.json();

      // 2. Trigger Generation
      const generateRes = await fetch("/api/exams/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          content,
          count: values.questionCount,
          types: values.questionTypes, // Send all selected types
          model: values.model,
        }),
      });

      if (!generateRes.ok) throw new Error("Failed to generate questions");

      toast({
        title: "Exam Created!",
        description: "Your exam is ready.",
      });

      router.push(`/dashboard/exam`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchQuestionTypes = form.watch("questionTypes");
  const toggleQuestionType = (type: string) => {
    const current = new Set(watchQuestionTypes);
    if (current.has(type)) {
      if (current.size > 1) current.delete(type);
    } else {
      current.add(type);
    }
    form.setValue("questionTypes", Array.from(current));
  };

  return (
    <div className="w-full h-full bg-background overflow-y-auto p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto flex flex-col h-full">
        {/* Header */}
        <header className="flex flex-col gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Exam Prep
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Create New Exam
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Configure your exam settings, upload materials, and let AI
                generate the questions.
              </p>
            </div>
            <div className="hidden md:block">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-surface-dark text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-border-dark">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> AI
                Generator Ready
              </span>
            </div>
          </div>
        </header>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <DescriptionIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  General Information
                </h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Exam Title
                  </label>
                  <Input
                    {...form.register("title")}
                    className="w-full bg-transparent border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary rounded-xl h-12"
                    placeholder="e.g., Biology Final Review - Chapter 5"
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      AI Model
                    </label>
                    <Select
                      onValueChange={(val) => form.setValue("model", val)}
                      defaultValue={form.getValues("model")}
                    >
                      <SelectTrigger className="w-full bg-transparent border-slate-200 dark:border-slate-800 rounded-xl h-12">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="llama-3.1-8b-instant">
                          Llama 3.1 8b Instant
                        </SelectItem>
                        <SelectItem value="llama-3.3-70b-versatile">
                          Llama 3.3 70b Versatile
                        </SelectItem>
                        <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">
                          Llama 4 Scout 17b
                        </SelectItem>
                        <SelectItem value="meta-llama/llama-4-maverick-17b-128e-instruct">
                          Llama 4 Maverick 17b
                        </SelectItem>
                        <SelectItem value="qwen/qwen3-32b">
                          Qwen3 32b
                        </SelectItem>
                        <SelectItem value="openai/gpt-oss-20b">
                          GPT-OSS 20b
                        </SelectItem>
                        <SelectItem value="openai/gpt-oss-120b">
                          GPT-OSS 120b
                        </SelectItem>
                        <SelectItem value="moonshotai/kimi-k2-instruct">
                          Kimi K2 Instruct
                        </SelectItem>
                        <SelectItem value="moonshotai/kimi-k2-instruct-0905">
                          Kimi K2 Instruct 0905
                        </SelectItem>
                        <SelectItem value="groq/compound">
                          Groq Compound
                        </SelectItem>
                        <SelectItem value="groq/compound-mini">
                          Groq Compound Mini
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <InfoIcon className="w-3 h-3" />
                      Choose a model for your exam generation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <TuneIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Configuration
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Number of Questions
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      {...form.register("questionCount", {
                        valueAsNumber: true,
                      })}
                      className="w-full bg-transparent border-slate-200 dark:border-slate-800 rounded-xl h-12"
                      min={5}
                      max={100}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Duration (Minutes)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <TimerIcon className="w-4 h-4" />
                    </span>
                    <Input
                      type="number"
                      {...form.register("duration", { valueAsNumber: true })}
                      className="pl-10 w-full bg-transparent border-slate-200 dark:border-slate-800 rounded-xl h-12"
                      step={5}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Difficulty Level
                  </label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("difficulty", value)
                    }
                    defaultValue={form.getValues("difficulty")}
                  >
                    <SelectTrigger className="w-full bg-transparent border-slate-200 dark:border-slate-800 rounded-xl h-12">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Question Types
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "mcq", label: "Multiple Choice", icon: CheckBoxIcon },
                    { id: "true_false", label: "True / False", icon: RuleIcon },
                    {
                      id: "fill_blanks",
                      label: "Fill in Blanks",
                      icon: EditNoteIcon,
                    },
                    {
                      id: "short_answer",
                      label: "Short Answer",
                      icon: DescriptionIcon,
                    },
                  ].map((type) => {
                    const isSelected = watchQuestionTypes.includes(type.id);
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.id}
                        onClick={() => toggleQuestionType(type.id)}
                        className={`cursor-pointer p-4 rounded-2xl border transition-all h-full flex flex-col gap-2 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 hover:border-primary"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <Icon
                            className={`w-5 h-5 ${
                              isSelected ? "text-primary" : "text-slate-500"
                            }`}
                          />
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {isSelected && (
                              <CheckIcon className="w-3 h-3 text-slate-900" />
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          {type.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Source Material */}
            <div className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <LibraryBooksIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Source Material
                </h3>
              </div>

              <div className="flex gap-2 mb-6 border-b border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "upload"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Upload Files
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "text"
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {activeTab === "upload" ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-white/5 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group h-64">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-surface-dark shadow-sm flex items-center justify-center mb-4 text-slate-400 group-hover:text-primary transition-colors">
                    <CloudUploadIcon className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Click to upload or drag & drop
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Supports PDF, DOCX, and PPTX up to 10MB.
                  </p>
                  {/* Placeholder input since we don't have drag-drop logic fully implemented */}
                  <input type="file" className="hidden" />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      toast({
                        title: "Coming Soon",
                        description:
                          "File upload is WIP. Please use 'Paste Text' tab.",
                      })
                    }
                  >
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      {...form.register("sourceText")}
                      className="bg-transparent min-h-[256px] resize-y border-slate-200 dark:border-slate-800 rounded-xl"
                      placeholder="Paste your notes, article text, or study material here..."
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isRefining || !form.watch("sourceText")}
                        onClick={async () => {
                          const content = form.getValues("sourceText");
                          if (!content) return;

                          setIsRefining(true);
                          try {
                            const res = await fetch("/api/exams/refine", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                content,
                                model: form.getValues("model"),
                              }),
                            });

                            if (!res.ok) throw new Error("Refinement failed");

                            const data = await res.json();
                            form.setValue("sourceText", data.result);
                            toast({
                              title: "Text Refined",
                              description:
                                "Your notes have been enhanced by AI.",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description:
                                "Failed to refine text. Please try again.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsRefining(false);
                          }
                        }}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      >
                        {isRefining ? (
                          <>
                            <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
                            Refining...
                          </>
                        ) : (
                          <>
                            <AutoAwesomeIcon className="w-4 h-4 mr-2" />
                            Refine with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-right text-xs text-slate-400">
                    {form.watch("sourceText")?.length || 0} characters
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="bg-surface-light dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Exam Summary
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Questions
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {form.watch("questionCount")} Qs
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Duration
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {form.watch("duration")} mins
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Types
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                      {watchQuestionTypes
                        .map((t) =>
                          t === "mcq"
                            ? "Multiple Choice"
                            : t === "true_false"
                            ? "True/False"
                            : t === "fill_blanks"
                            ? "Fill in Blanks"
                            : "Short Answer"
                        )
                        .join(", ")}
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Model
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {form.watch("model").includes("70b")
                        ? "Advanced"
                        : "Fast"}
                    </span>
                  </li>
                  <li className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Est. Gen Time
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <BoltIcon className="w-3 h-3" /> ~15s
                    </span>
                  </li>
                </ul>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-primary text-slate-900 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:shadow-md transition-all flex items-center justify-center gap-2 mb-3"
                >
                  {isSubmitting ? (
                    "Generating..."
                  ) : (
                    <>
                      <AutoAwesomeIcon className="w-5 h-5" />
                      Create Exam
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-slate-400">
                  Usually takes less than a minute.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-3xl p-6">
                <div className="flex items-start gap-3">
                  <LightbulbIcon className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Uploading focused notes yields better results than entire
                      textbooks. Try to limit content to specific chapters.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
