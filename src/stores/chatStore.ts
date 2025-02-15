import { create } from "zustand";
import { ChatSession, Message } from "@/types/chat";
import { createClient } from "@/lib/supabase-client";
import { AVAILABLE_MODELS } from "@/constants/models";
import { TimeframeGroupingStrategy } from "@/lib/session-grouping";

const supabase = createClient();

interface ChatStore {
  sessions: Record<string, ChatSession[]>; // { [x]: [ { chatSession }, { chatSession } ]}
  currentSessionId: string | null;
  addSession: () => Promise<string | null>;
  setCurrentSession: (id: string | null) => void;
  addMessage: (content: string, model: string) => void;
  setSessions: (sessions: ChatSession[]) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  setSessionTitle: (sessionId: string) => void;
  sessionTitle: string;
  fetchSessions: () => Promise<void>;
  init: (sessionId: string) => Promise<void>;
  loading: boolean;
  isLoadingMessageResponse: boolean;
  isStreaming: boolean;
  forkChat: (messages: Message[]) => Promise<string | null>;
  generateSpeech: (text: string) => Promise<string>;
  newMessage: string;
  setNewMessage: (message: string) => void;
  userId: string | null;
  setUserId: (userId: string) => void;
  titleLoading: boolean;
  user: {
    email: string;
    message_count: number;
    stripeSubscriptionId: string;
    subscriptionStatus: string;
  };
  currentSession: ChatSession | null;
  updateCurrentSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: {},
  currentSessionId: null,
  addSession: async (): Promise<string | null> => {
    const newSession = {
      user_id: get().userId,
      name: `Chat ${Object.values(get().sessions).flat().length + 1}`,
    };

    const { data, error } = await supabase
      .from("ChatBot_Sessions")
      .insert([newSession])
      .select()
      .single();

    if (error || !data) {
      console.error(error);
      return null;
    }

    const strategy = new TimeframeGroupingStrategy();
    const allSessions = [...Object.values(get().sessions).flat(), data];
    const groupedSessions = strategy.group(allSessions);

    set(() => ({
      sessions: groupedSessions,
      currentSessionId: data.id,
      sessionTitle: data.name,
    }));

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
      set((state) => {
        const allSessions = Object.values(state.sessions).flat();
        const updatedSessions = [
          ...allSessions,
          {
            ...sessionData,
            messages: messages,
          },
        ];

        const strategy = new TimeframeGroupingStrategy();
        return { sessions: strategy.group(updatedSessions) };
      });

      return sessionData.id;
    } catch (error) {
      console.error("Error forking chat:", error);
      return null;
    }
  },
  setCurrentSession: (id) => {
    set({ currentSessionId: id });
    if (!id) {
      set({ sessionTitle: "Untitled Chat" });
      return;
    }
    const session = Object.values(get().sessions)
      .flat()
      .find((session) => session.id === id);
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
      set((state) => {
        const allSessions = Object.values(state.sessions).flat();
        const session = allSessions.find(
          (session) => session.id === currentSessionId
        );
        if (!session) {
          console.error("Session not found");
          return state;
        }

        const updatedSessions = allSessions.map((session) =>
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
        );

        const strategy = new TimeframeGroupingStrategy();
        return { sessions: strategy.group(updatedSessions) };
      });

      // Get chat history for API request
      const currentSession = Object.values(get().sessions)
        .flat()
        .find((session) => session.id === currentSessionId);
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

      if (!botResponse.ok) {
        const error = await botResponse.json();

        // Remove the messages from UI state
        set((state) => {
          const allSessions = Object.values(state.sessions).flat();
          const updatedSessions = allSessions.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: session.messages.filter(
                    (msg) => msg.id !== userMessageId && msg.id !== botMessageId
                  ),
                }
              : session
          );

          const strategy = new TimeframeGroupingStrategy();
          return {
            sessions: strategy.group(updatedSessions),
            isLoadingMessageResponse: false,
            isStreaming: false,
          };
        });

        throw new Error(`Content flagged: ${error.categories?.join(", ")}`);
      }

      // Stream the response
      const reader = botResponse.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      try {
        while (true) {
          if (!reader) break;
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
                set((state) => {
                  const allSessions = Object.values(state.sessions).flat();
                  const updatedSessions = allSessions.map((session) =>
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
                  );

                  const strategy = new TimeframeGroupingStrategy();
                  return { sessions: strategy.group(updatedSessions) };
                });
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
        set({ isStreaming: false, isLoadingMessageResponse: false });
      }

      if (currentSession?.messages?.length === 2) {
        const titleResponse = await fetch(`/api/chat/title-gen`, {
          method: "POST",
          body: JSON.stringify({
            messages: currentSession?.messages,
          }),
        });
        const titleData = await titleResponse.json();
        const title = titleData.title;

        await get().updateSessionTitle(currentSessionId, title);
      }
    } catch (error) {
      set({ isLoadingMessageResponse: false });
      throw error;
    }
  },
  setSessions: (sessions: ChatSession[]) => {
    const strategy = new TimeframeGroupingStrategy();
    set({ sessions: strategy.group(sessions) });
  },
  updateSessionTitle: async (sessionId: string, title: string) => {
    set({ titleLoading: true });

    console.log({
      title,
    });
    const { error } = await supabase
      .from("ChatBot_Sessions")
      .update({ name: title })
      .eq("id", sessionId);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => {
      const allSessions = Object.values(state.sessions).flat();
      const updatedSessions = allSessions.map((session) =>
        session.id === sessionId ? { ...session, name: title } : session
      );

      const strategy = new TimeframeGroupingStrategy();
      return {
        sessions: strategy.group(updatedSessions),
        sessionTitle:
          sessionId === state.currentSessionId ? title : state.sessionTitle,
      };
    });
    set({ titleLoading: false });
  },
  deleteSession: async (sessionId: string) => {
    const response = await fetch(`/api/chat/delete?sessionId=${sessionId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to delete session:", error);
      throw new Error(error.message || "Failed to delete session");
    }

    // Update local state
    set((state) => {
      const allSessions = Object.values(state.sessions).flat();
      const filteredSessions = allSessions.filter(
        (session) => session.id !== sessionId
      );

      const strategy = new TimeframeGroupingStrategy();
      return {
        sessions: strategy.group(filteredSessions),
        currentSessionId: null,
      };
    });
  },
  setSessionTitle: (sessionId: string) => {
    const session = Object.values(get().sessions)
      .flat()
      .find((session) => session.id === sessionId);
    set({ sessionTitle: session?.name || "Untitled Chat" });
  },
  sessionTitle: "",
  loading: false,
  isLoadingMessageResponse: false,
  isStreaming: false,
  // DEPRECATED - use init instead
  fetchSessions: async () => {
    set({ loading: true });
    const response = await fetch(`/api/chat`);
    const responseData = await response.json();
    if (responseData.code === "user_id_required") {
      set({ loading: false });
      return;
    }

    const currentSession = responseData.sessions.find(
      (s: ChatSession) => s.id === get().currentSessionId
    );

    const strategy = new TimeframeGroupingStrategy();
    const groupedSessions = strategy.group(responseData.sessions);

    set({
      sessions: groupedSessions,
      loading: false,
      sessionTitle: currentSession?.name || "Untitled Chat",
      user: responseData.user,
    });
  },
  init: async (sessionId: string) => {
    set({ loading: true });
    const response = await fetch(`/api/chat`);
    const responseData = await response.json();
    if (responseData.code === "user_id_required") {
      set({ loading: false });
      return;
    }

    const currentSession = responseData.sessions.find(
      (s: ChatSession) => s.id === sessionId
    );
    console.log("currentSession", currentSession);

    const strategy = new TimeframeGroupingStrategy();
    const groupedSessions = strategy.group(responseData.sessions);

    set({
      sessions: groupedSessions,
      loading: false,
      currentSessionId: currentSession ? sessionId : null,
      currentSession: currentSession || null,
      sessionTitle: currentSession?.name || "Untitled Chat",
      user: responseData.user,
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
  titleLoading: false,
  user: {
    email: "",
    message_count: 0,
    stripeSubscriptionId: "",
    subscriptionStatus: "",
  },
  currentSession: null,
  updateCurrentSession: (sessionId: string) =>
    set((state) => {
      const allSessions = Object.values(state.sessions).flat();
      const session = allSessions.find((s) => s.id === sessionId) as
        | ChatSession
        | undefined;

      // there's a high chance the session isn't going to be found
      // in this case, we should create a new session
      if (!session) {
        return {
          currentSession: {
            id: sessionId,
            name: "Untitled Chat",
            messages: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: state.userId || "",
          },
        };
      }
      return {
        currentSession: session,
      };
    }),
}));
