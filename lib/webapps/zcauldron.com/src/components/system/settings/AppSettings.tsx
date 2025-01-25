"use client";

import { useThemeStore } from "@/stores/themeStore";
import { useAISettingsStore } from "@/stores/aiSettingsStore";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AppSettings() {
  const { theme, setTheme } = useThemeStore();
  const { model, setModel } = useAISettingsStore();
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setFeedbackStatus("sending");
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });
      setFeedbackStatus("success");
      setFeedback("");
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    } catch (error) {
      console.error(error);
      setFeedbackStatus("error");
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
      <div className="px-4 sm:px-0">
        <h2 className="text-base font-semibold">App Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize your application preferences and provide feedback.
        </p>
      </div>

      <Card className="md:col-span-2">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
            {/* Theme Settings */}
            <div className="col-span-full">
              <Label htmlFor="theme">Theme</Label>
              <div className="mt-2">
                <Select
                  value={theme}
                  onValueChange={(value) => setTheme(value as "light" | "dark")}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>

            {/* AI Model Settings */}
            <div className="col-span-full">
              <Label htmlFor="model">Default AI Language Model</Label>
              <div className="mt-2">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">
                      GPT-3.5 Turbo (Faster)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Select the AI model for chat interactions
              </p>
            </div>

            {/* Feedback Box */}
            <div className="col-span-full">
              <Label htmlFor="feedback">Send Feedback</Label>
              <div className="mt-2">
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="h-32"
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-end gap-x-6 p-4 sm:px-8">
          <Button
            variant="ghost"
            onClick={() => setFeedback("")}
            disabled={feedbackStatus === "sending"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleFeedbackSubmit}
            disabled={feedbackStatus === "sending" || !feedback.trim()}
          >
            {feedbackStatus === "sending" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </div>

        {(feedbackStatus === "success" || feedbackStatus === "error") && (
          <div className="px-4 pb-4 sm:px-8">
            {feedbackStatus === "success" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Feedback submitted successfully!
              </p>
            )}
            {feedbackStatus === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to submit feedback. Please try again.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
