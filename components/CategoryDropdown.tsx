"use client"

import { useEffect, useRef } from "react"
import { Check, Hexagon, Swords, Footprints, Crosshair, Puzzle, Gamepad2, Clock, Car, Gamepad, Users } from "lucide-react"

interface CategoryDropdownProps {
  isOpen: boolean
  onClose: () => void
  onCategoryChange: (category: string) => void
  anchorRect: DOMRect | null
  selectedCategory: string
}

const categories = [
  { name: "All", icon: Hexagon },
  { name: "Battle", icon: Swords },
  { name: "Platformer", icon: Footprints },
  { name: "Shooter", icon: Crosshair },
  { name: "Puzzle", icon: Puzzle },
  { name: "Skill", icon: Gamepad2 },
  { name: "Idle", icon: Clock },
  { name: "Racing", icon: Car },
  { name: "Retro", icon: Gamepad },
  { name: "Multiplayer", icon: Users },
]

export default function CategoryDropdown({
  isOpen,
  onClose,
  onCategoryChange,
  anchorRect,
  selectedCategory,
}: CategoryDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !anchorRect) return null

  const dropdownStyle = {
    position: "fixed" as const,
    top: anchorRect.bottom + 8,
    left: anchorRect.left,
    minWidth: anchorRect.width,
  }

  const handleCategorySelect = (category: string) => {
    onCategoryChange(category)
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="z-50 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl overflow-hidden min-w-48"
    >
      <div className="max-h-64 overflow-y-auto">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.name}
              onClick={() => handleCategorySelect(category.name)}
              className="w-full px-4 py-3 text-left text-white hover:bg-gray-800 transition-colors duration-200 flex items-center justify-between border-b border-gray-800/50 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="font-medium">{category.name}</span>
              </div>
              {selectedCategory === category.name && (
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}