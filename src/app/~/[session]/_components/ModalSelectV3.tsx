"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Image, Sparkles, PenToolIcon as Tool, Zap, Check, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "@/hooks/use-debounce";
import { AVAILABLE_MODELS, type AiModel, providers } from "@/constants/models";
import { ModelRequestForm } from "./ModalRequestForm";

interface ModelSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: AiModel) => void;
  currentModelId?: string;
}

export function ModelSelectionModal({ open, onOpenChange, onSelectModel, currentModelId }: ModelSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [filteredModels, setFilteredModels] = useState<AiModel[]>(AVAILABLE_MODELS);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Filter models based on search query and active tab
  useEffect(() => {
    let models = AVAILABLE_MODELS;

    // Filter by provider if not "all"
    if (activeTab !== "all") {
      models = models.filter((model) => model.provider === activeTab);
    }

    // Filter by search query
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.id.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query)
      );
    }

    setFilteredModels(models);
  }, [debouncedQuery, activeTab]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
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

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                {providers.map((provider) => (
                  <TabsTrigger key={provider} value={provider}>
                    {getProviderName(provider)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4 pr-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + debouncedQuery}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <motion.div
                          key={model.id}
                          variants={item}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                            currentModelId === model.id ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => onSelectModel(model)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{model.name}</span>
                                {model.free && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                                  >
                                    Free
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground mt-1">{model.id}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {currentModelId === model.id && <Check className="h-4 w-4 text-primary" />}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-3">
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                                model.image_input
                                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <Image className={`h-4 w-4 ${model.image_input ? "" : "opacity-40"}`} />
                              <span className="text-xs">Images</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                                model.object_generation
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <Sparkles className={`h-4 w-4 ${model.object_generation ? "" : "opacity-40"}`} />
                              <span className="text-xs">Objects</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                                model.tool_usage
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <Tool className={`h-4 w-4 ${model.tool_usage ? "" : "opacity-40"}`} />
                              <span className="text-xs">Tools</span>
                            </div>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                                model.tool_streaming
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <Zap className={`h-4 w-4 ${model.tool_streaming ? "" : "opacity-40"}`} />
                              <span className="text-xs">Streaming</span>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                        <h3 className="font-medium">No models found</h3>
                        <p className="text-sm text-muted-foreground mt-1">Try a different search term or provider</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={toggleRequestForm}
                >
                  <PlusCircle className="h-4 w-4" />
                  Request a Model
                </Button>
              </div>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
