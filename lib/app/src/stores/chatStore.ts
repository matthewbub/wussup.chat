import { create } from "zustand";
import { SERVICE_URLS } from "../constants/api";

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

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  createNewSession: (userId?: string) => Promise<void>;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (text: string, userId?: string) => Promise<void>;
  deleteSession: (sessionId: string, userId?: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  sessions: [],
  currentSessionId: null,

  /**
   * Creates a new chat session by making an API call.
   */
  createNewSession: async (userId) => {
    try {
      const response = await fetch(SERVICE_URLS.CREATE_THREAD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, title: "New Chat" }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      const newSession: ChatSession = {
        id: data.data.id,
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
      };

      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id,
      }));
    } catch (error) {
      console.error("Error creating a new session:", error);
      throw error;
    }
  },

  /**
   * Sets the current session.
   */
  setCurrentSession: (sessionId) => {
    set({ currentSessionId: sessionId });
  },

  /**
   * Deletes a session via API and updates the local state.
   */
  deleteSession: async (sessionId, userId) => {
    try {
      const deleteUrl = SERVICE_URLS.DELETE_THREAD.replace(
        ":threadId",
        sessionId
      );
      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error("Error deleting session");

      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        currentSessionId:
          state.currentSessionId === sessionId ? null : state.currentSessionId,
      }));
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  },

  /**
   * Adds a message to the current session and fetches a bot response.
   */
  addMessage: async (text, userId) => {
    let currentSessionId = get().currentSessionId;

    if (!currentSessionId) {
      await get().createNewSession(userId);
      currentSessionId = get().currentSessionId;
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    // update state with the new user message
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === get().currentSessionId
          ? { ...session, messages: [...session.messages, newMessage] }
          : session
      ),
    }));

    try {
      // send the message to your backend
      await fetch(SERVICE_URLS.CREATE_MESSAGE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          text: newMessage.text,
          role: "user",
          thread_id: currentSessionId,
        }),
      });

      // retrieve the bot response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history:
            get()
              .sessions.find((s) => s.id === currentSessionId)
              ?.messages.map((msg) => msg.text) ?? [],
        }),
      });

      const botResponse = await response.text();
      console.log("Raw response:", botResponse);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      // Add debugging before state update
      console.log("Current state before update:", get().sessions);
      console.log("Bot message to add:", botMessage);
      console.log("Target session ID:", currentSessionId);

      set((state) => {
        const targetSession = state.sessions.find(
          (s) => s.id === currentSessionId
        );
        console.log("Found target session:", targetSession);

        const updatedSessions = state.sessions.map((session) => {
          if (session.id === currentSessionId) {
            const updatedSession = {
              ...session,
              messages: [...session.messages, botMessage],
            };
            console.log("Updated session messages:", updatedSession.messages);
            return updatedSession;
          }
          return session;
        });

        console.log("Final updated sessions:", updatedSessions);
        return { sessions: updatedSessions };
      });
    } catch (error) {
      console.error("Error sending or receiving messages:", error);
      throw error;
    }
  },
}));
