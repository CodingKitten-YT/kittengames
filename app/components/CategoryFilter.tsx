"use client"

import React, { useState } from "react"
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

export default function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="flex space-x-1">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => setSelectedCategory(category.name)}
          className={`p-1 rounded-full transition-colors ${
            selectedCategory === category.name ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white"
          }`}
          title={category.name}
        >
          {category.icon}
        </button>
      ))}
    </div>
  )
}

