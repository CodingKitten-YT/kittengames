"use client"

import { useState, useCallback } from "react"
import GameGrid from "../components/GameGrid"
import Header from "../components/Header"
import GameFrame from "../components/GameFrame"
import BackToTop from "../components/BackToTop"
import OneTimePopup from '../components/OneTimePopup';

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
    if (url) {
      window.open(url, "_blank")
    } else {
      setSelectedGame({ slug, url: null })
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