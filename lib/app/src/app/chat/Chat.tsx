"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";

export const Chat: React.FC = () => {
  const { sessions, currentSessionId, addMessage } = useChatStore();
  const [newMessage, setNewMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const { user } = useAuthStore();
  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );
  const messages = currentSession?.messages || [];

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && currentSessionId) {
      addMessage(newMessage, true);
      setNewMessage("");
      // Here you would typically call your API to get the bot's response
      // For now, we'll just simulate a response after a short delay
      setTimeout(() => {
        addMessage("I'm a bot response!", false);
      }, 1000);
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
        Select or create a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleAddMessage} className="p-4 border-t">
        <div className="flex items-center space-x-2">
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
            rows={1}
            placeholder="Type a message..."
            className="flex-1 min-h-[48px] max-h-[200px] p-2 border rounded-md 
                       text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
