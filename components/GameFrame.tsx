"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { getCurrentSettings, launchGame } from "./GameLaunchSettingsPanel"

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
      const res = await fetch("https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/games.json")
      const games = await res.json()
      const foundGame = games.find((g: Game) => g.name.toLowerCase().replace(/\s+/g, "-") === slug)
      setGame(foundGame)
      setIsLoading(false)
    }
    fetchGame()
  }, [slug])

  // Launch logic: if settings dictate about:blank or new tab, launch and return null
  useEffect(() => {
    if (game) {
      const settings = getCurrentSettings()
      if (settings.openMode === "about-blank" || settings.openMode === "new-tab") {
        launchGame(game.url, settings)
        setGame(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game])

  useEffect(() => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement | null
    if (iframe) {
      const settings = getCurrentSettings()
      iframe.setAttribute('tabindex', '0')
      if (settings.confirmClose) {
        window.onbeforeunload = () => "Are you sure you want to close the game?"
      } else {
        window.onbeforeunload = null
      }
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-gray-900">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (!game) return <div className="flex justify-center items-center h-screen w-screen">Game not found</div>

  // Only render iframe if not about:blank or new-tab
  return (
    <div className="fixed inset-0 w-full h-full bg-gray-900">
      <iframe
        id="game-iframe"
        src={game.url}
        title={game.name}
        className="w-full h-full border-0"
        allowFullScreen={true}
        tabIndex={0}
        allow="keyboard; fullscreen"
      />
    </div>
  )
}
