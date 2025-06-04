"use client"

import { useHotkeys } from "../hooks/useHotkeys"
import type React from "react"

interface HotkeyProviderProps {
  children: React.ReactNode
}

export default function HotkeyProvider({ children }: HotkeyProviderProps) {
  useHotkeys() // This will handle all hotkey functionality
  
  return <>{children}</>
}