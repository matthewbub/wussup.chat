import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createNewSession: () => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (text: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      createNewSession: () => {
        const newSession = {
          id: crypto.randomUUID(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId
              ? state.sessions[0]?.id ?? null
              : state.currentSessionId,
        }));
      },

      addMessage: async (text: string) => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) {
          get().createNewSession();
        }

        const userMessage = { id: crypto.randomUUID(), text, isUser: true };

        // Update session messages
        set((state) => ({
          sessions: state.sessions.map((session) =>
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
          ),
        }));

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
        const botMessage = { id: crypto.randomUUID(), text: "", isUser: false };

        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === get().currentSessionId
              ? { ...session, messages: [...session.messages, botMessage] }
              : session
          ),
        }));

        while (!done) {
          if (!reader) break;
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunk = decoder.decode(value, { stream: true });

          set((state) => ({
            sessions: state.sessions.map((session) =>
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
            ),
          }));
        }
      },
    }),
    {
      name: "chat-storage",
    }
  )
);
