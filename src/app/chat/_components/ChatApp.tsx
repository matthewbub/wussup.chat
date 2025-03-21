"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef, useEffect } from "react";
import { AVAILABLE_MODELS } from "@/constants/models";
import { Message as MessageComponent } from "./Message";
import { useChatStore } from "../_store/chat";
import { ModelSelectionModal } from "./ModalSelectV3";
import type { AiModel } from "@/constants/models";
import { Sparkles, FileUp, FileText, Image as ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import {
  validateFile,
  CHARACTER_LIMIT,
  processStreamingResponse,
  createChatFormData,
  storeChatMessages,
  generateChatTitle,
  createUserMessage,
  createAIMessage,
  createMessageUpdate,
} from "../_utils/chat";
import { ChatStatus, Attachment } from "../_types/chat";

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
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [localInput, setLocalInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel>(AVAILABLE_MODELS[0]);

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

    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    addAttachment(file, validation.type!);
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
    setSelectedModel(model);
    setModalOpen(false);
  };

  const clearChat = () => {
    // Clear input and attachments immediately
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
    setLocalInput("");
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const input = textareaRef.current?.value || "";

    // Clear chat immediately
    clearChat();

    // Add user message immediately
    const userMessage = {
      id: crypto.randomUUID(),
      content: input,
      is_user: true,
      created_at: new Date().toISOString(),
      model: selectedModel.id,
      model_provider: selectedModel.provider,
    };

    addMessage(userMessage);

    // Start processing
    setStatus("streaming");

    if (messages.length === 0) {
      const titleData = await generateChatTitle(sessionId, input);
      await updateSessionName(titleData.title);
    }

    // try {
    //   // Generate title if this is the first message

    //   // Create and add AI message
    const aiMessage = createAIMessage({
      id: crypto.randomUUID(),
      model: selectedModel.id,
    });
    addMessage(aiMessage);

    //   // Handle model request
    const formData = createChatFormData({
      content: input,
      sessionId,
      model: selectedModel.id,
      modelProvider: selectedModel.provider,
      chatContext: user?.chat_context || "You are a helpful assistant.",
      messageHistory: messages,
      attachments,
    });

    const response = await fetch("/api/v1/chat", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setStatus("error");
      throw new Error(`Model error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (reader) {
      await processStreamingResponse(
        reader,
        // run this on every chunk
        (content) => {
          aiMessage.content += content;
          setMessages((prev) => {
            const newMessages = [...prev];
            const existingMessageIndex = newMessages.findIndex((m) => m.id === aiMessage.id);
            if (existingMessageIndex !== -1) {
              newMessages[existingMessageIndex] = { ...aiMessage };
            }
            return newMessages;
          });
        },
        (usage) => {
          console.log("usage", usage);
          // aiMessage.prompt_tokens = usage.promptTokens;
          // aiMessage.completion_tokens = usage.completionTokens;

          fetch("/api/v1/chat/usage", {
            method: "POST",
            body: JSON.stringify({
              sessionId,
              usage,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("data", data);
            })
            .catch((err) => console.error(err));
        }
      );
    }

    setStatus("idle");
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {messages.length > 0 && (
        <div className="space-y-8 mb-6 flex-1 overflow-y-scroll p-4">
          {messages.map((message) => (
            <MessageComponent
              key={message.id}
              {...message}
              isLoading={status === "streaming" && !message.is_user && message.id === messages[messages.length - 1].id}
            />
          ))}
        </div>
      )}

      <div className={cn(messages.length === 0 && "flex-1 flex flex-col items-center justify-center")}>
        <div className={cn("bg-background w-full", messages.length !== 0 && "sticky bottom-0")}>
          <div className="flex items-center gap-2 mb-4">
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              className="gap-2"
              disabled={status === "streaming"}
            >
              <Sparkles className="h-4 w-4" />
              {selectedModel ? selectedModel.id : "Select AI Model"}
            </Button>
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
              <Textarea ref={textareaRef} placeholder="Type your message..." disabled={status === "streaming"} />
            </div>

            <div className="flex justify-between gap-2">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "bg-secondary text-secondary-foreground px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors",
                    "hover:bg-secondary/80",
                    status === "streaming" && "opacity-50 cursor-not-allowed"
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
                    disabled={status === "streaming"}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={status === "streaming"}>
                  {status === "streaming" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </div>
          </form>

          {messages.length === 0 && (
            <div className="flex space-x-4 items-center justify-center">
              <p className="text-center text-sm text-muted-foreground">
                You&apos;re connected and ready to go; ask anything!
              </p>
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            </div>
          )}
        </div>
      </div>

      <ModelSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectModel={handleModelSelect}
        selectedModelId={selectedModel.id}
        defaultModelId="o3-mini"
        disabled={status === "streaming"}
      />
    </div>
  );
}
