"use client";

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ImportSettings() {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isLoaded } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setError("Please upload a JSON file");
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      setImportSuccess(false);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import chat history");
      }

      setImportSuccess(true);
      setSuccessMessage(
        `Successfully imported ${result.threadsImported} chats with ${result.messagesImported} messages.`
      );

      // Refresh the page after successful import
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import chat history");
      console.error(err);
    } finally {
      setIsImporting(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
          <CardTitle>Import Chat History</CardTitle>
          <CardDescription>
            Upload a JSON file containing your chat history. The file should be in the format exported by ZCauldron.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {importSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-700 mb-4">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-gray-500 mb-4">
            To import your chat history, upload a JSON file previously exported from ZCauldron.
          </p>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
        </CardContent>
        <CardFooter>
          <Button onClick={triggerFileInput} disabled={isImporting} className="w-full sm:w-auto">
            {isImporting ? (
              <>
                Importing...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              <>
                Upload JSON File
                <Upload className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
