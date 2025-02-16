import MarkdownComponent from "@/components/ui/Markdown";
import MessageDropdown from "./MessageDropdown";
import { Message as MessageType } from "ai";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
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
        {/* <div className="text-sm text-gray-400 mb-1">
          {message.role === "user" ? "You" : "Assistant"}
        </div> */}
        <div
          className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-2 pr-10 ${
            message.role === "user"
              ? "bg-blue-500 dark:bg-blue-800 text-white dark:text-white"
              : "bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-200"
          }`}
        >
          <MarkdownComponent>{message?.content}</MarkdownComponent>
        </div>
        <div
          className={
            "text-xs text-gray-600 dark:text-gray-400 " +
            (message.role === "user" ? "text-right" : "text-left")
          }
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 pl-1">
            {/* {new Date(message.created_at).toLocaleString()} */}
          </p>
        </div>
      </div>
    </div>
  );
}
