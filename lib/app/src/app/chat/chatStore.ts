import { create } from "zustand";
import { supabase } from "@/services/supabase";
import { ChatSession } from "./chatTypes";
import { useAuthStore } from "@/stores/authStore";

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
  addMessage: async (content, isUser) => {
    if (!useChatStore.getState().currentSessionId) return;

    const { data, error } = await supabase
      .from("ChatBot_Messages")
      .insert({
        chat_session_id: useChatStore.getState().currentSessionId,
        content,
        user_id: useAuthStore.getState().user?.id,
        is_user: isUser,
      })
      .select()
      .single();

    console.log(data);
    if (error) {
      console.error(error);
      return;
    }
  },
  // set((state) => {
  //   if (!state.currentSessionId) return state;
  //   return {
  //     sessions: state.sessions.map((session) =>
  //       session.id === state.currentSessionId
  //         ? {
  //             ...session,
  //             messages: [
  //               ...session.messages,
  //               { id: Date.now().toString(), content, isUser },
  //             ],
  //           }
  //         : session
  //     ),
  //   };
  // }),
  setSessions: (sessions) => set({ sessions }),
}));
