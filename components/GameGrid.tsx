"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import {
  Hexagon,
  Swords,
  Footprints,
  Crosshair,
  PuzzleIcon as PuzzlePiece,
  Gamepad,
  Clock,
  Car,
  Loader2,
} from "lucide-react"
import type React from "react"

interface Game {
  name: string
  type: string
  image: string
  url: string
  newtab?: boolean
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  other: <Hexagon className="w-6 h-6" />,
  battle: <Swords className="w-6 h-6" />,
  platformer: <Footprints className="w-6 h-6" />,
  shooter: <Crosshair className="w-6 h-6" />,
  puzzle: <PuzzlePiece className="w-6 h-6" />,
  skill: <Gamepad className="w-6 h-6" />,
  idle: <Clock className="w-6 h-6" />,
  racing: <Car className="w-6 h-6" />,
}

function GameCard({ game, onSelect }: { game: Game; onSelect: (slug: string, url: string | null) => void }) {
  const [tiltStyle, setTiltStyle] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = (centerY - y) / 10
    const tiltY = (x - centerX) / 10

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "all 0.1s ease",
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "all 0.5s ease",
    })
  }

  return (
    <div
      className="game-card glassmorphism-dark overflow-hidden aspect-square relative cursor-pointer group"
      onClick={() => onSelect(game.name.toLowerCase().replace(/\s+/g, "-"), game.newtab ? game.url : null)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
        <Image
          src={game.image || "/placeholder.svg"}
          alt={game.name}
          layout="fill"
          objectFit="cover"
          className={`transition-all duration-300 ${isLoading ? "opacity-0" : "group-hover:opacity-50"}`}
          onLoad={() => setIsLoading(false)}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <h3 className="text-lg font-semibold text-white text-center mb-2 drop-shadow-md">{game.name}</h3>
          <div className="text-white">{categoryIcons[game.type.toLowerCase()] || categoryIcons["other"]}</div>
        </div>
      </div>
    </div>
  )
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function GameGrid({
  onGameSelect,
  selectedCategory,
  searchQuery,
}: {
  onGameSelect: (slug: string, url: string | null) => void
  selectedCategory: string
  searchQuery: string
}) {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGames() {
      setIsLoading(true)
      try {
        const res = await fetch("https://cdn.statically.io/gh/CodingKitten-YT/KittenGames-gamelibrary/main/games.json")
        if (!res.ok) {
          throw new Error("Failed to fetch games")
        }
        const data = await res.json()
        setGames(shuffleArray(data)) // Shuffle the games array
      } catch (error) {
        console.error("Error fetching games:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGames()
  }, [])

  const filteredGames = useMemo(() => {
    return games.filter((game: Game) => {
      const matchesCategory = selectedCategory === "All" || game.type.toLowerCase() === selectedCategory.toLowerCase()
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [games, selectedCategory, searchQuery])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {filteredGames.map((game: Game) => (
        <GameCard key={game.name} game={game} onSelect={onGameSelect} />
      ))}
    </div>
  )
}

