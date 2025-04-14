"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { AVAILABLE_MODELS, AiModel } from "@/constants/models";
import { UpgradeToProModal } from "@/components/upgrade-to-pro";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/chat-store";

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
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { isSubscribed } = useChatStore();
  const USER_SUBSCRIPTION_TIER = isSubscribed ? "pro" : "free";

  return (
    <form onSubmit={onSubmit} className="px-4 pt-4 flex flex-col absolute bottom-0 w-full">
      <div className="self-end">
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

              return (
                <div className="flex items-center gap-2">
                  <div className="truncate">{selectedModelData?.displayName || selectedModel.id}</div>
                </div>
              );
            })()}
          </SelectTrigger>
          <SelectContent className="max-h-[400px] overflow-y-auto pt-0">
            {USER_SUBSCRIPTION_TIER === "free" && (
              <div
                className="px-2 py-3 border-b cursor-pointer hover:bg-teal-500/40 rounded group sticky top-0 bg-background z-10"
                onClick={() => setIsUpgradeModalOpen(true)}
              >
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-blue-500 group-hover:text-yellow-500 transition-colors" />
                  <span>Upgrade to Pro for all models</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground group-hover:text-white">
                  Get access to all models for $5/month
                </div>
              </div>
            )}
            {AVAILABLE_MODELS.map((model: AiModel) => {
              // Get provider icon data, fallback to default if not found
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
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span>{model.displayName || model.id}</span>
                        {model.free && USER_SUBSCRIPTION_TIER === "free" && (
                          <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                            Free
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
      </div>
      <div className="pb-4 mt-4 bg-background">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-1 flex items-end gap-2">
            <AutoExpandingTextarea
              placeholder="Message"
              value={currentInput}
              disabled={isLoading}
              className="flex-1"
              onBlur={(e) => {
                setInput(e.target.value);
              }}
            />
            <Button type="submit" disabled={isLoading} className="w-fit space-x-1">
              <span>Send</span>
              <Send className="h-6 w-6 dark:text-white" />
            </Button>
          </div>
        </div>
        <UpgradeToProModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
      </div>
    </form>
  );
};

function AutoExpandingTextarea({
  value: propValue = "",
  onChange,
  onBlur,
  className = "",
  ...props
}: {
  value: string;
  onChange?: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (ev: React.FocusEvent<HTMLTextAreaElement>) => void;
  className: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange" | "className" | "onBlur">) {
  const ref = useRef<null | HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState<string>("");

  const autoResize = useCallback(() => {
    const textarea = ref.current;

    if (textarea) {
      // temporarily reset height to auto - necessary for shrinking
      textarea.style.height = "auto";

      // set height to scrollHeight https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    // update internal value if prop value changes
    setInternalValue(propValue);

    // resize after state update
    requestAnimationFrame(autoResize);
  }, [propValue]);

  const handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = ev.target.value;
    setInternalValue(newValue);
    autoResize();
    if (onChange) {
      onChange(ev);
    }
  };

  const handleBlur = (ev: React.FocusEvent<HTMLTextAreaElement>) => {
    if (onBlur) {
      onBlur(ev);
    }
  };

  return (
    <Textarea
      ref={ref}
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      rows={2}
      className={cn("overflow-y-hidden resize-none box-border min-h-[50px] max-h-[300px]", className)}
      {...props}
    />
  );
}
