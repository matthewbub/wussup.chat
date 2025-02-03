import { useState } from "react"
import { Button } from "@/components/ui/button"
import type React from "react"

interface EditableFieldProps {
  initialValue: string
  onSave: (value: string) => void
  isEditable: boolean
  inputComponent: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>>
  className?: string
}

export function EditableField({
  initialValue,
  onSave,
  isEditable,
  inputComponent: InputComponent,
  className,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }

  const handleSave = () => {
    onSave(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  if (isEditable && isEditing) {
    return (
      <div className="flex flex-col space-y-2">
        <InputComponent
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={className}
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${className} ${isEditable ? "cursor-pointer hover:bg-gray-100" : ""}`}
      onClick={() => isEditable && setIsEditing(true)}
    >
      {value || (isEditable ? "Click to add..." : "No content")}
    </div>
  )
}

