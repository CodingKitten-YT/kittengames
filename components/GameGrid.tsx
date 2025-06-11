"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Loader2,
  Gamepad,
  LayoutGrid,
  Search,
  Zap,
} from "lucide-react"
import GameCard, { type Game } from "./GameGrid/GameCard"
import SectionHeader from "./GameGrid/SectionHeader"
import { categoryIcons } from "../utils/categoryIcons"
import { shuffleArray } from "../utils/gameUtils"

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
        const res = await fetch("https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/games.json")
        if (!res.ok) {
          throw new Error("Failed to fetch games")
        }
        const data = await res.json()
        
        // Simply store the games as they are in the JSON file
        setGames(data)
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

  // Get the first 10 games from the JSON file as recent games
  const recentGames = useMemo(() => {
    if (searchQuery || selectedCategory !== "All") {
      return []; // Don't show recent games when filtering
    }
    return games.slice(0, 10);
  }, [games, searchQuery, selectedCategory]);

  // Get remaining games, shuffled
  const remainingGames = useMemo(() => {
    if (searchQuery || selectedCategory !== "All") {
      return filteredGames; // When filtering, show all filtered games
    }
    // Exclude the first 10 games and shuffle the rest
    return shuffleArray(games.slice(10));
  }, [games, filteredGames, searchQuery, selectedCategory]);

  // Determine which icon to use for the filtered games section
  const getFilterIcon = () => {
    if (searchQuery && selectedCategory === "All") {
      return <Search className="w-6 h-6" />;
    }
    
    if (selectedCategory !== "All") {
      const categoryKey = selectedCategory.toLowerCase();
      return categoryIcons[categoryKey] || categoryIcons["other"];
    }
    
    return <LayoutGrid className="w-6 h-6" />;
  };

  // Determine the title for the filtered section
  const getFilterTitle = () => {
    if (searchQuery && selectedCategory === "All") {
      return "Search Results";
    }
    
    if (selectedCategory !== "All") {
      return `${selectedCategory} Games`;
    }
    
    return "All Games";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-purple-500/20 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-purple-300 mb-2">Loading Games</p>
            <p className="text-sm text-gray-400">Preparing your gaming experience...</p>
          </div>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md max-w-md border border-gray-700/40">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-2xl w-fit mx-auto mb-6">
            <Gamepad className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Games Found</h3>
          <p className="text-gray-300 leading-relaxed">We couldn't find any games in our library. Please check back later for awesome new games!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Recent Games Section */}
      {recentGames.length > 0 && (
        <div>
          <SectionHeader 
            icon={<Zap className="w-6 h-6" />} 
            title="Recently Added Games" 
            gradient={true}
          />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {recentGames.map((game: Game) => (
              <GameCard 
                key={game.name} 
                game={game}
                isRecent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Games Section */}
      <div>
        <SectionHeader 
          icon={getFilterIcon()}
          title={getFilterTitle()}
          count={searchQuery || selectedCategory !== "All" ? filteredGames.length : games.length}
        />
        {remainingGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {remainingGames.map((game: Game) => (
              <GameCard 
                key={game.name} 
                game={game}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-96 text-center">
            <div className="p-12 rounded-3xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-md max-w-md border border-gray-700/30">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 rounded-2xl w-fit mx-auto mb-6">
                <Search className="w-12 h-12 text-white opacity-60" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Games Found</h3>
              <p className="text-gray-300 leading-relaxed">Try adjusting your filters or search terms to discover more games.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}