"use client"

import { useState, useEffect, useMemo, memo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
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
  Play,
  ExternalLink,
  Zap,
  Trophy,
} from "lucide-react"
import type React from "react"
import { useGameLaunchSettings, launchGame, getCurrentSettings } from "./GameLaunchSettingsPanel"
import { createEncodedGameSlug } from "../utils/rot13"

interface Game {
  name: string
  type: string
  image: string
  url: string
  newtab?: boolean
  added?: string
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  other: <Hexagon className="w-5 h-5" />,
  battle: <Swords className="w-5 h-5" />,
  platformer: <Footprints className="w-5 h-5" />,
  shooter: <Crosshair className="w-5 h-5" />,
  puzzle: <PuzzlePiece className="w-5 h-5" />,
  skill: <Gamepad className="w-5 h-5" />,
  idle: <Clock className="w-5 h-5" />,
  racing: <Car className="w-5 h-5" />,
  retro: <Joystick className="w-5 h-5" />,
  multiplayer: <UsersRound className="w-5 h-5" />,
}

// Cache for encoded slugs to optimize performance
const encodedSlugCache = new Map<string, string>();

const GameCard = memo(({ game, isRecent = false }: { game: Game; isRecent?: boolean }) => {
  const [encodedSlug, setEncodedSlug] = useState<string>('');
  const [tiltStyle, setTiltStyle] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Pre-encode slug on hover for instant navigation
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (!encodedSlug) {
      const slug = game.name.toLowerCase().replace(/\s+/g, "-");
      if (encodedSlugCache.has(slug)) {
        setEncodedSlug(encodedSlugCache.get(slug)!);
      } else {
        const encoded = createEncodedGameSlug(game.name);
        encodedSlugCache.set(slug, encoded);
        setEncodedSlug(encoded);
      }
    }
  }, [game.name, encodedSlug]);

  // Handle click - either navigate or launch directly
  const handleClick = useCallback(() => {
    if (game.newtab) {
      // Launch directly for games marked as newtab
      const settings = getCurrentSettings();
      launchGame(game.url, settings);
    } else {
      // Navigate to play page with pre-encoded slug
      const finalSlug = encodedSlug || createEncodedGameSlug(game.name);
      window.location.href = `/play/${finalSlug}`;
    }
  }, [game, encodedSlug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = (centerY - y) / 15
    const tiltY = (x - centerX) / 15

    setTiltStyle({
      transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTiltStyle({
      transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    })
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  // Create a fallback image URL or use a placeholder
  const imageUrl = game.image || `https://via.placeholder.com/400x400/1f2937/9ca3af?text=${encodeURIComponent(game.name)}`

  return (
    <div
      className={`group relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer aspect-square
        ${isHovered 
          ? 'border-purple-400/60 shadow-2xl shadow-purple-500/25' 
          : 'border-gray-700/40 hover:border-gray-600/60'
        }
        ${isRecent ? 'ring-2 ring-yellow-500/30' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      onClick={handleClick}
    >
      {/* New Game Badge */}
      {isRecent && (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          <Sparkles className="w-3 h-3 inline mr-1" />
          NEW
        </div>
      )}

      {/* External Link Badge */}
      {game.newtab && (
        <div className="absolute top-2 left-2 z-10 bg-blue-500/80 backdrop-blur-sm p-1.5 rounded-full">
          <ExternalLink className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Enhanced gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 rounded-2xl
        ${isHovered 
          ? 'from-purple-600/30 via-pink-500/20 to-blue-500/30 opacity-100' 
          : 'from-purple-500/10 to-pink-500/10 opacity-0'
        }`}
      />

      {/* Animated border glow */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300
        ${isHovered ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-100' : 'opacity-0'}
      `} style={{
        background: isHovered ? 'conic-gradient(from 0deg, rgba(168, 85, 247, 0.3), rgba(236, 72, 153, 0.3), rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))' : 'none',
        animation: isHovered ? 'spin 3s linear infinite' : 'none',
      }} />

      <div className="relative h-full w-full rounded-2xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <div className="text-xs text-purple-300 opacity-60">Loading...</div>
            </div>
          </div>
        )}
        
        {imageError ? (
          // Enhanced fallback UI
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl text-white mb-4 shadow-lg">
              {categoryIcons[game.type.toLowerCase()] || categoryIcons["other"]}
            </div>
            <h3 className="text-sm font-bold text-white text-center leading-tight">{game.name}</h3>
            <div className="text-xs text-gray-400 mt-2 capitalize">{game.type}</div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            className={`object-cover transition-all duration-500 rounded-2xl
              ${isLoading ? "opacity-0 scale-110" : isHovered ? "opacity-60 scale-105" : "opacity-100 scale-100"}
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            unoptimized={true}
          />
        )}
        
        {/* Enhanced overlay with better typography */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 p-4 rounded-2xl
          ${isHovered ? 'opacity-100 bg-black/60 backdrop-blur-sm' : 'opacity-0'}
        `}>
          <div className="text-center space-y-3">
            <h3 className="text-lg font-bold text-white leading-tight drop-shadow-lg">
              {game.name}
            </h3>
            
            <div className="flex items-center justify-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl text-white shadow-lg">
                {categoryIcons[game.type.toLowerCase()] || categoryIcons["other"]}
              </div>
              <div className="text-xs text-gray-200 bg-black/40 px-2 py-1 rounded-full capitalize">
                {game.type}
              </div>
            </div>

            <div className="flex items-center justify-center text-purple-300">
              <Play className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Play Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Enhanced section header with animations
function SectionHeader({ icon, title, count, gradient = false }: { 
  icon: React.ReactNode; 
  title: string; 
  count?: number;
  gradient?: boolean;
}) {
  return (
    <div className="flex items-center mb-8 px-1 group">
      <div className={`mr-4 p-3 rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:scale-110
        ${gradient 
          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600' 
          : 'bg-gradient-to-r from-purple-700 to-purple-800'
        }`}>
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">{title}</h2>
        {count !== undefined && (
          <div className="flex items-center space-x-2">
            <div className="bg-purple-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-purple-100 border border-purple-700/30">
              {count} {count === 1 ? 'game' : 'games'}
            </div>
          </div>
        )}
      </div>
    </div>
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

  // Get the most recent games (top 8 for better visual balance)
  const recentGames = useMemo(() => {
    if (searchQuery || selectedCategory !== "All") {
      return []; // Don't show recent games when filtering
    }
    return games.slice(0, 8);
  }, [games, searchQuery, selectedCategory]);

  // Get remaining games, shuffled
  const remainingGames = useMemo(() => {
    if (searchQuery || selectedCategory !== "All") {
      return filteredGames; // When filtering, show all filtered games
    }
    // Exclude the recent games and shuffle the rest
    return shuffleArray(games.slice(8));
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}