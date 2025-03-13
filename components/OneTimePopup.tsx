"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink } from "lucide-react"
import Image from "next/legacy/image"
import Link from "next/link"

interface PopupData {
  popup: {
    enabled: boolean
    title: string
    message: string
    project: {
      name: string
      description: string
      url: string
      image: string
    }
    button: {
      text: string
      url: string
    }
  }
}

export default function OneTimePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [popupData, setPopupData] = useState<PopupData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenProjectPopup") === "true"
    
    if (!hasSeenPopup) {
      const fetchPopupData = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(
            "https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/popup.json"
          )
          
          if (!response.ok) {
            throw new Error("Failed to fetch popup data")
          }
          
          const data: PopupData = await response.json()
          
          if (data.popup && data.popup.enabled) {
            setPopupData(data)
            setIsOpen(true)
          } else {
            // If popup is disabled, mark as seen to avoid future checks
            localStorage.setItem("hasSeenProjectPopup", "true")
          }
        } catch (error) {
          console.error("Error loading popup data:", error)
          // Mark as seen to avoid repetitive failing requests
          localStorage.setItem("hasSeenProjectPopup", "true")
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchPopupData()
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem("hasSeenProjectPopup", "true")
  }

  if (!isOpen || isLoading || !popupData) return null

  const { title, message, project, button } = popupData.popup

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl border border-gray-700/50 transform transition-all duration-300 ease-out mx-4 flex flex-col md:flex-row">
        {/* Project Image (larger on desktop) */}
        <div className="w-full md:w-1/2 h-56 md:h-auto relative">
          <Image
            src={project.image}
            alt="Announcement image"
            layout="fill"
            objectFit="cover"
            className="brightness-95 transition-all hover:scale-105 duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/30 opacity-60"></div>
        </div>
        
        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8 relative flex flex-col justify-between">
          {/* Close button */}
          <button 
            onClick={handleDismiss} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-700/50 bg-black/30 z-10"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Content */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded-full text-xs font-medium border border-purple-500/20">
                New Announcement
              </span>
            </div>
            
            {/* Title and message */}
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-3">
                {title}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          {/* Action button */}
          <div className="mt-8">
            <Link
              href={button.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                localStorage.setItem("hasSeenProjectPopup", "true")
              }}
              className="inline-flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl overflow-hidden hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform hover:translate-y-px active:translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <span>{button.text}</span>
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}