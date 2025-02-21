import Image from "next/legacy/image"
import Link from "next/link"
import type React from "react"
import { Hexagon, Swords, Footprints, Crosshair, PuzzleIcon as PuzzlePiece, Gamepad, Clock, Car } from "lucide-react"

async function getGames() {
  const res = await fetch(
    "https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/games.json",
  )
  if (!res.ok) {
    throw new Error("Failed to fetch games")
  }
  return res.json()
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
}

export default async function GameGrid() {
  const games = await getGames()

  return (
    (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {games.map((game: any) => (
        <Link href={`/game/${game.name.toLowerCase().replace(/\s+/g, "-")}`} key={game.name} className="block">
          <div className="glassmorphism-dark rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 group aspect-square">
            <div className="relative h-full">
              <Image
                src={game.image || "/placeholder.svg"}
                alt={game.name}
                layout="fill"
                objectFit="cover"
                className="transition-opacity duration-300 group-hover:opacity-30"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-semibold text-white text-center mb-2">{game.name}</h3>
                {categoryIcons[game.type.toLowerCase()] || categoryIcons["other"]}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>)
  );
}

