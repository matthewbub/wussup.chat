"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Image,
  FileText,
  Sparkles,
  Zap,
  Check,
  PlusCircle,
  Code,
  ActivityIcon as Function,
  Brain,
  Video,
  AudioLines,
  Info,
  SlidersHorizontal,
  X,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "@/hooks/use-debounce";
import { AVAILABLE_MODELS, type AiModel, providers, type InputType } from "@/constants/models";
import { ModelRequestForm } from "./ModalRequestForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ModelSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectModel: (model: AiModel, isSecondary?: boolean) => void;
  primaryModelId?: string;
  secondaryModelId?: string;
  defaultModelId?: string;
  onRemoveSecondaryModel?: () => void;
}

export function ModelSelectionModal({
  open,
  onOpenChange,
  onSelectModel,
  primaryModelId,
  secondaryModelId,
  defaultModelId = "o3-mini",
  onRemoveSecondaryModel,
}: ModelSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProvider, setActiveProvider] = useState<string>("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [showImageCapable, setShowImageCapable] = useState(false);
  const [showReasoningOnly, setShowReasoningOnly] = useState(false);
  const [showStructuredOnly, setShowStructuredOnly] = useState(false);
  const [showToolsOnly, setShowToolsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"primary" | "secondary">("primary");

  const debouncedQuery = useDebounce(searchQuery, 300);
  const [filteredModels, setFilteredModels] = useState<AiModel[]>(AVAILABLE_MODELS);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Filter models based on all criteria
  useEffect(() => {
    let models = AVAILABLE_MODELS;

    // Filter by provider if not "all"
    if (activeProvider !== "all") {
      models = models.filter((model) => model.provider === activeProvider);
    }

    // Filter by free only
    if (showFreeOnly) {
      models = models.filter((model) => model.free);
    }

    // Filter by image capability
    if (showImageCapable) {
      models = models.filter((model) => model.inputs.includes("image"));
    }

    // Filter by reasoning capability
    if (showReasoningOnly) {
      models = models.filter((model) => model.reasoning);
    }

    // Filter by structured output capability
    if (showStructuredOnly) {
      models = models.filter((model) => model.meta?.capabilities?.structured_outputs);
    }

    // Filter by tools capability
    if (showToolsOnly) {
      models = models.filter((model) => model.meta?.capabilities?.native_tool_use);
    }

    // Filter by search query
    if (debouncedQuery) {
      const query = debouncedQuery.toLowerCase();
      models = models.filter(
        (model) =>
          model.name?.toLowerCase().includes(query) ||
          false ||
          model.id.toLowerCase().includes(query) ||
          model.provider.toLowerCase().includes(query) ||
          model.meta?.optimized_for?.toLowerCase().includes(query) ||
          false
      );
    }

    // Sort models
    if (sortBy === "token_limit") {
      models = [...models].sort((a, b) => {
        const aLimit = a.meta?.token_limits?.input || 0;
        const bLimit = b.meta?.token_limits?.input || 0;
        return bLimit - aLimit;
      });
    } else if (sortBy === "newest") {
      models = [...models].sort((a, b) => {
        const aDate = a.meta?.latest_update || "";
        const bDate = b.meta?.latest_update || "";
        return bDate.localeCompare(aDate);
      });
    }

    setFilteredModels(models);
  }, [
    debouncedQuery,
    activeProvider,
    showFreeOnly,
    showImageCapable,
    showReasoningOnly,
    showStructuredOnly,
    showToolsOnly,
    sortBy,
  ]);

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

  // Get input type icon
  const getInputTypeIcon = (type: InputType) => {
    switch (type) {
      case "text":
        return <FileText className="h-6 w-6" />;
      case "image":
        return <Image className="h-6 w-6" />;
      case "audio":
        return <AudioLines className="h-6 w-6" />;
      case "video":
        return <Video className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
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

  // Reset all filters
  const resetFilters = () => {
    setActiveProvider("all");
    setShowFreeOnly(false);
    setShowImageCapable(false);
    setShowReasoningOnly(false);
    setShowStructuredOnly(false);
    setShowToolsOnly(false);
    setSortBy("default");
  };

  // Count active filters
  const activeFilterCount = [
    showFreeOnly,
    showImageCapable,
    showReasoningOnly,
    showStructuredOnly,
    showToolsOnly,
    activeProvider !== "all",
    sortBy !== "default",
  ].filter(Boolean).length;

  // Handle model selection
  const handleModelSelect = (model: AiModel) => {
    onSelectModel(model, selectionMode === "secondary");
    if (selectionMode === "secondary") {
      setSelectionMode("primary");
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(selectionMode === "primary" ? "secondary" : "primary");
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

            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 mr-2">
                <Select value={activeProvider} onValueChange={setActiveProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Providers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Providers</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {getProviderName(provider)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Popover open={showFilters} onOpenChange={setShowFilters}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filters</h4>
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                          Reset
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="free-only"
                            checked={showFreeOnly}
                            onCheckedChange={(checked) => setShowFreeOnly(checked === true)}
                          />
                          <Label htmlFor="free-only">Free models only</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="image-capable"
                            checked={showImageCapable}
                            onCheckedChange={(checked) => setShowImageCapable(checked === true)}
                          />
                          <Label htmlFor="image-capable">Image input capable</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="reasoning-only"
                            checked={showReasoningOnly}
                            onCheckedChange={(checked) => setShowReasoningOnly(checked === true)}
                          />
                          <Label htmlFor="reasoning-only">Reasoning capable</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="structured-only"
                            checked={showStructuredOnly}
                            onCheckedChange={(checked) => setShowStructuredOnly(checked === true)}
                          />
                          <Label htmlFor="structured-only">Structured outputs</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="tools-only"
                            checked={showToolsOnly}
                            onCheckedChange={(checked) => setShowToolsOnly(checked === true)}
                          />
                          <Label htmlFor="tools-only">Tool use capable</Label>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sort-by">Sort by</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger id="sort-by">
                            <SelectValue placeholder="Default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="token_limit">Highest token limit</SelectItem>
                            <SelectItem value="newest">Newest first</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={selectionMode === "secondary" ? "default" : "outline"}
                        size="sm"
                        onClick={toggleSelectionMode}
                        className="flex items-center gap-1"
                        disabled={!primaryModelId}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {selectionMode === "secondary" ? "Selecting B" : "A/B Test"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {selectionMode === "secondary"
                          ? "Currently selecting model B for A/B testing"
                          : "Click to select a second model for A/B testing"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {selectionMode === "secondary" && (
              <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md">
                <p className="text-sm text-center">
                  Select a second model to compare with <span className="font-medium">{primaryModelId}</span>
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={
                    activeProvider +
                    debouncedQuery +
                    showFreeOnly +
                    showImageCapable +
                    showReasoningOnly +
                    showStructuredOnly +
                    showToolsOnly +
                    sortBy +
                    selectionMode
                  }
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
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary hover:shadow-sm ${
                          (primaryModelId === model.id && selectionMode === "primary") ||
                          (secondaryModelId === model.id && selectionMode === "secondary") ||
                          (!primaryModelId && !secondaryModelId && model.id === defaultModelId)
                            ? "border-primary bg-primary/5"
                            : primaryModelId === model.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-700"
                              : secondaryModelId === model.id
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-700"
                                : ""
                        }`}
                        onClick={() => handleModelSelect(model)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
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
                              {primaryModelId === model.id && (
                                <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                                  {selectionMode === "secondary" || secondaryModelId === model.id
                                    ? "Model A"
                                    : "Selected"}
                                </Badge>
                              )}
                              {secondaryModelId === model.id && (
                                <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                                  Model B
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

                          <div className="flex items-center gap-2">
                            {((primaryModelId === model.id && selectionMode === "primary") ||
                              (secondaryModelId === model.id && selectionMode === "secondary") ||
                              (!primaryModelId && !secondaryModelId && model.id === defaultModelId)) && (
                              <Check className="h-6 w-6 text-primary" />
                            )}
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-medium text-muted-foreground">Inputs</h4>
                              {model.outputs && model.outputs.length > 0 && (
                                <h4 className="text-xs font-medium text-muted-foreground">Outputs</h4>
                              )}
                            </div>

                            <div className="flex justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                {model.inputs &&
                                  model.inputs.map((input, idx) => (
                                    <TooltipProvider key={`${model.id}-input-${idx}`}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 p-1.5 rounded-md flex items-center justify-center">
                                            {getInputTypeIcon(input)}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs capitalize">{input} input</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                              </div>

                              {model.outputs && model.outputs.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                  {model.outputs.map((output, idx) => (
                                    <TooltipProvider key={`${model.id}-output-${idx}`}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400 p-1.5 rounded-md flex items-center justify-center">
                                            {getInputTypeIcon(output)}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs capitalize">{output} output</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-muted-foreground">Capabilities</h4>
                            <div className="flex flex-wrap items-center gap-2">
                              {model.reasoning && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-1.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center">
                                        <Brain className="h-6 w-6" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Reasoning</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {model.meta?.capabilities?.structured_outputs && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-1.5 rounded-md bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 flex items-center justify-center">
                                        <Code className="h-6 w-6" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Structured Outputs</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {model.meta?.capabilities?.function_calling && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center">
                                        <Function className="h-6 w-6" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Function Calling</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {model.meta?.capabilities?.native_tool_use && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center">
                                        <Sparkles className="h-6 w-6" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Tool Use</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              {model.meta?.capabilities?.caching && model.meta.capabilities.caching === "supported" && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center">
                                        <Zap className="h-6 w-6" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">Caching Support</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Search className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <h3 className="font-medium">No models found</h3>
                      <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="mt-4 flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              {secondaryModelId && (
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  onClick={onRemoveSecondaryModel}
                >
                  <X className="h-4 w-4" />
                  Remove Model B
                </Button>
              )}
              <Button
                variant="outline"
                className={`flex items-center justify-center gap-2 ${secondaryModelId ? "" : "w-full"}`}
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
