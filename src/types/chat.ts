export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  model: string;
  chat_session_id?: string;
  user_id?: string;
  metadata?: {
    type: string;
    imageUrl: string;
    prompt: string;
    storagePath: string;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_id: string;
}
