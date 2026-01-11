"use client";

import { useState, useTransition } from "react";
import { ModelConfig } from "@/lib/ai-models";
import { updateUserSettings } from "@/app/actions/settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelListProps {
  initialEnabledModels: string[];
  allModels: ModelConfig[];
}

export function ModelList({ initialEnabledModels, allModels }: ModelListProps) {
  const [activeTab, setActiveTab] = useState<"free" | "paid">("free");
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
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-surface border rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("free")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === "free"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Zap className="w-4 h-4" />
          FREE MODELS
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all",
            activeTab === "paid"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Lock className="w-4 h-4" />
          PAID MODELS
        </button>
      </div>

      {activeTab === "free" ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Groq Models
              </h3>
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              NVIDIA NIM Models
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          <div>
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              ModelScope Models
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <h3 className="font-bold text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              OpenRouter Models
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-surface/50 rounded-3xl border border-dashed border-border animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-surface border flex items-center justify-center mb-6 shadow-sm">
            <Lock className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold">Premium Models Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
            Higher-performance models like GPT-4, Claude 3, and dedicated
            endpoints will be available in the Ultimate plan.
          </p>
          <Badge
            variant="outline"
            className="mt-8 uppercase font-bold tracking-widest text-[10px] py-1"
          >
            Stay Tuned
          </Badge>
        </div>
      )}
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
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-transparent"
            >
              Free
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
