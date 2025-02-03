import { useState } from "react"
import CardModal from "./CardModal"
import { CalendarIcon, FlagIcon } from "lucide-react"

interface CardProps {
  card: {
    id: string
    content: string
    description: string
    list_id: string
    date_due: string | null
    priority: string | undefined
  }
}

export default function Card({ card }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority) return "text-gray-500" // Default color for undefined priority
    switch (priority.toLowerCase()) {
      case "urgent":
      case "fix that shit rn":
      case "critical":
        return "text-red-500"
      case "high":
        return "text-orange-500"
      case "medium":
        return "text-yellow-500"
      case "bug":
        return "text-purple-500"
      default:
        return "text-green-500"
    }
  }

  return (
    <>
      <div
        className="bg-white p-3 rounded shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <p className="text-sm font-medium mb-2">{card.content}</p>
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          {card.date_due && (
            <div className="flex items-center">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {new Date(card.date_due).toLocaleDateString()}
            </div>
          )}
          <div className={`flex items-center ${getPriorityColor(card.priority)}`}>
            <FlagIcon className="w-3 h-3 mr-1" />
            {card.priority || "No priority"}
          </div>
        </div>
      </div>
      <CardModal card={card} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  )
}

