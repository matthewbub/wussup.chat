export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  model: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_id: string;
}
