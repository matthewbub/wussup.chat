"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const fetchAudio = async (text: string) => {
  const response = await fetch("/api/audio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate speech");
  }

  const data = await response.json();
  return data.audio;
};

export default function MessageDropdown({
  message,
}: {
  message: {
    content: string;
    id: string;
  };
}) {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const handleReadAloud = async () => {
    try {
      setIsPlaying(message.id);
      const base64Audio = await fetchAudio(message.content);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);

      audio.onended = () => {
        setIsPlaying(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(null);
    }
  };

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
      <DropdownMenuTrigger className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* <DropdownMenuItem
          onClick={() => handleForkChat(message.id)}
        >
          <GitFork className="mr-2 h-4 w-4" />
          <span>Fork Chat from Here</span>
        </DropdownMenuItem> */}
        <DropdownMenuItem onClick={handleCopyMessage}>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Message</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleReadAloud}
          disabled={isPlaying === message.id}
        >
          {isPlaying === message.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="mr-2 h-4 w-4" />
          )}
          <span>{isPlaying === message.id ? "Playing..." : "Read Aloud"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
