"use client";
import { Fragment } from "react";
import { MessagePart } from "@/app/types";
import { File as FileIcon } from "lucide-react";
import { EmptyMessages } from "./empty-messags";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

const MESSAGE_TYPES = [
  "user",
  "user.with_attachments",
  "app.image.delta",
  "response.content_part.done",
  "response.output_text.delta",
] as const;

type MessageTypes = (typeof MESSAGE_TYPES)[number];

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
            console.log(match);
            return match ? (
              <SyntaxHighlighter
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

export function Messages({ messages }: { messages: MessagePart[] }) {
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
              src={message.content.image_url}
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

            {annotationsWithOutDuplicates.map((annotation, index) => (
              <div key={annotation.url}>
                <span className="text-xs bg-stone-100 text-stone-600 font-mono px-2 py-1 rounded w-fit">
                  {"message.part?.annotations[" + index + "].type:"}
                  {annotation.type}

                  <br />
                  {"message.part?.annotations[" + index + "].title:"}
                </span>
                <a
                  href={annotation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {annotation.title}
                </a>
              </div>
            ))}
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
        return null;
    }
  };

  return (
    <div className="w-full space-y-4 mb-4">
      {messages.length === 0 ? (
        <EmptyMessages />
      ) : (
        messages.map((message, index) => {
          if (MESSAGE_TYPES.includes(message.type as MessageTypes)) {
            return (
              <Fragment key={index}>{determineMessageType(message)}</Fragment>
            );
          }
          return null;
        })
      )}
    </div>
  );
}
