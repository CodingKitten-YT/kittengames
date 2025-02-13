"use client"

import { Volume2, VolumeX } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"

interface AudioControlsPopupProps {
  isOpen: boolean
  onClose: () => void
  volume: number
  onVolumeChange: (value: number) => void
  isMuted: boolean
  onMuteToggle: () => void
}

function AudioControlsPopup({
  isOpen,
  onClose,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
}: AudioControlsPopupProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="glassmorphism-dark rounded-global p-6 w-[90%] max-w-md shadow-2xl transform transition-all duration-300 ease-out scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Audio Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            ✖
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Master Volume</label>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={onMuteToggle} className="text-gray-400 hover:text-white transition-all duration-200">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>

              <div className="relative flex-1">
                {/* Slider background */}
                <div className="slider-background"></div>
                {/* Slider progress */}
                <div
                  className="slider-progress"
                  style={{ width: `${volume}%` }}
                ></div>
                {/* Slider input */}
                <Slider
                  value={[volume]}
                  onValueChange={(values) => onVolumeChange(values[0])}
                  max={100}
                  step={1}
                  className="flex-1 volume-slider"
                />
              </div>

              <span className="text-sm text-gray-300 min-w-[3ch]">{volume}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AudioControls({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)

  useEffect(() => {
    const savedVolume = localStorage.getItem("kittengames-volume")
    const savedMuted = localStorage.getItem("kittengames-muted")

    if (savedVolume) setVolume(Number.parseInt(savedVolume))
    if (savedMuted) setIsMuted(savedMuted === "true")
  }, [])

  useEffect(() => {
    localStorage.setItem("kittengames-volume", volume.toString())
    localStorage.setItem("kittengames-muted", isMuted.toString())
  }, [isMuted, volume])

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <AudioControlsPopup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      volume={volume}
      onVolumeChange={handleVolumeChange}
      isMuted={isMuted}
      onMuteToggle={toggleMute}
    />
  )
}