"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(search)
    }, 300) // Debounce for 300ms

    return () => clearTimeout(debounceTimer)
  }, [search, onSearch])

  return (
    <div className="relative w-56">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-3 py-2 rounded-full bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-gray-700/50 transition-all duration-300 text-sm"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
    </div>
  )
}

