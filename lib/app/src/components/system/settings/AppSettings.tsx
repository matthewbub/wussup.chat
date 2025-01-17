"use client";

import { useThemeStore } from "@/stores/themeStore";
import { useAISettingsStore } from "@/stores/aiSettingsStore";
import { useState } from "react";

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
    <div className="space-y-8">
      <h2 className="text-xl font-bold mb-6 dark:text-white">App Settings</h2>

      {/* Theme Settings */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium dark:text-gray-200">Theme</label>
        <select
          className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          value={theme}
          onChange={(e) => setTheme(e.target.value as "light" | "dark")}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Choose your preferred color theme
        </span>
      </div>

      {/* AI Model Settings */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium dark:text-gray-200">
          AI Language Model
        </label>
        <select
          className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="gpt-4">GPT-4 (Most Capable)</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
        </select>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Select the AI model for chat interactions
        </span>
      </div>

      {/* Feedback Box */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-medium dark:text-gray-200">
          Send Feedback
        </label>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <textarea
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder="Share your thoughts, suggestions, or report issues..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800 ${
                feedbackStatus === "sending" ? "opacity-75 cursor-wait" : ""
              }`}
              disabled={feedbackStatus === "sending" || !feedback.trim()}
            >
              {feedbackStatus === "sending" ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                "Submit Feedback"
              )}
            </button>
            {feedbackStatus === "success" && (
              <span className="text-green-600 dark:text-green-400">
                Feedback submitted successfully!
              </span>
            )}
            {feedbackStatus === "error" && (
              <span className="text-red-600 dark:text-red-400">
                Failed to submit feedback. Please try again.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
