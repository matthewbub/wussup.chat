import { create } from "zustand";
import { supabase } from "@/services/supabase";
import { ChatSession } from "@/types/chat";
import { useAuthStore } from "@/stores/authStore";

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addSession: (userId: string) => void;
  setCurrentSession: (id: string) => void;
  addMessage: (content: string, model: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  setSessionTitle: (sessionId: string) => void;
  sessionTitle: string;
  fetchSessions: (userId: string) => Promise<void>;
  loading: boolean;
  isLoading: boolean;
  isStreaming: boolean;
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
        sessionTitle: data.name,
      }));
    }
  },
  setCurrentSession: (id) => {
    set({ currentSessionId: id });
    const session = get().sessions.find((session) => session.id === id);
    set({ sessionTitle: session?.name || "Untitled Chat" });
  },
  addMessage: async (content, model) => {
    const currentSessionId = get().currentSessionId;
    if (!currentSessionId) return;

    set({ isLoading: true });
    try {
      // Add user message to database
      const { data: userMessage, error: userError } = await supabase
        .from("ChatBot_Messages")
        .insert({
          chat_session_id: currentSessionId,
          content,
          user_id: useAuthStore.getState().user?.id,
          is_user: true,
          model: null,
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
          model,
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

      set({ isStreaming: true });

      // Get bot response
      const botResponse = await fetch("/api/chat", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          message: content,
          history,
          userId: useAuthStore.getState().user?.id,
          sessionId: currentSessionId,
          model,
        }),
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
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                // Skip empty lines
                if (line.trim() === "data: ") continue;

                // Try parsing as JSON first
                const jsonData = line.slice(5);
                const parsed = JSON.parse(jsonData);

                if (parsed.type === "title_update") {
                  // Handle title update
                  get().updateSessionTitle(parsed.sessionId, parsed.title);
                } else if (parsed.choices?.[0]?.delta?.content) {
                  // Handle OpenAI streaming content
                  const content = parsed.choices[0].delta.content;
                  accumulatedResponse += content;

                  // Update bot message in state
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
              } catch (error) {
                // If it's not valid JSON, skip this chunk
                console.error("Error parsing chunk:", error);
              }
            }
          }
        }

        await supabase
          .from("ChatBot_Messages")
          .update({ content: accumulatedResponse })
          .eq("id", botMessage.id);
      } catch (error) {
        console.error("Error streaming response:", error);
      } finally {
        set({ isStreaming: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  setSessions: (sessions) => set({ sessions }),
  updateSessionTitle: (sessionId: string, title: string) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, name: title } : session
      ),
      sessionTitle:
        sessionId === state.currentSessionId ? title : state.sessionTitle,
    })),
  deleteSession: async (sessionId: string) => {
    const { error: messageError } = await supabase
      .from("ChatBot_Messages")
      .delete()
      .eq("chat_session_id", sessionId);

    if (messageError) {
      console.error(messageError);
      return;
    }

    const { error } = await supabase
      .from("ChatBot_Sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      sessions: state.sessions.filter((session) => session.id !== sessionId),
      currentSessionId: null,
    }));
  },
  setSessionTitle: (sessionId: string) => {
    const session = get().sessions.find((session) => session.id === sessionId);
    set({ sessionTitle: session?.name || "Untitled Chat" });
  },
  sessionTitle: "",
  loading: false,
  isLoading: false,
  isStreaming: false,
  fetchSessions: async (userId: string) => {
    set({ loading: true });
    const response = await fetch(`/api/chat?userId=${userId}`);
    const data = await response.json();
    const currentSession = data.sessions.find(
      (s: ChatSession) => s.id === get().currentSessionId
    );
    set({
      sessions: data.sessions,
      loading: false,
      sessionTitle: currentSession?.name || "Untitled Chat",
    });
  },
}));
