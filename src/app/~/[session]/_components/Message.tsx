import MarkdownComponent from "@/components/ui/Markdown";
import MessageDropdown from "./MessageDropdown";
import { Message as MessageType } from "@/types/chat";

interface MessageProps {
  message: MessageType;
  createdAt: string | undefined;
  fullMessage: MessageType;
}

export function Message({ message, createdAt, fullMessage }: MessageProps) {
  const messageData = {
    fullMessage: fullMessage,
    ...message,
  };

  console.log("messageData", messageData);
  return (
    <div
      className={`flex ${message?.is_user ? "justify-end" : "justify-start"}`}
    >
      <div className="flex flex-col relative group">
        <div className="absolute top-2 right-2">
          <MessageDropdown
            message={{
              content: message.content,
              id: message.id,
            }}
          />
        </div>

        <pre className="p-4 rounded-lg max-w-md overflow-x-auto text-xs border border-gray-200 dark:border-gray-800">
          <code>{JSON.stringify(fullMessage, null, 2)}</code>
        </pre>
        {message.content.length > 0 && (
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-2 pr-10 ${
              message.is_user
                ? "bg-blue-500 dark:bg-blue-800 text-white dark:text-white"
                : "bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-200"
            }`}
          >
            <MarkdownComponent>{message?.content}</MarkdownComponent>
          </div>
        )}
        {/* 
        {message.content.length === 0 && !fullMessage?.metadata ? (
          message.parts.map((ti) =>
            ti.type === "tool-invocation" ? (
              ti.toolInvocation.state === "result" ? (
                <div key={ti.toolInvocation.toolCallId}>
                  <img
                    src={ti.toolInvocation.result.image}
                    alt={ti.toolInvocation.result.prompt}
                    height={400}
                    width={400}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {ti.toolInvocation.result.prompt}
                  </p>
                </div>
              ) : (
                <div
                  key={ti.toolInvocation.toolCallId}
                  className="animate-pulse"
                >
                  Generating image...
                </div>
              )
            ) : null
          )
        ) : !fullMessage?.metadata ? (
          <div>
            <img
              src={fullMessage?.metadata?.imageUrl}
              alt={fullMessage?.metadata?.prompt}
              height={400}
              width={400}
            />
            <p className="text-sm text-gray-500 mt-2">
              {fullMessage?.metadata?.prompt}
            </p>
          </div>
        ) : (
          <div
            className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-2 pr-10 ${
              message.role === "user"
                ? "bg-blue-500 dark:bg-blue-800 text-white dark:text-white"
                : "bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-200"
            }`}
          >
            <MarkdownComponent>{message?.content}</MarkdownComponent>
          </div>
        )}
          */}
        {createdAt && (
          <div
            className={
              "text-xs text-gray-600 dark:text-gray-400 " +
              (message.is_user ? "text-right" : "text-left")
            }
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 pl-1">
              {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
