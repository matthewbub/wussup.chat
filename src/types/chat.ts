import { z } from "zod";

export interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  model: string;
  model_provider?: string;
  chat_session_id?: string;
  clerk_user_id?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
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
  clerk_user_id: string;
}

type ChatSessionGroup = "Older" | "This Month" | "This Week" | "Today";
export type GroupedSession = {
  [key in ChatSessionGroup]: ChatSession[];
};

// Define the supported file types
export const AttachmentTypeEnum = z.enum(["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"]);

// Schema for attachments
export const AttachmentSchema = z.object({
  name: z.string(),
  contentType: AttachmentTypeEnum,
  url: z.string().optional(), // Optional because it's generated server-side
  file: z.instanceof(File),
});

// Schema for chat messages
export const ChatMessageSchema = z.object({
  is_user: z.boolean(),
  content: z.string(),
});

// Main chat request schema
export const ChatRequestSchema = z.object({
  content: z.string(),
  model: z.string(),
  model_provider: z.string(),
  chat_context: z.string(),
  messageHistory: z.array(ChatMessageSchema).optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

// TypeScript types derived from the schemas
export type AttachmentType = z.infer<typeof AttachmentTypeEnum>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
