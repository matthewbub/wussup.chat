"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Check, PlusCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "@/hooks/use-debounce";
import { AVAILABLE_MODELS, type AiModel } from "@/constants/models";
import { ModelRequestForm } from "./ModalRequestForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

interface ModelSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: AiModel) => void;
  selectedModelId?: string;
  defaultModelId?: string;
  disabled?: boolean;
}

export function ModelSelectionModal({
  open,
  onOpenChange,
  onSelectModel,
  selectedModelId,
  defaultModelId = "o3-mini",
  disabled,
}: ModelSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filteredModels, setFilteredModels] = useState<AiModel[]>(AVAILABLE_MODELS);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Filter models based on search query
  useEffect(() => {
    let models = AVAILABLE_MODELS;

    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.id.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query) ||
          model.meta?.optimized_for?.toLowerCase().includes(query) ||
          false
      );
    }

    setFilteredModels(models);
  }, [debouncedQuery]);

  // Get provider display name
  const getProviderName = (provider: string) => {
    switch (provider) {
      case "openai":
        return "OpenAI";
      case "anthropic":
        return "Anthropic";
      case "xai":
        return "xAI";
      case "google":
        return "Google";
      default:
        return provider;
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Toggle between model list and request form
  const toggleRequestForm = () => {
    setShowRequestForm(!showRequestForm);
  };

  // Handle model selection
  const handleModelSelect = (model: AiModel) => {
    onSelectModel(model);
  };

  // Add disabled check to onOpenChange
  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{showRequestForm ? "Request a Model" : "Select AI Model"}</DialogTitle>
        </DialogHeader>

        {showRequestForm ? (
          <ModelRequestForm onCancel={toggleRequestForm} />
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={searchQuery}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model: AiModel) => (
                      <motion.div
                        key={model.id}
                        variants={item}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-xs ${
                          selectedModelId === model.id || (!selectedModelId && model.id === defaultModelId)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => handleModelSelect(model)}
                      >
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-11 flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{model.id}</span>
                              {model.free && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                >
                                  Free
                                </Badge>
                              )}
                              {selectedModelId === model.id && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{getProviderName(model.provider)}</span>
                              {model.meta?.optimized_for && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs max-w-[200px]">{model.meta.optimized_for}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                          <div className="col-span-1 flex items-center gap-2">
                            {(selectedModelId === model.id || (!selectedModelId && model.id === defaultModelId)) && (
                              <Check className="h-6 w-6 text-primary" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <h3 className="font-medium">No models found</h3>
                      <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={toggleRequestForm}
              >
                <PlusCircle className="h-4 w-4" />
                Request a Model
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
