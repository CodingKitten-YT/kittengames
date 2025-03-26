"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/legacy/image"
import {
  Hexagon,
  Swords,
  Footprints,
  Crosshair,
  Joystick,
  PuzzleIcon as PuzzlePiece,
  Gamepad,
  Clock,
  Car,
  UsersRound,
  Loader2,
  Sparkles,
  LayoutGrid,
  Search,
  User,
} from "lucide-react"
import type React from "react"

interface Game {
  name: string
  type: string
  image: string
  url: string
  newtab?: boolean
  added?: string
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
  retro: <Joystick className="w-6 h-6" />,
  multiplayer: <UsersRound className="w-6 h-6" />,
}

function GameCard({ game, onSelect, isNew = false }: { game: Game; onSelect: (slug: string, url: string | null) => void; isNew?: boolean }) {
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
    (<div
      className={`game-card glassmorphism-dark overflow-hidden aspect-square relative cursor-pointer group rounded-lg shadow-lg ${isNew ? 'ring-2 ring-purple-500 ring-opacity-70' : ''}`}
      onClick={() => onSelect(game.name.toLowerCase().replace(/\s+/g, "-"), game.newtab ? game.url : null)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      {isNew && (
        <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-md">
          <Sparkles className="w-3 h-3 mr-1" />
          New
        </div>
      )}
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
        <Image
          src={game.image || "https://placehold.co/512?text=No+Image"}
          alt={game.name}
          layout="fill"
          objectFit="cover"
          className={`transition-all duration-300 rounded-lg ${isLoading ? "opacity-0" : "group-hover:opacity-50"}`}
          onLoad={() => setIsLoading(false)}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-black/40 rounded-lg">
          <h3 className="text-lg font-bold text-white text-center mb-2 drop-shadow-md">{game.name}</h3>
          <div className="bg-purple-600/80 p-2 rounded-full text-white mb-2">{categoryIcons[game.type.toLowerCase()] || categoryIcons["other"]}</div>
        </div>
      </div>
    </div>)
  );
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

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center mb-4 px-1">
      <div className="mr-2 bg-purple-700 p-2 rounded-full text-white">{icon}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {count !== undefined && (
        <div className="ml-2 bg-purple-800/50 px-2 py-1 rounded-full text-sm text-purple-100">
          {count}
        </div>
      )}
    </div>
  );
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
        const res = await fetch("https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/games.json")
        if (!res.ok) {
          throw new Error("Failed to fetch games")
        }
        const data = await res.json()
        
        // Sort games by added date (if available) to get the most recent ones
        const sortedGames = [...data].sort((a, b) => {
          if (a.added && b.added) {
            return new Date(b.added).getTime() - new Date(a.added).getTime()
          }
          return a.added ? -1 : b.added ? 1 : 0;
        });
        
        // Store the sorted games
        setGames(sortedGames)
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

  // Get the most recent games (top 5 or less)
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
    // Exclude the recent games and shuffle the rest
    return shuffleArray(games.slice(5));
  }, [games, filteredGames, searchQuery, selectedCategory]);

  // Determine if we're in a week of a game being added
  const isRecentlyAdded = (game: Game) => {
    if (!game.added) return false;
    const addedDate = new Date(game.added);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - addedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Determine which icon to use for the filtered games section
  const getFilterIcon = () => {
    // If searching but no category filter, show search icon
    if (searchQuery && selectedCategory === "All") {
      return <Search className="w-6 h-6" />;
    }
    
    // If filtering by category, show that category's icon
    if (selectedCategory !== "All") {
      const categoryKey = selectedCategory.toLowerCase();
      return categoryIcons[categoryKey] || categoryIcons["other"];
    }
    
    // Default icon for all games
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
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
          <p className="text-purple-300 text-sm">Loading awesome games...</p>
        </div>
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-center">
        <div className="p-8 rounded-lg bg-gray-800/50 max-w-md">
          <Gamepad className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Games Found</h3>
          <p className="text-gray-300">We couldn't find any games in our library. Please check back later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Recent Games Section (only show if not filtering) */}
      {recentGames.length > 0 && (
        <div className="bg-gray-800/30 p-6 rounded-xl">
          <SectionHeader 
            icon={<Sparkles className="w-6 h-6" />} 
            title="Recently Added Games" 
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recentGames.map((game: Game) => (
              <GameCard 
                key={game.name} 
                game={game} 
                onSelect={onGameSelect} 
                isNew={isRecentlyAdded(game)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Games Section with count */}
      <div className="bg-gray-800/30 p-6 rounded-xl">
        <SectionHeader 
          icon={getFilterIcon()}
          title={getFilterTitle()}
          count={searchQuery || selectedCategory !== "All" ? filteredGames.length : games.length}
        />
        
        {remainingGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {remainingGames.map((game: Game) => (
              <GameCard 
                key={game.name} 
                game={game} 
                onSelect={onGameSelect} 
                isNew={isRecentlyAdded(game)}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-center">
            <div className="p-8 rounded-lg bg-gray-800/50 max-w-md">
              <Gamepad className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-white mb-2">No Games Found</h3>
              <p className="text-gray-300">Try adjusting your filters or search terms.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}