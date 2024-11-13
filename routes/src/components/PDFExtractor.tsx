import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth"; // Assuming you have an auth hook

interface ExtractResponse {
  text: string;
  error?: string;
}

const PDFExtractor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  // const { token } = useAuth(); // Get JWT token from your auth context

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setError("");
    setExtractedText("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/pdf/extract", {
        method: "POST",
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
        body: formData,
      });

      const data: ExtractResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract PDF text");
      }

      setExtractedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">PDF Text Extractor</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={!file || isLoading}
          className={`px-4 py-2 rounded-md text-white font-medium
            ${
              !file || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isLoading ? "Processing..." : "Extract Text"}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {extractedText && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Extracted Text</h3>
          <pre className="whitespace-pre-wrap">{extractedText}</pre>
        </div>
      )}
    </div>
  );
};

export default PDFExtractor;
