"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="glassmorphism-dark rounded-lg p-6 w-96 shadow-2xl transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Audio Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-300">Master Volume</label>
              <button
                onClick={onMuteToggle}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isMuted ? "Unmute" : "Mute"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onMuteToggle} className="text-gray-400 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <Slider
                value={[volume]}
                onValueChange={(values) => onVolumeChange(values[0])}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-gray-300 min-w-[3ch]">{volume}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Tips</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Click the volume icon in the navbar to quickly mute/unmute</li>
              <li>• Use the slider to adjust the master volume</li>
              <li>• Settings are saved automatically</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AudioControls() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)

  useEffect(() => {
    // Load saved settings
    const savedVolume = localStorage.getItem("kittengames-volume")
    const savedMuted = localStorage.getItem("kittengames-muted")

    if (savedVolume) setVolume(Number.parseInt(savedVolume))
    if (savedMuted) setIsMuted(savedMuted === "true")
  }, [])

  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const gainNode = audioContext.createGain()
    gainNode.connect(audioContext.destination)

    const updateAudio = () => {
      gainNode.gain.setValueAtTime(isMuted ? 0 : volume / 100, audioContext.currentTime)
    }

    updateAudio()

    // Save settings
    localStorage.setItem("kittengames-volume", volume.toString())
    localStorage.setItem("kittengames-muted", isMuted.toString())

    return () => {
      audioContext.close()
    }
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
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-white hover:text-purple-400 transition-colors duration-300"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <AudioControlsPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onMuteToggle={toggleMute}
      />
    </>
  )
}

