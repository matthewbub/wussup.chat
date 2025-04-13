import { openAiModels } from "@/constants/models";
import { create } from "zustand";

export type NewMessage = {
  content: string;
  role: "user" | "assistant";
  id: string;
};

export type ChatSession = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  chat_history: { role: string; content: string }[];
  pinned?: boolean;
};

type ChatStore = {
  messages: NewMessage[] | null;
  isLoading: boolean;
  isLoadingChatHistory: boolean;
  currentInput: string;
  selectedModel: {
    id: string;
    provider: string;
  };
  sessionId: string;
  chatSessions: ChatSession[];
  selectedChats: string[];
  setInput: (input: string) => void;
  setMessages: (messages: NewMessage[] | null) => void;
  addMessage: (message: NewMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: { id: string; provider: string }) => void;
  chatTitle: string;
  setSessionId: (id: string) => void;
  setChatSessions: (sessions: ChatSession[]) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
  deleteSession: (sessionId: string) => void;
  deleteMultipleSessions: (sessionIds: string[]) => void;
  duplicateSession: (sessionId: string) => void;
  toggleChatSelection: (sessionId: string) => void;
  selectAllChats: () => void;
  clearChatSelection: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  updateSessionTitleWithDb: (sessionId: string, newTitle: string) => Promise<{ success: boolean; error?: string }>;
  setIsLoadingChatHistory: (isLoading: boolean) => void;
  setPinStatus: (sessionId: string, pinStatus: boolean) => void;
  createNewThread: (
    sessionId: string,
    data: { name: string; created_at: string; updated_at: string; pinned: boolean }
  ) => void;
  isSubscribed: boolean;
  setInitialPageData: (data: { isSubscribed: boolean; messages: NewMessage[]; sessionId: string }) => void;
};

const firstFreeModel = openAiModels.find((model) => model.free);
export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  isLoadingChatHistory: false,
  currentInput: "",
  selectedModel: {
    id: firstFreeModel?.id || openAiModels[0].id,
    provider: firstFreeModel?.provider || openAiModels[0].provider,
  },
  sessionId: crypto.randomUUID(),
  chatSessions: [],
  selectedChats: [],
  isMobileSidebarOpen: false,
  setSessionId: (id) => {
    set({ sessionId: id });
  },
  setInput: (input) => set({ currentInput: input }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...(state.messages || []), message],
    })),
  updateLastMessage: (content) =>
    set((state) => ({
      messages: state.messages?.map((msg, idx) =>
        idx === (state.messages?.length || 0) - 1 ? { ...msg, content } : msg
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setModel: (model) => set({ selectedModel: model }),

  chatTitle: "",
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  updateSessionTitle: (sessionId, newTitle) => {
    set((state) => ({
      chatSessions: state.chatSessions.some((session) => session.id === sessionId)
        ? state.chatSessions.map((session) =>
            session.id === sessionId ? { ...session, name: newTitle, updated_at: new Date().toISOString() } : session
          )
        : [
            ...state.chatSessions,
            {
              id: sessionId,
              name: newTitle,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              chat_history: [],
              pinned: false,
            },
          ],
    }));
  },
  createNewThread: (sessionId, data) => {
    set((state) => ({
      chatSessions: state.chatSessions.some((session) => session.id === sessionId)
        ? state.chatSessions.map((session) =>
            session.id === sessionId ? { ...session, name: data.name, updated_at: data.updated_at } : session
          )
        : [
            ...state.chatSessions,
            {
              id: sessionId,
              name: data.name,
              created_at: data.created_at,
              updated_at: data.updated_at,

              // we need to get the chat history somehow, we're going to have to call this after the ai has responded ugh
              chat_history: [],
              pinned: data.pinned,
            },
          ],
    }));
  },

  updateSessionTitleWithDb: async (sessionId, newTitle) => {
    // First update the state optimistically
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newTitle, updated_at: new Date().toISOString() } : session
      ),
      ...(state.sessionId === sessionId ? { chatTitle: newTitle } : {}),
    }));

    try {
      const data = await fetch("/api/v3/threads", {
        method: "POST",
        body: JSON.stringify({ threadId: sessionId, name: newTitle }),
      });

      if (!data.ok) {
        throw new Error("Failed to update chat title");
      }

      const result = await data.json();
      console.log("result", result);

      return { success: true };
    } catch (error) {
      // Revert state on error
      set((state) => ({
        chatSessions: state.chatSessions.map((session) =>
          session.id === sessionId ? { ...session, name: state.chatTitle } : session
        ),
      }));
      console.error("Failed to update chat title:", error);
      return { success: false, error: "Failed to update chat title" };
    }
  },

  deleteSession: async (sessionId) => {
    set((state) => {
      const newSessions = state.chatSessions.filter((session) => session.id !== sessionId);
      return {
        chatSessions: newSessions,
        selectedChats: state.selectedChats.filter((id) => id !== sessionId),
      };
    });

    try {
      const data = await fetch("/api/v3/threads", {
        method: "DELETE",
        body: JSON.stringify({ threadIdArray: [sessionId] }),
      });

      if (!data.ok) {
        throw new Error("Failed to delete chat session");
      }

      const result = await data.json();
      console.log("result", result);
    } catch (error) {
      console.error("Failed to delete chat session:", error);
    }
  },

  deleteMultipleSessions: async (sessionIds) => {
    set((state) => {
      const newSessions = state.chatSessions.filter((session) => !sessionIds.includes(session.id));
      return {
        chatSessions: newSessions,
        selectedChats: state.selectedChats.filter((id) => !sessionIds.includes(id)),
      };
    });

    try {
      const data = await fetch("/api/v3/threads", {
        method: "DELETE",
        body: JSON.stringify({ threadIdArray: sessionIds }),
      });

      if (!data.ok) {
        throw new Error("Failed to delete chat sessions");
      }

      const result = await data.json();
      console.log("result", result);
    } catch (error) {
      console.error("Failed to delete chat sessions:", error);
    }
  },

  setPinStatus: async (sessionId, pinStatus) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId ? { ...session, pinned: pinStatus } : session
      ),
    }));

    try {
      console.log("setting pin status", pinStatus);
      const data = await fetch("/api/v3/threads", {
        method: "POST",
        body: JSON.stringify({ threadId: sessionId, pin: pinStatus }),
      });
      if (!data.ok) {
        throw new Error("Failed to set pin status");
      }
      const result = await data.json();
      console.log("result", result);
    } catch (error) {
      console.error("Failed to set pin status:", error);
    }
  },

  duplicateSession: async (sessionId) => {
    // Optimistically update the UI
    const newSessionId = crypto.randomUUID();
    set((state) => {
      const sessionToDuplicate = state.chatSessions.find((session) => session.id === sessionId);
      if (!sessionToDuplicate) return state;

      const newSession = {
        ...sessionToDuplicate,
        id: newSessionId,
        name: `${sessionToDuplicate.name} (copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pinned: false,
      };

      return {
        chatSessions: [...state.chatSessions, newSession],
      };
    });

    try {
      const data = await fetch("/api/v3/chat/duplicate", {
        method: "POST",
        body: JSON.stringify({ sessionId, newSessionId }),
      });

      if (!data.ok) {
        throw new Error("Failed to duplicate session");
      }

      const result = await data.json();

      if ("error" in result) {
        // Revert the optimistic update on error
        set((state) => ({
          chatSessions: state.chatSessions.filter((session) => session.id !== newSessionId),
        }));
        console.error("Failed to duplicate session:", result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      // Revert the optimistic update on error
      set((state) => ({
        chatSessions: state.chatSessions.filter((session) => session.id !== newSessionId),
      }));
      console.error("Failed to duplicate session:", error);
      return { success: false, error: "Failed to duplicate session" };
    }
  },

  toggleChatSelection: (sessionId) =>
    set((state) => {
      if (state.selectedChats.includes(sessionId)) {
        return { selectedChats: state.selectedChats.filter((id) => id !== sessionId) };
      } else {
        return { selectedChats: [...state.selectedChats, sessionId] };
      }
    }),

  selectAllChats: () =>
    set((state) => ({
      selectedChats: state.chatSessions.map((session) => session.id),
    })),

  clearChatSelection: () => set({ selectedChats: [] }),

  setMobileSidebarOpen: (isOpen) => set({ isMobileSidebarOpen: isOpen }),
  setIsLoadingChatHistory: (isLoading: boolean) => set({ isLoadingChatHistory: isLoading }),
  setInitialPageData: (data) =>
    set({
      isSubscribed: data.isSubscribed,
      messages: data.messages,
      sessionId: data.sessionId,
      isLoadingChatHistory: false,
    }),
  isSubscribed: false,
}));
