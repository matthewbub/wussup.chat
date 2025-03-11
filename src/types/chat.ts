export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  model: string;
  chat_session_id?: string;
  clerk_user_id?: string;
  responseType?: "A" | "B";
  responseGroupId?: string;
  parentMessageId?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  metadata?: {
    type: string;
    imageUrl: string;
    prompt: string;
    storagePath: string;
  };
  isPreferred?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  clerk_user_id: string;
}

type ChatSessionGroup = "Older" | "This Month" | "This Week" | "Today";
export type GroupedSession = {
  [key in ChatSessionGroup]: ChatSession[];
};
