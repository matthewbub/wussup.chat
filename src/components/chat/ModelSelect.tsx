"use client";

import * as React from "react";
import { ChevronDown, Info, Image, Sparkles, Zap, FlaskRoundIcon as Flask } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface ModelOption {
  name: string;
  features: ("image" | "fast" | "experimental" | "brain")[];
  disabled?: boolean;
}

interface ModelGroup {
  title: string;
  description?: string;
  models: ModelOption[];
}

interface ModelSelectorProps {
  plan: "FREE" | "PRO" | "SUPERPRO";
}

const modelGroups: ModelGroup[] = [
  {
    title: "Standard Models",
    models: [
      { name: "GPT-4o-mini", features: ["image"] },
      { name: "GPT-4o", features: ["image"] },
      { name: "o3-mini", features: ["fast", "brain"] },
      { name: "Gemini 2.0 Flash", features: ["fast", "image"] },
    ],
  },
  {
    title: "Premium Models",
    description: "Smart, but expensive.",
    models: [{ name: "Claude 3.5 Sonnet", features: ["image"] }],
  },
  {
    title: "Experimental Models",
    description: "Still early. Expect errors.",
    models: [
      { name: "Llama 3.3 70b", features: ["experimental"] },
      { name: "Deepseek v3 (Fireworks)", features: ["experimental"] },
      {
        name: "Deepseek R1 (Fireworks)",
        features: ["brain", "experimental"],
        disabled: true,
      },
      {
        name: "DeepSeek R1 Distilled",
        features: ["brain", "experimental"],
      },
      {
        name: "Gemini 2.0 Flash Lite Preview",
        features: ["fast", "image", "experimental"],
      },
    ],
  },
];

export default function ModelSelector({ plan }: ModelSelectorProps) {
  const [selectedModels, setSelectedModels] = React.useState<string[]>(["GPT-4o-mini"]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState<string[]>(["Standard Models"]);

  const maxModels = plan === "SUPERPRO" ? 4 : 1;

  const handleModelSelect = (modelName: string, disabled: boolean = false) => {
    if (disabled) return;

    setSelectedModels((current) => {
      if (current.includes(modelName)) {
        return current.filter((m) => m !== modelName);
      }
      if (current.length >= maxModels) {
        return [...current.slice(1), modelName];
      }
      return [...current, modelName];
    });
  };

  const selectedModelsDisplay = selectedModels.join(" + ");

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative w-full max-w-md">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full flex justify-between items-center">
          <div className="font-medium">{selectedModelsDisplay}</div>
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

        <div className="p-2">
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
                      selectedModels.includes(model.name) && "bg-zinc-800",
                      model.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => handleModelSelect(model.name, model.disabled)}
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
