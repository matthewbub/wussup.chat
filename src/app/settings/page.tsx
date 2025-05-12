"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ApiKey = {
  id: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
};

export default function SettingsPage() {
  const { userId } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Fetch user's API keys when component mounts
    const fetchApiKeys = async () => {
      if (!userId) return;

      setIsLoadingKeys(true);
      try {
        const response = await fetch("/api/settings/apikey");
        if (!response.ok) {
          throw new Error("Failed to fetch API keys");
        }

        const data = await response.json();
        setApiKeys(data.apiKeys);
      } catch (error) {
        console.error("Error fetching API keys:", error);
      } finally {
        setIsLoadingKeys(false);
      }
    };

    fetchApiKeys();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setMessage({ type: "error", text: "API key is required" });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/settings/apikey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          provider: "openai",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save API key");
      }

      setMessage({ type: "success", text: "API key saved successfully" });
      setApiKey("");

      // Refresh the API keys list
      const keysResponse = await fetch("/api/settings/apikeys");
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setApiKeys(keysData.apiKeys);
      }
    } catch (error) {
      console.error("Error saving API key:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (provider: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/settings/apikey?provider=${provider}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete API key");
      }

      // Refresh the API keys list
      const keysResponse = await fetch("/api/settings/apikeys");
      if (keysResponse.ok) {
        const keysData = await keysResponse.json();
        setApiKeys(keysData.apiKeys);
      }

      setMessage({ type: "success", text: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format provider name for display
  const formatProvider = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* API Keys List */}
      <div className="bg-card/20 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>

        {isLoadingKeys ? (
          <p className="text-muted-foreground">Loading API keys...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-muted-foreground">
            You don't have any API keys yet.
          </p>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div>
                  <p className="font-medium">{formatProvider(key.provider)}</p>
                  <p className="text-sm text-muted-foreground">
                    Added: {formatDate(key.createdAt)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(key.provider)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add API Key Form */}
      <div className="bg-card/20 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add OpenAI API Key</h2>
        <p className="text-muted-foreground mb-4">
          Add your OpenAI API key to use your own account for chat completions
          and image generation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
              API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full"
              autoComplete="off"
            />
          </div>

          {message.text && (
            <div
              className={`p-3 rounded ${
                message.type === "error"
                  ? "bg-red-100 text-red-800"
                  : message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : ""
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save API Key"}
          </Button>
        </form>
      </div>
    </div>
  );
}
