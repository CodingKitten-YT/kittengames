"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface Game {
  name: string
  url: string
}

export default function GameFrame({ slug }: { slug: string }) {
  const [game, setGame] = useState<Game | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGame() {
      setIsLoading(true)
      const res = await fetch("https://cdn.statically.io/gh/CodingKitten-YT/KittenGames-gamelibrary/main/games.json")
      const games = await res.json()
      const foundGame = games.find((g: Game) => g.name.toLowerCase().replace(/\s+/g, "-") === slug)
      setGame(foundGame)
      setIsLoading(false)
    }
    fetchGame()
  }, [slug])

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!game) return <div className="flex justify-center items-center h-screen w-screen">Game not found</div>

  return (
    <div className="fixed inset-0 w-full h-full">
      <iframe
        id="game-iframe"
        src={game.url}
        title={game.name}
        className="w-full h-full border-0 pointer-events-auto"
        allowFullScreen
      />
    </div>
  )
}
