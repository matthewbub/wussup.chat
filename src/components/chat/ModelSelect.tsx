"use client";

import * as React from "react";
import { ChevronDown, Info, Image, Sparkles, Zap, FlaskRoundIcon as Flask } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { openAiModels, anthropicModels, xaiModels, geminiModels } from "@/constants/models";

interface ModelOption {
  name: string;
  provider: "openai" | "anthropic" | "xai" | "google";
  features: ("image" | "fast" | "experimental" | "brain")[];
  disabled?: boolean;
}

interface ModelGroup {
  title: string;
  description?: string;
  models: ModelOption[];
}

interface ModelSelectorProps {
  onModelSelect: (model: string, provider: "openai" | "anthropic" | "xai" | "google") => void;
  selectedModel: string;
}

const transformModels = (models: any[], provider: "openai" | "anthropic" | "xai" | "google"): ModelOption[] => {
  return models.map((model) => ({
    name: model.model,
    provider: provider,
    features: [
      ...(model.image_input ? ["image" as const] : []),
      ...(model.tool_usage ? ["brain" as const] : []),
      ...(model.tool_streaming ? ["fast" as const] : []),
      ...(model.model.includes("preview") || model.model.includes("exp") ? ["experimental" as const] : []),
    ],
    disabled: false,
  }));
};

const modelGroups: ModelGroup[] = [
  {
    title: "OpenAI Models",
    // description: "",
    models: transformModels(openAiModels, "openai"),
  },
  {
    title: "Anthropic Models",
    // description: "",
    models: transformModels(anthropicModels, "anthropic"),
  },
  {
    title: "xAI Models",
    // description: "",
    models: transformModels(xaiModels, "xai"),
  },
  {
    title: "Google Models",
    // description: "",
    models: transformModels(geminiModels, "google"),
  },
];

export default function ModelSelector({ onModelSelect, selectedModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState<string[]>(["OpenAI Models"]);

  const handleModelSelect = (
    modelName: string,
    provider: "openai" | "anthropic" | "xai" | "google",
    disabled: boolean = false
  ) => {
    if (disabled) return;
    onModelSelect(modelName, provider);
    setIsOpen(false);
  };

  const selectedModelDisplay = selectedModel || "Select a model";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative w-full max-w-md">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between items-center">
          <div className="font-medium">{selectedModelDisplay}</div>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-zinc-700 rounded-md shadow-lg z-50">
        <div className="p-4 bg-zinc-800/50 border-b border-zinc-700">
          <h2 className="text-lg font-medium mb-1">Unlock all models + higher rate limits with Pro</h2>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-pink-400 text-2xl font-semibold">$8</span>
            <span className="text-zinc-400">/month</span>
          </div>
          <Button variant="link" className="text-zinc-400 hover:text-zinc-300 p-0 h-auto font-normal">
            Upgrade now
          </Button>
        </div>

        <div className="p-2 max-h-[60vh] overflow-y-auto">
          {modelGroups.map((group) => (
            <Collapsible
              key={group.title}
              open={openSections.includes(group.title)}
              onOpenChange={() =>
                setOpenSections((current) =>
                  current.includes(group.title) ? current.filter((t) => t !== group.title) : [...current, group.title]
                )
              }
              className="mb-2"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto hover:bg-zinc-800 font-medium rounded-md"
                >
                  <div className="text-left">
                    <div>{group.title}</div>
                    {group.description && <div className="text-sm text-zinc-400">{group.description}</div>}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200",
                      openSections.includes(group.title) ? "rotate-180" : ""
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 mt-1">
                {group.models.map((model) => (
                  <Button
                    key={model.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-between p-2 h-auto hover:bg-zinc-800 rounded-md",
                      selectedModel === model.name && "bg-zinc-800",
                      model.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleModelSelect(model.name, model.provider, model.disabled)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      <Info className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div className="flex gap-1">
                      {model.features.map((feature, index) => {
                        const FeatureIcon = {
                          image: Image,
                          fast: Sparkles,
                          experimental: Flask,
                          brain: () => <div className="h-4 w-4 text-purple-400">🧠</div>,
                          zap: Zap,
                        }[feature];
                        return (
                          <FeatureIcon
                            key={index}
                            className={cn("h-4 w-4", {
                              "text-blue-400": feature === "image",
                              "text-green-400": feature === "fast",
                              "text-amber-400": feature === "experimental",
                              "text-orange-400": feature === "brain",
                            })}
                          />
                        );
                      })}
                      {model.disabled && <span className="text-red-400 text-sm">Disabled</span>}
                    </div>
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
