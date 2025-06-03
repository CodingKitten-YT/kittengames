import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import Draggable, { DraggableData, DraggableEvent } from "react-draggable"
import { Cat, ChevronDown, ArrowLeft, EyeOff, Maximize2, MessageCirclePlus, Film, Gamepad, LayoutGrid, Settings } from "lucide-react"
import SearchBar from "./SearchBar"
import CategoryDropdown from "./CategoryDropdown"
import TabCustomizationPopup from "./TabCustomizationPopup"
import MovieLink from "./MovieLink"
import navbarConfig from "../config/navbar.json"

interface HeaderProps {
  currentPage: "games" | "apps" | "settings"
  isCompact?: boolean
  onBackClick?: () => void
  onCategoryChange?: (category: string) => void
  onSearch?: (query: string) => void
  onFullscreen?: () => void
  compactNavbarConfig?: {
    backButtonMargin?: string
    eyeOffButtonMargin?: string
    fullscreenButtonMargin?: string
  }
}

const navItems = [
  { id: "games", label: "Games", icon: Gamepad, href: "/" },
  { id: "apps", label: "Apps", icon: LayoutGrid, href: "/apps" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export default function Header({
  currentPage,
  isCompact,
  onBackClick,
  onCategoryChange,
  onSearch,
  onFullscreen,
  compactNavbarConfig = {},
}: HeaderProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isTabCustomizationOpen, setIsTabCustomizationOpen] = useState(false)
  const categoryButtonRef = useRef<HTMLButtonElement>(null)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [position, setPosition] = useState({ x: 10, y: 10 })
  const router = useRouter()
  const pathname = usePathname()

  const {
    backButtonMargin = '-mr-0.5',
    eyeOffButtonMargin = '-ml-0',
    fullscreenButtonMargin = ''
  } = compactNavbarConfig

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
    const savedPosition = localStorage.getItem('navbarPosition')
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition))
    }
  }, [])

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    const newPosition = { x: data.x, y: data.y }
    setPosition(newPosition)
    localStorage.setItem('navbarPosition', JSON.stringify(newPosition))
  }

  useEffect(() => {
    const savedTabName = localStorage.getItem("cloakedTabName")
    const savedTabIcon = localStorage.getItem("cloakedTabIcon")

    if (savedTabName) {
      document.title = savedTabName
    }

    if (savedTabIcon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = savedTabIcon
      } else {
        const newFavicon = document.createElement("link")
        newFavicon.rel = "icon"
        newFavicon.href = savedTabIcon
        document.head.appendChild(newFavicon)
      }
    }
  }, [])

  const shouldShowButton = (buttonId: string) => {
    return navbarConfig.alwaysVisible.includes(buttonId) || 
           navbarConfig.pageSpecific[currentPage]?.includes(buttonId)
  }

  const headerContent = (
    <div
      className={`glassmorphism-dark rounded-full flex items-center justify-between ${
        isCompact ? "px-2 py-1.5" : "px-6 py-3 w-full"
      }`}
    >
      <div className="flex items-center space-x-1">
        {isCompact ? (
          <>
            <button
              onClick={onBackClick}
              className={`text-purple-400 w-8 h-8 flex items-center justify-center hover:bg-purple-400/20 rounded-full transition-all duration-300 ${backButtonMargin}`}
              title="Back to games"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsTabCustomizationOpen(true)}
              className={`text-purple-400 w-8 h-8 flex items-center justify-center hover:bg-purple-400/20 rounded-full transition-all duration-300 ${eyeOffButtonMargin}`}
              title="Customize tab appearance"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Link href="/" className="flex items-center space-x-3 mr-4">
              <Cat className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hidden sm:inline">
                KittenGames
              </span>
            </Link>

            <div className="ml-6 flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.id === currentPage
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-full flex items-center space-x-2 transition-all duration-300
                      ${isActive ? 'text-white bg-purple-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className={`transition-all duration-300 origin-left ${isActive ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0 hidden'}`}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
      {!isCompact && (
        <div className="flex items-center space-x-4">
          {shouldShowButton("requestFeature") && (
            <a
              href="https://app.formbricks.com/s/cm6ui6jwh0000jj03onw8dfr7"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-400 transition-colors duration-300"
              title="Request games/features"
            >
              <MessageCirclePlus className="w-6 h-6" />
            </a>
          )}
          {shouldShowButton("movies") && <MovieLink />}
          {shouldShowButton("customizeTab") && (
            <button
              onClick={() => setIsTabCustomizationOpen(true)}
              className="text-white hover:text-purple-400 transition-colors duration-300"
              title="Customize tab appearance"
            >
              <EyeOff className="w-6 h-6" />
            </button>
          )}
          {shouldShowButton("categories") && (
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
          )}
          {shouldShowButton("search") && <SearchBar onSearch={onSearch} />}
        </div>
      )}
      {isCompact && (
        <div className="flex items-center space-x-1">
          <button
            onClick={onFullscreen}
            className={`text-purple-400 w-8 h-8 flex items-center justify-center hover:bg-purple-400/20 rounded-full transition-all duration-300 ${fullscreenButtonMargin}`}
            title="Fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {isCompact ? (
        <Draggable
          bounds="parent"
          handle=".glassmorphism-dark"
          defaultPosition={position}
          onStop={handleDragStop}
        >
          <header className="fixed z-40">
            {headerContent}
          </header>
        </Draggable>
      ) : (
        <header className={`fixed top-4 z-40 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl`}>
          {headerContent}
        </header>
      )}

      <CategoryDropdown
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onCategoryChange={(category) => {
          setSelectedCategory(category)
          onCategoryChange?.(category)
        }}
        anchorRect={buttonRect}
        selectedCategory={selectedCategory}
      />

      <TabCustomizationPopup isOpen={isTabCustomizationOpen} onClose={() => setIsTabCustomizationOpen(false)} />
    </>
  )
}