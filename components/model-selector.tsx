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

export type ModelType = "auto" | "fast" | "best";

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
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Auto (Llama 3.3 70B)</span>
            </div>
          </SelectItem>
          <SelectItem value="fast">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Fast (Llama 3.1 8B)</span>
            </div>
          </SelectItem>
          <SelectItem value="best">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-blue-500" />
              <span>Best (Llama 3.3 70B)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
        Choose 'Auto' for the best balance or specify a model.
      </p>
    </div>
  );
}
