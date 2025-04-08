import { openAiModels } from "@/constants/models";
import { create } from "zustand";
import {
  deleteSession as deleteChatSession,
  deleteSessions as deleteMultipleSessions,
  togglePin as togglePinSessionAction,
  duplicateChat as duplicateSessionAction,
} from "@/app/actions/chat-actions";

export type NewMessage = {
  content: string;
  role: "user" | "assistant";
};

export type ChatSession = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  chat_history: { role: string; content: string }[];
  pinned?: boolean;
  isFavorite?: boolean;
  existsInDb?: boolean;
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
  togglePinSession: (sessionId: string) => void;
  duplicateSession: (sessionId: string) => void;
  toggleChatSelection: (sessionId: string) => void;
  selectAllChats: () => void;
  clearChatSelection: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
  updateSessionTitleWithDb: (sessionId: string, newTitle: string) => Promise<{ success: boolean; error?: string }>;
  setIsLoadingChatHistory: (isLoading: boolean) => void;
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
  updateSessionTitle: async (sessionId, newTitle) => {
    // Get the current state
    const state = useChatStore.getState();

    // Find the session to update
    const sessionIndex = state.chatSessions.findIndex((session) => session.id === sessionId);

    if (sessionIndex === -1) {
      // Create a new session if it doesn't exist
      const newSession: ChatSession = {
        id: sessionId,
        name: newTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chat_history: [],
        pinned: false,
        existsInDb: false,
      };

      // Add the new session to the state
      set((state) => ({
        chatSessions: [...state.chatSessions, newSession],
      }));
      return;
    }

    // Create a new session object with updated values
    const updatedSession = {
      ...state.chatSessions[sessionIndex],
      name: newTitle,
      updated_at: new Date().toISOString(),
    };

    // Update the state immutably
    set((state) => {
      const newChatSessions = [...state.chatSessions];
      newChatSessions[sessionIndex] = updatedSession; // Replace the old session with the updated one
      return { chatSessions: newChatSessions };
    });
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
      await deleteChatSession(sessionId);
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
      await deleteMultipleSessions(sessionIds);
    } catch (error) {
      console.error("Failed to delete chat sessions:", error);
    }
  },

  togglePinSession: async (sessionId) => {
    // Optimistically update the UI
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId ? { ...session, pinned: !session.pinned } : session
      ),
    }));

    try {
      const result = await togglePinSessionAction(sessionId);

      // If the server call failed, revert the optimistic update
      if ("error" in result) {
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === sessionId ? { ...session, pinned: !session.pinned } : session
          ),
        }));
        console.error("Failed to toggle pin status:", result.error);
      }
    } catch (error) {
      // Revert the optimistic update on error
      set((state) => ({
        chatSessions: state.chatSessions.map((session) =>
          session.id === sessionId ? { ...session, pinned: !session.pinned } : session
        ),
      }));
      console.error("Failed to toggle pin status:", error);
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
      const result = await duplicateSessionAction(sessionId);

      if ("error" in result) {
        // Revert the optimistic update on error
        set((state) => ({
          chatSessions: state.chatSessions.filter((session) => session.id !== newSessionId),
        }));
        console.error("Failed to duplicate session:", result.error);
        return { success: false, error: result.error };
      }

      // Update the session ID in case the server generated a different one
      if (result.sessionId !== newSessionId) {
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === newSessionId ? { ...session, id: result.sessionId } : session
          ),
        }));
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
}));
