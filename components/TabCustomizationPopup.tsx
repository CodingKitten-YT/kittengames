"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, Check } from "lucide-react"
import Image from "next/legacy/image"
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
  const [presets, setPresets] = useState<CloakPreset[]>([
    {
      name: "Google Drive",
      tabName: "My Drive - Google Drive",
      tabIcon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png",
    },
  ])
  const [selectedPreset, setSelectedPreset] = useState<CloakPreset | null>(null)
  const [tabName, setTabName] = useState("")
  const [tabIcon, setTabIcon] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load presets from GitHub JSON
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          "https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/presets.json"
        )
        if (!response.ok) {
          throw new Error("Failed to fetch presets")
        }
        const data = await response.json()
        
        // Ensure Custom option is always available
        const presetsWithCustom = [...data]
        if (!presetsWithCustom.find(preset => preset.name === "Custom")) {
          presetsWithCustom.push({ name: "Custom", tabName: "", tabIcon: "" })
        }
        
        setPresets(presetsWithCustom)
        // Set default selection to first preset
        if (presetsWithCustom.length > 0 && !selectedPreset) {
          setSelectedPreset(presetsWithCustom[0])
          setTabName(presetsWithCustom[0].tabName)
          setTabIcon(presetsWithCustom[0].tabIcon)
        }
      } catch (error) {
        console.error("Error loading presets:", error)
        // Fallback to ensure at least Custom option is available
        const fallbackPresets = [
          {
            name: "Google Drive",
            tabName: "My Drive - Google Drive",
            tabIcon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png",
          },
          { name: "Custom", tabName: "", tabIcon: "" }
        ]
        setPresets(fallbackPresets)
        if (!selectedPreset) {
          setSelectedPreset(fallbackPresets[0])
          setTabName(fallbackPresets[0].tabName)
          setTabIcon(fallbackPresets[0].tabIcon)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchPresets()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && !isLoading && selectedPreset) {
      const savedPresetName = localStorage.getItem("cloakedPresetName")
      const savedTabName = localStorage.getItem("cloakedTabName")
      const savedTabIcon = localStorage.getItem("cloakedTabIcon")

      if (savedPresetName) {
        const foundPreset = presets.find((preset) => preset.name === savedPresetName)
        if (foundPreset) {
          setSelectedPreset(foundPreset)
          if (foundPreset.name === "Custom") {
            setTabName(savedTabName || "")
            setTabIcon(savedTabIcon || "")
          } else {
            setTabName(foundPreset.tabName)
            setTabIcon(foundPreset.tabIcon)
          }
        }
      } else if (savedTabName && savedTabIcon) {
        const customPreset = presets.find(preset => preset.name === "Custom")
        if (customPreset) {
          setSelectedPreset(customPreset)
          setTabName(savedTabName)
          setTabIcon(savedTabIcon)
        }
      }
    }
  }, [isOpen, isLoading, presets])

  const handlePresetChange = (preset: CloakPreset) => {
    setSelectedPreset(preset)
    if (preset.name !== "Custom") {
      setTabName(preset.tabName)
      setTabIcon(preset.tabIcon)
    }
    setIsDropdownOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPreset) return
    
    const newTabName = selectedPreset.name === "Custom" ? tabName : selectedPreset.tabName
    const newTabIcon = selectedPreset.name === "Custom" ? tabIcon : selectedPreset.tabIcon

    document.title = newTabName
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
    if (favicon) {
      favicon.href = newTabIcon
    } else {
      const newFavicon = document.createElement("link")
      newFavicon.rel = "icon"
      newFavicon.href = newTabIcon
      document.head.appendChild(newFavicon)
    }
    localStorage.setItem("cloakedPresetName", selectedPreset.name)
    localStorage.setItem("cloakedTabName", newTabName)
    localStorage.setItem("cloakedTabIcon", newTabIcon)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden p-6 w-96 shadow-2xl border border-gray-700/50 transform transition-all duration-300 ease-out">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Customize Tab Appearance
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-xl hover:bg-gray-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-white flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-xl animate-spin mb-2"></div>
            <span>Loading presets...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="preset" className="block text-sm font-medium text-gray-300 mb-2">
                Preset
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 border border-gray-700/50 transition-all duration-300 flex justify-between items-center hover:bg-gray-700/50"
                >
                  <div className="flex items-center space-x-3">
                    {selectedPreset?.tabIcon && selectedPreset.name !== "Custom" ? (
                      <div className="flex-shrink-0 w-5 h-5 relative">
                        <Image
                          src={selectedPreset.tabIcon}
                          alt={selectedPreset.name}
                          layout="fill"
                          objectFit="contain"
                          className="rounded-sm"
                        />
                      </div>
                    ) : selectedPreset?.name === "Custom" ? (
                      <div className="w-5 h-5 bg-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-white">C</span>
                      </div>
                    ) : null}
                    <span>{selectedPreset?.name || "Select a preset"}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform duration-300 text-purple-400 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg overflow-hidden shadow-lg max-h-60 overflow-y-auto border border-gray-700/50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetChange(preset)}
                        className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/70 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          {preset.tabIcon && preset.name !== "Custom" ? (
                            <div className="flex-shrink-0 w-5 h-5 relative">
                              <Image
                                src={preset.tabIcon}
                                alt={preset.name}
                                layout="fill"
                                objectFit="contain"
                                className="rounded-sm"
                              />
                            </div>
                          ) : preset.name === "Custom" ? (
                            <div className="w-5 h-5 bg-purple-600 rounded-xl flex items-center justify-center">
                              <span className="text-xs text-white">C</span>
                            </div>
                          ) : null}
                          <span>{preset.name}</span>
                        </div>
                        {selectedPreset?.name === preset.name && (
                          <Check className="w-4 h-4 text-purple-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedPreset?.name === "Custom" && (
              <>
                <div>
                  <label htmlFor="tabName" className="block text-sm font-medium text-gray-300 mb-2">
                    Tab Name
                  </label>
                  <input
                    type="text"
                    id="tabName"
                    value={tabName}
                    onChange={(e) => setTabName(e.target.value)}
                    placeholder="Enter custom tab name"
                    className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 border border-gray-700/50 transition-all duration-300 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="tabIcon" className="block text-sm font-medium text-gray-300 mb-2">
                    Tab Icon URL
                  </label>
                  <input
                    type="url"
                    id="tabIcon"
                    value={tabIcon}
                    onChange={(e) => setTabIcon(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    className="w-full px-4 py-3 bg-gray-800/80 text-white rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 border border-gray-700/50 transition-all duration-300 placeholder-gray-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
              <div className="bg-gray-800/60 rounded-lg overflow-hidden border border-gray-700/50">
                <div className="flex items-center space-x-3 bg-gray-900/80 px-4 py-3">
                  {tabIcon ? (
                    <div className="flex-shrink-0 w-4 h-4 relative">
                      <Image
                        src={tabIcon}
                        alt="Tab Icon"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-sm"
                      />
                    </div>
                  ) : (
                    <div className="w-4 h-4 bg-gray-700 rounded-sm"></div>
                  )}
                  <span className="text-sm text-white truncate flex-grow">
                    {tabName || "Tab Title"}
                  </span>
                </div>
                <div className="bg-gray-800/60 h-28 flex items-center justify-center p-4">
                  <div className="text-gray-400 text-sm text-center">
                    <p>Website Content</p>
                    <p className="text-xs mt-2 text-gray-500">The tab will appear like this in your browser</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg overflow-hidden hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transform hover:translate-y-px active:translate-y-0.5"
            >
              Apply Changes
            </button>
          </form>
        )}
      </div>
    </div>
  )
}