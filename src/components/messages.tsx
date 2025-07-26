"use client";
import { Fragment, JSX, useState, useEffect } from "react";
import { MessagePart } from "@/app/types";
import {
  File as FileIcon,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { EmptyMessage } from "./EmptyMessage";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { MESSAGE_TYPES, STATUS_TYPES } from "@/constants/stream";

export type ResponseState =
  | "Idle"
  | "Loading"
  | "Streaming"
  | "Complete"
  | "WebSearching";
export type MessageTypes = (typeof MESSAGE_TYPES)[number];
export type StatusTypes = (typeof STATUS_TYPES)[number];

function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert",
        // Paragraph and list styling
        "prose-p:my-1 prose-p:leading-relaxed",
        "prose-li:my-0.5",
        // Inline code styling
        "prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono",
        // Code block styling
        "prose-pre:bg-accent/70 prose-pre:text-sm prose-pre:font-mono prose-pre:rounded-md prose-pre:border prose-pre:border-border prose-pre:p-0"
      )}
    >
      <Markdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                // @ts-expect-error - this is a valid type
                style={oneDark}
                language={match[1]}
                PreTag="div"
                className="!mt-0 !mb-0"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

// Status Indicator Component
function StatusIndicator({ state }: { state: ResponseState }) {
  if (state === "Idle") return null;

  return (
    <div className="flex items-center gap-2 transition-opacity duration-300 opacity-70 hover:opacity-100">
      {state === "Loading" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-xs text-muted-foreground font-medium">
            Thinking...
          </span>
        </>
      )}
      {state === "WebSearching" && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span className="text-xs text-muted-foreground font-medium">
            Searching the web...
          </span>
        </>
      )}
      {state === "Streaming" && (
        <>
          <div className="relative h-3 w-3">
            <div className="absolute h-full w-full rounded-full bg-green-500 animate-ping opacity-30"></div>
            <div className="absolute h-full w-full rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Responding...
          </span>
        </>
      )}
      {state === "Complete" && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground font-medium">
            Complete
          </span>
        </>
      )}
    </div>
  );
}

export function Messages({
  messages,
}: {
  messages: MessagePart[];
}): JSX.Element | null {
  // Add state for response stage
  const [responseState, setResponseState] = useState<ResponseState>("Idle");
  // Add fade effect for status indicator
  const [indicatorVisible, setIndicatorVisible] = useState(false);

  // Monitor messages for state changes
  useEffect(() => {
    if (messages && messages.length === 0) {
      setResponseState("Idle");
      return;
    }

    // Check for the latest message type to determine state
    const latestMessages = [...messages].reverse();

    for (const message of latestMessages) {
      if (
        message.type === "response.web_search_call.in_progress" ||
        message.type === "response.web_search_call.searching"
      ) {
        setResponseState("WebSearching");
        return;
      }

      if (message.type === "response.in_progress") {
        setResponseState("Loading");
        return;
      }

      if (
        message.type === "response.output_item.added" ||
        message.type === "response.content_part.added"
      ) {
        setResponseState("Streaming");
        return;
      }

      if (message.type === "response.completed") {
        setResponseState("Complete");
        // Set a timer to hide the "Complete" indicator after 3 seconds
        setTimeout(() => {
          setIndicatorVisible(false);
        }, 3000);
        return;
      }
    }
  }, [messages]);

  // Show indicator when state changes and hide "Complete" after a delay
  useEffect(() => {
    if (responseState !== "Idle") {
      setIndicatorVisible(true);
    }
  }, [responseState]);

  const determineMessageType = (message: MessagePart) => {
    switch (message.type as MessageTypes) {
      case "user":
        return (
          <div className="w-full flex items-end justify-end">
            {/* 75% is roughly the input (textarae) size we provide to the user in the interface */}
            <div className="max-w-[75%] py-2 px-4 bg-accent/70 rounded-md">
              <MarkdownContent content={message.content as string} />
            </div>
          </div>
        );
      case "user.with_attachments":
        return (
          <div className="w-full flex items-end justify-end relative">
            {/* 75% is roughly the input (textarae) size we provide to the user in the interface */}
            <div className="max-w-[75%] py-2 px-4 bg-accent/70 rounded-md">
              <MarkdownContent content={message.content as string} />
            </div>
            <FileIcon className="h-4 w-4 absolute -bottom-2 -right-2 stroke-teal-600" />
          </div>
        );
      case "app.image.delta":
        return (
          <div className="w-full relative mb-4">
            <img
              // @ts-expect-error - this is a valid type
              src={message?.content?.image_url}
              alt="Generated Image"
              className="w-[300px]"
            />
          </div>
        );
      case "response.content_part.done":
        const annotations = message.part?.annotations || [];

        const annotationsWithOutDuplicates = annotations.filter(
          (annotation, index, self) =>
            index === self.findIndex((t) => t.url === annotation.url)
        );

        if (!annotationsWithOutDuplicates.length) {
          return null;
        }

        return (
          <div className="text-foreground whitespace-pre-wrap mb-4">
            <MarkdownContent content={message.content as string} />

            <div className="mt-3 flex flex-wrap gap-2">
              {annotationsWithOutDuplicates.map((annotation) => (
                <a
                  key={annotation.url}
                  href={annotation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 group"
                >
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="truncate max-w-[200px]">
                    {annotation.title}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        );

      case "response.output_text.delta":
        if (message.content.length <= 0) {
          return null;
        }

        if (Array.isArray(message.content)) {
          return (
            <div className="text-foreground whitespace-pre-wrap">
              <MarkdownContent
                content={JSON.stringify(message.content) as string}
              />
            </div>
          );
        }
        return (
          <div className="text-foreground whitespace-pre-wrap">
            <MarkdownContent content={message.content as string} />
          </div>
        );
      default:
        // return <pre>{JSON.stringify(message, null, 2)}</pre>;
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Messages */}
      <div className="w-full space-y-4 mb-4 max-h-[calc(100vh-140px)] overflow-y-scroll pr-6">
        {messages && messages.length === 0 ? (
          <EmptyMessage />
        ) : (
          messages &&
          messages.map((message, index) => {
            if (MESSAGE_TYPES.includes(message.type as MessageTypes)) {
              return (
                <Fragment key={index}>{determineMessageType(message)}</Fragment>
              );
            }
            return null;
            // return <pre key={index}>{JSON.stringify(message, null, 2)}</pre>;
          })
        )}
      </div>
      {/* Status indicator */}
      <div
        className={cn(
          "transition-all duration-300 mb-2 sticky bottom-0 bg-background",
          indicatorVisible
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-2",
          responseState !== "Idle" ? "h-6" : "h-0"
        )}
      >
        <StatusIndicator state={responseState} />
      </div>
    </div>
  );
}
