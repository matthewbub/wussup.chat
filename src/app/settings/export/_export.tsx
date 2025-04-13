"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@clerk/nextjs";

type Thread = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  Message: {
    id: string;
    input: string;
    output: string;
    model: string;
  }[];
};

type ExportSettingsProps = {
  threads?: Thread[];
};

export default function ExportSettings({ threads }: ExportSettingsProps) {
  const { chatSessions } = useChatStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoaded } = useAuth();

  // Format server-side threads to match client-side format if provided
  const availableSessions = threads
    ? threads.map((thread) => ({
        id: thread.id,
        name: thread.name,
        created_at: thread.createdAt.toISOString(),
        updated_at: thread.updatedAt.toISOString(),
        pinned: thread.pinned || false,
        chat_history: thread.Message.reduce(
          (acc: { role: string; content: string }[], message: { input: string; output: string }) => {
            acc.push({ role: "user", content: message.input });
            acc.push({ role: "assistant", content: message.output });
            return acc;
          },
          []
        ),
      }))
    : chatSessions;

  const exportChatHistory = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setExportSuccess(false);

      if (availableSessions.length === 0) {
        setError("No chat history found to export");
        return;
      }

      // Get all session IDs
      const sessionIds = availableSessions.map((session) => session.id);

      // Fetch the full chat history data from the server
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionIds: sessionIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export chat history");
      }

      const { data: exportData } = await response.json();

      if (!exportData || exportData.length === 0) {
        throw new Error("No data returned from server");
      }

      // Format to match standard JSON format
      const formattedData = {
        threads: exportData.map(
          (thread: {
            name: string;
            id: string;
            created_at: string;
            updated_at: string;
            pinned: boolean;
            chat_history: { role: string; content: string; model: string }[];
          }) => ({
            title: thread.name,
            id: thread.id,
            created_at: thread.created_at,
            updated_at: thread.updated_at,
            last_message_at: thread.updated_at,
            user_edited_title: false,
            status: "done",
            model: thread.chat_history.length > 0 ? thread.chat_history[1]?.model || "unknown" : "unknown",
          })
        ),
        messages: exportData.flatMap(
          (thread: {
            id: string;
            created_at: string;
            chat_history: { role: string; content: string; model: string }[];
          }) =>
            thread.chat_history.map((msg: { role: string; content: string; model: string }, index: number) => {
              const id = crypto.randomUUID();
              const created_at = new Date(new Date(thread.created_at).getTime() + index * 60000).toISOString();

              return {
                threadId: thread.id,
                role: msg.role,
                content: msg.content,
                status: "done",
                model: msg.model || "unknown",
                modelParams: { reasoningEffort: "low" },
                id: id,
                created_at: created_at,
                attachments: [],
              };
            })
        ),
      };

      const timestamp = new Date().toISOString().replace(/:/g, "_");
      const exportFileName = `chat-export-${timestamp}.json`;
      const exportMimeType = "application/json";

      // Create and download the file
      const blob = new Blob([JSON.stringify(formattedData, null, 2)], { type: exportMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export chat history");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto py-8 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Export Chat History</CardTitle>
          <CardDescription>
            Download all your chat conversations as a JSON file. This file can be used as a backup of your chat history
            or imported into other applications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {exportSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-700 mb-4">
              <AlertDescription>Chat history exported successfully!</AlertDescription>
            </Alert>
          )}

          {availableSessions.length === 0 ? (
            <p className="text-sm text-gray-500">No chat history found to export.</p>
          ) : (
            <p className="text-sm text-gray-500">
              You have {availableSessions.length} {availableSessions.length === 1 ? "chat" : "chats"} that will be
              exported.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={exportChatHistory}
            disabled={isExporting || availableSessions.length === 0}
            className="w-full sm:w-auto"
          >
            {isExporting ? "Exporting..." : "Export Chat History"}
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
