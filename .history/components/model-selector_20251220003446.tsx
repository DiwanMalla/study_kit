"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, BrainCircuit } from "lucide-react";

export type ModelType =
  | "auto"
  | "llama-3.1-8b-instant"
  | "llama-3.3-70b-versatile"
  | "meta-llama/llama-4-scout-17b-16e-instruct"
  | "meta-llama/llama-4-maverick-17b-128e-instruct"
  | "qwen/qwen3-32b"
  | "openai/gpt-oss-20b"
  | "openai/gpt-oss-120b"
  | "moonshotai/kimi-k2-instruct"
  | "moonshotai/kimi-k2-instruct-0905";

interface ModelSelectorProps {
  value: ModelType;
  onValueChange: (value: ModelType) => void;
  className?: string;
}

export function ModelSelector({ value, onValueChange, className }: ModelSelectorProps) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm font-medium">AI Model</Label>
      <Select value={value} onValueChange={(v) => onValueChange(v as ModelType)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Auto (Recommended)</span>
            </div>
          </SelectItem>
          <SelectItem value="llama-3.1-8b-instant">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span>Fast — Llama 3.1 8B Instant (Groq)</span>
            </div>
          </SelectItem>
          <SelectItem value="llama-3.3-70b-versatile">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>Balanced — Llama 3.3 70B Versatile (Groq)</span>
            </div>
          </SelectItem>
          <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>Reasoning — Llama 4 Scout (Groq)</span>
            </div>
          </SelectItem>
          <SelectItem value="meta-llama/llama-4-maverick-17b-128e-instruct">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>Best — Llama 4 Maverick (Groq)</span>
            </div>
          </SelectItem>
          <SelectItem value="qwen/qwen3-32b">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>Reasoning — Qwen3 32B (Groq)</span>
            </div>
          </SelectItem>
          <SelectItem value="openai/gpt-oss-120b">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>Reasoning — GPT OSS 120B (Groq)</span>
            </div>
          </SelectItem>
          <SelectItem value="moonshotai/kimi-k2-instruct-0905">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span>Long Context — Kimi K2 (Groq)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
        Choose 'Auto' for the best balance, or pick a specific Groq model.
      </p>
    </div>
  );
}
