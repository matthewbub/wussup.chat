"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef, useEffect } from "react";
import { AVAILABLE_MODELS } from "@/constants/models";
import { Message } from "./Message";
import { EmptyChatScreen } from "@/components/EmptyChatScreen";
import { useChatStore } from "../_store/chat";
import { ModelSelectionModal } from "./ModalSelectV3";
import type { AiModel } from "@/constants/models";
import { Sparkles, X, FileUp, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const CHARACTER_LIMIT = 1000;

type Attachment = {
  file: File;
  type: string;
};

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt?: string;
};

export default function ChatApp({
  sessionId,
  initialMessages = [],
}: {
  sessionId: string;
  initialMessages?: Message[];
}) {
  const { updateSessionName, user, messages, setMessages, addMessage } = useChatStore();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [localInput, setLocalInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [primaryModel, setPrimaryModel] = useState<AiModel | null>(AVAILABLE_MODELS[0]);
  const [secondaryModel, setSecondaryModel] = useState<AiModel | null>(null);

  // Initialize messages from initialMessages
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text");
      if (pastedText && pastedText.length > CHARACTER_LIMIT) {
        e.preventDefault();
        const file = new File([pastedText], "pasted-text.txt", {
          type: "text/plain",
        });
        addAttachment(file, "text");
        setLocalInput("Text document attached");
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    // Handle different file types
    if (file.type.startsWith("image/")) {
      addAttachment(file, "image");
    } else if (file.type === "application/pdf") {
      addAttachment(file, "pdf");
    } else if (file.type === "text/plain") {
      addAttachment(file, "text");
    } else {
      alert("Unsupported file type. Please upload a PDF, image, or text file.");
      return;
    }
  };

  const addAttachment = (file: File, type: string) => {
    setAttachments((prev) => [...prev, { file, type }]);
  };

  const removeAttachment = (file: File) => {
    setAttachments((prev) => prev.filter((a) => a.file !== file));
    if (localInput === "Text document attached") {
      setLocalInput("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleModelSelect = (model: AiModel) => {
    setPrimaryModel(model);
    setModalOpen(false);
  };

  const removeSecondaryModel = () => {
    setSecondaryModel(null);
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const input = textareaRef.current?.value || "";
    setStatus("streaming");

    // Generate title if this is the first message
    if (messages.length === 0) {
      const titleResponse = await fetch("/api/v1/title", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          messages: [{ role: "user", content: input }],
        }),
      });

      const titleData = await titleResponse.json();
      await updateSessionName(titleData.title);
    }

    // Create FormData and append attachments
    const formData = new FormData();
    formData.append("content", input);
    formData.append("session_id", sessionId);
    console.log("Sending Primary Model", primaryModel);
    formData.append("model", primaryModel?.id || AVAILABLE_MODELS[0].id);
    formData.append("model_provider", primaryModel?.provider || AVAILABLE_MODELS[0].provider);
    formData.append("chat_context", user?.chat_context || "You are a helpful assistant.");

    // new
    formData.append("messageHistory", JSON.stringify(messages));
    formData.append("content", input);
    // attachments
    attachments.forEach((attachment) => {
      formData.append("attachments", attachment.file);
    });

    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        // Add user message immediately
        const userMessage = {
          id: crypto.randomUUID(),
          content: input,
          role: "user" as const,
          createdAt: new Date().toISOString(),
        };
        addMessage(userMessage);

        const assistantMessage = {
          id: crypto.randomUUID(),
          content: "",
          role: "assistant" as const,
          createdAt: new Date().toISOString(),
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              if (line.startsWith("0")) {
                const data = line.slice(3, -1);
                if (data === "[DONE]") break;

                // Replace escaped newlines with actual newlines
                const cleanedData = data.replace(/\\n/g, "\n");
                assistantMessage.content += cleanedData;
                setMessages((prev: Message[]) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === "assistant") {
                    newMessages[newMessages.length - 1] = assistantMessage;
                  } else {
                    newMessages.push(assistantMessage);
                  }
                  return newMessages;
                });
              } else {
                console.warn("Unexpected line format:", line);
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
              setStatus("error");
            }
          }
        }

        // Send message info to the info API route
        try {
          await fetch("/api/v1/info", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              created_at: assistantMessage.createdAt,
              content: assistantMessage.content,
              role: assistantMessage.role,
              message_id: assistantMessage.id,
              session_id: sessionId,
            }),
          });
        } catch (error) {
          console.error("Error sending message info:", error);
        }
      }

      setStatus("idle");
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
      setLocalInput("");
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="space-y-4 mb-6 flex-1 overflow-y-scroll p-4">
        {messages &&
          messages.map((message) => (
            <Message
              key={message.id}
              content={message.content}
              id={message.id}
              is_user={message.role === "user"}
              createdAt={message.createdAt}
            />
          ))}

        {messages.length === 0 && <EmptyChatScreen setNewMessage={setLocalInput} />}
      </div>

      <div className="sticky bottom-0 bg-background">
        <div className="flex items-center gap-2 mb-4">
          <Button type="button" onClick={() => setModalOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" />
            {primaryModel
              ? `Selected: ${primaryModel.id} ${secondaryModel ? "and " + secondaryModel.id : ""}`
              : "Select AI Model"}
          </Button>

          {secondaryModel && (
            <Button type="button" variant="outline" onClick={removeSecondaryModel} className="gap-2">
              <X className="h-4 w-4" />
              Remove Model B
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-xl bg-secondary p-4 mb-4">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {attachments.map((attachment) => (
                <div
                  key={attachment.file.name}
                  className="bg-muted text-muted-foreground border border-border rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center p-1 rounded",
                      attachment.type === "pdf"
                        ? "bg-red-600 dark:bg-red-500"
                        : attachment.type === "image"
                          ? "bg-green-600 dark:bg-green-500"
                          : "bg-blue-600 dark:bg-blue-500"
                    )}
                  >
                    {attachment.type === "pdf" ? (
                      <FileText size={20} className="text-white" />
                    ) : attachment.type === "image" ? (
                      <ImageIcon size={20} className="text-white" />
                    ) : (
                      <FileUp size={20} className="text-white" />
                    )}
                  </div>
                  <span className="text-sm">
                    {attachment.file.name} ({(attachment.file.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.file)}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-2"
                  >
                    <X size={20} />
                  </button>
                  {attachment.type === "image" && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(attachment.file)}
                        alt="Preview"
                        className="max-h-32 rounded-lg"
                        onLoad={() => URL.revokeObjectURL(URL.createObjectURL(attachment.file))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <Textarea ref={textareaRef} placeholder="Type your message..." />
          </div>

          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="file-upload"
                className={cn(
                  "bg-secondary text-secondary-foreground px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors",
                  "hover:bg-secondary/80"
                )}
              >
                <FileUp className="h-4 w-4" />
                <span className="text-sm">Attach File</span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg,.gif"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={status === "streaming"}>
                Send
              </Button>
            </div>
          </div>
        </form>
      </div>

      <ModelSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectModel={handleModelSelect}
        primaryModelId={primaryModel?.id}
        defaultModelId="o3-mini"
        onRemoveSecondaryModel={removeSecondaryModel}
      />
    </div>
  );
}
