"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Bot, Zap, Star, Cpu } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AVAILABLE_MODELS, AiModel } from "@/constants/models";

// Placeholder subscription tier - would come from user data in a real implementation
const USER_SUBSCRIPTION_TIER = "free";
// Provider icon mapping
const PROVIDER_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  openai: { icon: Sparkles, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  anthropic: { icon: Bot, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  google: { icon: Cpu, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  xai: { icon: Zap, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  default: { icon: Star, color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400" },
};

export const ChatAppInput = ({
  currentInput,
  setInput,
  isLoading,
  onSubmit,
  selectedModel,
  onModelChange,
}: {
  currentInput: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  selectedModel: { id: string; provider: string };
  onModelChange: (model: { id: string; provider: string }) => void;
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-primary/10">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <Select
          value={`${selectedModel.provider}/${selectedModel.id}`}
          onValueChange={(value) => {
            const [provider, id] = value.split("/");
            // Check if the model is available for the user's subscription tier
            const modelData = AVAILABLE_MODELS.find((m) => m.provider === provider && m.id === id);
            if (modelData && (USER_SUBSCRIPTION_TIER !== "free" || modelData.free)) {
              onModelChange({ provider, id });
            }
          }}
        >
          <SelectTrigger className="w-[220px]">
            {(() => {
              const selectedModelData = AVAILABLE_MODELS.find(
                (m) => m.provider === selectedModel.provider && m.id === selectedModel.id
              );
              const providerData = PROVIDER_ICONS[selectedModel.provider] || PROVIDER_ICONS.default;
              const ProviderIcon = providerData.icon;

              return (
                <div className="flex items-center gap-2">
                  <div className={`rounded-md p-1 ${providerData.color}`}>
                    <ProviderIcon className="h-4 w-4" />
                  </div>
                  <div className="truncate">{selectedModelData?.displayName || selectedModel.id}</div>
                </div>
              );
            })()}
          </SelectTrigger>
          <SelectContent>
            {USER_SUBSCRIPTION_TIER === "free" && (
              <div className="px-2 py-3 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span>Upgrade to Pro for all models</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">Get access to all models for $5/month</div>
              </div>
            )}
            {AVAILABLE_MODELS.map((model: AiModel) => {
              // Get provider icon data, fallback to default if not found
              const providerData = PROVIDER_ICONS[model.provider] || PROVIDER_ICONS.default;
              const ProviderIcon = providerData.icon;
              const capitalized = model.provider.charAt(0).toUpperCase() + model.provider.slice(1);

              return (
                <SelectItem
                  key={`${model.provider}/${model.id}`}
                  value={`${model.provider}/${model.id}`}
                  className="flex items-center py-2"
                  disabled={!model.free && USER_SUBSCRIPTION_TIER === "free"}
                >
                  <div
                    className={`flex items-center gap-2 w-full ${
                      !model.free && USER_SUBSCRIPTION_TIER === "free" ? "opacity-50" : ""
                    }`}
                  >
                    <div className={`rounded-md p-1 ${providerData.color}`}>
                      <ProviderIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span>{model.displayName || model.id}</span>
                        {model.free && USER_SUBSCRIPTION_TIER === "free" && (
                          <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            Free
                          </span>
                        )}
                        {!model.free && USER_SUBSCRIPTION_TIER === "free" && (
                          <span className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{capitalized}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="flex-1 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Message"
            value={currentInput}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading} className="flex-none w-fit">
            <Send className="h-6 w-6 dark:text-white" />
          </Button>
        </div>
      </div>
    </form>
  );
};
