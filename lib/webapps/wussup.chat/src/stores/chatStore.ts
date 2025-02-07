import { create } from "zustand";
import { ChatSession, Message } from "@/types/chat";
import { createClient } from "@/lib/supabase-client";
import { AVAILABLE_MODELS } from "@/constants/models";

const supabase = createClient();

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addSession: () => Promise<string | null>;
  setCurrentSession: (id: string) => void;
  addMessage: (content: string, model: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  setSessionTitle: (sessionId: string) => void;
  sessionTitle: string;
  fetchSessions: () => Promise<void>;
  loading: boolean;
  isLoadingMessageResponse: boolean;
  isStreaming: boolean;
  forkChat: (messages: Message[]) => Promise<string | null>;
  generateSpeech: (text: string) => Promise<string>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  userId: string | null;
  setUserId: (userId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  addSession: async (): Promise<string | null> => {
    const newSession = {
      user_id: get().userId,
      name: `Chat ${get().sessions.length + 1}`,
    };
    const { data, error } = await supabase
      .from("ChatBot_Sessions")
      .insert([newSession])
      .select()
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    if (data) {
      set((state) => ({
        sessions: [...state.sessions, data],
        currentSessionId: data.id,
        sessionTitle: data.name,
      }));
    }
    return data.id;
  },
  forkChat: async (messages: Message[]): Promise<string | null> => {
    try {
      // First create a new session
      const { data: sessionData, error: sessionError } = await supabase
        .from("ChatBot_Sessions")
        .insert([
          {
            user_id: get().userId,
            name: `Fork of: ${messages[0]?.content?.slice(0, 30)}...`, // Use first message as title
          },
        ])
        .select()
        .single();

      if (sessionError || !sessionData) {
        console.error("Error creating forked session:", sessionError);
        return null;
      }

      // Then create new messages linked to the new session
      const newMessages = messages.map((msg) => ({
        chat_session_id: sessionData.id,
        content: msg.content,
        is_user: msg.is_user,
        user_id: get().userId,
        model: msg.model,
      }));

      const { error: messagesError } = await supabase
        .from("ChatBot_Messages")
        .insert(newMessages);

      if (messagesError) {
        console.error("Error copying messages:", messagesError);
        // Clean up the session if message copying failed
        await supabase
          .from("ChatBot_Sessions")
          .delete()
          .eq("id", sessionData.id);
        return null;
      }

      // Update local state
      set((state) => ({
        sessions: [
          ...state.sessions,
          {
            ...sessionData,
            messages: messages,
          },
        ],
      }));

      return sessionData.id;
    } catch (error) {
      console.error("Error forking chat:", error);
      return null;
    }
  },
  setCurrentSession: (id) => {
    set({ currentSessionId: id });
    const session = get().sessions.find((session) => session.id === id);
    set({ sessionTitle: session?.name || "Untitled Chat" });
  },

  addMessage: async (content, model) => {
    const currentSessionId = get().currentSessionId;
    if (!currentSessionId) {
      console.log("No current session id");
      return;
    }

    set({ isLoadingMessageResponse: true });

    const userMessageId = crypto.randomUUID();
    const botMessageId = crypto.randomUUID();
    const userCreatedAt = new Date().toISOString();
    const botCreatedAt = new Date().toISOString();
    try {
      // Update state with user message
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [
                  ...(session.messages || []),
                  {
                    id: userMessageId,
                    content,
                    is_user: true,
                    model: model,
                    created_at: userCreatedAt,
                  },
                  // bot message
                  {
                    id: botMessageId,
                    content: "",
                    is_user: false,
                    model: model,
                    created_at: botCreatedAt,
                  },
                ],
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

      const findModel = AVAILABLE_MODELS.find((m) => m.id === model);

      const botResponse = await fetch(`/api/chat/${findModel?.provider}`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          message: content,
          history,
          sessionId: currentSessionId,
          model,
          userMessageId,
          botMessageId,
          userCreatedAt,
          botCreatedAt,
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

                const jsonData = line.slice(5);
                const parsed = JSON.parse(jsonData);

                const content = parsed.choices[0].delta.content;
                accumulatedResponse += content;

                // Update bot message in state
                set((state) => ({
                  sessions: state.sessions.map((session) =>
                    session.id === currentSessionId
                      ? {
                          ...session,
                          messages: session.messages.map((msg) =>
                            msg.id === botMessageId
                              ? { ...msg, content: accumulatedResponse }
                              : msg
                          ),
                        }
                      : session
                  ),
                }));
              } catch (error) {
                // If it's not valid JSON, skip this chunk
                console.error("Error parsing chunk:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error streaming response:", error);
      } finally {
        set({ isStreaming: false });
      }
    } finally {
      set({ isLoadingMessageResponse: false });
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
  isLoadingMessageResponse: false,
  isStreaming: false,
  fetchSessions: async () => {
    set({ loading: true });
    const response = await fetch(`/api/chat`);
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
  generateSpeech: async (text: string) => {
    try {
      const response = await fetch("/api/audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const data = await response.json();
      return data.audio;
    } catch (error) {
      console.error("Error generating speech:", error);
      throw error;
    }
  },
  newMessage: "",
  setNewMessage: (message: string) => set({ newMessage: message }),
  userId: null,
  setUserId: (userId: string) => set({ userId }),
}));
