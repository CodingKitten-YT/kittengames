"use client"

import { useState, useCallback } from "react"
import GameGrid from "../components/GameGrid"
import Header from "../components/Header"
import GameFrame from "../components/GameFrame"
import BackToTop from "../components/BackToTop"

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
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

  return (
    <div className="min-h-screen">
      <Header
        isCompact={!!selectedGame}
        onBackClick={handleBackClick}
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onFullscreen={handleFullscreen}
      />
      {!selectedGame ? (
        <main className="container mx-auto px-4 py-8 pt-28">
          <GameGrid onGameSelect={setSelectedGame} selectedCategory={selectedCategory} searchQuery={searchQuery} />
        </main>
      ) : (
        <GameFrame slug={selectedGame} />
      )}
      <BackToTop />
    </div>
  )
}

