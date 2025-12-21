"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Check, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface SummaryActionsProps {
  summaryId: string;
  summaryText: string;
}

export function SummaryActions({
  summaryId,
  summaryText,
}: SummaryActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/summary/${summaryId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast({
        title: "Deleted",
        description: "Summary deleted successfully",
      });

      router.push("/dashboard/ai-summary");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete summary",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast({
      description: "Summary copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCopy}
        className="flex-shrink-0 px-5 py-2.5 rounded-full bg-card border border-border hover:border-primary text-slate-700 dark:text-slate-200 font-medium shadow-sm flex items-center gap-2 transition-all hover:shadow-md active:scale-95 group"
      >
        {copied ? (
          <span className="material-symbols-outlined text-[20px] text-green-500">
            check
          </span>
        ) : (
          <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">
            content_copy
          </span>
        )}
        <span>{copied ? "Copied" : "Copy Summary"}</span>
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={isDeleting}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border hover:border-red-500 text-slate-500 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                delete
              </span>
            )}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight">
              Delete Summary?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
              This action cannot be undone. This will permanently delete this
              summary from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-full px-6 border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="rounded-full px-6 bg-red-500 hover:bg-red-600 text-white border-none"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
