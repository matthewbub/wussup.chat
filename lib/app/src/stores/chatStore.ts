import { create } from "zustand";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatStore {
  messages: Message[];
  addMessage: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  addMessage: async (text: string) => {
    // Add user message
    const userMessage = { id: crypto.randomUUID(), text, isUser: true };
    set((state) => ({ messages: [...state.messages, userMessage] }));

    // Send to API and handle bot response
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: get().messages,
      }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    const botMessage = { id: crypto.randomUUID(), text: "", isUser: false };

    set((state) => ({ messages: [...state.messages, botMessage] }));

    while (!done) {
      if (!reader) break;
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });

      botMessage.text += chunk;
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === botMessage.id ? { ...msg, text: botMessage.text } : msg
        ),
      }));
    }
  },
}));
