"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useRef, useEffect } from "react";
import { AVAILABLE_MODELS } from "@/constants/models";
import { Message as MessageComponent } from "./Message";
import { EmptyChatScreen } from "@/components/EmptyChatScreen";
import { useChatStore } from "../_store/chat";
import { ModelSelectionModal } from "./ModalSelectV3";
import type { AiModel } from "@/constants/models";
import { Sparkles, X, FileUp, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
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
  const [primaryModel, setPrimaryModel] = useState<AiModel | null>(AVAILABLE_MODELS[0]);
  const [secondaryModel, setSecondaryModel] = useState<AiModel | null>(null);

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

    try {
      // Generate title if this is the first message
      if (messages.length === 0) {
        const titleData = await generateChatTitle(sessionId, input);
        await updateSessionName(titleData.title);
      }

      // Add user message immediately
      const userMessage = createUserMessage(input);
      addMessage(userMessage);

      // Generate IDs for the response group
      const responseGroupId = crypto.randomUUID();
      const primaryMessageId = crypto.randomUUID();
      const secondaryMessageId = secondaryModel ? crypto.randomUUID() : null;

      // Store user message
      await storeChatMessages([
        createMessageUpdate({
          id: userMessage.id,
          content: userMessage.content,
          is_user: userMessage.is_user,
          session_id: sessionId,
          created_at: userMessage.created_at,
          prompt_tokens: 0,
          completion_tokens: 0,
        }),
      ]);

      // Create and add primary message
      const primaryMessage = createAIMessage({
        id: primaryMessageId,
        model: primaryModel?.id || AVAILABLE_MODELS[0].id,
        responseType: "A",
        responseGroupId,
        parentMessageId: userMessage.id,
      });
      addMessage(primaryMessage);

      // Handle primary model request
      const primaryFormData = createChatFormData({
        content: input,
        sessionId,
        model: primaryModel?.id || AVAILABLE_MODELS[0].id,
        modelProvider: primaryModel?.provider || AVAILABLE_MODELS[0].provider,
        chatContext: user?.chat_context || "You are a helpful assistant.",
        messageHistory: messages,
        responseType: "A",
        responseGroupId,
        parentMessageId: userMessage.id,
        attachments,
      });

      const primaryResponse = await fetch("/api/v1/chat-ab", {
        method: "POST",
        body: primaryFormData,
      });

      if (!primaryResponse.ok) {
        throw new Error(`Primary model error: ${primaryResponse.statusText}`);
      }

      const primaryReader = primaryResponse.body?.getReader();
      if (primaryReader) {
        await processStreamingResponse(
          primaryReader,
          (content) => {
            primaryMessage.content += content;
            setMessages((prev) => {
              const newMessages = [...prev];
              const existingMessageIndex = newMessages.findIndex((m) => m.id === primaryMessage.id);
              if (existingMessageIndex !== -1) {
                newMessages[existingMessageIndex] = { ...primaryMessage };
              }
              return newMessages;
            });
          },
          (usage) => {
            primaryMessage.prompt_tokens = usage.promptTokens;
            primaryMessage.completion_tokens = usage.completionTokens;
            userMessage.prompt_tokens = usage.promptTokens;

            setMessages((prev) => {
              const newMessages = [...prev];
              const userMessageIndex = newMessages.findIndex((m) => m.id === userMessage.id);
              const primaryMessageIndex = newMessages.findIndex((m) => m.id === primaryMessage.id);

              if (userMessageIndex !== -1) {
                newMessages[userMessageIndex] = { ...userMessage };
              }
              if (primaryMessageIndex !== -1) {
                newMessages[primaryMessageIndex] = { ...primaryMessage };
              }

              return newMessages;
            });
          }
        );
      }

      let secondaryMessage: Message | undefined;

      // Handle secondary model if present
      if (secondaryModel) {
        secondaryMessage = createAIMessage({
          id: secondaryMessageId!,
          model: secondaryModel.id,
          responseType: "B",
          responseGroupId,
          parentMessageId: userMessage.id,
        });
        addMessage(secondaryMessage);

        const secondaryFormData = createChatFormData({
          content: input,
          sessionId,
          model: secondaryModel.id,
          modelProvider: secondaryModel.provider,
          chatContext: user?.chat_context || "You are a helpful assistant.",
          messageHistory: messages,
          responseType: "B",
          responseGroupId,
          parentMessageId: userMessage.id,
          attachments,
        });

        const secondaryResponse = await fetch("/api/v1/chat-ab", {
          method: "POST",
          body: secondaryFormData,
        });

        if (!secondaryResponse.ok) {
          throw new Error(`Secondary model error: ${secondaryResponse.statusText}`);
        }

        const secondaryReader = secondaryResponse.body?.getReader();
        if (secondaryReader) {
          await processStreamingResponse(secondaryReader, (content) => {
            secondaryMessage!.content += content;
            setMessages((prev) => {
              const newMessages = [...prev];
              const existingMessageIndex = newMessages.findIndex((m) => m.id === secondaryMessage!.id);
              if (existingMessageIndex !== -1) {
                newMessages[existingMessageIndex] = { ...secondaryMessage! };
              }
              return newMessages;
            });
          });
        }
      }

      // Store final messages
      await storeChatMessages([
        createMessageUpdate({
          id: primaryMessage.id,
          content: primaryMessage.content,
          is_user: primaryMessage.is_user,
          session_id: sessionId,
          created_at: primaryMessage.created_at,
          model: primaryMessage.model,
          response_type: primaryMessage.responseType,
          response_group_id: primaryMessage.responseGroupId,
          parent_message_id: primaryMessage.parentMessageId,
          prompt_tokens: primaryMessage.prompt_tokens,
          completion_tokens: primaryMessage.completion_tokens,
        }),
        ...(secondaryMessage
          ? [
              createMessageUpdate({
                id: secondaryMessage.id,
                content: secondaryMessage.content,
                is_user: secondaryMessage.is_user,
                session_id: sessionId,
                created_at: secondaryMessage.created_at,
                model: secondaryMessage.model,
                response_type: secondaryMessage.responseType,
                response_group_id: secondaryMessage.responseGroupId,
                parent_message_id: secondaryMessage.parentMessageId,
                prompt_tokens: secondaryMessage.prompt_tokens || 0,
                completion_tokens: secondaryMessage.completion_tokens || 0,
              }),
            ]
          : []),
        createMessageUpdate({
          id: userMessage.id,
          content: userMessage.content,
          is_user: userMessage.is_user,
          session_id: sessionId,
          created_at: userMessage.created_at,
          prompt_tokens: userMessage.prompt_tokens,
          completion_tokens: 0,
        }),
      ]);

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
          messages.reduce((acc: React.JSX.Element[], message, index) => {
            if (message.is_user) {
              acc.push(<MessageComponent key={message.id} {...message} />);
              return acc;
            }

            if (message.responseType === "A") {
              const nextMessage = messages[index + 1];
              if (nextMessage?.responseType === "B") {
                acc.push(
                  <div key={message.id} className="flex gap-4">
                    <div className="flex-1 border-r pr-4">
                      <MessageComponent {...message} isLoading={status === "streaming"} />
                    </div>
                    <div className="flex-1 pl-4">
                      <MessageComponent {...nextMessage} isLoading={status === "streaming"} />
                    </div>
                  </div>
                );
                return acc;
              }
            }

            if (message.responseType === "B") {
              return acc;
            }

            acc.push(<MessageComponent key={message.id} {...message} isLoading={status === "streaming"} />);
            return acc;
          }, [])}

        {messages.length === 0 && <EmptyChatScreen setNewMessage={setLocalInput} />}
      </div>

      <div className="sticky bottom-0 bg-background">
        <div className="flex items-center gap-2 mb-4">
          <Button type="button" onClick={() => setModalOpen(true)} className="gap-2" disabled={status === "streaming"}>
            <Sparkles className="h-4 w-4" />
            {primaryModel
              ? `Selected: ${primaryModel.id} ${secondaryModel ? "and " + secondaryModel.id : ""}`
              : "Select AI Model"}
          </Button>

          {secondaryModel && (
            <Button
              type="button"
              variant="outline"
              onClick={removeSecondaryModel}
              className="gap-2"
              disabled={status === "streaming"}
            >
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
      </div>

      <ModelSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSelectModel={handleModelSelect}
        primaryModelId={primaryModel?.id}
        defaultModelId="o3-mini"
        onRemoveSecondaryModel={removeSecondaryModel}
        disabled={status === "streaming"}
      />
    </div>
  );
}
