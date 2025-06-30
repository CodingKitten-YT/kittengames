"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Check, AlertTriangle, Globe, Zap, Shield, Clock } from "lucide-react"

interface StreamingDomain {
  id: string
  name: string
  domain: string
  description: string
  speed: "fast" | "medium" | "slow"
  reliability: "high" | "medium" | "low"
  icon: React.ComponentType<{ className?: string }>
}

const streamingDomains: StreamingDomain[] = [
  {
    id: "vidsrc-xyz",
    name: "VidSrc XYZ",
    domain: "vidsrc.xyz",
    description: "Primary streaming source",
    speed: "fast",
    reliability: "high",
    icon: Globe
  },
  {
    id: "vidsrc-in",
    name: "VidSrc IN",
    domain: "vidsrc.in",
    description: "Alternative streaming source",
    speed: "fast",
    reliability: "high",
    icon: Zap
  },
  {
    id: "vidsrc-pm",
    name: "VidSrc PM",
    domain: "vidsrc.pm",
    description: "Mirror streaming source",
    speed: "medium",
    reliability: "medium",
    icon: Shield
  },
  {
    id: "vidsrc-net",
    name: "VidSrc NET",
    domain: "vidsrc.net",
    description: "Backup streaming source",
    speed: "medium",
    reliability: "medium",
    icon: Clock
  }
]

const STORAGE_KEY = "kittengames-streaming-settings"

interface StreamingSettings {
  selectedDomain: string
  autoSwitch: boolean
  showErrorHelper: boolean
}

export function getStreamingSettings(): StreamingSettings {
  if (typeof window === "undefined") {
    return {
      selectedDomain: "vidsrc-xyz",
      autoSwitch: true,
      showErrorHelper: true
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return {
      selectedDomain: "vidsrc-xyz",
      autoSwitch: true,
      showErrorHelper: true
    }
    return JSON.parse(saved)
  } catch (error) {
    console.error("Error loading streaming settings:", error)
    return {
      selectedDomain: "vidsrc-xyz",
      autoSwitch: true,
      showErrorHelper: true
    }
  }
}

export function saveStreamingSettings(settings: StreamingSettings) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function getStreamingUrl(type: 'movie' | 'tv', id: string, season?: number, episode?: number): string {
  const settings = getStreamingSettings()
  const domain = streamingDomains.find(d => d.id === settings.selectedDomain)?.domain || "vidsrc.xyz"
  
  if (type === 'movie') {
    return `https://${domain}/embed/movie/${id}?autoplay=1`
  } else {
    return `https://${domain}/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&autoplay=1&autonext=1`
  }
}

export default function StreamingSettingsPanel() {
  const [settings, setSettings] = useState<StreamingSettings>({
    selectedDomain: "vidsrc-xyz",
    autoSwitch: true,
    showErrorHelper: true
  })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [pingResults, setPingResults] = useState<Record<string, { ping: number; accessible: boolean; testing: boolean }>>({})
  const [testingAll, setTestingAll] = useState(false)

  useEffect(() => {
    const savedSettings = getStreamingSettings()
    setSettings(savedSettings)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveStreamingSettings(settings)
    }
  }, [settings, isLoaded])

  const selectedDomain = streamingDomains.find(d => d.id === settings.selectedDomain) || streamingDomains[0]

  const testDomainPing = async (domain: StreamingDomain) => {
    setPingResults(prev => ({
      ...prev,
      [domain.id]: { ...prev[domain.id], testing: true }
    }))

    try {
      const startTime = performance.now()
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(`https://${domain.domain}`, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)
      const endTime = performance.now()
      const ping = Math.round(endTime - startTime)

      setPingResults(prev => ({
        ...prev,
        [domain.id]: { ping, accessible: true, testing: false }
      }))
    } catch (error) {
      setPingResults(prev => ({
        ...prev,
        [domain.id]: { ping: -1, accessible: false, testing: false }
      }))
    }
  }

  const testAllDomains = async () => {
    setTestingAll(true)
    const promises = streamingDomains.map(domain => testDomainPing(domain))
    await Promise.all(promises)
    setTestingAll(false)
  }

  const handleDomainChange = (domainId: string) => {
    setSettings(prev => ({ ...prev, selectedDomain: domainId }))
    setIsDropdownOpen(false)
  }

  return (
    <div className="space-y-8 text-gray-100">
      {/* Domain Selection */}
      <section className="border-b border-gray-800 pb-8">
        <h3 className="text-xl font-semibold mb-2 text-white">Streaming Domain</h3>
        <p className="text-gray-400 mb-6 text-sm">
          Choose which streaming source to use for movies and TV shows. Switch domains if content isn't loading properly.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selected Domain
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-gray-900 text-gray-100 rounded-md border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 flex justify-between items-center hover:bg-gray-800 transition"
              >
                <div className="flex items-center space-x-3">
                  <selectedDomain.icon className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <div className="font-medium">{selectedDomain.name}</div>
                    <div className="text-xs text-gray-400">{selectedDomain.domain}</div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 text-purple-400 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-900 rounded-md shadow-lg border border-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">              {streamingDomains.map((domain) => {
                const pingResult = pingResults[domain.id]
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => handleDomainChange(domain.id)}
                    className="w-full px-4 py-3 text-left text-gray-100 hover:bg-gray-800 transition flex items-center justify-between border-b border-gray-800 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <domain.icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{domain.name}</div>
                        <div className="text-xs text-gray-400">{domain.domain}</div>
                        {pingResult && (
                          <div className="flex items-center space-x-2 mt-1">
                            {pingResult.testing ? (
                              <span className="text-xs text-yellow-400">Testing...</span>
                            ) : pingResult.accessible ? (
                              <span className="text-xs text-green-400">{pingResult.ping}ms</span>
                            ) : (
                              <span className="text-xs text-red-400">Unavailable</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!pingResult && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            testDomainPing(domain)
                          }}
                          className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded"
                        >
                          Test
                        </button>
                      )}
                      {settings.selectedDomain === domain.id && (
                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                )
              })}
                </div>
              )}
            </div>
          </div>

          {/* Test All Domains Button */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Test domain availability</span>
            <button
              onClick={testAllDomains}
              disabled={testingAll}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors duration-200"
            >
              {testingAll ? "Testing..." : "Test All"}
            </button>
          </div>

          {/* Current Selection Info */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <selectedDomain.icon className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="font-medium text-white">{selectedDomain.name}</h4>
                  <p className="text-sm text-gray-400">{selectedDomain.domain}</p>
                </div>
              </div>
              {pingResults[selectedDomain.id] && (
                <div className="text-right">
                  {pingResults[selectedDomain.id].testing ? (
                    <span className="text-sm text-yellow-400">Testing...</span>
                  ) : pingResults[selectedDomain.id].accessible ? (
                    <div>
                      <span className="text-sm text-green-400 font-medium">{pingResults[selectedDomain.id].ping}ms</span>
                      <p className="text-xs text-gray-400">Available</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-sm text-red-400 font-medium">Failed</span>
                      <p className="text-xs text-gray-400">Unavailable</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Settings */}
      <section className="border-b border-gray-800 pb-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Playback Options</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-750 transition-all duration-150 ease-in-out shadow-md border-2 border-gray-700 hover:border-purple-500">
            <div>
              <span className="font-medium text-sm">Auto-Switch Domains</span>
              <p className="text-xs text-gray-300 mt-0.5">
                Automatically try alternative domains when the selected one fails to load.
              </p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoSwitch}
                onChange={(e) => setSettings(prev => ({ ...prev, autoSwitch: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-750 transition-all duration-150 ease-in-out shadow-md border-2 border-gray-700 hover:border-purple-500">
            <div>
              <span className="font-medium text-sm">Show Error Helper</span>
              <p className="text-xs text-gray-300 mt-0.5">
                Display helpful messages when videos fail to load with suggestions to try different domains.
              </p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.showErrorHelper}
                onChange={(e) => setSettings(prev => ({ ...prev, showErrorHelper: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
          </label>
        </div>
      </section>

      {/* Usage Tips */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-white">Tips & Troubleshooting</h3>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-gray-300">
              <p className="font-medium text-white">If videos won't load:</p>
              <ul className="space-y-1 list-disc list-inside ml-2">
                <li>Try switching to a different domain above</li>
                <li>Check your internet connection</li>
                <li>Disable any ad blockers temporarily</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try using a different browser or incognito mode</li>
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                Different domains may have varying content availability and loading speeds depending on your location.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}