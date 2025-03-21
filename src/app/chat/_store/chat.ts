import { create } from "zustand";
import { ChatSession, Message } from "@/types/chat";
import { User } from "@/types/user";

interface ChatStore {
  currentSession: ChatSession | null;
  messages: Message[];
  updateSessionName: (name: string) => void;
  setCurrentSession: (session: ChatSession) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  user: User | null;
  setUser: (user: User) => void;
  updateUserChatContext: (context: string) => void;
  clearStore: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentSession: null,
  messages: [],
  updateSessionName: (name: string) => {
    set((state) => {
      if (!state.currentSession) {
        return state;
      }
      state.currentSession.name = name;
      return { currentSession: state.currentSession };
    });
  },
  setCurrentSession: (session: ChatSession) => {
    set({ currentSession: session });
  },
  addMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => {
    set((state) => ({
      messages: typeof messages === "function" ? messages(state.messages) : messages,
    }));
  },
  user: null,
  setUser: (user: User) => {
    set({ user: user });
  },
  updateUserChatContext: (context: string) => {
    set((state) => {
      if (!state.user) {
        return state;
      }
      state.user.chat_context = context;
      return { user: state.user };
    });
  },
  clearStore: () => {
    set({ currentSession: null, messages: [], user: null });
  },
}));
