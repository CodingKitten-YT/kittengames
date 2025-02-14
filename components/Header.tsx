"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Cat,
  ChevronDown,
  ArrowLeft,
  EyeOff,
  Maximize2,
  MessageCirclePlus,
} from "lucide-react"
import SearchBar from "./SearchBar"
import CategoryDropdown from "./CategoryDropdown"
import TabCustomizationPopup from "./TabCustomizationPopup"

export default function Header({
  isCompact,
  onBackClick,
  onCategoryChange,
  onSearch,
  onFullscreen,
}: {
  isCompact: boolean
  onBackClick: () => void
  onCategoryChange: (category: string) => void
  onSearch: (query: string) => void
  onFullscreen: () => void
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isTabCustomizationOpen, setIsTabCustomizationOpen] = useState(false)
  const categoryButtonRef = useRef<HTMLButtonElement>(null)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [position, setPosition] = useState({ x: 16, y: 16 })
  const [isDragging, setIsDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  const handleCategoryClick = () => {
    if (categoryButtonRef.current) {
      setButtonRect(categoryButtonRef.current.getBoundingClientRect())
    }
    setIsCategoryOpen(!isCategoryOpen)
  }

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleCategoryClick()
    }
  }

  useEffect(() => {
    const savedTabName = localStorage.getItem("cloakedTabName")
    const savedTabIcon = localStorage.getItem("cloakedTabIcon")

    if (savedTabName) document.title = savedTabName

    if (savedTabIcon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (!favicon) {
        favicon = document.createElement("link")
        favicon.rel = "icon"
        document.head.appendChild(favicon)
      }
      favicon.href = savedTabIcon
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCompact) {
      setIsDragging(true)
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffset.current.y)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
  }

  const headerContent = (
    <div
      className={`glassmorphism-dark rounded-full flex items-center justify-between ${
        isCompact ? "px-2 py-2" : "px-6 py-3 w-full"
      }`}
    >
      <div className="flex items-center space-x-3">
        {isCompact ? (
          <button
            onClick={onBackClick}
            className="text-purple-400 w-8 h-8 flex items-center justify-center hover:bg-purple-400/20 rounded-full transition-all duration-300"
            title="Back to games"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link href="/" className="flex items-center space-x-3">
            <Cat className="w-6 h-6 text-purple-400" />
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hidden sm:inline">
              KittenGames
            </span>
          </Link>
        )}
      </div>
      {!isCompact && (
        <div className="flex items-center space-x-4">
          <a
            href="https://app.formbricks.com/s/cm6ui6jwh0000jj03onw8dfr7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-purple-400 transition-colors duration-300"
            title="Request games/features"
          >
            <MessageCirclePlus className="w-6 h-6" />
          </a>
          <button
            onClick={() => setIsTabCustomizationOpen(true)}
            className="text-white hover:text-purple-400 transition-colors duration-300"
            title="Customize tab appearance"
          >
            <EyeOff className="w-6 h-6" />
          </button>
          <div className="relative">
            <button
              ref={categoryButtonRef}
              onClick={handleCategoryClick}
              onKeyDown={handleCategoryKeyDown}
              className="flex items-center space-x-2 text-white text-base hover:text-purple-400 transition-colors duration-300"
              aria-haspopup="true"
              aria-expanded={isCategoryOpen}
            >
              <span>{selectedCategory}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
          <SearchBar onSearch={onSearch} />
        </div>
      )}
      {isCompact && (
        <button
          onClick={onFullscreen}
          className="text-purple-400 w-8 h-8 flex items-center justify-center hover:bg-purple-400/20 rounded-full transition-all duration-300"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  )

  return (
    <>
      {isCompact ? (
        <header
          className="fixed z-40 cursor-move"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
          onMouseDown={handleMouseDown}
        >
          {headerContent}
        </header>
      ) : (
        <header className="fixed top-4 z-40 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl">
          {headerContent}
        </header>
      )}
      <CategoryDropdown
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onCategoryChange={(category) => {
          setSelectedCategory(category)
          onCategoryChange(category)
        }}
        anchorRect={buttonRect}
        selectedCategory={selectedCategory}
      />
      <TabCustomizationPopup isOpen={isTabCustomizationOpen} onClose={() => setIsTabCustomizationOpen(false)} />
    </>
  )
}
