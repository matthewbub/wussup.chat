import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  id: string;
  text: string;
  completed: boolean;
}

interface ChatStore {
  messages: Message[];
  addMessage: (text: string) => void;
  editMessage: (id: string, text: string) => void;
  deleteMessage: (id: string) => void;
  toggleMessage: (id: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],

      addMessage: (text) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: crypto.randomUUID(),
              text: text.trim(),
              completed: false,
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
    }),
    {
      name: "chat-storage",
    }
  )
);
