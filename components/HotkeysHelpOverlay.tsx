"use client"

import { useState, useEffect } from "react"
import { useHotkeys } from "./HotkeysSettingsPanel"
import { Keyboard, X, HelpCircle } from "lucide-react"

export default function HotkeysHelpOverlay() {
  const { settings } = useHotkeys()
  const [isVisible, setIsVisible] = useState(false)
  const [showHelpButton, setShowHelpButton] = useState(true)

  // Show/hide the help overlay with Ctrl+? or Cmd+?
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '?') {
        event.preventDefault()
        setIsVisible(!isVisible)
      }
      
      // Close on Escape
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  // Auto-hide help button after some time on game pages
  useEffect(() => {
    const gameIframe = document.getElementById('game-iframe')
    if (gameIframe) {
      const timer = setTimeout(() => {
        setShowHelpButton(false)
      }, 10000) // Hide after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  if (!settings.enabled) return null

  const enabledHotkeys = settings.hotkeys.filter(h => h.enabled)

  return (
    <>
      {/* Help Button */}
      {showHelpButton && !isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          onMouseEnter={() => setShowHelpButton(true)}
          className="fixed top-20 right-4 z-40 bg-gray-800/90 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg hover:bg-gray-700/90 transition-all duration-200 opacity-60 hover:opacity-100"
          title="Show hotkeys help (Ctrl+?)"
        >
          <Keyboard className="w-5 h-5" />
        </button>
      )}

      {/* Overlay */}
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Keyboard className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Hotkeys Help</h2>
                  <p className="text-sm text-gray-400">Available keyboard shortcuts</p>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {enabledHotkeys.length > 0 ? (
                <div className="space-y-3">
                  {enabledHotkeys.map(hotkey => (
                    <div
                      key={hotkey.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm font-mono">
                            {hotkey.keys.join(' + ')}
                          </kbd>
                        </div>
                        <div className="text-sm">
                          <div className="text-white font-medium">{hotkey.action.name}</div>
                          <div className="text-gray-400">{hotkey.description || hotkey.action.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hotkeys configured</p>
                  <p className="text-sm">Go to Settings → Hotkeys to set up shortcuts</p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Ctrl + ?</kbd> to toggle this help</p>
                  <p>• Press <kbd className="px-1 py-0.5 bg-gray-700 rounded text-xs">Escape</kbd> to close</p>
                  <p>• Hotkeys work on all pages, including inside games</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Floating hotkeys indicator for game pages
export function HotkeysIndicator() {
  const { settings } = useHotkeys()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Only show on game pages
    const isGamePage = document.getElementById('game-iframe') !== null
    setIsVisible(isGamePage && settings.enabled)
  }, [settings.enabled])

  useEffect(() => {
    // Auto-hide after 5 seconds
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible || !settings.enabled) return null

  const enabledCount = settings.hotkeys.filter(h => h.enabled).length

  return (
    <div className="fixed bottom-4 left-4 z-30 bg-gray-800/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 text-sm">
        <Keyboard className="w-4 h-4 text-purple-400" />
        <span>{enabledCount} hotkey{enabledCount !== 1 ? 's' : ''} active</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-400">Press Ctrl+? for help</span>
      </div>
    </div>
  )
}
