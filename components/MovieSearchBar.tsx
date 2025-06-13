"use client"

import React, { useState, useRef, useEffect } from "react"
import { Search, X, Film, Tv, Loader2 } from "lucide-react"
import { Movie, TVShow, TMDBResponse } from "../types/tmdb"
import { searchMovies, searchTVShows } from "../utils/tmdb"
import Image from "next/image"
import { getPosterUrl } from "../utils/tmdb"

interface SearchResult {
  id: number
  title?: string
  name?: string
  media_type: 'movie' | 'tv'
  poster_path?: string
  release_date?: string
  first_air_date?: string
  vote_average: number
  overview?: string
}

interface MovieSearchBarProps {
  onSearch?: (query: string) => void
  onResultClick?: (item: Movie | TVShow, type: 'movie' | 'tv') => void
}

export default function MovieSearchBar({ onSearch, onResultClick }: MovieSearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Search both movies and TV shows - increased results
      const [movieResponse, tvResponse] = await Promise.all([
        searchMovies(searchQuery),
        searchTVShows(searchQuery)
      ])

      // Combine and format results - significantly increased
      const movieResults: SearchResult[] = movieResponse.results.slice(0, 12).map((movie: Movie) => ({
        ...movie,
        media_type: 'movie' as const
      }))

      const tvResults: SearchResult[] = tvResponse.results.slice(0, 12).map((show: TVShow) => ({
        ...show,
        media_type: 'tv' as const
      }))

      // Merge and sort by vote_average
      const combinedResults = [...movieResults, ...tvResults]
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20) // Increased to 20 results

      setResults(combinedResults)
      setActiveIndex(-1)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setActiveIndex(-1)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value)
    }, 300)

    if (onSearch) {
      onSearch(value)
    }
  }

  // Scroll active item into view
  const scrollActiveItemIntoView = () => {
    if (resultsRef.current && activeIndex >= 0) {
      const activeElement = resultsRef.current.children[activeIndex] as HTMLElement
      if (activeElement) {
        const container = resultsRef.current
        const containerRect = container.getBoundingClientRect()
        const elementRect = activeElement.getBoundingClientRect()
        
        const isVisible = (
          elementRect.top >= containerRect.top &&
          elementRect.bottom <= containerRect.bottom
        )
        
        if (!isVisible) {
          activeElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        }
      }
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex(prev => {
          const newIndex = Math.min(prev + 1, results.length - 1)
          return newIndex
        })
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex(prev => {
          const newIndex = Math.max(prev - 1, -1)
          return newIndex
        })
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0 && results[activeIndex]) {
          handleResultClick(results[activeIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        inputRef.current?.blur()
        setActiveIndex(-1)
        break
    }
  }

  // Scroll to active item when activeIndex changes
  useEffect(() => {
    scrollActiveItemIntoView()
  }, [activeIndex])

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    const item = result as Movie | TVShow
    setQuery(result.title || result.name || "")
    setIsOpen(false)
    setActiveIndex(-1)
    
    if (onResultClick) {
      onResultClick(item, result.media_type)
    }
  }

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).getFullYear().toString()
  }

  return (
    <div ref={searchRef} className="relative">
      {/* Reverted search bar to original size */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search movies & TV shows..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 bg-gray-700/50 border border-gray-600/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults([])
              setIsOpen(false)
              setActiveIndex(-1)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Much bigger results dropdown */}
      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-50 overflow-hidden w-[600px]">
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-3" />
              <p className="text-gray-400 text-base">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div 
              ref={resultsRef}
              className="py-3 max-h-[600px] overflow-y-auto overscroll-contain" // Increased height significantly
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #1F2937'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 8px;
                }
                div::-webkit-scrollbar-track {
                  background: #1F2937;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb {
                  background: #4B5563;
                  border-radius: 4px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: #6B7280;
                }
              `}</style>
              {results.map((result, index) => (
                <button
                  key={`${result.media_type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full px-5 py-4 flex items-center space-x-4 hover:bg-gray-700/50 transition-all duration-200 text-left ${
                    index === activeIndex ? 'bg-gray-700/60 border-l-2 border-purple-500' : ''
                  }`}
                >
                  {/* Bigger poster */}
                  <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700 shadow-md">
                    {result.poster_path ? (
                      <Image
                        src={getPosterUrl(result.poster_path, 'w185')}
                        alt={result.title || result.name || ''}
                        width={56}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {result.media_type === 'movie' ? (
                          <Film className="w-6 h-6 text-gray-500" />
                        ) : (
                          <Tv className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bigger content area */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-semibold text-lg leading-tight pr-3"> {/* Increased font size */}
                        {result.title || result.name}
                      </h4>
                      <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 ${
                        result.media_type === 'movie' 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                          : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      }`}>
                        {result.media_type === 'movie' ? (
                          <>
                            <Film className="w-4 h-4" />
                            <span>Movie</span>
                          </>
                        ) : (
                          <>
                            <Tv className="w-4 h-4" />
                            <span>Series</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 text-base text-gray-400 mb-3"> {/* Increased spacing and font */}
                      <span className="font-medium">{formatDate(result.release_date || result.first_air_date)}</span>
                      {result.vote_average > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="font-medium">{result.vote_average.toFixed(1)}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {result.overview && (
                      <p className="text-gray-400 text-base leading-relaxed line-clamp-3"> {/* Increased to 3 lines and bigger font */}
                        {result.overview}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() && !loading ? (
            <div className="p-6 text-center text-gray-400">
              <p className="text-base">No results found for "<span className="text-white font-medium">{query}</span>"</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}