"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chat-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@clerk/nextjs";

type Thread = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  Message: any[];
  [key: string]: any;
};

type ExportSettingsProps = {
  threads?: Thread[];
};

export default function ExportSettings({ threads }: ExportSettingsProps) {
  const { chatSessions } = useChatStore();
  const [exportFormat, setExportFormat] = useState("json");
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
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
        chat_history: thread.Message.reduce((acc: any[], message: any) => {
          acc.push({ role: "user", content: message.input });
          acc.push({ role: "assistant", content: message.output });
          return acc;
        }, []),
      }))
    : chatSessions;

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessions((prev) =>
      prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSessions.length === availableSessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(availableSessions.map((session) => session.id));
    }
  };

  const exportChatHistory = async () => {
    try {
      setIsExporting(true);
      setError(null);
      setExportSuccess(false);

      if (selectedSessions.length === 0) {
        setError("Please select at least one chat to export");
        return;
      }

      // Fetch the full chat history data from the server
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionIds: selectedSessions,
          format: exportFormat,
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

      // Format the data based on selected format
      let formattedData;
      let exportFileName;
      let exportMimeType;

      if (exportFormat === "json") {
        formattedData = JSON.stringify(exportData, null, 2);
        exportFileName = "chat-history.json";
        exportMimeType = "application/json";
      } else if (exportFormat === "csv") {
        // Create CSV format
        const headers = "Chat Name,Date,Role,Content\n";
        const rows = exportData
          .flatMap((session: { name: string; updated_at: string; chat_history: { role: string; content: string }[] }) =>
            session.chat_history.map(
              (msg: { role: string; content: string }) =>
                `"${session.name.replace(/"/g, '""')}","${new Date(session.updated_at).toLocaleString()}","${
                  msg.role
                }","${msg.content.replace(/"/g, '""')}"`
            )
          )
          .join("\n");

        formattedData = headers + rows;
        exportFileName = "chat-history.csv";
        exportMimeType = "text/csv";
      } else if (exportFormat === "markdown") {
        // Create Markdown format
        formattedData = exportData
          .map((session: { name: string; updated_at: string; chat_history: { role: string; content: string }[] }) => {
            const chatTitle = `# ${session.name}\n\nDate: ${new Date(session.updated_at).toLocaleString()}\n\n`;
            const messages = session.chat_history
              .map((msg: { role: string; content: string }) => `**${msg.role}**: ${msg.content}`)
              .join("\n\n---\n\n");
            return chatTitle + messages;
          })
          .join("\n\n\n");

        exportFileName = "chat-history.md";
        exportMimeType = "text/markdown";
      } else if (exportFormat === "txt") {
        // Create plain text format
        formattedData = exportData
          .map((session: { name: string; updated_at: string; chat_history: { role: string; content: string }[] }) => {
            const chatTitle = `${session.name}\nDate: ${new Date(session.updated_at).toLocaleString()}\n\n`;
            const messages = session.chat_history
              .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
              .join("\n\n");
            return chatTitle + messages;
          })
          .join("\n\n----------------------------------------\n\n");

        exportFileName = "chat-history.txt";
        exportMimeType = "text/plain";
      }

      // Create and download the file
      const blob = new Blob([formattedData as string], { type: exportMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = exportFileName as string;
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
          <CardDescription>Download your chat conversations in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="export-format" className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="txt">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Chats to Export</Label>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedSessions.length === availableSessions.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="max-h-64 overflow-y-auto border rounded-md p-2">
                {availableSessions.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No chat history found</p>
                ) : (
                  <div className="space-y-2">
                    {availableSessions.map((session) => (
                      <div key={session.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`session-${session.id}`}
                          checked={selectedSessions.includes(session.id)}
                          onCheckedChange={() => handleSelectSession(session.id)}
                        />
                        <Label htmlFor={`session-${session.id}`} className="flex-1 cursor-pointer text-sm">
                          {session.name || "Untitled Chat"} ({new Date(session.updated_at).toLocaleDateString()})
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {exportSuccess && (
              <Alert className="bg-green-50 border-green-200 text-green-700">
                <AlertDescription>Chat history exported successfully!</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={exportChatHistory}
            disabled={isExporting || selectedSessions.length === 0}
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
