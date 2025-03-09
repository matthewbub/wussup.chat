import MarkdownComponent from "@/components/ui/Markdown";
import MessageDropdown from "./MessageDropdown";
import { cn } from "@/lib/utils";
import { Message as MessageType } from "@/types/chat";
import { Clock, Award, Bot } from "lucide-react";

export type MessageProps = Omit<MessageType, "chat_session_id" | "user_id" | "metadata"> & {
  isLoading?: boolean;
  isPreferred?: boolean;
  onSelect?: () => void;
  isSelectable?: boolean;
  responseType?: string;
};

export function Message({
  created_at,
  content,
  id,
  is_user,
  model,
  isLoading,
  isPreferred,
  onSelect,
  isSelectable,
  responseType,
}: MessageProps) {
  // Only show selection UI for A/B messages
  const isABMessage = responseType === "A" || responseType === "B";
  const showSelectionUI = isABMessage && !is_user;

  return (
    <div className={cn("flex", is_user ? "justify-end" : "justify-start")}>
      <div className="flex flex-col">
        <div
          className={cn(
            "flex flex-col relative group",
            showSelectionUI && isSelectable && "cursor-pointer hover:opacity-90",
            showSelectionUI &&
              isPreferred &&
              "scale-105 border border-purple-500/30 bg-zinc-900 p-6 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] rounded-lg"
          )}
          onClick={showSelectionUI && isSelectable ? onSelect : undefined}
        >
          <div className="absolute top-2 right-2">
            <MessageDropdown message={{ content, id }} />
          </div>

          {content.length > 0 && (
            <div
              className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-2 pr-10",
                is_user ? "bg-blue-500 dark:bg-blue-800 text-white dark:text-white" : "text-black dark:text-gray-200",
                isLoading && "animate-pulse"
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
        </div>
        {created_at && (
          <MessageFooter
            created_at={created_at}
            model={model}
            is_user={is_user}
            showSelectionUI={showSelectionUI}
            isPreferred={isPreferred}
          />
          // <div
          //   className={cn(
          //     "text-xs text-gray-600 dark:text-gray-400",
          //     is_user ? "text-right" : "text-left",
          //     showSelectionUI && isPreferred && "mt-8"
          //   )}
          // >
          //   <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 pl-1">
          //     {new Date(created_at).toLocaleString()}
          //     {model && ` - ${model}`}
          //     {showSelectionUI && isPreferred && " (Selected for future context)"}
          //   </p>
          // </div>
        )}
      </div>
    </div>
  );
}

interface MessageFooterProps {
  created_at: string;
  model?: string;
  is_user: boolean;
  showSelectionUI?: boolean;
  isPreferred?: boolean;
}

function MessageFooter({ created_at, model, is_user, showSelectionUI, isPreferred }: MessageFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 pt-1.5 pl-1 text-xs",
        is_user ? "justify-end" : "justify-start",
        "text-gray-500 dark:text-gray-400",
        showSelectionUI && isPreferred && "mt-8"
      )}
    >
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{new Date(created_at).toLocaleString()}</span>
      </div>

      {model && (
        <div className="flex items-center gap-1">
          <span>•</span>
          <Bot className="h-3 w-3" />
          <span>{model}</span>
        </div>
      )}

      {showSelectionUI && isPreferred && (
        <div className="flex items-center gap-1 text-purple-500 dark:text-purple-400 font-medium">
          <span>•</span>
          <Award className="h-3 w-3" />
          <span>Selected</span>
        </div>
      )}
    </div>
  );
}
