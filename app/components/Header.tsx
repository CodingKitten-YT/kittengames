import Link from "next/link"
import { Cat } from "lucide-react"
import SearchBar from "./SearchBar"
import CategoryFilter from "./CategoryFilter"

export default function Header() {
  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-7xl">
      <div className="glassmorphism-dark rounded-full px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Cat className="w-8 h-8 text-purple-400" />
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            KittenGames
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <CategoryFilter />
          <SearchBar />
        </div>
      </div>
    </header>
  )
}

