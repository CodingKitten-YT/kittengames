"use client"

import { useState, memo, useCallback } from "react"
import Image from "next/image"
import {
  Loader2,
  ExternalLink,
} from "lucide-react"
import React from "react"
import { launchGame } from "../GameLaunchSettingsPanel"
import { createEncodedGameSlug } from "../../utils/rot13"
import { categoryIcons } from "../../utils/categoryIcons"
import type { ProcessedGame } from "../../utils/gamesApi"

const encodedSlugCache = new Map<string, string>()

const GameCard = memo(({ game, isRecent = false }: { game: ProcessedGame; isRecent?: boolean }) => {
  const [encodedSlug, setEncodedSlug] = useState<string>('');
  const [tiltStyle, setTiltStyle] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (!encodedSlug) {
      // Use the path as the primary slug, fallback to name-based slug
      const slug = game.path || game.name.toLowerCase().replace(/\s+/g, "-")
      if (encodedSlugCache.has(slug)) {
        setEncodedSlug(encodedSlugCache.get(slug)!)
      } else {
        const newEncodedSlug = createEncodedGameSlug(game.name)
        encodedSlugCache.set(slug, newEncodedSlug)
        setEncodedSlug(newEncodedSlug)
      }
    }
  }, [game.name, game.path, encodedSlug])

  const handleClick = useCallback(() => {
    // Create encoded slug from game name for URL routing
    const encodedSlug = createEncodedGameSlug(game.name)
    window.location.href = `/play/${encodedSlug}`
  }, [game])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const tiltX = (centerY - y) / 20
    const tiltY = (x - centerX) / 20
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: "transform 0.1s ease-out",
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.3s ease-in-out",
    })
  }

  const handleImageLoad = () => setIsLoading(false)
  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  const imageUrl = game.image || `https://via.placeholder.com/300x300/2d3748/e2e8f0?text=${encodeURIComponent(game.name)}`

  return (
    <div
      className={`group relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700/30 transition-all duration-300 cursor-pointer aspect-square
        hover:border-purple-500/40 hover:shadow-lg 
      `}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      onClick={handleClick}
    >
      <div className="relative h-full w-full rounded-xl overflow-hidden">
        {isLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 rounded-xl">
            <div className="flex flex-col items-center space-y-1.5">
              <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 animate-spin" />
              <div className="text-[9px] lg:text-[10px] text-gray-500">Loading...</div>
            </div>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 rounded-xl p-3 text-center">
            <div className="bg-gray-700/70 p-2 sm:p-3 rounded-lg text-gray-400 mb-2">
              {React.cloneElement(categoryIcons[game.type.toLowerCase()] || categoryIcons["other"], { className: "w-8 h-8 sm:w-10 md:w-12" })}
            </div>
            <h3 className="font-semibold text-gray-200 leading-tight text-base sm:text-lg md:text-xl">{game.name}</h3>
            <div className="text-gray-400 mt-1 capitalize text-xs sm:text-sm md:text-base">{game.type}</div>
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={game.name}
            fill
            className={`object-cover transition-all duration-300 rounded-xl
              ${isLoading ? "opacity-0 scale-105" : "opacity-100"}
              group-hover:brightness-75 
            `}
            onLoad={handleImageLoad}
            onError={handleImageError}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            unoptimized={true}
          />
        )}
        
        {!isLoading && !imageError && (
          <div 
            className={`absolute inset-0 bg-gray-900/75 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-300 p-3 sm:p-4 rounded-xl
              ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'} 
            `}
          >
            <div className="text-center space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-white leading-tight text-lg sm:text-xl md:text-2xl">
                {game.name}
              </h3>
              
              <div className="flex items-center justify-center">
                <div className="bg-gray-800/80 p-3 sm:p-4 rounded-lg"> 
                  {React.cloneElement(categoryIcons[game.type.toLowerCase()] || categoryIcons["other"], { 
                    className: "w-6 h-6 sm:w-7 sm:h-7 text-purple-400" 
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

GameCard.displayName = 'GameCard'

export default GameCard
export type { Game }