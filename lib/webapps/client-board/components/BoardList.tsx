"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBoardStore } from "../store/boardStore";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { IS_ADMIN_VIEW } from "../utils/constants";

export default function BoardList() {
  const router = useRouter();
  const { boards, fetchBoards, createBoard } = useBoardStore();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleBoardClick = (boardId: string) => {
    router.push(`/board/${boardId}`);
  };

  const handleCreateBoard = async () => {
    const title = prompt("Enter board title:");
    if (title) {
      const boardId = await createBoard(title);
      if (boardId) {
        router.push(`/board/${boardId}`);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Boards</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleBoardClick(board.id)}
          >
            <h2 className="text-xl font-semibold">{board.title}</h2>
          </div>
        ))}
        {IS_ADMIN_VIEW && (
          <Button
            onClick={handleCreateBoard}
            className="h-full flex items-center justify-center"
            variant="outline"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Board
          </Button>
        )}
      </div>
    </div>
  );
}
