// store/chatStore.ts
import { create } from "zustand";
import { useChat } from "@ai-sdk/react";
import { UIMessage, Message, CreateMessage, ChatRequestOptions } from "ai";

interface ChatState {
  messages: UIMessage[];
  input: string;
  status: "submitted" | "streaming" | "ready" | "error";
  error: Error | undefined;
  setInput: (input: string) => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  stop: () => void;
  reload: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// create a bare store with dummy implementations
const useStore = create<ChatState>(() => ({
  messages: [],
  input: "",
  status: "ready",
  error: undefined,
  setInput: () => {},
  append: async () => null,
  stop: () => {},
  reload: () => {},
  handleInputChange: () => {},
  handleSubmit: () => {},
}));

// create a custom hook that combines zustand with useChat
const useChatStore = () => {
  const chatHook = useChat({
    api: "/api/v1/chat",
  });

  // update the store with the latest chat hook values
  useStore.setState(chatHook);

  return useStore();
};

export { useChatStore };
