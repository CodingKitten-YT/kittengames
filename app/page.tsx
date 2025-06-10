"use client"

import { useState, useCallback } from "react"
import GameGrid from "../components/GameGrid"
import Header from "../components/Header"
import BackToTop from "../components/BackToTop"
import OneTimePopup from '../components/OneTimePopup';
import { launchGame } from "../components/GameLaunchSettingsPanel"

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleGameSelect = useCallback((slug: string, url: string | null) => {
    // This handler is now only used for games with newtab: true
    if (url) {
      launchGame(url)
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Header
        currentPage="games"
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
      />
      <main className="container mx-auto px-4 py-8 pt-28">
        <GameGrid onGameSelect={handleGameSelect} selectedCategory={selectedCategory} searchQuery={searchQuery} />
      </main>
      <BackToTop />
      <OneTimePopup />
    </div>
  )
}