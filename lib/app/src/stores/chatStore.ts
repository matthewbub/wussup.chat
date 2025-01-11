import { create } from "zustand";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

// Helper functions for localStorage
const SESSIONS_KEY = "chat_sessions";
const CURRENT_SESSION_KEY = "current_session_id";

const getStoredSessions = (): ChatSession[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  if (!stored) return [];
  return JSON.parse(stored, (key, value) => {
    if (key === "timestamp" || key === "createdAt") {
      return new Date(value);
    }
    return value;
  });
};

const getCurrentSessionId = (): string | null => {
  return localStorage.getItem(CURRENT_SESSION_KEY);
};

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createNewSession: () => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (text: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  sessions: getStoredSessions(),
  currentSessionId: getCurrentSessionId(),

  createNewSession: () => {
    const newSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };

    set((state) => {
      const newSessions = [newSession, ...state.sessions];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
      localStorage.setItem(CURRENT_SESSION_KEY, newSession.id);
      return {
        sessions: newSessions,
        currentSessionId: newSession.id,
      };
    });
  },

  setCurrentSession: (sessionId) => {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    set({ currentSessionId: sessionId });
  },

  deleteSession: (sessionId) => {
    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== sessionId);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));

      const newState = {
        sessions: newSessions,
        currentSessionId:
          state.currentSessionId === sessionId
            ? newSessions[0]?.id ?? null
            : state.currentSessionId,
      };

      if (state.currentSessionId === sessionId) {
        localStorage.setItem(
          CURRENT_SESSION_KEY,
          newState.currentSessionId ?? ""
        );
      }

      return newState;
    });
  },

  addMessage: async (text: string) => {
    const { currentSessionId } = get();
    if (!currentSessionId) {
      get().createNewSession();
    }

    const userMessage = {
      id: crypto.randomUUID(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    // Update session messages
    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === (currentSessionId ?? get().currentSessionId)
          ? {
              ...session,
              messages: [...session.messages, userMessage],
              title:
                session.messages.length === 0
                  ? text.slice(0, 30)
                  : session.title,
            }
          : session
      );

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      return { sessions: updatedSessions };
    });

    // Send to API and handle bot response
    const currentSession = get().sessions.find(
      (s) => s.id === get().currentSessionId
    );

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: currentSession?.messages ?? [],
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    const botMessage = {
      id: crypto.randomUUID(),
      text: "",
      isUser: false,
      timestamp: new Date(),
    };

    // Add initial bot message
    set((state) => {
      const updatedSessions = state.sessions.map((session) =>
        session.id === get().currentSessionId
          ? { ...session, messages: [...session.messages, botMessage] }
          : session
      );

      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
      return { sessions: updatedSessions };
    });

    // Stream response
    while (!done) {
      if (!reader) break;
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });

      set((state) => {
        const updatedSessions = state.sessions.map((session) =>
          session.id === get().currentSessionId
            ? {
                ...session,
                messages: session.messages.map((msg) =>
                  msg.id === botMessage.id
                    ? { ...msg, text: msg.text + chunk }
                    : msg
                ),
              }
            : session
        );

        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updatedSessions));
        return { sessions: updatedSessions };
      });
    }
  },
}));
