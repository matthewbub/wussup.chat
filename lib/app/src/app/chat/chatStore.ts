import { create } from "zustand";
import { supabase } from "@/services/supabase";
import { ChatSession } from "./chatTypes";
import { useAuthStore } from "@/stores/authStore";

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addSession: (userId: string) => void;
  setCurrentSession: (id: string) => void;
  addMessage: (content: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
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
  addMessage: async (content) => {
    const currentSessionId = get().currentSessionId;
    if (!currentSessionId) return;

    // Add user message to database
    const { data: userMessage, error: userError } = await supabase
      .from("ChatBot_Messages")
      .insert({
        chat_session_id: currentSessionId,
        content,
        user_id: useAuthStore.getState().user?.id,
        is_user: true,
      })
      .select()
      .single();

    if (userError || !userMessage) return;

    // Update state with user message
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...(session.messages || []), userMessage],
            }
          : session
      ),
    }));

    // Create bot message first
    const { data: botMessage, error: botError } = await supabase
      .from("ChatBot_Messages")
      .insert({
        chat_session_id: currentSessionId,
        content: "",
        user_id: useAuthStore.getState().user?.id,
        is_user: false,
      })
      .select()
      .single();

    if (botError || !botMessage) return;

    // Add empty bot message to state immediately
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [...(session.messages || []), botMessage],
            }
          : session
      ),
    }));

    // Get chat history for API request
    const currentSession = get().sessions.find(
      (session) => session.id === currentSessionId
    );
    const history = currentSession?.messages || [];

    // Get bot response
    const botResponse = await fetch("/api/chat", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ message: content, history }),
    });

    if (!botResponse.body) throw new Error("No response body");

    // Stream the response
    const reader = botResponse.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;

        // Update bot message in state with accumulated response
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: session.messages.map((msg) =>
                    msg.id === botMessage.id
                      ? { ...msg, content: accumulatedResponse }
                      : msg
                  ),
                }
              : session
          ),
        }));
      }

      // Update final bot message in database
      await supabase
        .from("ChatBot_Messages")
        .update({ content: accumulatedResponse })
        .eq("id", botMessage.id);
    } catch (error) {
      console.error("Error streaming response:", error);
    }
  },
  setSessions: (sessions) => set({ sessions }),
}));
