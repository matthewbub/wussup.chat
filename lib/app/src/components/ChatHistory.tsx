import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { useChatStore } from "@/stores/chatStore";
import { formatDistanceToNow } from "date-fns";
import { useSidebarStore } from "@/stores/sidebarStore";
import MarkdownComponent from "./ui/Markdown";

export function ChatHistory() {
  const [newMessage, setNewMessage] = useState("");
  const isOpen = useSidebarStore((state) => state.isOpen);
  const closeSidebar = useSidebarStore((state) => state.close);
  const {
    sessions,
    currentSessionId,
    createNewSession,
    setCurrentSession,
    deleteSession,
    addMessage,
  } = useChatStore();

  // Create initial session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions.length, createNewSession]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await addMessage(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] relative">
      {/* Session Sidebar */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-[100%]"
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-base-300 border-r border-base-300 
        flex flex-col transition-transform duration-300 ease-in-out left-0 top-0`}
      >
        <button
          onClick={createNewSession}
          className="btn btn-neutral m-4 mt-14 lg:mt-4"
        >
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 cursor-pointer hover:bg-base-200 flex justify-between items-center ${
                session.id === currentSessionId ? "bg-base-200" : ""
              }`}
              onClick={() => setCurrentSession(session.id)}
            >
              <div className="flex flex-col">
                <span className="text-base-content truncate">
                  {session.title}
                </span>
                <span className="text-base-content/60 text-sm">
                  {formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="btn btn-ghost btn-sm text-base-content/60 hover:text-base-content"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`${msg.isUser ? "text-right" : "text-left"}`}
            >
              <div
                className={
                  "flex flex-col gap-1 " +
                  (msg.isUser ? "items-end" : "items-start")
                }
              >
                <div
                  className={`chat-bubble min-h-fit ${
                    msg.isUser ? "chat-bubble-primary" : "chat-bubble-neutral"
                  } max-w-[85%] sm:max-w-[60%]`}
                >
                  <MarkdownComponent>{msg.text}</MarkdownComponent>
                </div>
                <span className="text-xs text-base-content/60">
                  {formatDistanceToNow(new Date(msg.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-2 sm:p-4 border-t border-base-300 bg-base-200/50 backdrop-blur-sm">
          <form onSubmit={handleAddMessage} className="flex gap-2 items-end">
            <textarea
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
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
              className="textarea textarea-bordered flex-1 min-h-[48px] max-h-[200px] 
              text-sm sm:text-base resize-none"
            />
            <button type="submit" className="btn btn-primary">
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
