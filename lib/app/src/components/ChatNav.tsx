import { Folder, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { useChatStore } from "@/stores/useChatStore";
import { Card } from "@/components/ui/Card";
export function ChatNav() {
  const [newFolderName, setNewFolderName] = useState("");
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  const {
    folders,
    currentFolderId,
    addFolder,
    editFolder,
    deleteFolder,
    setCurrentFolder,
  } = useChatStore();

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      addFolder(newFolderName);
      setNewFolderName("");
      setIsAddingFolder(false);
    }
  };

  return (
    <Card className="w-64 h-full p-4 flex flex-col">
      <button
        onClick={() => setIsAddingFolder(true)}
        className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-200 rounded-lg hover:bg-stone-700 transition-colors mb-4"
      >
        <Plus className="h-4 w-4" />
        New Folder
      </button>

      <div className="space-y-1">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-stone-800 transition-colors ${
              currentFolderId === folder.id ? "bg-stone-800" : ""
            }`}
          >
            <Folder className="h-4 w-4 text-stone-400" />
            {folder.isEditing ? (
              <input
                type="text"
                defaultValue={folder.name}
                onBlur={(e) => editFolder(folder.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    editFolder(folder.id, e.currentTarget.value);
                }}
                className="flex-1 bg-transparent border-none p-0 text-stone-200 focus:outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setCurrentFolder(folder.id)}
                className="flex-1 text-left text-stone-200"
              >
                {folder.name}
              </button>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => editFolder(folder.id, folder.name)}
                className="text-stone-400 hover:text-stone-300"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => deleteFolder(folder.id)}
                className="text-stone-400 hover:text-stone-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddingFolder && (
        <form onSubmit={handleAddFolder} className="mt-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => setIsAddingFolder(false)}
            placeholder="Folder name..."
            className="w-full px-3 py-2 bg-stone-800 text-stone-200 rounded-lg border border-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-600"
            autoFocus
          />
        </form>
      )}
    </Card>
  );
}
