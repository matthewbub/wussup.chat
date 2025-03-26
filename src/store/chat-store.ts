import { openAiModels } from "@/constants/models";
import { create } from "zustand";

export type NewMessage = {
  content: string;
  role: "user" | "assistant";
};

export type ChatSession = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  chat_history: { role: string; content: string }[];
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
  chatSessions: ChatSession[];
  setInput: (input: string) => void;
  setMessages: (messages: NewMessage[]) => void;
  addMessage: (message: NewMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: { id: string; provider: string }) => void;
  chatTitle: string;
  setChatTitle: (title: string) => void;
  setSessionId: (id: string) => void;
  setChatSessions: (sessions: ChatSession[]) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
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
  chatSessions: [],
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
  setChatTitle: (title) =>
    set((state) => {
      const updatedSessions = state.chatSessions.map((session) =>
        session.id === state.sessionId ? { ...session, name: title } : session
      );
      return {
        chatTitle: title,
        chatSessions: updatedSessions,
      };
    }),
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  updateSessionTitle: (sessionId, newTitle) =>
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newTitle } : session
      ),
      ...(state.sessionId === sessionId ? { chatTitle: newTitle } : {}),
    })),
}));
