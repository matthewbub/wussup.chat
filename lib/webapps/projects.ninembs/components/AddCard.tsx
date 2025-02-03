import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon } from "lucide-react"

interface AddCardProps {
  onAdd: (content: string) => void
}

export default function AddCard({ onAdd }: AddCardProps) {
  const [content, setContent] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onAdd(content.trim())
      setContent("")
      setIsAdding(false)
    }
  }

  if (!isAdding) {
    return (
      <Button variant="ghost" className="w-full justify-start text-gray-500" onClick={() => setIsAdding(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add a card
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter card content"
        className="mb-2"
        autoFocus
      />
      <div className="flex justify-between">
        <Button type="submit" disabled={!content.trim()}>
          Add Card
        </Button>
        <Button variant="ghost" onClick={() => setIsAdding(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

