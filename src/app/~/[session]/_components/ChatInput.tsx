"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/hooks/useChatStore";

export default function ChatInput() {
  const { input, handleInputChange, handleSubmit, status, stop, reload } =
    useChatStore();
  const buttonOptions = {
    stop: {
      type: "button",
      variant: "destructive",
      onClick: () => stop(),
      className: "animate-pulse",
      disabled: !(status === "streaming" || status === "submitted"),
    },
    error: {
      type: "button",
      variant: "outline",
      onClick: () => reload(),
      disabled: !(status === "ready" || status === "error"),
    },
    send: {
      type: "submit",
      className: "self-end w-fit",
    },
  } as const;

  const getButtonProps = (status: string) => {
    switch (status) {
      case "submitted":
      case "streaming":
        return buttonOptions.stop;
      case "ready":
      case "error":
        return buttonOptions.error;
      default:
        return buttonOptions.send;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl bg-secondary p-4"
    >
      <Textarea
        value={input}
        onChange={(e) => handleInputChange(e)}
        placeholder="Type your message..."
      />

      <div className="flex justify-between gap-2">
        {/* <LanguageModalSelector
          // model={model}
          // onModelChange={setModel}
          // isSubscribed={user?.subscriptionStatus === "active"}
        /> */}
        <div className="flex gap-2">
          <Button {...getButtonProps(status)}>Send</Button>
        </div>
      </div>
    </form>
  );
}
