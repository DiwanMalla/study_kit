"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

interface MarkdownMessageProps {
  content: string;
  role: "user" | "assistant";
}

export function MarkdownMessage({ content, role }: MarkdownMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-x-hidden [&_p]:my-4 [&_p]:leading-relaxed [&_li]:my-2 [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:mt-5 [&_h2]:mb-3 [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:my-4 [&_ol]:my-4 [&_pre]:my-4 [&_blockquote]:my-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeRaw]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            const isInline = !className;

            if (!isInline && match) {
              return (
                <div className="relative group my-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => handleCopyCode(codeString)}
                  >
                    {copiedCode === codeString ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="overflow-x-auto rounded-lg">
                    <code className={cn(className, "block p-4")} {...props}>
                      {children}
                    </code>
                  </div>
                </div>
              );
            }

            return (
              <code className={cn(className, "break-all")} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
