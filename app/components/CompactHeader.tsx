"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Cat } from "lucide-react"

export default function CompactHeader() {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsCompact(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-4 left-4 z-10 transition-all duration-300 ease-in-out ${isCompact ? "w-16 h-16" : "w-64 h-16"}`}
    >
      <div className="glassmorphism-dark rounded-full w-full h-full flex items-center justify-center overflow-hidden">
        <Link href="/" className="flex items-center space-x-2 px-4">
          {isCompact ? (
            <ArrowLeft className="w-8 h-8 text-purple-400" />
          ) : (
            <>
              <Cat className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                KittenGames
              </span>
            </>
          )}
        </Link>
      </div>
    </header>
  )
}

