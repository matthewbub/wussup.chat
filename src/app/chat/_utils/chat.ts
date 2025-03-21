// file handling utilities
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const CHARACTER_LIMIT = 1000;

type FileValidationResult = {
  isValid: boolean;
  error?: string;
  type?: string;
};

/**
 * validates file upload based on size and type
 */
export const validateFile = (file: File): FileValidationResult => {
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File is too large. Maximum size is 10MB." };
  }

  if (file.type.startsWith("image/")) {
    return { isValid: true, type: "image" };
  } else if (file.type === "application/pdf") {
    return { isValid: true, type: "pdf" };
  } else if (file.type === "text/plain") {
    return { isValid: true, type: "text" };
  }

  return {
    isValid: false,
    error: "Unsupported file type. Please upload a PDF, image, or text file.",
  };
};

/**
 * creates a new user message that gets fed to the LLM
 */
export const createUserMessage = (content: string) => ({
  id: crypto.randomUUID(),
  content,
  is_user: true,
  created_at: new Date().toISOString(),
  model: null,
  model_provider: null,
  prompt_tokens: 0,
  completion_tokens: 0,
});

/**
 * creates a new ai message
 */
export const createAIMessage = (params: { id: string; model: string }) => ({
  id: params.id,
  content: "",
  is_user: false,
  created_at: new Date().toISOString(),
  model: params.model,
  prompt_tokens: 0,
  completion_tokens: 0,
});

/**
 * creates a message update object for storage
 */
export const createMessageUpdate = (params: {
  id: string;
  content: string;
  is_user: boolean;
  session_id: string;
  created_at: string;
  model?: string;
  model_provider?: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  is_preferred?: boolean;
}) => ({
  id: params.id,
  content: params.content,
  is_user: params.is_user,
  session_id: params.session_id,
  created_at: params.created_at,
  model: params.model,
  model_provider: params.model_provider,
  prompt_tokens: params.prompt_tokens || 0,
  completion_tokens: params.completion_tokens || 0,
  is_preferred: params.is_preferred,
});

/**
 * processes streaming response from chat api
 */
export const processStreamingResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (content: string) => void,
  onMetadata?: (data: any) => void
) => {
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      try {
        if (line.startsWith("0")) {
          const data = line.slice(3, -1);
          if (data === "[DONE]") break;

          const cleanedData = data.replace(/\\n/g, "\n");
          onChunk(cleanedData);
        } else if (line.startsWith("e:") || line.startsWith("d:")) {
          const eventData = JSON.parse(line.slice(2));
          if (eventData.usage && onMetadata) {
            onMetadata(eventData.usage);
          }
        }
      } catch (e) {
        console.error("Error parsing chunk:", e);
      }
    }
  }
};

/**
 * creates form data for chat api request
 */
export const createChatFormData = (params: {
  content: string;
  sessionId: string;
  model: string;
  modelProvider: string;
  chatContext: string;
  messageHistory: any[];
  responseType?: string;
  responseGroupId?: string;
  parentMessageId?: string;
  attachments?: Array<{ file: File }>;
}) => {
  console.log("[Create Chat Form Data] Params.modelProvider:", params.modelProvider);
  const formData = new FormData();
  formData.append("content", params.content);
  formData.append("session_id", params.sessionId);
  formData.append("model", params.model);
  formData.append("model_provider", params.modelProvider);
  formData.append("chat_context", params.chatContext);
  formData.append("messageHistory", JSON.stringify(params.messageHistory));

  if (params.attachments) {
    params.attachments.forEach((attachment) => {
      formData.append("attachments", attachment.file);
    });
  }

  return formData;
};

/**
 * stores chat messages in the backend
 */
export const storeChatMessages = async (messages: any[]) => {
  return fetch("/api/v1/chat-store", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });
};

/**
 * generates chat title for new conversations
 */
export const generateChatTitle = async (sessionId: string, content: string) => {
  const response = await fetch("/api/v1/title", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      messages: [{ is_user: true, content }],
    }),
  });
  return response.json();
};
