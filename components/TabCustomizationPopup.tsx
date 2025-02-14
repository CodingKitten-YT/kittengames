"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import Image from "next/image"
import type React from "react"

interface TabCustomizationPopupProps {
  isOpen: boolean
  onClose: () => void
}

interface CloakPreset {
  name: string
  tabName: string
  tabIcon: string
}

export default function TabCustomizationPopup({ isOpen, onClose }: TabCustomizationPopupProps) {
  const [selectedPreset, setSelectedPreset] = useState<CloakPreset>({ name: "", tabName: "", tabIcon: "" })
  const [tabName, setTabName] = useState("")
  const [tabIcon, setTabIcon] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [cloakPresets, setCloakPresets] = useState<CloakPreset[]>([])

  // Load presets from JSON
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/presets.json")
        const data = await response.json()
        setCloakPresets(data)
        setSelectedPreset(data[0]) // Set the first preset as default
      } catch (error) {
        console.error("Failed to load presets:", error)
      }
    }

    fetchPresets()
  }, [])

  // Initialize cloaking on component mount
  useEffect(() => {
    const savedTabName = localStorage.getItem("cloakedTabName")
    const savedTabIcon = localStorage.getItem("cloakedTabIcon")
    
    if (savedTabName) document.title = savedTabName
    if (savedTabIcon) updateFavicon(savedTabIcon)
  }, [])

  // Load saved settings when component mounts
  useEffect(() => {
    const savedPresetName = localStorage.getItem("cloakedPresetName")
    const savedTabName = localStorage.getItem("cloakedTabName")
    const savedTabIcon = localStorage.getItem("cloakedTabIcon")

    if (savedPresetName) {
      const foundPreset = cloakPresets.find((preset) => preset.name === savedPresetName)
      if (foundPreset) {
        setSelectedPreset(foundPreset)
        foundPreset.name === "Custom"
          ? setTabName(savedTabName || "")
          : setTabName(foundPreset.tabName)
        setTabIcon(foundPreset.tabIcon || savedTabIcon || "")
      }
    }
  }, [cloakPresets])

  const updateFavicon = (iconUrl: string) => {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = iconUrl
    } else {
      const newFavicon = document.createElement("link")
      newFavicon.rel = "icon"
      newFavicon.href = iconUrl
      document.head.appendChild(newFavicon)
    }
  }

  const handlePresetChange = (preset: CloakPreset) => {
    setSelectedPreset(preset)
    if (preset.name !== "Custom") {
      setTabName(preset.tabName)
      setTabIcon(preset.tabIcon)
    }
    setIsDropdownOpen(false)
  }

  const updateTabAppearance = (newTabName: string, newTabIcon: string) => {
    document.title = newTabName
    updateFavicon(newTabIcon)

    localStorage.setItem("cloakedPresetName", selectedPreset.name)
    localStorage.setItem("cloakedTabName", newTabName)
    localStorage.setItem("cloakedTabIcon", newTabIcon)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTabName = selectedPreset.name === "Custom" ? tabName : selectedPreset.tabName
    const newTabIcon = selectedPreset.name === "Custom" ? tabIcon : selectedPreset.tabIcon

    updateTabAppearance(newTabName, newTabIcon)
    onClose()
  }

  const handleReset = () => {
    localStorage.removeItem("cloakedPresetName")
    localStorage.removeItem("cloakedTabName")
    localStorage.removeItem("cloakedTabIcon")

    document.title = "KittenGames"
    updateFavicon("/favicon.ico")

    setSelectedPreset(cloakPresets[0])
    setTabName(cloakPresets[0].tabName)
    setTabIcon(cloakPresets[0].tabIcon)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glassmorphism-dark rounded-global-lg p-6 w-96 shadow-2xl transform transition-all duration-300 ease-out">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Customize Tab Appearance</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="preset" className="block text-sm font-medium text-gray-300 mb-1">
              Preset
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-global-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300 flex justify-between items-center"
              >
                <div className="flex items-center gap-2">
                  {selectedPreset.tabIcon && (
                    <Image
                      src={selectedPreset.tabIcon}
                      alt={selectedPreset.name}
                      width={16}
                      height={16}
                      className="rounded-sm"
                    />
                  )}
                  <span>{selectedPreset.name}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-global-sm shadow-lg">
                  {cloakPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePresetChange(preset)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      {preset.tabIcon && (
                        <Image
                          src={preset.tabIcon}
                          alt={preset.name}
                          width={16}
                          height={16}
                          className="rounded-sm"
                        />
                      )}
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {selectedPreset.name === "Custom" && (
            <>
              <div className="mb-4">
                <label htmlFor="tabName" className="block text-sm font-medium text-gray-300 mb-1">
                  Tab Name
                </label>
                <input
                  type="text"
                  id="tabName"
                  value={tabName}
                  onChange={(e) => setTabName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-global-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  placeholder="Enter custom tab name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="tabIcon" className="block text-sm font-medium text-gray-300 mb-1">
                  Tab Icon URL
                </label>
                <input
                  type="url"
                  id="tabIcon"
                  value={tabIcon}
                  onChange={(e) => setTabIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-global-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                  placeholder="Enter icon URL"
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
            <div className="bg-gray-800 rounded-global-sm overflow-hidden">
              <div className="flex items-center space-x-2 bg-gray-900 px-3 py-2">
                <div className="flex-shrink-0 w-4 h-4 relative">
                  {(selectedPreset.name === "Custom" ? tabIcon : selectedPreset.tabIcon) && (
                    <Image
                      src={selectedPreset.name === "Custom" ? tabIcon : selectedPreset.tabIcon}
                      alt="Tab Icon"
                      fill
                      className="rounded-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
                <span className="text-sm text-white truncate flex-grow">
                  {selectedPreset.name === "Custom" ? tabName : selectedPreset.tabName}
                </span>
              </div>
              <div className="bg-gray-800 h-24 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Website Content</span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-global-sm hover:bg-purple-700 transition-colors"
            >
              Apply Changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 bg-gray-600 text-white py-2 rounded-global-sm hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}