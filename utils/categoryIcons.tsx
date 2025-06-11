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
} from "lucide-react"
import type React from "react"

export const categoryIcons: { [key: string]: React.ReactNode } = {
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