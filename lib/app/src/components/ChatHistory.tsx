import { useState } from "react";
import { Card } from "./ui/Card";
import { useChatStore } from "@/stores/chatStore";

export function ChatHistory() {
  const [newMessage, setNewMessage] = useState("");
  const { messages, addMessage } = useChatStore();

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await addMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    // height is 100vh minus the header height
    <Card className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${msg.isUser ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-stone-700 text-stone-200"
              } max-w-[60%] whitespace-pre-wrap break-words`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-stone-800 bg-stone-900/50 backdrop-blur-sm">
        <form onSubmit={handleAddMessage} className="flex gap-2 items-end">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              // Auto-resize
              e.target.style.height = "inherit";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddMessage(e);
              }
            }}
            rows={1}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-md bg-stone-800 border-stone-700 border 
            text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 
            focus:ring-stone-600 resize-none overflow-hidden min-h-[40px] max-h-[200px]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-stone-700 text-stone-200 rounded-full hover:bg-stone-600 transition-colors h-fit"
          >
            Send
          </button>
        </form>
      </div>
    </Card>
  );
}
