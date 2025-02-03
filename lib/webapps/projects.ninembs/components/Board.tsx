"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import List from "./List"
import AddList from "./AddList"
import { useBoardStore } from "../store/boardStore"
import { Skeleton } from "@/components/ui/skeleton"
import { IS_ADMIN_VIEW } from "../utils/constants"

export default function Board() {
  const {
    lists,
    currentBoard,
    isEditingBoardTitle,
    setCurrentBoard,
    updateBoardTitle,
    addList,
    setIsEditingBoardTitle,
  } = useBoardStore()
  const [isLoading, setIsLoading] = useState(true)

  const params = useParams()
  const boardId = params.boardId as string

  useEffect(() => {
    const loadBoard = async () => {
      setIsLoading(true)
      await setCurrentBoard(boardId)
      setIsLoading(false)
    }
    loadBoard()
  }, [boardId, setCurrentBoard])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentBoard) {
      updateBoardTitle(currentBoard.id, e.target.value)
    }
  }

  const handleTitleBlur = () => {
    setIsEditingBoardTitle(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingBoardTitle(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-6">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-80 h-96" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentBoard) {
    return <div>Board not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        {IS_ADMIN_VIEW && isEditingBoardTitle ? (
          <input
            type="text"
            value={currentBoard.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="text-3xl font-bold mb-6 w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
            autoFocus
          />
        ) : (
          <h1
            className={`text-3xl font-bold mb-6 ${IS_ADMIN_VIEW ? "cursor-pointer" : ""}`}
            onClick={() => IS_ADMIN_VIEW && setIsEditingBoardTitle(true)}
          >
            {currentBoard.title}
          </h1>
        )}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {lists.map((list) => (
            <List key={list.id} list={list} />
          ))}
          {IS_ADMIN_VIEW && <AddList onAdd={(title) => addList(title, boardId)} />}
        </div>
      </div>
    </div>
  )
}

