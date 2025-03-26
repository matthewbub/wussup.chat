import { openAiModels } from "@/constants/models";
import { create } from "zustand";

export type NewMessage = {
  content: string;
  role: "user" | "assistant";
};

type ChatStore = {
  messages: NewMessage[];
  isLoading: boolean;
  currentInput: string;
  selectedModel: {
    id: string;
    provider: string;
  };
  sessionId: string;
  setInput: (input: string) => void;
  setMessages: (messages: NewMessage[]) => void;
  addMessage: (message: NewMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: { id: string; provider: string }) => void;
  chatTitle: string;
  setChatTitle: (title: string) => void;
  setSessionId: (id: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  currentInput: "",
  selectedModel: {
    id: openAiModels[0].id,
    provider: openAiModels[0].provider,
  },
  // idk how i feel about this
  sessionId: crypto.randomUUID(),
  setSessionId: (id) => set({ sessionId: id }),
  setInput: (input) => set({ currentInput: input }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateLastMessage: (content) =>
    set((state) => ({
      messages: state.messages.map((msg, idx) => (idx === state.messages.length - 1 ? { ...msg, content } : msg)),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setModel: (model) => set({ selectedModel: model }),
  chatTitle: "",
  setChatTitle: (title) => set({ chatTitle: title }),
}));
