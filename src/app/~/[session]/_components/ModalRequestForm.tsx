"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ModelRequestFormProps {
  onCancel: () => void;
}

export function ModelRequestForm({ onCancel }: ModelRequestFormProps) {
  const [formData, setFormData] = useState({
    modelName: "",
    useCase: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/request-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit request");
      }

      setSubmitStatus("success");
      // Reset form after successful submission
      setFormData({
        modelName: "",
        useCase: "",
      });
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitStatus === "success" && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Thanks for your request! We'll consider it for future updates.</AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage || "Failed to submit request. Please try again."}</AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          Your feedback helps us build better features. We use this information to prioritize model integrations.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="modelName">Model Name *</Label>
        <Input
          id="modelName"
          name="modelName"
          value={formData.modelName}
          onChange={handleChange}
          placeholder="e.g., GPT-5, Claude 4, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="useCase">What would you like to achieve with this model?</Label>
        <Textarea
          id="useCase"
          name="useCase"
          value={formData.useCase}
          onChange={handleChange}
          placeholder="Tell us how you'd use this model in your workflow"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          This helps us understand your needs and build more useful features.
        </p>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
