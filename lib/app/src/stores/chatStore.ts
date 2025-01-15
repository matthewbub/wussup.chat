import { create } from "zustand";
import { supabase } from "@/services/supabase";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addSession: (userId: string) => void;
  setCurrentSession: (id: string) => void;
  addMessage: (content: string, isUser: boolean) => void;
  setSessions: (sessions: ChatSession[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  sessions: [],
  currentSessionId: null,
  addSession: async (userId: string) => {
    const newSession = {
      user_id: userId,
      name: `Chat ${useChatStore.getState().sessions.length + 1}`,
    };
    const { data, error } = await supabase
      .from("ChatBot_Sessions")
      .insert([newSession])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        sessions: [...state.sessions, data],
        currentSessionId: data.id,
      }));
    }
  },
  setCurrentSession: (id) => set({ currentSessionId: id }),
  addMessage: (content, isUser) =>
    set((state) => {
      if (!state.currentSessionId) return state;
      return {
        sessions: state.sessions.map((session) =>
          session.id === state.currentSessionId
            ? {
                ...session,
                messages: [
                  ...session.messages,
                  { id: Date.now().toString(), content, isUser },
                ],
              }
            : session
        ),
      };
    }),
  setSessions: (sessions) => set({ sessions }),
}));
