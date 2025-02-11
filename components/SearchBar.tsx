"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"

export default function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(search)
    }, 300) // Debounce for 300ms

    return () => clearTimeout(debounceTimer)
  }, [search, onSearch])

  const handleClear = () => {
    setSearch("")
    onSearch("")
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-56">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-10 py-2 rounded-full bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-gray-700/50 transition-all duration-300 text-sm"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
      {search && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

