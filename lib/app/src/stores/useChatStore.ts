import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  id: string;
  text: string;
  completed: boolean;
  folderId: string | null;
}

interface ChatFolder {
  id: string;
  name: string;
  isEditing?: boolean;
}

interface ChatStore {
  messages: Message[];
  folders: ChatFolder[];
  currentFolderId: string | null;
  // Messages actions
  addMessage: (text: string) => void;
  editMessage: (id: string, text: string) => void;
  deleteMessage: (id: string) => void;
  toggleMessage: (id: string) => void;
  moveMessage: (messageId: string, targetFolderId: string | null) => void;
  // Folders actions
  addFolder: (name: string) => void;
  editFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  setCurrentFolder: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      folders: [],
      currentFolderId: null,

      // Messages actions
      addMessage: (text) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              text: text.trim(),
              completed: false,
              folderId: state.currentFolderId,
            },
          ],
        })),

      editMessage: (id, text) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id ? { ...message, text: text.trim() } : message
          ),
        })),

      deleteMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        })),

      toggleMessage: (id) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === id
              ? { ...message, completed: !message.completed }
              : message
          ),
        })),

      moveMessage: (messageId, targetFolderId) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId
              ? { ...message, folderId: targetFolderId }
              : message
          ),
        })),

      // Folders actions
      addFolder: (name) =>
        set((state) => ({
          folders: [
            ...state.folders,
            {
              id: crypto.randomUUID(),
              name: name.trim(),
            },
          ],
        })),

      editFolder: (id, name) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, name: name.trim() } : folder
          ),
        })),

      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          messages: state.messages.map((message) =>
            message.folderId === id ? { ...message, folderId: null } : message
          ),
          currentFolderId:
            state.currentFolderId === id ? null : state.currentFolderId,
        })),

      setCurrentFolder: (id) =>
        set(() => ({
          currentFolderId: id,
        })),
    }),
    {
      name: "chat-storage",
    }
  )
);
