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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newMessage, history: messages }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      const botMessage = { id: crypto.randomUUID(), text: "", isUser: false };

      setMessages((prev) => [...prev, botMessage]);

      while (!done) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const { value, done: doneReading } = await reader?.read()!;
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });

        botMessage.text += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessage.id ? { ...msg, text: botMessage.text } : msg
          )
        );
      }
    }
  };

  return (
    <Card>
      <div className="p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.isUser ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.isUser ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
              } max-w-[60%] whitespace-pre-wrap break-words`}
            >
              {msg.text}
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
