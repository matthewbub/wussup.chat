export interface Annotation {
  type: string;
  end_index: number;
  start_index: number;
  title: string;
  url: string;
}

export interface ChunkSequence {
  type: string;
  count: number;
  content: string;
  part?: {
    annotations?: Annotation[];
    type?: string;
    text?: string;
  };
}

export interface ApiChunk {
  type: string;
  content: string;
  delta?: string;
  part?: {
    annotations?: Annotation[];
  };
}

// streaming but no thinking or anything like that just the basic stuff
type OpenAIMessageTypeBasic =
  | "response.created"
  | "response.in_progress"
  | "response.output_item.added"
  | "response.output_item.done"
  | "response.output_item.added"
  | "response.content_part.added"
  | "response.output_text.delta"
  | "response.output_text.done"
  | "response.content_part.done"
  | "response.output_item.done"
  | "response.completed";

type OpenAIMessageTypeWithWebSearch =
  | "response.created"
  | "response.in_progress"
  | "response.output_item.added"
  | "response.web_search_call.in_progress"
  | "response.web_search_call.searching"
  | "response.web_search_call.completed"
  | "response.output_item.done"
  | "response.output_item.added"
  | "response.content_part.added"
  | "response.output_text.delta"
  | "response.output_text.annotation.added"
  | "response.output_text.done"
  | "response.content_part.done"
  | "response.output_item.done"
  | "response.completed";

type OpenAIMessageTypeWithThinking =
  | "response.created"
  | "response.in_progress"
  | "response.output_item.added"
  | "response.reasoning_summary_part.added"
  | "response.reasoning_summary_text.delta"
  | "response.reasoning_summary_text.done"
  | "response.reasoning_summary_part.done"
  | "response.output_item.done"
  | "response.output_item.added"
  | "response.content_part.added"
  | "response.output_text.delta"
  | "response.output_text.done"
  | "response.content_part.done"
  | "response.completed";

// this is actually an artificial type from us (internally)
// it is not part of the openai api
type OpenAiMessageTypeWithImage = "app.image.delta";

// i think this is all there is for anthropic
type AnthropicMessageTypeBasic =
  | "message_start"
  | "content_block_start"
  | "content_block_delta"
  | "content_block_stop"
  | "message_delta"
  | "message_stop";

export interface MessagePart {
  type:
    | "user"
    | OpenAIMessageTypeBasic
    | OpenAIMessageTypeWithWebSearch
    | OpenAIMessageTypeWithThinking
    | OpenAiMessageTypeWithImage
    | AnthropicMessageTypeBasic;
  content: string;
  part?: {
    annotations?: Annotation[];
    type?: string;
    text?: string;
  };
}
