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
  responseType?: string;
  responseGroupId?: string;
  parentMessageId?: string;
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

  const handleModelSelect = (model: AiModel, isSecondary?: boolean) => {
    if (isSecondary) {
      setSecondaryModel(model);
    } else {
      setPrimaryModel(model);
    }
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

    try {
      // Add user message immediately
      const userMessage = {
        id: crypto.randomUUID(),
        content: input,
        role: "user" as const,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMessage);

      // Generate IDs for the response group
      const responseGroupId = crypto.randomUUID();
      const primaryMessageId = crypto.randomUUID();
      const secondaryMessageId = secondaryModel ? crypto.randomUUID() : null;

      // Store user message first
      await fetch("/api/v1/chat-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              id: userMessage.id,
              content: userMessage.content,
              role: userMessage.role,
              session_id: sessionId,
              created_at: userMessage.createdAt,
            },
          ],
        }),
      });

      // Create FormData for the primary model
      const primaryFormData = new FormData();
      primaryFormData.append("content", input);
      primaryFormData.append("session_id", sessionId);
      primaryFormData.append("model", primaryModel?.id || AVAILABLE_MODELS[0].id);
      primaryFormData.append("model_provider", primaryModel?.provider || AVAILABLE_MODELS[0].provider);
      primaryFormData.append("chat_context", user?.chat_context || "You are a helpful assistant.");
      primaryFormData.append("messageHistory", JSON.stringify(messages));
      primaryFormData.append("response_type", "A");
      primaryFormData.append("response_group_id", responseGroupId);
      primaryFormData.append("parent_message_id", userMessage.id);

      // Add attachments if any
      attachments.forEach((attachment) => {
        primaryFormData.append("attachments", attachment.file);
      });

      // Create primary message placeholder
      const primaryMessage: Message = {
        id: primaryMessageId,
        content: "",
        role: "assistant",
        createdAt: new Date().toISOString(),
        responseType: "A",
        responseGroupId,
        parentMessageId: userMessage.id,
      };
      addMessage(primaryMessage);

      // Start primary model request
      const primaryResponse = await fetch("/api/v1/chat-ab", {
        method: "POST",
        body: primaryFormData,
      });

      if (!primaryResponse.ok) {
        throw new Error(`Primary model error: ${primaryResponse.statusText}`);
      }

      // Handle primary model streaming
      const primaryReader = primaryResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (primaryReader) {
        while (true) {
          const { done, value } = await primaryReader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              if (line.startsWith("0")) {
                const data = line.slice(3, -1);
                if (data === "[DONE]") break;

                const cleanedData = data.replace(/\\n/g, "\n");
                primaryMessage.content += cleanedData;

                setMessages((prev: Message[]) => {
                  const newMessages = [...prev];
                  const existingMessageIndex = newMessages.findIndex((m) => m.id === primaryMessage.id);

                  if (existingMessageIndex !== -1) {
                    newMessages[existingMessageIndex] = { ...primaryMessage };
                  }

                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

      let secondaryMessage: Message | undefined;

      // If there's a secondary model, make a separate request
      if (secondaryModel) {
        const secondaryFormData = new FormData();
        secondaryFormData.append("content", input);
        secondaryFormData.append("session_id", sessionId);
        secondaryFormData.append("model", secondaryModel.id);
        secondaryFormData.append("model_provider", secondaryModel.provider);
        secondaryFormData.append("chat_context", user?.chat_context || "You are a helpful assistant.");
        secondaryFormData.append("messageHistory", JSON.stringify(messages));
        secondaryFormData.append("response_type", "B");
        secondaryFormData.append("response_group_id", responseGroupId);
        secondaryFormData.append("parent_message_id", userMessage.id);

        // Add attachments if any
        attachments.forEach((attachment) => {
          secondaryFormData.append("attachments", attachment.file);
        });

        // Create secondary message placeholder
        secondaryMessage = {
          id: secondaryMessageId!,
          content: "",
          role: "assistant",
          createdAt: new Date().toISOString(),
          responseType: "B",
          responseGroupId,
          parentMessageId: userMessage.id,
        };
        addMessage(secondaryMessage);

        // Start secondary model request
        const secondaryResponse = await fetch("/api/v1/chat-ab", {
          method: "POST",
          body: secondaryFormData,
        });

        if (!secondaryResponse.ok) {
          throw new Error(`Secondary model error: ${secondaryResponse.statusText}`);
        }

        // Handle secondary model streaming
        const secondaryReader = secondaryResponse.body?.getReader();

        if (secondaryReader) {
          while (true) {
            const { done, value } = await secondaryReader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              try {
                if (line.startsWith("0")) {
                  const data = line.slice(3, -1);
                  if (data === "[DONE]") break;

                  const cleanedData = data.replace(/\\n/g, "\n");
                  secondaryMessage.content += cleanedData;

                  setMessages((prev: Message[]) => {
                    const newMessages = [...prev];
                    const existingMessageIndex = newMessages.findIndex((m) => m.id === secondaryMessage!.id);

                    if (existingMessageIndex !== -1) {
                      newMessages[existingMessageIndex] = { ...secondaryMessage! };
                    }

                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Error parsing chunk:", e);
              }
            }
          }
        }
      }

      // Store both model responses
      await fetch("/api/v1/chat-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              id: primaryMessage.id,
              content: primaryMessage.content,
              role: primaryMessage.role,
              session_id: sessionId,
              created_at: primaryMessage.createdAt,
              response_type: primaryMessage.responseType,
              response_group_id: primaryMessage.responseGroupId,
              parent_message_id: primaryMessage.parentMessageId,
              model: primaryModel?.id,
              model_provider: primaryModel?.provider,
            },
            ...(secondaryMessage
              ? [
                  {
                    id: secondaryMessage.id,
                    content: secondaryMessage.content,
                    role: secondaryMessage.role,
                    session_id: sessionId,
                    created_at: secondaryMessage.createdAt,
                    response_type: secondaryMessage.responseType,
                    response_group_id: secondaryMessage.responseGroupId,
                    parent_message_id: secondaryMessage.parentMessageId,
                    model: secondaryModel?.id,
                    model_provider: secondaryModel?.provider,
                  },
                ]
              : []),
          ],
        }),
      });

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
