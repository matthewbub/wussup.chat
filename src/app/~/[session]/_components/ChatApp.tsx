"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import React, { useState } from "react";
import { AVAILABLE_MODELS } from "@/constants/models";
import { getButtonProps, getButtonChildren } from "../_helpers/getButtonProps";
import { Message } from "./Message";
import { EmptyChatScreen } from "@/components/EmptyChatScreen";
import { useChatStore } from "../_store/chat";
import ModelSelector from "@/app/~/[session]/_components/ModelSelect";

export default function ChatApp({
  sessionId,
  initialMessages = [],
}: {
  sessionId: string;
  initialMessages?: { id: string; content: string; role: "user" | "assistant" }[];
}) {
  const { updateSessionName, user } = useChatStore();
  const { messages, input, handleInputChange, handleSubmit, status, stop, reload, setInput } = useChat({
    api: "/api/v1/chat",
    initialMessages: initialMessages,
    onFinish: async (message, { usage, finishReason }) => {
      // TODO: ADD THIS
      console.log("Finished streaming message:", message);
      console.log("Token usage:", usage);
      console.log("Finish reason:", finishReason);

      // Shoudln't this be on the server to begin w
      const response = await fetch("/api/v1/info", {
        method: "POST",
        body: JSON.stringify({
          created_at: message.createdAt,
          content: message.content,
          role: message.role,
          message_id: message.id,
          session_id: sessionId,
          prompt_tokens: usage?.promptTokens,
          completion_tokens: usage?.completionTokens,
          total_tokens: usage?.totalTokens,
        }),
      });
      const data = await response.json();
      console.log("Response:", data);
    },
    onError: (error) => {
      console.error("An error occurred:", error);
    },
    onResponse: (response) => {
      // It's worth noting that you can abort the processing by throwing an error in the onResponse callback.
      // This will trigger the onError callback and stop the message from being appended to the chat UI.
      // This can be useful for handling unexpected responses from the AI provider.
      console.log("Received HTTP response from server:", response);
    },
  });

  const [model, setModel] = useState(AVAILABLE_MODELS[0].model);
  const [modelProvider, setModelProvider] = useState<"openai" | "anthropic" | "xai" | "google">(
    AVAILABLE_MODELS[0].provider
  );

  const handleModelSelect = (modelName: string, provider: "openai" | "anthropic" | "xai" | "google") => {
    setModel(modelName);
    setModelProvider(provider);
  };

  const componentSubmitHandler = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    console.log("Model at submit:", model);
    console.log("Provider at submit:", modelProvider);
    console.log("User chat context:", user?.chat_context);

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
      console.log("Title response:", titleData);

      await updateSessionName(titleData.title);
    }

    handleSubmit(ev, {
      data: {
        user_specified_model: model,
        model_provider: modelProvider,
        session_id: sessionId,
        chat_context: user?.chat_context || "You are a helpful assistant.",
      },
    });
    setInput("");
  };

  // BUTTON PROPS
  const buttonOptions = {
    stop: {
      type: "button",
      variant: "destructive",
      onClick: () => stop(),
      className: "animate-pulse",
      disabled: !(status === "streaming" || status === "submitted"),
    },
    error: {
      type: "button",
      variant: "outline",
      onClick: () => reload(),
      disabled: !(status === "ready" || status === "error"),
    },
    send: {
      type: "submit",
      className: "self-end w-fit",
    },
  } as const;

  const buttonChildren = getButtonChildren(status);
  const buttonProps = getButtonProps(status, buttonOptions);

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
              createdAt={message.createdAt?.toString()}
            />
          ))}

        {messages.length === 0 && <EmptyChatScreen setNewMessage={setInput} />}
      </div>
      <form onSubmit={componentSubmitHandler} className="sticky bottom-0 bg-background">
        <div className="flex flex-col gap-2 rounded-xl bg-secondary p-4 mb-4">
          <Textarea value={input} onChange={(e) => handleInputChange(e)} placeholder="Type your message..." />

          <div className="flex justify-between gap-2">
            <ModelSelector
              onModelSelect={handleModelSelect}
              selectedModel={model}
              isPremium={user?.subscriptionStatus === "active"}
            />
            <div className="flex gap-2">
              <Button {...buttonProps}>{buttonChildren}</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
