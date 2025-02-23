import { create } from "zustand";
import { ChatSession } from "@/types/chat";

interface ChatStore {
  currentSession: ChatSession | null;
  updateSessionName: (name: string) => void;
  setCurrentSession: (session: ChatSession) => void;
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
}));
