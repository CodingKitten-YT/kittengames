"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import GameFrame from "../../../components/GameFrame"
import Header from "../../../components/Header"
import SaveLoadModal from "../../../components/SaveLoadModal"
import { decodeGameSlug } from "../../../utils/rot13"
import { useGameLaunchSettings } from "../../../components/GameLaunchSettingsPanel"

export default function PlayGame() {
  const params = useParams()
  const router = useRouter()
  const encodedSlug = (params?.slug as string) || ''
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  
  const { confirmClose } = useGameLaunchSettings()

  // Decode the ROT13 encoded slug to get the original game slug
  const decodedSlug = decodeGameSlug(encodedSlug)

  const handleBackClick = () => {
    if (confirmClose) {
      if (window.confirm("Are you sure you want to return to the main page? Your game progress might be lost.")) {
        router.push("/") // Navigate back to the games page
      }
    } else {
      router.push("/") // Navigate back to the games page
    }
  }

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  const handleSave = () => {
    setIsSaveModalOpen(true)
  }

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const message = "Are you sure you want to leave? Game progress might be lost.";
      event.preventDefault();
      event.returnValue = message; // For older browsers
      return message; // For some modern browsers
    };

    if (confirmClose) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (confirmClose) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [confirmClose]); // Re-run effect if confirmClose changes

  return (
    <div className="relative">
      <Header 
        currentPage="games"
        isCompact={true}
        onBackClick={handleBackClick}
        onFullscreen={handleFullscreen}
        onSave={handleSave}
      />
      <GameFrame slug={decodedSlug} />
      
      <SaveLoadModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
    </div>
  )
}
