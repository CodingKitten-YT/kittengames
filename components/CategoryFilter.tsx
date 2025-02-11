"use client"
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

export default function CategoryFilter({ onCategoryChange }: { onCategoryChange: (category: string) => void }) {
  return (
    <div className="py-2">
      {categories.map((category) => (
        <button
          key={category.name}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={() => onCategoryChange(category.name)}
        >
          <span className="mr-2">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  )
}

