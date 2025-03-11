import MarkdownComponent from "@/components/ui/Markdown";
import MessageDropdown from "./MessageDropdown";
import { cn } from "@/lib/utils";
import { Message as MessageType } from "@/types/chat";
import { Clock, Award, Bot } from "lucide-react";
import { useRef } from "react";

export type MessageProps = Omit<MessageType, "chat_session_id" | "clerk_user_id"> & {
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
  const messageRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("flex", is_user ? "justify-end" : "justify-start")}>
      <div className="flex flex-col" ref={messageRef}>
        <div
          className={cn(
            "flex flex-col relative group transition-all duration-200",
            showSelectionUI && isSelectable && "cursor-pointer hover:opacity-90",
            showSelectionUI &&
              isPreferred &&
              "border border-purple-500/30 bg-zinc-900 p-6 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] rounded-lg"
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
        </div>
        {created_at && (
          <MessageFooter
            created_at={created_at}
            model={model}
            is_user={is_user}
            showSelectionUI={showSelectionUI}
            isPreferred={isPreferred}
          />
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
        "text-gray-500 dark:text-gray-400"
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
