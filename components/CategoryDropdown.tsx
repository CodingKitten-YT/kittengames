"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Hexagon, Swords, Footprints, Crosshair, PuzzleIcon as PuzzlePiece, Gamepad, Clock, Car } from "lucide-react"

const categories = [
  { name: "All", icon: <Hexagon className="w-4 h-4" /> },
  { name: "Battle", icon: <Swords className="w-4 h-4" /> },
  { name: "Platformer", icon: <Footprints className="w-4 h-4" /> },
  { name: "Shooter", icon: <Crosshair className="w-4 h-4" /> },
  { name: "Puzzle", icon: <PuzzlePiece className="w-4 h-4" /> },
  { name: "Skill", icon: <Gamepad className="w-4 h-4" /> },
  { name: "Idle", icon: <Clock className="w-4 h-4" /> },
  { name: "Racing", icon: <Car className="w-4 h-4" /> },
]

interface CategoryDropdownProps {
  isOpen: boolean
  onClose: () => void
  onCategoryChange: (category: string) => void
  anchorRect: DOMRect | null
  selectedCategory: string
}

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

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen || !anchorRect) return null

  const dropdownStyle = {
    position: "fixed",
    top: `${anchorRect.bottom + 8}px`,
    left: `${anchorRect.left - 100}px`, // Changed to align better with the anchor
    width: "12rem",
    maxHeight: "calc(100vh - 96px)",
    zIndex: 9999,
    transition: "opacity 0.3s ease-out", // Improved animation for smoother visibility transition
    opacity: isOpen ? 1 : 0, // Added opacity control for better visibility handling
  } as const

  return createPortal(
    <div
      ref={dropdownRef}
      className="glassmorphism-dark rounded-global-lg shadow-lg overflow-hidden"
      style={dropdownStyle}
    >
      <div className="py-2">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              onCategoryChange(category.name)
              onClose()
            }}
            className={`flex items-center w-full px-3 py-1.5 text-xs ${
              selectedCategory === category.name
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            } transition-colors`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>,
    document.body
  )
}
