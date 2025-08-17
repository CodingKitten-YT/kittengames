"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  X,
  Check,
  Home,
  Gamepad2,
  Settings,
  Search,
  ChevronDown,
  EyeOff,
  ArrowLeft,
  Maximize2,
  MessageCirclePlus,
  Film,
  Gamepad,
  Save,
} from "lucide-react"

import SearchBar from "./SearchBar"
import MovieSearchBar from "./MovieSearchBar" // Add this import
import CategoryDropdown from "./CategoryDropdown"
import TabCustomizationPopup from "./TabCustomizationPopup"
import navbarData from "../config/navbar.json"

// Define NavItem interface for navigation items
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

// Define the navbar config structure
interface NavbarConfigData {
  alwaysVisible: string[];
  pageSpecific: {
    [key: string]: string[];
  };
}

const navbarConfig: NavbarConfigData = navbarData;

// Define your navigation items here
const navItems: NavItem[] = [
  { id: "games", label: "Games", href: "/", icon: Gamepad },
  { id: "movies", label: "Movies", href: "/movies", icon: Film },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings }
];

interface HeaderProps {
  currentPage?: string;
  isCompact?: boolean;
  onBackClick?: () => void;
  onCategoryChange?: (category: string) => void;
  onSearch?: (query: string) => void;
  onFullscreen?: () => void;
  onSave?: () => void;
  compactNavbarConfig?: {
    backButtonMargin?: string;
    eyeOffButtonMargin?: string;
    fullscreenButtonMargin?: string;
  };
}

export default function Header({
  currentPage,
  isCompact,
  onBackClick,
  onCategoryChange,
  onSearch,
  onFullscreen,
  onSave,
  compactNavbarConfig = {},
}: HeaderProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isTabCustomizationOpen, setIsTabCustomizationOpen] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(isCompact ? true : false)
  const categoryButtonRef = useRef<HTMLButtonElement>(null)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const router = useRouter()
  const pathname = usePathname()
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current)
      autoHideTimeoutRef.current = null
    }
    setIsNavVisible(true)
  }

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsNavVisible(false)
    }, 1000)
  }

  // Handle movie search result clicks
  const handleMovieSearchResult = (item: any, type: 'movie' | 'tv') => {
    if (type === 'movie') {
      router.push(`/movies/movie/${item.id}`)
    } else {
      router.push(`/movies/show/${item.id}`)
    }
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

    if (isCompact) {
      autoHideTimeoutRef.current = setTimeout(() => {
        setIsNavVisible(false)
      }, 2000)
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current)
      }
    }
  }, [isCompact])

  const shouldShowButton = (buttonId: string) => {
    if (!currentPage) return navbarConfig.alwaysVisible.includes(buttonId); // Default for undefined currentPage
    return navbarConfig.alwaysVisible.includes(buttonId) ||
           navbarConfig.pageSpecific[currentPage]?.includes(buttonId)
  }

  if (isCompact) {
    return (
      <>
        {/* Corner trigger area */}
        <div
          className="fixed top-0 left-0 w-24 h-24 z-50 pointer-events-auto" // Slightly smaller trigger
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* Indicator dot when hidden - Minimalist */}
        <div
          className={`fixed top-3 left-3 z-50 transition-all duration-300 ${ // Adjusted position
            isNavVisible
              ? 'opacity-0 scale-0 pointer-events-none'
              : 'opacity-70 scale-100'
          }`}
          onMouseEnter={handleMouseEnter} // Allow hover on dot to show menu
        >
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm" />
        </div>

        {/* Control buttons panel - Minimalist Pill */}
        <div
          className={`fixed top-0 left-0 z-50 transition-all duration-300 ease-out ${ // Changed to top-0
            isNavVisible
              ? 'opacity-100 translate-x-0 translate-y-0 scale-100'
              : 'opacity-0 -translate-x-4 -translate-y-4 scale-95 pointer-events-none'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="mt-3 ml-3 bg-gray-800/80 backdrop-blur-md rounded-full px-2.5 py-1.5 flex items-center space-x-1 shadow-lg border border-gray-700/50">
            <button
              onClick={onBackClick}
              className={`text-gray-300 w-8 h-8 flex items-center justify-center hover:bg-gray-700/70 hover:text-blue-400 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${backButtonMargin}`}
              title="Back to games"
            >
              <ArrowLeft className="w-4 h-4" /> {/* Slightly smaller icons for smaller buttons */}
            </button>

            <button
              onClick={() => setIsTabCustomizationOpen(true)}
              className={`text-gray-300 w-8 h-8 flex items-center justify-center hover:bg-gray-700/70 hover:text-orange-400 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${eyeOffButtonMargin}`}
              title="Customize tab appearance"
            >
              <EyeOff className="w-4 h-4" />
            </button>

            <button
              onClick={onFullscreen}
              className={`text-gray-300 w-8 h-8 flex items-center justify-center hover:bg-gray-700/70 hover:text-purple-400 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${fullscreenButtonMargin}`}
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {onSave && (
              <button
                onClick={onSave}
                className="text-gray-300 w-8 h-8 flex items-center justify-center hover:bg-gray-700/70 hover:text-green-400 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                title="Save/Load Game Data"
              >
                <Save className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <TabCustomizationPopup isOpen={isTabCustomizationOpen} onClose={() => setIsTabCustomizationOpen(false)} />
      </>
    )
  }

  // Full mode - updated to include movie search
  const headerContent = (
    <div className="bg-gray-800/70 backdrop-blur-md rounded-full flex items-center px-3 py-2 w-full justify-between shadow-lg border border-gray-700/30">
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
          <Image
            src="/cat.svg"
            alt="KittenGames"
            width={28} // Slightly adjusted
            height={28}
            className="w-7 h-7 opacity-90 hover:opacity-100 transition-opacity duration-200 select-none pointer-events-none"
            draggable={false}
          />
        </div>
        
        <div className="flex items-center space-x-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === currentPage
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative px-2.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200
                  ${isActive ? 'text-white bg-purple-600/40' : 'text-gray-300 hover:text-white hover:bg-gray-700/50'}`}
              >
                <Icon className="w-4 h-4" /> {/* Adjusted icon size */}
                <span className={`text-sm transition-all duration-300 origin-left ${isActive ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0 hidden md:inline-block md:opacity-100 md:max-w-[100px]'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {shouldShowButton("requestFeature") && (
          <a
            href="https://app.formbricks.com/s/cm6ui6jwh0000jj03onw8dfr7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-purple-400 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-700/50"
            title="Request games/features"
          >
            <MessageCirclePlus className="w-5 h-5" />
          </a>
        )}
        {shouldShowButton("customizeTab") && (
          <button
            onClick={() => setIsTabCustomizationOpen(true)}
            className="text-gray-300 hover:text-purple-400 transition-colors duration-200 p-1.5 rounded-full hover:bg-gray-700/50"
            title="Customize tab appearance"
          >
            <EyeOff className="w-5 h-5" />
          </button>
        )}
        {shouldShowButton("categories") && (
          <div className="relative">
            <button
              ref={categoryButtonRef}
              onClick={handleCategoryClick}
              onKeyDown={handleCategoryKeyDown}
              className="flex items-center space-x-1.5 text-gray-300 text-sm hover:text-purple-400 transition-colors duration-200 px-2 py-1.5 rounded-full hover:bg-gray-700/50"
              aria-haspopup="true"
              aria-expanded={isCategoryOpen}
            >
              <span>{selectedCategory}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
        {shouldShowButton("search") && <SearchBar onSearch={onSearch || (() => {})} />}
        {shouldShowButton("movieSearch") && (
          <div className="w-64">
            <MovieSearchBar onResultClick={handleMovieSearchResult} />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="px-3 pt-3">
        {headerContent}
      </div>
      
      <CategoryDropdown
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onCategoryChange={(category) => {
          setSelectedCategory(category)
          if (onCategoryChange) onCategoryChange(category);
          setIsCategoryOpen(false)
        }}
        anchorRect={buttonRect}
        selectedCategory={selectedCategory}
      />

      <TabCustomizationPopup isOpen={isTabCustomizationOpen} onClose={() => setIsTabCustomizationOpen(false)} />
    </div>
  )
}