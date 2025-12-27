import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Zap, BrainCircuit, Code, BookOpen, Settings } from "lucide-react";
import { AI_MODELS, ModelConfig, DEFAULT_MODEL_ID } from "@/lib/ai-models";

export type ModelType = string;

interface ModelSelectorProps {
  value: ModelType;
  onValueChange: (value: ModelType) => void;
  className?: string;
  enabledModels?: string[]; // Optional: if provided, only show these models
  excludeCategories?: string[]; // Optional: exclude specific categories (e.g., "image")
}

export function ModelSelector({
  value,
  onValueChange,
  className,
  enabledModels,
  hideLabel = false,
  hideDescription = false,
  excludeCategories = [],
}: ModelSelectorProps & { hideLabel?: boolean; hideDescription?: boolean; excludeCategories?: string[] }) {
  
  // Filter models
  const visibleModels = React.useMemo(() => {
    let models = AI_MODELS;
    
    if (enabledModels && enabledModels.length > 0) {
      models = models.filter((m) => enabledModels.includes(m.id));
    }

    if (excludeCategories && excludeCategories.length > 0) {
      models = models.filter((m) => !excludeCategories.includes(m.category));
    }

    return models;
  }, [enabledModels, excludeCategories]);

  const groqModels = visibleModels.filter((m) => m.provider === "Groq");
  const openRouterModels = visibleModels.filter((m) => m.provider === "OpenRouter");
  const modelScopeModels = visibleModels.filter((m) => m.provider === "ModelScope");
  const nvidiaModels = visibleModels.filter((m) => m.provider === "NVIDIA");

  // Helper to render icon based on category
  const getIcon = (category: ModelConfig["category"]) => {
    switch (category) {
      case "fast": return <Zap className="h-4 w-4 text-amber-500" />;
      case "best": return <BrainCircuit className="h-4 w-4 text-primary" />;
      case "coding": return <Code className="h-4 w-4 text-blue-500" />;
      case "long-context": return <BookOpen className="h-4 w-4 text-green-500" />;
      case "reasoning": return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      case "image": return <Sparkles className="h-4 w-4 text-pink-500" />;
      default: return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className={className}>
      {!hideLabel && <Label className="mb-2 block text-sm font-medium">AI Model</Label>}
      <Select
        value={value}
        onValueChange={(v) => onValueChange(v as ModelType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>

          {nvidiaModels.length > 0 && (
             <>
               <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                 NVIDIA NIM
               </div>
               {nvidiaModels.map((model) => (
                 <SelectItem key={model.id} value={model.id}>
                   <div className="flex items-center gap-2">
                     {getIcon(model.category)}
                     <span>{model.name}</span>
                   </div>
                 </SelectItem>
               ))}
             </>
          )}

          <SelectItem value="auto">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Auto (Recommended)</span>
            </div>
          </SelectItem>

          {modelScopeModels.length > 0 && (
             <>
               <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                 ModelScope (Image)
               </div>
               {modelScopeModels.map((model) => (
                 <SelectItem key={model.id} value={model.id}>
                   <div className="flex items-center gap-2">
                     {getIcon(model.category)}
                     <span>{model.name}</span>
                   </div>
                 </SelectItem>
               ))}
             </>
          )}

          {groqModels.length > 0 && (
             <>
               <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                 Groq (Fast & Free)
               </div>
               {groqModels.map((model) => (
                 <SelectItem key={model.id} value={model.id}>
                   <div className="flex items-center gap-2">
                     {getIcon(model.category)}
                     <span>{model.name}</span>
                   </div>
                 </SelectItem>
               ))}
             </>
          )}

          {openRouterModels.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                OpenRouter (Various)
              </div>
              {openRouterModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    {getIcon(model.category)}
                    <span>{model.name}</span>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
          
          <div className="pt-2 mt-2 border-t border-border">
             <a href="/dashboard/settings" className="flex items-center gap-2 px-2 py-1.5 text-sm text-primary hover:bg-accent rounded-sm cursor-pointer w-full">
                <Settings className="h-4 w-4" />
                <span>Manage Models</span>
             </a>
          </div>
        </SelectContent>
      </Select>
      {!hideDescription && (
        <p className="mt-1.5 text-[0.8rem] text-muted-foreground">
          Choose 'Auto' for the best balance, or pick a specific model.
        </p>
      )}
    </div>
  );
}

