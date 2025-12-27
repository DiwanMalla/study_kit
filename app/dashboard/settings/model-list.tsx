"use client";

import { useState, useTransition } from "react";
import { ModelConfig } from "@/lib/ai-models";
import { updateUserSettings } from "@/app/actions/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface ModelListProps {
  initialEnabledModels: string[];
  allModels: ModelConfig[];
}

export function ModelList({ initialEnabledModels, allModels }: ModelListProps) {
  const [enabledModels, setEnabledModels] = useState<string[]>(
    initialEnabledModels.length > 0
      ? initialEnabledModels
      : allModels.map((m) => m.id) // Default to all enabled if none saved
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = (modelId: string) => {
    const newEnabled = enabledModels.includes(modelId)
      ? enabledModels.filter((id) => id !== modelId)
      : [...enabledModels, modelId];

    setEnabledModels(newEnabled);

    startTransition(async () => {
      await updateUserSettings({ enabledModels: newEnabled });
    });
  };

  // Group models by provider
  const groqModels = allModels.filter((m) => m.provider === "Groq");
  const openRouterModels = allModels.filter((m) => m.provider === "OpenRouter");
  const modelScopeModels = allModels.filter((m) => m.provider === "ModelScope");
  const nvidiaModels = allModels.filter((m) => m.provider === "NVIDIA");

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Groq Models</h3>
          {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {groqModels.map((model) => (
            <ModelItem
              key={model.id}
              model={model}
              checked={enabledModels.includes(model.id)}
              onCheckedChange={() => handleToggle(model.id)}
              disabled={isPending}
            />
          ))}
        </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">NVIDIA NIM Models</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {nvidiaModels.map((model) => (
            <ModelItem
              key={model.id}
              model={model}
              checked={enabledModels.includes(model.id)}
              onCheckedChange={() => handleToggle(model.id)}
              disabled={isPending}
            />
          ))}
        </div>
      </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">ModelScope Models</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {modelScopeModels.map((model) => (
            <ModelItem
              key={model.id}
              model={model}
              checked={enabledModels.includes(model.id)}
              onCheckedChange={() => handleToggle(model.id)}
              disabled={isPending}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-4">OpenRouter Models</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {openRouterModels.map((model) => (
            <ModelItem
              key={model.id}
              model={model}
              checked={enabledModels.includes(model.id)}
              onCheckedChange={() => handleToggle(model.id)}
              disabled={isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelItem({
  model,
  checked,
  onCheckedChange,
  disabled,
}: {
  model: ModelConfig;
  checked: boolean;
  onCheckedChange: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-start space-x-3 rounded-lg border p-4 shadow-sm hover:bg-muted/50 transition-colors">
      <Checkbox
        id={model.id}
        // Use onChange for native checkbox wrapper if onCheckedChange is not supported
        // But better to normalize: The Checkbox component we saw IS native input.
        // So we should use onChange and prevent passing onCheckedChange to it.
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor={model.id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          {model.name}
        </label>
        {model.description && (
          <p className="text-xs text-muted-foreground">{model.description}</p>
        )}
        <div className="flex gap-2 mt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
            {model.category}
          </Badge>
          {model.isFree && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent">
              Free
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
