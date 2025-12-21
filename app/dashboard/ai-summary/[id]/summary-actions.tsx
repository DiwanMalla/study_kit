"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
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
        <span className="material-symbols-outlined text-[20px] group-hover:text-primary transition-colors">
          {copied ? "check" : "content_copy"}
        </span>
        {copied ? "Copied!" : "Copy Summary"}
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={isDeleting}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-card border border-border hover:border-red-500 text-slate-500 hover:text-red-500 flex items-center justify-center transition-all hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Summary?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              summary from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
