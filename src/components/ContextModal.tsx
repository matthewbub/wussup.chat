import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chatStore";

interface ContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContextDialog({ open, onOpenChange }: ContextDialogProps) {
  const { user, updateUserChatContext } = useChatStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const context = formData.get("context");
    e.preventDefault();
    await fetch("/api/v1/context", {
      method: "POST",
      body: JSON.stringify({ context: context }),
      headers: { "Content-Type": "application/json" },
    });
    onOpenChange(false);
    updateUserChatContext(context as string);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Chat Context</DialogTitle>
          <DialogDescription>
            This context will be used to guide the AI's responses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                name="context"
                placeholder="Enter context for the AI..."
                className="min-h-[100px]"
                defaultValue={user?.chat_context}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Context</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
