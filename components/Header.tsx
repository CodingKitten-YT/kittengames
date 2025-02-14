"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Cat,
  ChevronDown,
  ArrowLeft,
  EyeOff,
  Maximize2,
  MessageCirclePlus,
} from "lucide-react";
import SearchBar from "./SearchBar";
import CategoryDropdown from "./CategoryDropdown";
import TabCustomizationPopup from "./TabCustomizationPopup";

export default function Header({
  isCompact,
  onBackClick,
  onCategoryChange,
  onSearch,
  onFullscreen,
}: {
  isCompact: boolean;
  onBackClick: () => void;
  onCategoryChange: (category: string) => void;
  onSearch: (query: string) => void;
  onFullscreen: () => void;
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTabCustomizationOpen, setIsTabCustomizationOpen] = useState(false);
  const categoryButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const headerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Load initial position from localStorage
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== "undefined") {
      const savedPosition = localStorage.getItem("navbarPosition");
      return savedPosition ? JSON.parse(savedPosition) : { x: 20, y: 20 };
    }
    return { x: 20, y: 20 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem("navbarPosition", JSON.stringify(position));
    }
  }, [position, isDragging]);

  const handleCategoryButtonClick = () => {
    if (categoryButtonRef.current) {
      setButtonRect(categoryButtonRef.current.getBoundingClientRect()); // Set the rect of the category button
    }
    setIsCategoryOpen(!isCategoryOpen);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCompact || !headerRef.current) return;

    // Don't initiate drag on button clicks
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = true;
    setIsDragging(true);
    
    dragStart.current = {
      x: e.clientX,
      y: e.clientY
    };
    
    initialPosition.current = {
      x: position.x,
      y: position.y
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    requestAnimationFrame(() => {
      const headerWidth = headerRef.current?.offsetWidth || 200;
      const headerHeight = headerRef.current?.offsetHeight || 50;

      const newX = Math.max(0, Math.min(
        window.innerWidth - headerWidth,
        initialPosition.current.x + deltaX
      ));
      
      const newY = Math.max(0, Math.min(
        window.innerHeight - headerHeight,
        initialPosition.current.y + deltaY
      ));

      setPosition({ x: newX, y: newY });
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    
    isDraggingRef.current = false;
    setIsDragging(false);
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  // Clean up event listeners
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const headerContent = (
    <div
      className={`glassmorphism-dark rounded-full flex items-center justify-between select-none ${
        isCompact ? "px-2 py-2" : "px-6 py-3 w-full"
      }`}
    >
      <div className="flex items-center space-x-3">
        {isCompact ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBackClick();
            }}
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
            onClick={handleCategoryButtonClick}
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
          onClick={(e) => {
            e.stopPropagation();
            onFullscreen();
          }}
          className="text-purple-400 w-8 h-8 flex items-center justify-center hover:bg-purple-400/20 rounded-full transition-all duration-300"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      {isCompact ? (
        <header
          ref={headerRef}
          className={`fixed z-40 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
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
          setSelectedCategory(category);
          onCategoryChange(category);
        }}
        anchorRect={buttonRect}
        selectedCategory={selectedCategory}
      />
      <TabCustomizationPopup isOpen={isTabCustomizationOpen} onClose={() => setIsTabCustomizationOpen(false)} />
    </>
  );
}