"use client"

import { useEffect, useCallback } from "react"

interface Hotkey {
  id: string
  key: string
  modifiers: string[]
  action: "redirect" | "newTab" | "javascript"
  url?: string
  script?: string
  attributes?: Record<string, any>
  name: string
  enabled: boolean
}

export function useHotkeys() {
  const executeHotkey = useCallback((hotkey: Hotkey) => {
    try {
      switch (hotkey.action) {
        case "redirect":
          if (hotkey.url) {
            window.location.href = hotkey.url
          }
          break
        case "newTab":
          if (hotkey.url) {
            window.open(hotkey.url, "_blank")
          }
          break
        case "javascript":
          if (hotkey.script) {
            // Create a safe execution context with attributes support
            const context = {
              attributes: hotkey.attributes || {},
              console: console,
              window: window,
              document: document
            }
            const safeEval = new Function('attributes', 'console', 'window', 'document', hotkey.script)
            safeEval(context.attributes, context.console, context.window, context.document)
          }
          break
      }
    } catch (error) {
      console.error(`Failed to execute hotkey "${hotkey.name}":`, error)
    }
  }, [])

  // Convert hotkey format to key sequence for matching
  const hotkeyToKeySequence = useCallback((hotkey: Hotkey) => {
    const sequence = []
    
    // Add modifiers first in a specific order
    if (hotkey.modifiers.includes("ctrl")) sequence.push("Control")
    if (hotkey.modifiers.includes("alt")) sequence.push("Alt") 
    if (hotkey.modifiers.includes("shift")) sequence.push("Shift")
    if (hotkey.modifiers.includes("meta")) sequence.push("Meta")
    
    // Add the main key
    let key = hotkey.key
    if (key === "Space") key = " "
    sequence.push(key)
    
    return sequence
  }, [])

  useEffect(() => {
    let pressedKeys: string[] = []

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore hotkeys when user is typing in input fields (but allow iframes)
      const activeElement = document.activeElement
      if (activeElement && activeElement.tagName !== 'IFRAME' && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        (activeElement as HTMLElement).contentEditable === 'true'
      )) {
        return
      }

      // Add the pressed key to our sequence
      pressedKeys.push(event.key)

      // Load hotkeys from localStorage
      const saved = localStorage.getItem("kittengames-hotkeys")
      if (!saved) return

      let hotkeys: Hotkey[]
      try {
        hotkeys = JSON.parse(saved)
      } catch (e) {
        console.error("Failed to parse hotkeys:", e)
        return
      }

      // Check each hotkey to see if we have a match
      for (const hotkey of hotkeys) {
        if (!hotkey.enabled) continue

        const keySequence = hotkeyToKeySequence(hotkey)
        
        // Keep only the last N keys where N is the length of the longest hotkey sequence
        const maxLength = Math.max(...hotkeys.map(h => hotkeyToKeySequence(h).length))
        if (pressedKeys.length > maxLength) {
          pressedKeys = pressedKeys.slice(-maxLength)
        }

        // Check if the last keys match this hotkey sequence
        if (pressedKeys.length >= keySequence.length) {
          const recentKeys = pressedKeys.slice(-keySequence.length)
          if (keySequence.every((key, index) => key === recentKeys[index])) {
            event.preventDefault()
            executeHotkey(hotkey)
            pressedKeys = [] // Reset after successful match
            return
          }
        }
      }
    }

    // Use window listener with capture to catch iframe events
    window.addEventListener("keydown", handleKeyDown, true)

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [executeHotkey, hotkeyToKeySequence])
}