"use client";
import { Fragment } from "react";
import { MessagePart } from "@/app/types";
import { File as FileIcon } from "lucide-react";
import { EmptyMessages } from "./empty-messags";

const MESSAGE_TYPES = [
  "user",
  "user.with_attachments",
  "app.image.delta",
  "response.content_part.done",
  "response.output_text.delta",
] as const;

type MessageTypes = (typeof MESSAGE_TYPES)[number];

export function Messages({ messages }: { messages: MessagePart[] }) {
  const determineMessageType = (message: MessagePart) => {
    switch (message.type as MessageTypes) {
      case "user":
        return (
          <div className="w-full flex items-end justify-end">
            {/* 75% is roughly the input (textarae) size we provide to the user in the interface */}
            <div className="max-w-[75%] py-2 px-4 bg-accent/70 rounded-md">
              {message.content as string}
            </div>
          </div>
        );
      case "user.with_attachments":
        return (
          <div className="w-full flex items-end justify-end relative">
            {/* 75% is roughly the input (textarae) size we provide to the user in the interface */}
            <div className="max-w-[75%] py-2 px-4 bg-accent/70 rounded-md">
              {message.content as string}
            </div>
            <FileIcon className="h-4 w-4 absolute -bottom-2 -right-2 stroke-teal-600" />
          </div>
        );
      case "app.image.delta":
        return (
          <div className="w-full h-64 relative">
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
          <div className="text-foreground whitespace-pre-wrap">
            {message.content as string}

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
              {JSON.stringify(message.content) as string}
            </div>
          );
        }
        return (
          <div className="text-foreground whitespace-pre-wrap">
            {message.content as string}
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
