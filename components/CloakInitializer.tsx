"use client"

import { useEffect } from "react"

export default function CloakInitializer() {
  useEffect(() => {
    const savedTabName = localStorage.getItem("cloakedTabName")
    const savedTabIcon = localStorage.getItem("cloakedTabIcon")
    
    if (savedTabName) document.title = savedTabName
    if (savedTabIcon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement("link") as HTMLLinkElement
      favicon.rel = "icon"
      favicon.href = savedTabIcon
      document.head.appendChild(favicon)
    }
  }, [])

  return null
}