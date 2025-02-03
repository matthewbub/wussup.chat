import { useState } from "react"
import Card from "./Card"
import AddCard from "./AddCard"
import { useBoardStore } from "../store/boardStore"
import { IS_ADMIN_VIEW } from "../utils/constants"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ListProps {
  list: {
    id: string
    title: string
  }
}

export default function List({ list }: ListProps) {
  const {
    cards,
    updateListTitle,
    addCard,
    deleteConfirmation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    confirmDeleteList,
  } = useBoardStore()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(list.title)

  const listCards = cards.filter((card) => card.list_id === list.id)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    updateListTitle(list.id, title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateListTitle(list.id, title)
      setIsEditing(false)
    }
  }

  const handleAddCard = (content: string) => {
    addCard(content, list.id)
  }

  const handleDeleteList = () => {
    openDeleteConfirmation(list.id, listCards.length)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md w-80 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          {IS_ADMIN_VIEW && isEditing ? (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className="font-bold w-full bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          ) : (
            <h2
              className={`font-bold ${IS_ADMIN_VIEW ? "cursor-pointer" : ""}`}
              onClick={() => IS_ADMIN_VIEW && setIsEditing(true)}
            >
              {title}
            </h2>
          )}
          {IS_ADMIN_VIEW && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteList}
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete list</span>
            </Button>
          )}
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {listCards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
        {IS_ADMIN_VIEW && (
          <div className="p-4 border-t">
            <AddCard onAdd={handleAddCard} />
          </div>
        )}
      </div>

      <Dialog open={deleteConfirmation.isOpen} onOpenChange={closeDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this list? It contains {deleteConfirmation.cardCount} card(s). This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteConfirmation}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteList}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

