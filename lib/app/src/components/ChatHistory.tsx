import { CheckCircle2, Circle, FolderInput, Trash2 } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { Card } from "./ui/Card";

export function ChatHistory() {
  const [newMessage, setNewMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isMoving, setIsMoving] = useState<string | null>(null);

  const {
    messages,
    folders,
    currentFolderId,
    addMessage,
    editMessage,
    deleteMessage,
    toggleMessage,
    moveMessage,
  } = useChatStore();

  const filteredMessages = messages.filter(
    (message) => message.folderId === currentFolderId
  );

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleStartEditing = (text: string) => {
    setEditingId(text);
    setEditingText(text);
  };

  const handleSaveEdit = (id: string) => {
    if (editingText.trim()) {
      editMessage(id, editingText);
    }
    setEditingId(null);
    setEditingText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(id);
    }
    if (e.key === "Escape") {
      setEditingId(null);
      setEditingText("");
    }
  };

  return (
    <Card>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {filteredMessages.map((message) => (
          <div key={message.id} className="flex items-start gap-2 group">
            <button
              onClick={() => toggleMessage(message.id)}
              className="mt-1 shrink-0"
            >
              {message.completed ? (
                <CheckCircle2 className="text-stone-400 h-4 w-4" />
              ) : (
                <Circle className="text-stone-600 h-4 w-4" />
              )}
            </button>
            <div
              className={`flex-1 p-3 rounded-lg ${
                message.completed
                  ? "bg-stone-800/50 text-stone-500"
                  : "bg-stone-800 text-stone-200"
              }`}
            >
              {editingId === message.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => handleSaveEdit(message.id)}
                  onKeyDown={(e) => handleKeyDown(e, message.id)}
                  className="w-full bg-transparent border-none p-0 focus:outline-none"
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => handleStartEditing(message.text)}
                  className="cursor-text"
                >
                  {message.text}
                </div>
              )}
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0 flex gap-2">
              <button
                onClick={() =>
                  setIsMoving(isMoving === message.id ? null : message.id)
                }
                className="text-stone-500 hover:text-stone-400"
              >
                <FolderInput className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteMessage(message.id)}
                className="text-stone-500 hover:text-stone-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {isMoving === message.id && (
              <div className="absolute right-0 mt-6 bg-stone-800 rounded-lg shadow-lg border border-stone-700 p-1">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      moveMessage(message.id, folder.id);
                      setIsMoving(null);
                    }}
                    className="block w-full text-left px-3 py-1 text-stone-200 hover:bg-stone-700 rounded"
                  >
                    {folder.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    moveMessage(message.id, null);
                    setIsMoving(null);
                  }}
                  className="block w-full text-left px-3 py-1 text-stone-200 hover:bg-stone-700 rounded"
                >
                  Unfile
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-stone-800 relative">
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
