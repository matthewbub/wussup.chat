"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import React, { useState } from "react";
import { AVAILABLE_MODELS } from "@/constants/models";
import { getButtonProps, getButtonChildren } from "../_helpers/getButtonProps";
import { LanguageModalSelector } from "@/components/chat/LanguageModalSelector";
import { Message } from "./Message";
import { EmptyChatScreen } from "@/components/EmptyChatScreen";

export default function ChatApp({ isUserSubscribed, sessionId }: { isUserSubscribed: boolean; sessionId: string }) {
  const { messages, input, handleInputChange, handleSubmit, status, stop, reload, setInput } = useChat({
    api: "/api/v1/chat",
    onFinish: async (message, { usage, finishReason }) => {
      const wasFirstMessage = messages.length === 0;

      if (wasFirstMessage) {
        const titleResponse = await fetch("/api/v1/title", {
          method: "POST",
          body: JSON.stringify({
            session_id: sessionId,
            messages: [message],
          }),
        });

        const titleData = await titleResponse.json();
        console.log("Title response:", titleData);
      }

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

  // console.log("MESSAGES", messages);

  const [model, setModel] = useState(AVAILABLE_MODELS[0].id);
  const componentSubmitHandler = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    console.log("Model at submit:", model);
    handleSubmit(ev, {
      data: {
        user_specified_model: model,
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
      <form onSubmit={componentSubmitHandler} className="flex flex-col gap-2 rounded-xl bg-secondary p-4 mb-4">
        <Textarea value={input} onChange={(e) => handleInputChange(e)} placeholder="Type your message..." />

        <div className="flex justify-between gap-2">
          <LanguageModalSelector model={model} onModelChange={setModel} isSubscribed={isUserSubscribed} />
          <div className="flex gap-2">
            <Button {...buttonProps}>{buttonChildren}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
