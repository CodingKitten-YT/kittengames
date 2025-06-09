"use client"

import { useState, useCallback } from "react"
import GameGrid from "../components/GameGrid"
import Header from "../components/Header"
import GameFrame from "../components/GameFrame"
import BackToTop from "../components/BackToTop"
import OneTimePopup from '../components/OneTimePopup';
import { getCurrentSettings, launchGame } from "../components/GameLaunchSettingsPanel"

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<{ slug: string; url: string | null } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const handleBackClick = useCallback(() => {
    setSelectedGame(null)
  }, [])

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFullscreen = useCallback(() => {
    const iframe = document.getElementById("game-iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err)
      })
    }
  }, [])

  const handleGameSelect = useCallback((slug: string, url: string | null) => {
    const settings = getCurrentSettings()
    
    if (url) {
      // Legacy direct URL opening - let settings handle this
      launchGame(url, settings)
    } else {
      // Game needs to be loaded - check settings for launch mode
      if (settings.openMode === "new-tab" || settings.openMode === "about-blank") {
        // For new-tab and about-blank, we need to get the game URL first
        fetch("https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/games.json")
          .then(res => res.json())
          .then(games => {
            const game = games.find((g: any) => g.name.toLowerCase().replace(/\s+/g, "-") === slug)
            if (game) {
              launchGame(game.url, settings)
            }
          })
          .catch(() => {
            // Fallback to same-tab mode
            setSelectedGame({ slug, url: null })
          })
      } else {
        // Same-tab mode - load in current tab
        setSelectedGame({ slug, url: null })
      }
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header
        currentPage="games"
        isCompact={!!selectedGame}
        onBackClick={handleBackClick}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onFullscreen={handleFullscreen}
      />
      {!selectedGame ? (
        <main className="container mx-auto px-4 py-8 pt-28">
          <GameGrid onGameSelect={handleGameSelect} selectedCategory={selectedCategory} searchQuery={searchQuery} />
        </main>
      ) : (
        <GameFrame slug={selectedGame.slug} />
      )}
      <BackToTop />
      <OneTimePopup />
    </div>
  )
}