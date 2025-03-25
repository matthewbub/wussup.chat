import { openAiModels } from "@/constants/models";
import { create } from "zustand";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

type ChatStore = {
  messages: Message[];
  isLoading: boolean;
  currentInput: string;
  selectedModel: {
    id: string;
    provider: string;
  };
  sessionId: string;
  setInput: (input: string) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: { id: string; provider: string }) => void;
  chatTitle: string;
  setChatTitle: (title: string) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  currentInput: "",
  selectedModel: {
    id: openAiModels[0].id,
    provider: openAiModels[0].provider,
  },
  sessionId: crypto.randomUUID(),
  setInput: (input) => set({ currentInput: input }),
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
