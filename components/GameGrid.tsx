import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import Image from "next/image"
import {
  Hexagon,
  Swords,
  Footprints,
  Crosshair,
  PuzzleIcon as PuzzlePiece,
  Gamepad,
  Clock,
  Car,
  Loader2,
} from "lucide-react"
import type React from "react"

const categoryIcons: { [key: string]: React.ReactNode } = {
  other: <Hexagon className="w-6 h-6" />,
  battle: <Swords className="w-6 h-6" />,
  platformer: <Footprints className="w-6 h-6" />,
  shooter: <Crosshair className="w-6 h-6" />,
  puzzle: <PuzzlePiece className="w-6 h-6" />,
  skill: <Gamepad className="w-6 h-6" />,
  idle: <Clock className="w-6 h-6" />,
  racing: <Car className="w-6 h-6" />,
}

// Hardcoded Ad Object
const ad = {
  show: false,
  image: "https://cdn.pixabay.com/photo/2015/09/15/15/53/bank-notes-941246_960_720.jpg", // Replace with your actual image URL
  title: "Special Offer!",
  link: "https://example.com", // Replace with your actual ad link
}

const GameCard = ({ game, onSelect }: { game: any; onSelect: (slug: string) => void }) => {
  const [tiltStyle, setTiltStyle] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top

    const tiltX = (height / 2 - y) / 10
    const tiltY = (x - width / 2) / 10

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

  // Function to determine if the image is base64
  const isBase64Image = (image: string) => {
    return image.startsWith("data:image/")
  }

  return (
    <div
      className="game-card glassmorphism-dark overflow-hidden aspect-square relative cursor-pointer group"
      onClick={() => onSelect(game.name.toLowerCase().replace(/\s+/g, "-"))}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}
        {/* Conditionally render base64 or URL image */}
        {isBase64Image(game.image) ? (
          <img
            src={game.image}
            alt={game.name}
            className={`transition-all duration-300 ${isLoading ? "opacity-0" : "group-hover:opacity-50"}`}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          <Image
            src={game.image || "/placeholder.svg"}
            alt={game.name}
            fill
            className={`transition-all duration-300 ${isLoading ? "opacity-0" : "group-hover:opacity-50"}`}
            onLoad={() => setIsLoading(false)}
            priority
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <h3 className="text-lg font-semibold text-white text-center mb-2 drop-shadow-md">{game.name}</h3>
          <div className="text-white">{categoryIcons[game.type.toLowerCase()] || categoryIcons["other"]}</div>
        </div>
      </div>
    </div>
  )
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const GameGrid = ({
  onGameSelect,
  selectedCategory,
  searchQuery,
}: {
  onGameSelect: (slug: string) => void
  selectedCategory: string
  searchQuery: string
}) => {
  const [games, setGames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const gameCardRef = useRef<HTMLDivElement | null>(null)
  const adCardRef = useRef<HTMLDivElement | null>(null)
  const [gameCardHeight, setGameCardHeight] = useState<number>(0)

  useEffect(() => {
    let isMounted = true

    const fetchGames = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("https://cdn.statically.io/gh/CodingKitten-YT/KittenGames-gamelibrary/main/games.json")
        if (!res.ok) throw new Error("Failed to fetch games")
        const data = await res.json()
        if (isMounted) setGames(shuffleArray(data))
      } catch (error) {
        console.error("Error fetching games:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchGames()
    return () => {
      isMounted = false
    }
  }, [])

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      return (
        (selectedCategory === "All" || game.type.toLowerCase() === selectedCategory.toLowerCase()) &&
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })
  }, [games, selectedCategory, searchQuery])

  const handleGameSelect = useCallback(
    (slug: string) => {
      onGameSelect(slug)
    },
    [onGameSelect]
  )

  // Measure game card height once the component mounts
  useEffect(() => {
    const updateHeight = () => {
      setGameCardHeight(gameCardRef.current?.clientHeight || 0)
    }

    if (gameCardRef.current) {
      updateHeight()
      window.addEventListener("resize", updateHeight)
    }

    return () => {
      window.removeEventListener("resize", updateHeight)
    }
  }, [filteredGames])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {ad.show && (
        <div
          className="col-span-2 sm:col-span-2 md:col-span-2 lg:col-span-2"
          style={{ height: gameCardHeight ? `${gameCardHeight}px` : "auto" }}
        >
          <a href={ad.link} target="_blank" rel="noopener noreferrer">
            <div className="game-card glassmorphism-dark overflow-hidden relative">
              <div className="relative h-full">
                <Image
                  src={ad.image}
                  alt={ad.title}
                  width={300}
                  height={gameCardHeight || 0}
                  className="w-full object-cover rounded-md"
                  style={{ maxHeight: `${gameCardHeight}px` }}
                />
              </div>
            </div>
          </a>
        </div>
      )}

      {filteredGames.map((game, index) => (
        <div key={game.name} ref={index === 0 ? gameCardRef : null}>
          <GameCard game={game} onSelect={handleGameSelect} />
        </div>
      ))}
    </div>
  )
}

export default GameGrid