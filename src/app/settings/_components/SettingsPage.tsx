"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Send,
  Star,
  FileText,
  ImageIcon,
  Mic,
  Video,
  BrainCircuit,
  Lock,
  Clock,
  Info,
  ChevronDown,
  ChevronRight,
  Home,
  CreditCardIcon,
  MessageCircle,
  FileCode,
  ThumbsUp,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "next-themes";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { AVAILABLE_MODELS, type AiModel } from "@/constants/models";
import MarkdownComponent from "@/components/ui/Markdown";
import type { SubscriptionStatus } from "@/lib/subscription/subscription-facade";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Provider display names and API key placeholders
const providerInfo = {
  openai: {
    name: "OpenAI",
    keyPlaceholder: "sk-...",
    keyUrl: "https://platform.openai.com/api-keys",
    keyUrlText: "OpenAI dashboard",
    icon: MessageSquare,
  },
  anthropic: {
    name: "Anthropic",
    keyPlaceholder: "sk_ant-...",
    keyUrl: "https://console.anthropic.com/keys",
    keyUrlText: "Anthropic console",
    icon: MessageSquare,
  },
  xai: {
    name: "xAI",
    keyPlaceholder: "xai-...",
    keyUrl: "#",
    keyUrlText: "xAI developer portal",
    icon: MessageSquare,
  },
  google: {
    name: "Google AI",
    keyPlaceholder: "AIza...",
    keyUrl: "https://makersuite.google.com/app/apikey",
    keyUrlText: "Google AI Studio",
    icon: MessageSquare,
  },
};

// Input and output type icons with colors
const inputTypeIcons = {
  text: {
    icon: FileText,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    tooltip: "Text Input",
  },
  images: {
    icon: ImageIcon,
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    tooltip: "Image Input",
  },
  audio: {
    icon: Mic,
    color: "text-green-500 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
    tooltip: "Audio Input",
  },
  videos: {
    icon: Video,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50",
    tooltip: "Video Input",
  },
  video: {
    icon: Video,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50",
    tooltip: "Video Input",
  },
};

const outputTypeIcons = {
  text: {
    icon: MessageSquare,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    tooltip: "Text Output",
  },
  images: {
    icon: ImageIcon,
    color: "text-purple-500 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    tooltip: "Image Output",
  },
  audio: {
    icon: Mic,
    color: "text-green-500 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
    tooltip: "Audio Output",
  },
  "images (coming soon)": {
    icon: ImageIcon,
    color: "text-purple-300 dark:text-purple-500/70",
    bg: "bg-purple-50 dark:bg-purple-950/50",
    tooltip: "Image Output (Coming Soon)",
  },
  "audio (coming soon)": {
    icon: Mic,
    color: "text-green-300 dark:text-green-500/70",
    bg: "bg-green-50 dark:bg-green-950/50",
    tooltip: "Audio Output (Coming Soon)",
  },
};

// Navigation sections
const navigationSections = [
  {
    id: "subscription",
    label: "Subscription",
    icon: CreditCardIcon,
  },
  {
    id: "models",
    label: "AI Models",
    icon: BrainCircuit,
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: Lock,
  },
  {
    id: "chat-history",
    label: "Chat History",
    icon: MessageCircle,
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: ThumbsUp,
  },
];

export default function SettingsPage({ status }: { status: SubscriptionStatus }) {
  const { theme } = useTheme();
  const [subscription, setSubscription] = useState<"free" | "pro">("pro");
  const [enabledModels, setEnabledModels] = useState<Record<string, boolean>>(
    AVAILABLE_MODELS.reduce((acc, model) => ({ ...acc, [model.id]: true }), {})
  );
  const [feedback, setFeedback] = useState("");
  const [apiKeys, setApiKeys] = useState<Record<string, { value: string; expiration: Date | null }>>({
    openai: { value: "", expiration: null },
    anthropic: { value: "", expiration: null },
    xai: { value: "", expiration: null },
    google: { value: "", expiration: null },
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState({
    models: false,
    apiKeys: false,
    feedback: false,
    subscription: false,
    import: false,
    export: false,
  });
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState("subscription");
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleModelToggle = async (modelId: string) => {
    // Update UI immediately for responsiveness
    setEnabledModels((prev) => ({ ...prev, [modelId]: !prev[modelId] }));

    // Call API
    setIsLoading((prev) => ({ ...prev, models: true }));
    try {
      const updatedModels = {
        ...enabledModels,
        [modelId]: !enabledModels[modelId],
      };

      const response = await fetch("/api/settings/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabledModels: updatedModels }),
      });

      const data = await response.json();
      console.log("API response:", data);
    } catch (error) {
      console.error("Error updating model settings:", error);
      // Revert on error
      setEnabledModels((prev) => ({ ...prev, [modelId]: !prev[modelId] }));
    } finally {
      setIsLoading((prev) => ({ ...prev, models: false }));
    }
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], value },
    }));
  };

  const handleExpirationChange = (provider: string, date: Date | null) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], expiration: date },
    }));
  };

  const handleSaveApiKeys = async () => {
    setIsLoading((prev) => ({ ...prev, apiKeys: true }));
    try {
      const response = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKeys }),
      });

      const data = await response.json();
      console.log("API response:", data);
    } catch (error) {
      console.error("Error saving API keys:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, apiKeys: false }));
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) return;

    setIsLoading((prev) => ({ ...prev, feedback: true }));
    try {
      const response = await fetch("/api/settings/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      const data = await response.json();
      console.log("API response:", data);

      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 3000);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, feedback: false }));
    }
  };

  const handleUpgrade = async () => {
    setIsLoading((prev) => ({ ...prev, subscription: true }));
    try {
      const response = await fetch("/api/settings/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: "pro" }),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (data.subscription) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error upgrading subscription:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, subscription: false }));
    }
  };

  // Group models by provider
  const modelsByProvider = AVAILABLE_MODELS.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, AiModel[]>
  );

  // Render input/output icons
  const renderIcons = (types: string[] | undefined, isInput: boolean) => {
    if (!types || types.length === 0) return null;

    const iconMap = isInput ? inputTypeIcons : outputTypeIcons;

    return (
      <div className="flex flex-wrap gap-1">
        {types.map((type) => {
          const iconInfo = iconMap[type as keyof typeof iconMap];
          if (!iconInfo) return null;

          const IconComponent = iconInfo.icon;
          const comingSoon = type.includes("coming soon");

          return (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`p-1.5 rounded-md ${iconInfo.bg} ${comingSoon ? "opacity-60" : ""}`}>
                    <IconComponent className={`h-4 w-4 ${iconInfo.color}`} />
                    {comingSoon && <span className="sr-only">Coming Soon</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{iconInfo.tooltip}</p>
                  {comingSoon && <p className="text-xs">Coming Soon</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept JSON files
    if (file.type !== "application/json") {
      setImportError("Please upload a valid JSON file");
      setImportStatus("error");
      return;
    }

    setIsLoading((prev) => ({ ...prev, import: true }));
    setImportStatus("idle");
    setImportError(null);

    try {
      const fileContent = await file.text();
      let jsonData;

      try {
        jsonData = JSON.parse(fileContent);
      } catch (err) {
        throw new Error("Invalid JSON format");
      }

      // Validate that the JSON has the expected structure
      if (
        !jsonData.threads ||
        !jsonData.messages ||
        !Array.isArray(jsonData.threads) ||
        !Array.isArray(jsonData.messages)
      ) {
        throw new Error("JSON must contain 'threads' and 'messages' arrays");
      }

      // Send the parsed JSON to the API
      const response = await fetch("/api/settings/import-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ history: jsonData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to import chat history");
      }

      const data = await response.json();
      console.log("Import successful:", data);

      setImportStatus("success");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing chat history:", error);
      setImportError(error instanceof Error ? error.message : "Unknown error occurred");
      setImportStatus("error");
    } finally {
      setIsLoading((prev) => ({ ...prev, import: false }));
    }
  };

  const handleExportChatHistory = async () => {
    setIsLoading((prev) => ({ ...prev, export: true }));
    try {
      const response = await fetch("/api/settings/export-history", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to export chat history");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chat_history.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting chat history:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, export: false }));
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileNavOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">Settings</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </div>

      {/* Side Navigation */}
      <div
        className={cn(
          "lg:w-64 bg-muted/30 border-r shrink-0 overflow-y-auto",
          isMobileNavOpen ? "block fixed inset-0 z-50 bg-background" : "hidden lg:block"
        )}
      >
        <div className="p-6 sticky top-0">
          <div className="hidden lg:block mb-6">
            <h2 className="text-xl font-bold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
          </div>

          {isMobileNavOpen && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Settings</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileNavOpen(false)}>
                <ChevronRight className="h-5 w-5" />
                <span className="sr-only">Close navigation</span>
              </Button>
            </div>
          )}

          <nav className="space-y-1">
            {navigationSections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left"
                onClick={() => scrollToSection(section.id)}
              >
                <section.icon className="mr-2 h-5 w-5" />
                {section.label}
              </Button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl py-8 px-4 md:px-8 space-y-12">
          {/* Subscription Section */}
          <section id="subscription" className="scroll-mt-16">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <CreditCardIcon className="mr-2 h-6 w-6" />
              Subscription Information
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your subscription and billing details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {subscription === "free"
                          ? "Basic features with limited usage"
                          : "Full access to all features and models"}
                      </p>
                    </div>
                    <Badge
                      className={
                        subscription === "pro"
                          ? "bg-gradient-to-r from-amber-500 to-amber-300 text-black dark:from-amber-400 dark:to-amber-200"
                          : ""
                      }
                    >
                      {subscription === "free" ? "Free" : "Pro"}
                    </Badge>
                  </div>

                  {subscription === "free" ? (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <h4 className="font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                          Pro Plan Benefits
                        </h4>
                        <ul className="mt-2 space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                            Access to all AI models (OpenAI, Claude, Grok, Google)
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                            Bring your own API keys for cost control
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                            Higher usage limits and priority support
                          </li>
                        </ul>
                      </div>

                      <Button onClick={handleUpgrade} className="w-full" disabled={isLoading.subscription}>
                        {isLoading.subscription ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <h4 className="font-medium">Billing Information</h4>
                        <div className="mt-2 text-sm space-y-2">
                          <div className="flex justify-between">
                            <span>Next billing date</span>
                            <span>April 25, 2025</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment method</span>
                            <span>•••• 4242</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button variant="outline" className="flex-1">
                          Manage Billing
                        </Button>
                        <Button variant="destructive" className="flex-1">
                          Cancel Subscription
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="dark:border-gray-800" />

          {/* AI Models Section */}
          <section id="models" className="scroll-mt-16">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <BrainCircuit className="mr-2 h-6 w-6" />
              AI Language Model Controls
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Available Models</CardTitle>
                <CardDescription>Enable or disable AI models that will appear in the Chat menu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Object.entries(modelsByProvider).map(([provider, models]) => (
                    <div key={provider} className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {providerInfo[provider as keyof typeof providerInfo].name}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {models.map((model) => (
                          <div
                            key={model.id}
                            className="border rounded-lg p-4 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                          >
                            {/* Left side - Model info */}
                            <div className="flex-1">
                              {/* Model name and badges */}
                              <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-2">
                                <Label htmlFor={model.id} className="text-base font-medium">
                                  {model.model}
                                </Label>

                                {/* Badges for reasoning and pro */}
                                <div className="flex flex-wrap gap-1">
                                  {model.reasoning && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50">
                                            <BrainCircuit className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mr-1" />
                                            <span className="text-xs text-blue-700 dark:text-blue-300">Reasoning</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Enhanced reasoning capabilities</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}

                                  {!model.free && (
                                    <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50">
                                      <Star className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 mr-1" />
                                      <span className="text-xs text-amber-700 dark:text-amber-300">Pro</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Input/Output capabilities */}
                              <div className="space-y-2">
                                {/* Inputs row */}
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground font-medium w-16">Inputs:</span>
                                  {renderIcons(model.inputs, true)}
                                </div>

                                {/* Outputs row */}
                                <div className="flex items-center">
                                  <span className="text-xs text-muted-foreground font-medium w-16">Outputs:</span>
                                  {renderIcons(model.outputs, false)}
                                </div>
                              </div>
                            </div>

                            {/* Right side - Toggle switch */}
                            <div className="flex items-center justify-end md:justify-center md:pl-4 md:border-l md:dark:border-gray-800">
                              <Switch
                                id={model.id}
                                checked={enabledModels[model.id]}
                                onCheckedChange={() => handleModelToggle(model.id)}
                                disabled={(subscription === "free" && !model.free) || isLoading.models}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {subscription === "free" && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Pro Plan Required</AlertTitle>
                      <AlertDescription>
                        Upgrade to Pro to access all AI models and features.
                        <Button
                          variant="link"
                          className="p-0 h-auto ml-1"
                          onClick={handleUpgrade}
                          disabled={isLoading.subscription}
                        >
                          Upgrade now
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="dark:border-gray-800" />

          {/* API Keys Section */}
          <section id="api-keys" className="scroll-mt-16">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Lock className="mr-2 h-6 w-6" />
              API Keys
            </h2>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Provider Keys</CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/50">
                            <Lock className="h-3.5 w-3.5 text-green-500 dark:text-green-400 mr-1" />
                            <span className="text-xs text-green-700 dark:text-green-300">E2EE</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Keys are stored with end-to-end encryption</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {subscription === "pro" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            Set expiration dates to automatically remove keys for enhanced security. Your keys are
                            stored with end-to-end encryption.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <CardDescription>
                  {subscription === "pro"
                    ? "Add your own API keys with optional expiration dates"
                    : "Upgrade to Pro to use your own API keys"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subscription === "free" ? (
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Pro Feature</AlertTitle>
                        <AlertDescription>
                          Using your own API keys is a Pro feature. This allows you to control costs and use your
                          existing API quotas.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={handleUpgrade} className="w-full" disabled={isLoading.subscription}>
                        {isLoading.subscription ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(providerInfo).map(([provider, info]) => (
                          <div key={provider} className="border rounded-lg p-4 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                              <Label htmlFor={`${provider}-key`} className="flex items-center gap-2 font-medium">
                                <MessageSquare className="h-4 w-4" />
                                {info.name}
                              </Label>

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 gap-1">
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    {apiKeys[provider].expiration
                                      ? format(apiKeys[provider].expiration, "MMM d, yyyy")
                                      : "No expiration"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                  <Calendar
                                    mode="single"
                                    selected={apiKeys[provider].expiration || undefined}
                                    onSelect={(date) => handleExpirationChange(provider, date)}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                  <div className="border-t p-3 flex justify-between">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleExpirationChange(provider, null)}
                                    >
                                      No expiration
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleExpirationChange(provider, addMonths(new Date(), 3))}
                                    >
                                      +3 months
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <div className="relative">
                                <Input
                                  id={`${provider}-key`}
                                  type="password"
                                  placeholder={info.keyPlaceholder}
                                  value={apiKeys[provider].value}
                                  onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                                />
                                <a
                                  href={info.keyUrl}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Get key
                                </a>
                              </div>

                              {apiKeys[provider].expiration && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Expires {format(apiKeys[provider].expiration, "MMMM d, yyyy")}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <Button onClick={handleSaveApiKeys} disabled={isLoading.apiKeys}>
                          {isLoading.apiKeys ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </span>
                          ) : (
                            "Save Keys"
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="dark:border-gray-800" />

          {/* Chat History Section */}
          <section id="chat-history" className="scroll-mt-16">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <MessageCircle className="mr-2 h-6 w-6" />
              Chat History
            </h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Import Chat History</CardTitle>
                <CardDescription>
                  Import conversations from{" "}
                  <a
                    href="https://t3.chat"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 dark:text-blue-400"
                  >
                    t3.chat
                  </a>{" "}
                  or other compatible formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <Collapsible open={isCodeBlockOpen} onOpenChange={setIsCodeBlockOpen} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          Using the{" "}
                          <a
                            href="https://t3.chat"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 dark:text-blue-400"
                          >
                            T3 Chat
                          </a>{" "}
                          Export Format
                        </h4>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {isCodeBlockOpen ? "Hide Format" : "Show Format"}
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 transition-transform duration-200 ml-1",
                                isCodeBlockOpen ? "transform rotate-180" : ""
                              )}
                            />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="space-y-2">
                        <MarkdownComponent>
                          {`
Special thanks to the amazing team at T3 Chat for inspiring this feature! Their work at [T3 Chat](https://t3.chat) helped make this possible.

### How to import:
1. Download your chat export from T3 Chat
2. Click the "Import Chat History" button below
3. Select your downloaded JSON file
4. We'll handle the rest and notify you when it's complete!

Using a different format or have suggestions? [We'd love to hear from you!](#feedback)

#### Format Example:
\`\`\`json
{
  "threads": [
    {
      "title": "Thread Title",
      "id": "thread-id",
      "created_at": "2025-01-11T21:24:13.599Z",
      "updated_at": "2025-01-11T21:24:13.599Z",
      "last_message_at": "2025-01-11T21:24:13.599Z",
      "user_edited_title": false,  // optional
      "status": "done",           // optional
      "model": "gpt-4o-mini"
    }
  ],
  "messages": [
    {
      "threadId": "thread-id",
      "role": "user", 
      "content": "Hello AI!",
      "status": "done",  // optional for messages
      "model": "gpt-4o-mini", 
      "id": "message-id",
      "created_at": "2025-01-11T21:24:13.519Z"
    },
    {
      "threadId": "thread-id",
      "role": "assistant",
      "content": "Hello! How can I help you today?",
      "status": "done",  // optional for messages
      "model": "gpt-4o-mini",
      "id": "message-id-2",
      "created_at": "2025-01-11T21:24:13.520Z"
    }
  ]
}
\`\`\`
`}
                        </MarkdownComponent>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>

                  <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileChange} className="hidden" />

                  {importStatus === "success" && (
                    <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Your T3 Chat history has been imported successfully.
                      </AlertDescription>
                    </Alert>
                  )}

                  {importStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Import Failed</AlertTitle>
                      <AlertDescription>{importError || "An unknown error occurred."}</AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={handleImportClick} disabled={isLoading.import} className="w-full">
                    {isLoading.import ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Importing...
                      </span>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Import Chat History
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Chat History</CardTitle>
                <CardDescription>Back up your conversations or transfer them to another platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      About Export
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground">Exporting your chat history allows you to:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>Create backups of all your valuable conversations</li>
                      <li>Transfer your chat history to other platforms</li>
                      <li>Archive conversations for future reference</li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Your data will be exported in the same format shown above, compatible with platforms that support
                      this JSON structure.
                    </p>
                  </div>

                  <Button onClick={handleExportChatHistory} disabled={isLoading.export} className="w-full">
                    {isLoading.export ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Exporting...
                      </span>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Download Chat History
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <Separator className="dark:border-gray-800" />

          {/* Feedback Section */}
          <section id="feedback" className="scroll-mt-16">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <ThumbsUp className="mr-2 h-6 w-6" />
              Feedback
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>Help us improve by sharing your thoughts and suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us what you think about our service, or suggest new features..."
                      rows={6}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  {feedbackSubmitted && (
                    <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Thank you!</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Your feedback has been submitted successfully. We appreciate your input!
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedback.trim() || isLoading.feedback}
                    className="w-full"
                  >
                    {isLoading.feedback ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
