import React from "react";
import { useAISettingsStore } from "../../stores/aiSettingsStore";
import { useState } from "react";

export function AppSettings() {
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
      // Replace with your actual feedback submission logic
      await fetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ feedback }),
      });
      setFeedbackStatus("success");
      setFeedback("");
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    } catch (error) {
      setFeedbackStatus("error");
      setTimeout(() => setFeedbackStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="card-title text-xl mb-6">App Settings</h2>

      {/* Theme Settings */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg font-medium">Theme</span>
        </label>
        {/* Theme select options go here */}
        <label className="label">
          <span className="label-text-alt">
            Choose your preferred color theme
          </span>
        </label>
      </div>

      {/* AI Model Settings */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg font-medium">
            AI Language Model
          </span>
        </label>
        {/* AI Model select options go here */}
        <label className="label">
          <span className="label-text-alt">
            Select the AI model for chat interactions
          </span>
        </label>
      </div>

      {/* Feedback Box */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg font-medium">Send Feedback</span>
        </label>
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <textarea
            className="textarea textarea-bordered w-full h-32"
            placeholder="Share your thoughts, suggestions, or report issues..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className={`btn btn-primary ${
                feedbackStatus === "sending" ? "loading" : ""
              }`}
              disabled={feedbackStatus === "sending" || !feedback.trim()}
            >
              Submit Feedback
            </button>
            {feedbackStatus === "success" && (
              <span className="text-success">
                Feedback submitted successfully!
              </span>
            )}
            {feedbackStatus === "error" && (
              <span className="text-error">
                Failed to submit feedback. Please try again.
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
