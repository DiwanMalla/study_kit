"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const router = useRouter();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    setStatus("Uploading file...");

    const formData = new FormData();
    formData.append("file", file);

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
        body: JSON.stringify({ fileId: uploadedFile.id }),
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
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
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
          ) : (
            <>
              <h3 className="text-lg font-semibold">Upload your study material</h3>
              <p className="text-sm text-muted-foreground">
                PDF, PPTX, or Images (max 10MB)
              </p>
            </>
          )}
        </div>
        {!status.includes("created") && (
          <div className="relative">
            <Button disabled={isLoading}>
              {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Select File"}
            </Button>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              onChange={handleUpload}
              accept=".pdf,.pptx,image/*"
              disabled={isLoading}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
