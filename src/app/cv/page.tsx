"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, FileText, FileUp } from "lucide-react";
// import { // toast } from "@/components/ui/// toast";
import { cn } from "@/lib/utils";
import { Indie_Flower } from "next/font/google";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const CHARACTER_LIMIT = 1000;

const indieFlower = Indie_Flower({
  variable: "--font-indie-flower",
  subsets: ["latin"],
  weight: "400",
});

type Attachment = {
  file: File;
  type: "job-description" | "resume";
};

type FormData = {
  jobDescription: string;
};

export default function Home() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, watch } = useForm<FormData>();

  const jobDescription = watch("jobDescription");

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text");
      if (pastedText && pastedText.length > CHARACTER_LIMIT) {
        e.preventDefault();
        const file = new File([pastedText], "job-description.txt", {
          type: "text/plain",
        });
        addAttachment(file, "job-description");
        setValue("jobDescription", "Job description attached as a text document");
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      addAttachment(file, "resume");
    }
  };

  const addAttachment = (file: File, type: "job-description" | "resume") => {
    setAttachments((prev) => [...prev.filter((a) => a.type !== type), { file, type }]);
  };

  const removeAttachment = (type: "job-description" | "resume") => {
    setAttachments((prev) => prev.filter((a) => a.type !== type));
    if (type === "job-description" && jobDescription === "Job description attached as a text document") {
      setValue("jobDescription", "");
    }
    if (type === "resume" && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: FormData) => {
    setGeneratedContent("");

    const formData = new FormData();
    formData.append("jobDescription", data.jobDescription);
    attachments.forEach((attachment) => {
      formData.append(attachment.type, attachment.file);
    });

    try {
      setIsGenerating(true);

      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to generate cover letter:", response.status, response.statusText);
        // toast.error(`Failed to generate cover letter: ${response.statusText}`);
        setIsGenerating(false);
      }

      // Check if it's a stream response
      if (response.headers.get("content-type")?.includes("text/plain")) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode and parse the chunk
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.includes("An error occurred")) {
                // toast.error("AI model failed to generate response");
                setIsGenerating(false);
                return;
              }

              if (line.startsWith("0")) {
                // first 4 and last 1 char
                const data = line.slice(3, -1);
                if (data === "[DONE]") break;

                try {
                  // Replace escaped newlines with actual newlines
                  const cleanedData = data.replace(/\\n/g, "\n");
                  result += cleanedData;
                  setGeneratedContent(result);
                } catch (e) {
                  console.error("Error parsing chunk:", e);
                }
              }
            }
          }
        }

        // toast.success("Cover letter generated successfully!");
        setIsGenerating(false);
      } else {
        console.error("Received unexpected response:", await response.text());
        // toast.error("Unexpected response from server. Please try again.");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // toast.error("Network error. Please check your connection and try again.");
      setIsGenerating(false);
    }
  };

  const isResumeAttached = attachments.filter((a) => a.type === "resume").length > 0;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 mt-20">
      <div className="flex-1">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className={cn("text-7xl font-bold text-center mb-4", indieFlower.className)}>Fooking Cover Letters!</h1>
          <p className="text-xl text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Describe the role you&apos;re after and we&apos;ll try our best to generate a cover letter that helps you
            shine
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative mb-4">
              <Input
                className="w-full bg-background border-input rounded-xl py-6 px-4 text-foreground placeholder:text-muted-foreground"
                placeholder="Describe the job role"
                {...register("jobDescription")}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <label
                  htmlFor="resume-upload"
                  className={cn(
                    "bg-secondary text-secondary-foreground px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors",
                    isResumeAttached ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:bg-secondary/80 "
                  )}
                >
                  <span className="text-sm">Attach Resume</span>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isResumeAttached}
                  />
                </label>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.type}
                    className="bg-muted text-muted-foreground border border-border rounded-lg px-3 py-2 flex items-center gap-2"
                  >
                    {attachment.type === "job-description" ? (
                      <div className="flex items-center justify-center p-1 bg-blue-600 dark:bg-blue-500 rounded">
                        <FileText size={20} className="text-white" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-1 bg-rose-600 dark:bg-rose-500 rounded">
                        <FileUp size={20} className="text-white" />
                      </div>
                    )}
                    <span className="text-sm">
                      {attachment.file.name} ({(attachment.file.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.type)}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button type="submit" className="w-full rounded-full bg-teal-500 hover:bg-teal-600">
              Generate Cover Letter
            </Button>
          </form>
        </div>

        {generatedContent && <TiptapEditor content={generatedContent} editable={!isGenerating} />}
      </div>
      <footer className="text-center text-sm text-muted-foreground mt-12">
        <p>
          2025. Made by{" "}
          <a href="https://bsky.app/profile/matthewbub.com" className="underline">
            Matthew Bub
          </a>
        </p>
      </footer>
    </div>
  );
}

const TiptapEditor = ({ content, editable = false }: { content: string; editable?: boolean }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-muted/50 rounded-xl">
      <EditorContent editor={editor} />
      <Button
        onClick={() => {
          // Get plain text content from the editor
          const plainText = editor?.getText() || content;
          navigator.clipboard.writeText(plainText);
        }}
        className="mt-4"
      >
        Copy to Clipboard
      </Button>
    </div>
  );
};
