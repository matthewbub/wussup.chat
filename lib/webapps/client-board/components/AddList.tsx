import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon } from "lucide-react"

interface AddListProps {
  onAdd: (title: string) => void
}

export default function AddList({ onAdd }: AddListProps) {
  const [title, setTitle] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim()) {
      onAdd(title.trim())
      setTitle("")
      setIsAdding(false)
    }
  }

  if (!isAdding) {
    return (
      <Button variant="outline" className="h-12 w-80 justify-start text-gray-500" onClick={() => setIsAdding(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add new list
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md w-80 flex-shrink-0">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter list title"
        className="mb-2"
        autoFocus
      />
      <div className="flex justify-between">
        <Button type="submit" disabled={!title.trim()}>
          Add List
        </Button>
        <Button variant="ghost" onClick={() => setIsAdding(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

