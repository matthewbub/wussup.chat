import { create } from "zustand";
import { ChatSession } from "@/types/chat";
import { User } from "@/types/user";

interface ChatStore {
  currentSession: ChatSession | null;
  updateSessionName: (name: string) => void;
  setCurrentSession: (session: ChatSession) => void;
  user: User | null;
  updateUser: (user: User) => void;
  updateUserChatContext: (context: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  currentSession: null,
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
  user: null,
  updateUser: (user: User) => {
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
}));
