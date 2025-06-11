"use client"

import { useState, memo, useCallback } from "react"
import Image from "next/image"
import {
  Loader2,
  Sparkles,
  ExternalLink,
  Play,
} from "lucide-react"
import type React from "react"
import { launchGame, getCurrentSettings } from "../GameLaunchSettingsPanel"
import { createEncodedGameSlug } from "../../utils/rot13"
import { categoryIcons } from "../../utils/categoryIcons"

interface Game {
  name: string
  type: string
  image: string
  url: string
  newtab?: boolean
  added?: string
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

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
})

GameCard.displayName = 'GameCard'

export default GameCard
export type { Game }