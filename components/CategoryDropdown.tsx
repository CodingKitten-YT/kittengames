import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Hexagon, Joystick, Swords, Footprints, Crosshair, PuzzleIcon, UsersRound as PuzzlePiece, Gamepad, Clock, Car, UsersRound } from "lucide-react"

const categories = [
  { name: "All", icon: <Hexagon className="w-5 h-5" /> },
  { name: "Battle", icon: <Swords className="w-5 h-5" /> },
  { name: "Platformer", icon: <Footprints className="w-5 h-5" /> },
  { name: "Shooter", icon: <Crosshair className="w-5 h-5" /> },
  { name: "Puzzle", icon: <PuzzlePiece className="w-5 h-5" /> },
  { name: "Skill", icon: <Gamepad className="w-5 h-5" /> },
  { name: "Idle", icon: <Clock className="w-5 h-5" /> },
  { name: "Racing", icon: <Car className="w-5 h-5" /> },
  { name: "Retro", icon: <Joystick className="w-5 h-5" /> },
  { name: "Multiplayer", icon: <UsersRound className="w-5 h-5" /> },
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
    top: `${anchorRect.bottom + 12}px`,
    left: `${anchorRect.right - 220}px`,
    width: "14rem",
    maxHeight: "calc(100vh - 140px)",
    zIndex: 9999,
  } as const

  return createPortal(
    <div
      ref={dropdownRef}
      className="bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/60 overflow-hidden animate-dropdown-fade"
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
            className={`
              flex items-center w-full px-4 py-3 text-base font-medium group 
              transition-all duration-200 ease-in-out 
              ${selectedCategory === category.name 
                ? "bg-purple-600/90 text-white" 
                : "text-gray-300 hover:bg-gray-700/80 hover:text-white"}
              focus:outline-none focus:ring-2 focus:ring-purple-500/60
            `}
          >
            <span className={`mr-4 opacity-80 group-hover:opacity-100 transition-opacity 
              ${selectedCategory === category.name ? 'text-white' : 'text-gray-400'}`}>
              {category.icon}
            </span>
            {category.name}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}