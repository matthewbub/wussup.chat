"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "./chatStore";
import MarkdownComponent from "@/components/ui/Markdown";
import { ModelSelect } from "./ModelSelect";
import { useSubscription } from "@/stores/useSubscription";

export const Chat: React.FC = () => {
  const { sessions, currentSessionId, addMessage, sessionTitle } =
    useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const [model, setModel] = useState("gpt-4-turbo-2024-04-09");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );
  const messages = currentSession?.messages || [];
  const { subscription } = useSubscription();

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentSessionId) {
      addMessage(newMessage, model);
      setNewMessage("");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentSessionId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-800 dark:text-slate-200">
          Select or create a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-900/50">
      {sessionTitle && (
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-slate-100">{sessionTitle}</h1>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.is_user ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                  message.is_user
                    ? "bg-blue-700 text-white"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                <MarkdownComponent>{message.content}</MarkdownComponent>
              </div>
              <div
                className={
                  "text-xs text-slate-500 " +
                  (message.is_user ? "text-right" : "text-left")
                }
              >
                <p className="text-xs text-slate-500 pt-2 pl-1">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleAddMessage}
        className="p-4 border-t border-slate-800"
      >
        <div className="flex items-end space-x-2">
          <div className="flex flex-col w-full gap-2">
            <ModelSelect
              model={model}
              onModelChange={setModel}
              isSubscribed={subscription.isSubscribed}
            />
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddMessage(e);
                }
              }}
              rows={12}
              placeholder="Type a message..."
              className="flex-1 min-h-[48px] max-h-[200px] p-2 border rounded-md 
                       text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-800 text-slate-200"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
