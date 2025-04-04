import { openAiModels } from "@/constants/models";
import { create } from "zustand";
import {
  createChatSession,
  deleteChatSession,
  deleteMultipleSessions,
  togglePinSession as togglePinSessionAction,
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
};

type ChatStore = {
  messages: NewMessage[];
  isLoading: boolean;
  currentInput: string;
  selectedModel: {
    id: string;
    provider: string;
  };
  sessionId: string;
  chatSessions: ChatSession[];
  selectedChats: string[];
  setInput: (input: string) => void;
  setMessages: (messages: NewMessage[]) => void;
  addMessage: (message: NewMessage) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setModel: (model: { id: string; provider: string }) => void;
  chatTitle: string;
  setSessionId: (id: string) => void;
  setChatSessions: (sessions: ChatSession[]) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;

  // New functions
  deleteSession: (sessionId: string) => void;
  deleteMultipleSessions: (sessionIds: string[]) => void;
  togglePinSession: (sessionId: string) => void;
  duplicateSession: (sessionId: string) => void;
  toggleChatSelection: (sessionId: string) => void;
  selectAllChats: () => void;
  clearChatSelection: () => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (isOpen: boolean) => void;
};

const firstFreeModel = openAiModels.find((model) => model.free);
export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
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
    // Create new session in database when setting a new ID
    createChatSession(id).catch((error) => {
      console.error("Failed to create chat session:", error);
    });
  },
  setInput: (input) => set({ currentInput: input }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  updateLastMessage: (content) =>
    set((state) => ({
      messages: state.messages.map((msg, idx) => (idx === state.messages.length - 1 ? { ...msg, content } : msg)),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setModel: (model) => set({ selectedModel: model }),

  chatTitle: "",
  setChatSessions: (sessions) => set({ chatSessions: sessions }),
  updateSessionTitle: async (sessionId, newTitle) => {
    set((state) => ({
      chatSessions: state.chatSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newTitle } : session
      ),
      ...(state.sessionId === sessionId ? { chatTitle: newTitle } : {}),
    }));
  },
  // New function implementations
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

  duplicateSession: (sessionId) =>
    set((state) => {
      const sessionToDuplicate = state.chatSessions.find((session) => session.id === sessionId);
      if (!sessionToDuplicate) return state;

      const newSession = {
        ...sessionToDuplicate,
        id: crypto.randomUUID(),
        name: `${sessionToDuplicate.name} (copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pinned: false,
      };

      return {
        chatSessions: [...state.chatSessions, newSession],
      };
    }),

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
}));
