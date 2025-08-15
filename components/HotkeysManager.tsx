"use client"

import { useEffect } from "react"
import { useHotkeys, type Hotkey, type HotkeyAction } from "./HotkeysSettingsPanel"
import { useRouter } from "next/navigation"

function executeAction(action: HotkeyAction, router: any) {
  switch (action.type) {
    case 'redirect':
      if (action.data?.url) {
        if (action.data.url.startsWith('http')) {
          window.location.href = action.data.url
        } else {
          router.push(action.data.url)
        }
      }
      break
      
    case 'refresh':
      window.location.reload()
      break
      
    case 'back':
      router.back()
      break
      
    case 'forward':
      router.forward()
      break
      
    case 'fullscreen':
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        document.documentElement.requestFullscreen()
      }
      break
      
    case 'escape':
      // If we're in a game (iframe present), go back
      const gameIframe = document.getElementById('game-iframe')
      if (gameIframe) {
        router.back()
      }
      break
      
    case 'close-tab':
      window.close()
      break
      
    case 'new-tab':
      window.open(window.location.href, '_blank')
      break
  }
}

function normalizeKey(key: string): string {
  // Normalize key names to match common conventions
  const keyMap: { [key: string]: string } = {
    ' ': 'Space',
    'Control': 'Ctrl',
    'Meta': 'Cmd'
  }
  
  return keyMap[key] || key
}

function keysMatch(hotkey: string[], pressed: string[]): boolean {
  if (hotkey.length !== pressed.length) return false
  
  const normalizedHotkey = hotkey.map(normalizeKey).sort()
  const normalizedPressed = pressed.map(normalizeKey).sort()
  
  return normalizedHotkey.every((key, index) => key === normalizedPressed[index])
}

export default function HotkeysManager() {
  const { settings } = useHotkeys()
  const router = useRouter()

  useEffect(() => {
    if (!settings.enabled || settings.hotkeys.length === 0) return

    const pressedKeys = new Set<string>()
    let keySequence: string[] = []

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.contentEditable === 'true'
      ) {
        return
      }

      const key = normalizeKey(event.key)
      
      // Add to pressed keys
      pressedKeys.add(key)
      
      // Update sequence
      keySequence = Array.from(pressedKeys)
      
      // Check for hotkey matches
      const matchingHotkey = settings.hotkeys.find(hotkey => 
        hotkey.enabled && keysMatch(hotkey.keys, keySequence)
      )

      if (matchingHotkey) {
        event.preventDefault()
        event.stopPropagation()
        
        // Execute the action
        executeAction(matchingHotkey.action, router)
        
        // Clear the sequence
        pressedKeys.clear()
        keySequence = []
        
        return
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key)
      pressedKeys.delete(key)
      
      // If no keys are pressed, clear the sequence
      if (pressedKeys.size === 0) {
        keySequence = []
      }
    }

    // Handle focus loss (clear pressed keys)
    const handleBlur = () => {
      pressedKeys.clear()
      keySequence = []
    }

    // Handle messages from iframe (hotkeys-helper.js)
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return

      // Handle hotkey requests from iframe
      if (event.data.type === 'kittengames-hotkey-request') {
        // Send hotkeys config to iframe
        const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement
        if (gameIframe && gameIframe.contentWindow && event.source === gameIframe.contentWindow) {
          const configMessage = {
            type: 'kittengames-hotkey-config',
            hotkeys: settings.hotkeys,
            enabled: settings.enabled
          }
          gameIframe.contentWindow.postMessage(configMessage, '*')
        }
        return
      }

      // Handle hotkey pressed from iframe
      if (event.data.type === 'kittengames-hotkey' && event.data.hotkey) {
        // Execute the action from iframe hotkey
        executeAction(event.data.hotkey.action, router)
        return
      }
    }

    // Listen on both document and window for maximum coverage
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    document.addEventListener('keyup', handleKeyUp, { capture: true })
    window.addEventListener('blur', handleBlur)
    window.addEventListener('message', handleMessage)
    
    // Send config to iframe when it loads
    const handleIframeLoad = () => {
      const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement
      if (gameIframe && gameIframe.contentWindow) {
        // Send initial config
        setTimeout(() => {
          const configMessage = {
            type: 'kittengames-hotkey-config',
            hotkeys: settings.hotkeys,
            enabled: settings.enabled
          }
          if (gameIframe.contentWindow) {
            gameIframe.contentWindow.postMessage(configMessage, '*')
          }
        }, 100) // Small delay to ensure iframe is ready
        
        // Also try to add direct listeners for same-origin iframes
        try {
          const iframeDoc = gameIframe.contentDocument || gameIframe.contentWindow.document
          if (iframeDoc) {
            iframeDoc.addEventListener('keydown', handleKeyDown, { capture: true })
            iframeDoc.addEventListener('keyup', handleKeyUp, { capture: true })
          }
        } catch (e) {
          // Cross-origin iframe, will use postMessage instead
          console.debug('Using postMessage for cross-origin iframe hotkeys')
        }
      }
    }

    // Set up iframe event listeners when iframe loads
    const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement
    if (gameIframe) {
      gameIframe.addEventListener('load', handleIframeLoad)
      // If already loaded, trigger immediately
      if (gameIframe.contentWindow) {
        handleIframeLoad()
      }
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      document.removeEventListener('keyup', handleKeyUp, { capture: true })
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('message', handleMessage)
      
      if (gameIframe) {
        gameIframe.removeEventListener('load', handleIframeLoad)
      }
    }
  }, [settings, router])

  // This component doesn't render anything
  return null
}

// Hook for components that want to manually trigger hotkey actions
export function useHotkeyActions() {
  const { settings } = useHotkeys()
  const router = useRouter()

  const triggerAction = (actionId: string) => {
    const action = settings.actions.find(a => a.id === actionId)
    if (action) {
      executeAction(action, router)
    }
  }

  const getAction = (actionId: string) => {
    return settings.actions.find(a => a.id === actionId)
  }

  return {
    triggerAction,
    getAction,
    actions: settings.actions
  }
}

// Component to display current hotkey status (optional debug component)
export function HotkeysStatus() {
  const { settings } = useHotkeys()
  
  if (!settings.enabled) return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-xs opacity-50 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        <span>Hotkeys: {settings.hotkeys.filter(h => h.enabled).length} active</span>
      </div>
    </div>
  )
}
