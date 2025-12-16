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

    <div className="space-y-8">
      <div className="grid gap-2">
        <div className="grid gap-1.5">
          <Label htmlFor="title">Assignment Title</Label>
          <Input 
            id="title" 
            placeholder="e.g. Calculus Homework 1" 
            {...form.register("title")} 
          />
          {form.formState.errors.title && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        
        <div className="grid gap-1.5">
          <Label htmlFor="description">Instructions / Description (Optional)</Label>
          <Textarea 
            id="description"
            placeholder="Paste instructions or add specific questions here..." 
            className="min-h-[150px]"
            {...form.register("description")} 
          />
          <p className="text-sm text-muted-foreground">
            You can paste the text of your assignment here if you don&apos;t have a file.
          </p>
        </div>

        <div className="space-y-4">
            <Label>Attachments</Label>
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
                    <div className="p-4 rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, Image, PPTX (max 10MB)</p>
                    </div>
                    <Input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        id="file-upload"
                        onChange={onFileChange}
                        accept=".pdf,.pptx,image/*"
                    />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                        Select Files
                    </Button>
                </CardContent>
            </Card>

            {files.length > 0 && (
                <div className="grid gap-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                            <div className="flex items-center gap-2">
                                <FileIcon className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Assignment...
            </>
          ) : (
            "Create Assignment"
          )}
        </Button>
      </div>
    </div>
  );
}
