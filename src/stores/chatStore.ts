import { create } from "zustand";
import { ChatSession, Message } from "@/types/chat";
import { createClient } from "@/lib/supabase-client";
import { TimeframeGroupingStrategy } from "@/lib/session-grouping";

const supabase = createClient();

type ModalType = "auth" | "billing";

interface ChatStore {
  sessions: Record<string, ChatSession[]>; // { [x]: [ { chatSession }, { chatSession } ]}
  addSession: (sessionId: string, userId: string) => Promise<string | null>;
  updateSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  init: (sessionId: string) => Promise<void>;
  loading: boolean;
  forkChat: (messages: Message[]) => Promise<string | null>;
  generateSpeech: (text: string) => Promise<string>;
  user: {
    user_id: string;
    email: string;
    message_count: number;
    stripeSubscriptionId: string;
    subscriptionStatus: string;
    subscriptionPeriodEnd: string;
    chat_context: string;
  };
  activeModal: ModalType | null;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  clearStore: () => void;
  initGuest: () => Promise<void>;
  updateUserChatContext: (chatContext: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: {},
  addSession: async (sessionId: string, userId: string): Promise<string | null> => {
    const newSession = {
      id: sessionId,
      user_id: userId,
      name: "Untitled Chat " + (Object.values(get().sessions).flat().length + 1),
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const strategy = new TimeframeGroupingStrategy();
    const allSessions = [...Object.values(get().sessions).flat(), newSession];
    const groupedSessions = strategy.group(allSessions);

    set(() => ({
      sessions: groupedSessions,
    }));

    return sessionId;
  },
  forkChat: async (messages: Message[]): Promise<string | null> => {
    try {
      // First create a new session
      const { data: sessionData, error: sessionError } = await supabase
        .from("ChatBot_Sessions")
        .insert([
          {
            user_id: get().user.user_id,
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
        user_id: get().user.user_id,
        model: msg.model,
      }));

      const { error: messagesError } = await supabase.from("ChatBot_Messages").insert(newMessages);

      if (messagesError) {
        console.error("Error copying messages:", messagesError);
        // Clean up the session if message copying failed
        await supabase.from("ChatBot_Sessions").delete().eq("id", sessionData.id);
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
  updateSessionTitle: async (sessionId: string, title: string) => {
    const { error } = await supabase.from("ChatBot_Sessions").update({ name: title }).eq("id", sessionId);

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
      };
    });
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
      const filteredSessions = allSessions.filter((session) => session.id !== sessionId);

      const strategy = new TimeframeGroupingStrategy();
      return {
        sessions: strategy.group(filteredSessions),
      };
    });
  },

  loading: false,
  isLoadingMessageResponse: false,
  isStreaming: false,
  init: async (sessionId?: string) => {
    set({ loading: true });
    const response = await fetch(`/api/v1/init`);
    const responseData = await response.json();
    if (responseData.code === "user_id_required") {
      set({ loading: false, activeModal: "auth" });
      return;
    }

    const currentSession = responseData.sessions.find((s: ChatSession) => s.id === sessionId);
    console.log("currentSession", currentSession);

    const strategy = new TimeframeGroupingStrategy();
    const groupedSessions = strategy.group(responseData.sessions);

    set({
      sessions: groupedSessions,
      loading: false,
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
  user: {
    user_id: "",
    email: "",
    message_count: 0,
    stripeSubscriptionId: "",
    subscriptionStatus: "",
    subscriptionPeriodEnd: "",
  },
  activeModal: null,
  openModal: (type: ModalType) => {
    set({ activeModal: type });
  },
  closeModal: () => {
    set({ activeModal: null });
  },
  clearStore: () =>
    set(() => ({
      user: {
        user_id: "",
        email: "",
        message_count: 0,
        stripeSubscriptionId: "",
        subscriptionStatus: "",
        subscriptionPeriodEnd: "",
        chat_context: "",
      },
      activeModal: null,
      sessions: {},
    })),
  // This is just to see if the user is logged in or not
  initGuest: async () => {
    set({ loading: true });
    const response = await fetch(`/api/v1/init`);
    const responseData = await response.json();

    const strategy = new TimeframeGroupingStrategy();
    const groupedSessions = strategy.group(responseData.sessions);
    set({
      loading: false,
      user: responseData.user,
      sessions: groupedSessions,
    });
  },
  updateUserChatContext: async (chatContext: string) => {
    set((state) => ({
      user: {
        ...state.user,
        chat_context: chatContext,
      },
    }));
  },
}));
