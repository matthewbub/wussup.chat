import { useState } from "react";
import { Card } from "./ui/Card";

export function ChatHistory() {
  const [messages, setMessages] = useState<
    { id: string; text: string; isUser: boolean }[]
  >([]);
  const [newMessage, setNewMessage] = useState("");

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const userMessage = {
        id: crypto.randomUUID(),
        text: newMessage,
        isUser: true,
      };
      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");

      // Send message and history to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage, history: messages }),
      });

      const data = await response.json();
      const botMessage = {
        id: crypto.randomUUID(),
        text: data.response,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  return (
    <Card>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                message.isUser
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-stone-800">
        <form onSubmit={handleAddMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-full bg-stone-800 border-stone-700 border text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-600"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-stone-700 text-stone-200 rounded-full hover:bg-stone-600 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </Card>
  );
}
