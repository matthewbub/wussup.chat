"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function MessageDropdown({
  message,
}: {
  message: {
    content: string;
    id: string;
  };
}) {
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to copy message:", error);
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyMessage}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Message</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
