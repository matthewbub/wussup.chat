import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useChatStore } from "@/stores/chatStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import MarkdownComponent from "@/components/ui/Markdown";
import { Menu, X } from "lucide-react";
import { DateDisplay } from "@/components/ui/DateDisplay";

export function ChatHistory() {
  const [newMessage, setNewMessage] = useState("");
  const isOpen = useSidebarStore((state) => state.isOpen);
  const closeSidebar = useSidebarStore((state) => state.close);
  const toggleSidebar = useSidebarStore((state) => state.toggle);
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
    <div className="flex min-h-[calc(100vh-100px)] relative">
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 hover:bg-base-200 rounded-md transition-colors absolute top-2 left-2 z-10"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Session Sidebar */}
        <div className={`flex flex-col lg:col-span-3`}>
          {isOpen && (
            <button
              onClick={toggleSidebar}
              className="btn-outline mt-2 mx-4 text-sm flex items-center gap-2 w-fit"
            >
              Close <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={createNewSession}
            className="btn-secondary m-4 lg:mt-4"
          >
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto menu__list">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`menu__link flex justify-between items-center ${
                  session.id === currentSessionId ? "menu__link--active" : ""
                }`}
                onClick={() => setCurrentSession(session.id)}
              >
                <div className="flex flex-col">
                  <span className="truncate text-sm">{session.title}</span>
                  <DateDisplay date={session.createdAt} className="text-sm" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="btn-ghost btn-sm text-base-content/60 hover:text-base-content"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col lg:col-span-9">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentSession?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm text-on-dark
${msg.isUser ? "text-right" : "text-left"}`}
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
                  <DateDisplay
                    date={msg.timestamp}
                    className="text-xs text-base-content/60"
                  />
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
              <button type="submit" className="btn-primary">
                Send
              </button>
            </form>
          </div>
        </Card>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}
