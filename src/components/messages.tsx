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
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
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
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Custom styling for different markdown elements
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 text-gray-100">{children}</p>
        ),
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mb-2 text-gray-100">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mb-2 text-gray-100">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mb-1 text-gray-100">{children}</h3>
        ),
        code: ({
          children,
          className,
          ...props
        }: React.HTMLProps<HTMLElement>) => {
          const match = /language-(\w+)/.exec(className || "");
          const inline = !match;
          return !inline ? (
            <pre className="bg-gray-900 border border-gray-600 rounded p-3 my-2 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code
              className="bg-gray-700 px-1.5 py-0.5 rounded text-gray-200 font-mono text-xs"
              {...props}
            >
              {children}
            </code>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-2 text-gray-100 space-y-1">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-2 text-gray-100 space-y-1">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="text-gray-100">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-600 pl-4 my-2 text-gray-300 italic">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-gray-100">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-100">{children}</em>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full border border-gray-600">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-gray-700">{children}</thead>
        ),
        tbody: ({ children }) => (
          <tbody className="bg-gray-800">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-gray-600">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left text-gray-200 font-medium">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 text-gray-100">{children}</td>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}

// Status Indicator Component
function StatusIndicator({ state }: { state: ResponseState }) {
  if (state === "Idle") return null;

  return (
    <div className="flex items-center gap-2 transition-opacity duration-300 opacity-80 hover:opacity-100">
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
            <div className="absolute h-full w-full rounded-full bg-green-500 animate-ping opacity-40"></div>
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
            <div className="max-w-[75%] py-3 px-4 bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm">
              <MarkdownContent content={message.content as string} />
            </div>
          </div>
        );
      case "user.with_attachments":
        return (
          <div className="w-full flex items-end justify-end relative">
            <div className="max-w-[75%] py-3 px-4 bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm">
              <MarkdownContent content={message.content as string} />
            </div>
            <FileIcon className="h-4 w-4 absolute -bottom-2 -right-2 stroke-background bg-primary rounded-full p-0.5" />
          </div>
        );
      case "app.image.delta":
        return (
          <div className="w-full relative mb-4">
            <img
              // @ts-expect-error - this is a valid type
              src={message?.content?.image_url}
              alt="Generated Image"
              className="w-[300px] rounded-lg border border-border shadow-sm"
            />
          </div>
        );
      case "response.content_part.done":
        const annotations = message.part?.annotations || [];

        const annotationsWithOutDuplicates = annotations.filter(
          (annotation, index, self) =>
            index === self.findIndex((t) => t.url === annotation.url),
        );

        if (!annotationsWithOutDuplicates.length) {
          return null;
        }

        return (
          <div className="text-foreground whitespace-pre-wrap mb-4">
            <MarkdownContent content={message.content as string} />

            <div className="mt-4 flex flex-wrap gap-2">
              {annotationsWithOutDuplicates.map((annotation, index) => (
                <a
                  key={annotation.url}
                  href={annotation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors border border-border text-muted-foreground group"
                >
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="truncate max-w-[200px]">
                    {annotation.title}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors" />
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
      <div className="w-full space-y-6 mb-4 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 pl-2">
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
          "transition-all duration-300 mb-2 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border/50 pt-2",
          indicatorVisible
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform -translate-y-2",
          responseState !== "Idle" ? "h-8" : "h-0",
        )}
      >
        <StatusIndicator state={responseState} />
      </div>
    </div>
  );
}
