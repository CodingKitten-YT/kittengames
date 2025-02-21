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

const cloakPresets: CloakPreset[] = [
  {
    name: "Google Drive",
    tabName: "My Drive - Google Drive",
    tabIcon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png",
  },
  {
    name: "Google Docs",
    tabName: "Google Docs",
    tabIcon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico",
  },
  {
    name: "Microsoft Teams",
    tabName: "Microsoft Teams",
    tabIcon: "https://statics.teams.cdn.office.net/evergreen-assets/apps/teams_microsoft_32x32.png",
  },
  { name: "Zoom", tabName: "Zoom Meeting", tabIcon: "https://st1.zoom.us/zoom.ico" },
  { name: "Custom", tabName: "", tabIcon: "" },
]

export default function TabCustomizationPopup({ isOpen, onClose }: TabCustomizationPopupProps) {
  const [selectedPreset, setSelectedPreset] = useState<CloakPreset>(cloakPresets[0])
  const [tabName, setTabName] = useState("")
  const [tabIcon, setTabIcon] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const savedPresetName = localStorage.getItem("cloakedPresetName")
      const savedTabName = localStorage.getItem("cloakedTabName")
      const savedTabIcon = localStorage.getItem("cloakedTabIcon")

      if (savedPresetName) {
        const foundPreset = cloakPresets.find((preset) => preset.name === savedPresetName)
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
        setSelectedPreset(cloakPresets[cloakPresets.length - 1]) // Set to Custom
        setTabName(savedTabName)
        setTabIcon(savedTabIcon)
      } else {
        setSelectedPreset(cloakPresets[0])
        setTabName(cloakPresets[0].tabName)
        setTabIcon(cloakPresets[0].tabIcon)
      }
    }
  }, [isOpen])

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glassmorphism-dark rounded-lg p-6 w-96 shadow-2xl transform transition-all duration-300 ease-out">
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
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300 flex justify-between items-center"
              >
                {selectedPreset.name}
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 rounded-md shadow-lg">
                  {cloakPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePresetChange(preset)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-gray-600 transition-colors"
                    >
                      {preset.name}
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
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
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
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
                />
              </div>
            </>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <div className="flex items-center space-x-2 bg-gray-900 px-3 py-2">
                <div className="flex-shrink-0 w-4 h-4 relative">
                  <Image
                    src={selectedPreset.name === "Custom" ? tabIcon : selectedPreset.tabIcon}
                    alt="Tab Icon"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-sm"
                  />
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
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Apply Changes
          </button>
        </form>
      </div>
    </div>
  )
}

