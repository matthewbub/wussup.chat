import { create } from "zustand";
import Dexie, { Table } from "dexie";

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

interface CurrentSession {
  id: string;
  sessionId: string | null;
}

// Define the database
class ChatDatabase extends Dexie {
  sessions!: Table<ChatSession>;
  currentSession!: Table<CurrentSession>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      sessions: "id",
      currentSession: "id",
    });
  }
}

const db = new ChatDatabase();

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createNewSession: () => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (text: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  sessions: [],
  currentSessionId: null,

  createNewSession: async () => {
    const newSession = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    };

    await db.transaction("rw", [db.sessions, db.currentSession], async () => {
      await db.sessions.put(newSession);
      await db.currentSession.put({ id: "current", sessionId: newSession.id });
    });

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: newSession.id,
    }));
  },

  setCurrentSession: async (sessionId) => {
    await db.currentSession.put({ id: "current", sessionId });
    set({ currentSessionId: sessionId });
  },

  deleteSession: async (sessionId) => {
    await db.transaction("rw", [db.sessions, db.currentSession], async () => {
      await db.sessions.delete(sessionId);

      set((state) => {
        const newState = {
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId
              ? state.sessions[0]?.id ?? null
              : state.currentSessionId,
        };

        if (state.currentSessionId === sessionId) {
          db.currentSession.put({
            id: "current",
            sessionId: newState.currentSessionId,
          });
        }

        return newState;
      });
    });
  },

  addMessage: async (text: string) => {
    const { currentSessionId, sessions } = get();
    if (!currentSessionId) {
      await get().createNewSession();
    }

    const userMessage = {
      id: crypto.randomUUID(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    // Update session messages
    await db.transaction("rw", db.sessions, async () => {
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

        const updatedSession = updatedSessions.find(
          (s) => s.id === (currentSessionId ?? get().currentSessionId)
        );
        if (updatedSession) {
          db.sessions.put(updatedSession);
        }

        return { sessions: updatedSessions };
      });
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
    await db.transaction("rw", db.sessions, async () => {
      set((state) => {
        const updatedSessions = state.sessions.map((session) =>
          session.id === get().currentSessionId
            ? { ...session, messages: [...session.messages, botMessage] }
            : session
        );

        const updatedSession = updatedSessions.find(
          (s) => s.id === get().currentSessionId
        );
        if (updatedSession) {
          db.sessions.put(updatedSession);
        }

        return { sessions: updatedSessions };
      });
    });

    // Stream response
    while (!done) {
      if (!reader) break;
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });

      await db.transaction("rw", db.sessions, async () => {
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

          const updatedSession = updatedSessions.find(
            (s) => s.id === get().currentSessionId
          );
          if (updatedSession) {
            db.sessions.put(updatedSession);
          }

          return { sessions: updatedSessions };
        });
      });
    }
  },
}));

// Initialize store with data from Dexie
(async () => {
  const sessions = await db.sessions.toArray();
  const currentSession = await db.currentSession.get("current");
  useChatStore.setState({
    sessions,
    currentSessionId: currentSession?.sessionId ?? null,
  });
})();
