"use client"

import { useState } from "react"
import { AlertTriangle, Settings, RefreshCw, ExternalLink, LucideIcon } from "lucide-react"
import { getStreamingSettings } from "./StreamingSettingsPanel"
import { useRouter } from "next/navigation"

interface StreamingErrorHelperProps {
  onRetry?: () => void
  onDomainSwitch?: (newDomain: string) => void
  type?: 'movie' | 'tv'
}

interface QuickDomain {
  id: string
  name: string
  domain: string
}

const quickDomains: QuickDomain[] = [
  { id: "vidsrc-xyz", name: "VidSrc XYZ", domain: "vidsrc.xyz" },
  { id: "vidsrc-in", name: "VidSrc IN", domain: "vidsrc.in" },
  { id: "vidsrc-pm", name: "VidSrc PM", domain: "vidsrc.pm" },
  { id: "vidsrc-net", name: "VidSrc NET", domain: "vidsrc.net" },
]

export default function StreamingErrorHelper({ onRetry, onDomainSwitch, type = 'movie' }: StreamingErrorHelperProps) {
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()
  const settings = getStreamingSettings()

  if (!isVisible || !settings.showErrorHelper) {
    return null
  }

  const handleQuickSwitch = (domainId: string) => {
    // Save the new domain setting
    const newSettings = { ...settings, selectedDomain: domainId }
    if (typeof window !== "undefined") {
      localStorage.setItem("kittengames-streaming-settings", JSON.stringify(newSettings))
    }
    
    // Notify parent component
    if (onDomainSwitch) {
      onDomainSwitch(domainId)
    }
    
    // Retry loading
    if (onRetry) {
      onRetry()
    }
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-yellow-400 mb-1">
            {type === 'movie' ? 'Movie' : 'Episode'} Not Loading?
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            This could be due to the streaming source being unavailable. Try switching to a different domain or refreshing.
          </p>
          
          {/* Quick Domain Switch */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-2">Quick switch to:</p>
              <div className="flex flex-wrap gap-2">
                {quickDomains
                  .filter(domain => domain.id !== settings.selectedDomain)
                  .slice(0, 2)
                  .map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => handleQuickSwitch(domain.id)}
                    className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 text-xs rounded-md border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-200 flex items-center space-x-1"
                  >
                    <span>{domain.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-md transition-colors duration-200 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
              
              <button
                onClick={() => router.push('/settings?tab=streaming')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md transition-colors duration-200 flex items-center space-x-1"
              >
                <Settings className="w-3 h-3" />
                <span>More Options</span>
              </button>
              
              <button
                onClick={() => setIsVisible(false)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-md transition-colors duration-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}