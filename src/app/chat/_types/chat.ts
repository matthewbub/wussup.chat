export type ChatStatus = "idle" | "streaming" | "error";

export type Attachment = {
  file: File;
  type: string;
};

export type MessageUpdate = {
  id: string;
  content: string;
  is_user: boolean;
  session_id: string;
  created_at: string;
  model?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
};

export type StreamingCallbacks = {
  onChunkReceived: (content: string) => void;
  onMetadataReceived?: (data: any) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
};
