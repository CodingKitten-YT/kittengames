"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import Image from "next/legacy/image"

interface CloakPreset {
  name: string
  tabName: string
  tabIcon: string
}

export default function CloakSettingsPanel() {
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

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          "https://raw.githubusercontent.com/CodingKitten-YT/KittenGames-gamelibrary/refs/heads/main/presets.json"
        )
        if (!response.ok) throw new Error("Failed to fetch presets")
        const data = await response.json()
        const presetsWithCustom = [...data]
        if (!presetsWithCustom.find(preset => preset.name === "Custom")) {
          presetsWithCustom.push({ name: "Custom", tabName: "", tabIcon: "" })
        }
        setPresets(presetsWithCustom)
        if (presetsWithCustom.length > 0 && !selectedPreset) {
          setSelectedPreset(presetsWithCustom[0])
          setTabName(presetsWithCustom[0].tabName)
          setTabIcon(presetsWithCustom[0].tabIcon)
        }
      } catch (error) {
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
    fetchPresets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLoading && selectedPreset) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, presets])

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
  }

  return (
    <section className="border-b border-gray-800 pb-8 mb-8">
      <h3 className="text-xl font-semibold mb-2 text-white">Tab Cloaking</h3>
      <p className="text-gray-400 mb-6 text-sm">
        Change how this tab appears in your browser. Choose a preset or customize the tab name and icon.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="preset" className="block text-sm font-medium text-gray-300 mb-2">
            Preset
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2 bg-gray-900 text-gray-100 rounded-md border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 flex justify-between items-center hover:bg-gray-800 transition"
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
                  <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
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
              <div className="absolute z-10 w-full mt-1 bg-gray-900 rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetChange(preset)}
                    className="w-full px-4 py-2 text-left text-gray-100 hover:bg-gray-800 transition flex items-center justify-between"
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
                        <div className="w-5 h-5 bg-purple-600 rounded flex items-center justify-center">
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
                className="w-full px-4 py-2 bg-gray-900 text-gray-100 rounded-md border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
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
                className="w-full px-4 py-2 bg-gray-900 text-gray-100 rounded-md border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Preview</label>
          <div className="bg-gray-900 rounded-md border border-gray-800">
            <div className="flex items-center space-x-3 bg-gray-950 px-4 py-2">
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
            <div className="bg-gray-900 h-20 flex items-center justify-center p-4">
              <div className="text-gray-400 text-xs text-center">
                <p>Website Content</p>
                <p className="mt-1 text-gray-500">The tab will appear like this in your browser</p>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-fit bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition"
        >
          Apply Changes
        </button>
      </form>
    </section>
  )
}