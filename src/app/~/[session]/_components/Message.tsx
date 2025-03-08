import MarkdownComponent from "@/components/ui/Markdown";
import MessageDropdown from "./MessageDropdown";
import { cn } from "@/lib/utils";
import { Message as MessageType } from "@/types/chat";

export type MessageProps = Omit<MessageType, "chat_session_id" | "user_id" | "metadata">;

export function Message({ created_at, content, id, is_user, model }: MessageProps) {
  return (
    <div className={cn("flex", is_user ? "justify-end" : "justify-start")}>
      <div className="flex flex-col relative group">
        <div className="absolute top-2 right-2">
          <MessageDropdown message={{ content, id }} />
        </div>

        {content.length > 0 && (
          <div
            className={cn(
              "max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-2 pr-10",
              is_user ? "bg-blue-500 dark:bg-blue-800 text-white dark:text-white" : "text-black dark:text-gray-200"
            )}
          >
            <MarkdownComponent>{content}</MarkdownComponent>
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
        {created_at && (
          <div className={cn("text-xs text-gray-600 dark:text-gray-400", is_user ? "text-right" : "text-left")}>
            <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 pl-1">
              {new Date(created_at).toLocaleString()}
              {model && ` - ${model}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
