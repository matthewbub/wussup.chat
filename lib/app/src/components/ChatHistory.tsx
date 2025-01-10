import { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { useChatStore } from "@/stores/chatStore";
import { formatDistanceToNow } from "date-fns";
import { useSidebarStore } from "@/stores/sidebarStore";

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
      {/* Session Sidebar - Now using sidebar store */}
      <div
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-[100%]"
        } lg:translate-x-0 fixed lg:relative z-40 w-64 h-full bg-stone-900 border-r border-stone-800 
        flex flex-col transition-transform duration-300 ease-in-out left-0 top-0`}
      >
        <button
          onClick={createNewSession}
          className="m-4 mt-14 lg:mt-4 px-4 py-2 bg-stone-700 text-stone-200 rounded-md hover:bg-stone-600 transition-colors"
        >
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 cursor-pointer hover:bg-stone-800 flex justify-between items-center ${
                session.id === currentSessionId ? "bg-stone-800" : ""
              }`}
              onClick={() => setCurrentSession(session.id)}
            >
              <div className="flex flex-col">
                <span className="text-stone-200 truncate">{session.title}</span>
                <span className="text-stone-400 text-sm">
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
                className="text-stone-400 hover:text-stone-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for mobile - Now using sidebar store */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Chat Area - Made responsive */}
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
                  className={`inline-block p-2 rounded-lg ${
                    msg.isUser
                      ? "bg-blue-500 text-white"
                      : "bg-stone-700 text-stone-200"
                  } max-w-[85%] sm:max-w-[60%] whitespace-pre-wrap break-words`}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-stone-400">
                  {formatDistanceToNow(new Date(msg.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input - Made responsive */}
        <div className="p-2 sm:p-4 border-t border-stone-800 bg-stone-900/50 backdrop-blur-sm">
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
              className="flex-1 p-2 rounded-md bg-stone-800 border-stone-700 border 
              text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 
              focus:ring-stone-600 resize-none overflow-hidden min-h-[40px] max-h-[200px]
              text-sm sm:text-base"
            />
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 bg-stone-700 text-stone-200 rounded-full hover:bg-stone-600 
              transition-colors h-fit text-sm sm:text-base"
            >
              Send
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
