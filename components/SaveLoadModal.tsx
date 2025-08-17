"use client"

import React, { useState, useRef } from "react"
import { X, Save, Upload, Download, FileText, Clock, AlertTriangle } from "lucide-react"

interface SaveLoadModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SaveMetadata {
  scope: 'allgames'
  timestamp: number
  date: string
  version: string
  userAgent: string
  url: string
}

interface KGSaveFile {
  metadata: SaveMetadata
  gameData: {
    localStorage: Record<string, string>
    cookies: Record<string, string>
    indexedDB: Record<string, any>
    timestamp: number
    userAgent: string
    url: string
  }
}

export default function SaveLoadModal({ isOpen, onClose }: SaveLoadModalProps) {
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save')
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsProcessing(true)
    setError('')
    setStatus('Extracting game data...')

    try {
      // Request game data from iframe
      const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement
      if (!gameIframe || !gameIframe.contentWindow) {
        throw new Error('Game iframe not found')
      }

      // Send extract request
      gameIframe.contentWindow.postMessage({
        type: 'kittengames-save-extract'
      }, '*')

      // Listen for response
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'kittengames-save-data') {
          window.removeEventListener('message', handleMessage)
          
          const gameData = event.data.gameData
          const now = new Date()
          
          const saveFile: KGSaveFile = {
            metadata: {
              scope: 'allgames',
              timestamp: now.getTime(),
              date: now.toISOString(),
              version: '1.0.0',
              userAgent: navigator.userAgent,
              url: window.location.href
            },
            gameData
          }

          // Random kitten comments
          const kittenComments = [
            '// Nice try, but the kittens already thought of this.',
            '// Ah, so you peeked behind the curtain. Clever.',
            '// Hah! You thought you found a secret. You did.',
            '// Clever human detected. Proceed with mischief.'
          ]
          
          const randomComment = kittenComments[Math.floor(Math.random() * kittenComments.length)]
          const jsonContent = JSON.stringify(saveFile, null, 2)
          const fileContent = `${randomComment}\n${jsonContent}`

          // Create and download file
          const blob = new Blob([fileContent], {
            type: 'application/json'
          })
          
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `allgames-${now.toISOString().slice(0, 19).replace(/[:.]/g, '-')}.kgsave`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          setStatus('Save file downloaded successfully!')
          setIsProcessing(false)
          
          setTimeout(() => {
            onClose()
          }, 2000)
        }
        
        if (event.data?.type === 'kittengames-save-error') {
          window.removeEventListener('message', handleMessage)
          setError(`Failed to extract game data: ${event.data.error}`)
          setIsProcessing(false)
        }
      }

      window.addEventListener('message', handleMessage)

      // Timeout after 10 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleMessage)
        if (isProcessing) {
          setError('Timeout waiting for game data')
          setIsProcessing(false)
        }
      }, 10000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save game')
      setIsProcessing(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.kgsave')) {
      setError('Please select a valid .kgsave file')
      return
    }

    setIsProcessing(true)
    setError('')
    setStatus('Reading save file...')

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        
        // Strip any comment lines that start with //
        const jsonContent = content
          .split('\n')
          .filter(line => !line.trim().startsWith('//'))
          .join('\n')
        
        const saveFile: KGSaveFile = JSON.parse(jsonContent)

        // Validate save file structure
        if (!saveFile.metadata || !saveFile.gameData) {
          throw new Error('Invalid save file format')
        }

        // Check if save file is for all games
        if (saveFile.metadata.scope !== 'allgames') {
          throw new Error('This save file is not compatible. Only allgames saves are supported.')
        }

        setStatus('Restoring game data...')

        // Send restore request to iframe
        const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement
        if (!gameIframe || !gameIframe.contentWindow) {
          throw new Error('Game iframe not found')
        }

        gameIframe.contentWindow.postMessage({
          type: 'kittengames-save-restore',
          gameData: saveFile.gameData
        }, '*')

        // Listen for completion/error
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'kittengames-save-error') {
            window.removeEventListener('message', handleMessage)
            setError(`Failed to restore game data: ${event.data.error}`)
            setIsProcessing(false)
          }
        }

        window.addEventListener('message', handleMessage)

        setStatus('Game data restored! The game will reload...')
        setIsProcessing(false)
        
        // The game iframe will reload itself after restoring data
        setTimeout(() => {
          window.removeEventListener('message', handleMessage)
          onClose()
        }, 3000)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load save file')
        setIsProcessing(false)
      }
    }

    reader.onerror = () => {
      setError('Failed to read save file')
      setIsProcessing(false)
    }

    reader.readAsText(file)
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Save className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Save/Load All Games</h2>
              <p className="text-sm text-gray-400">This will save or load progress for <b>all games</b> on this site.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('save')}
            disabled={isProcessing}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors disabled:opacity-50 ${
              activeTab === 'save'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Save Game
          </button>
          <button
            onClick={() => setActiveTab('load')}
            disabled={isProcessing}
            className={`flex-1 px-4 py-3 font-medium text-sm transition-colors disabled:opacity-50 ${
              activeTab === 'load'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Load Game
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-white font-medium mb-2">Create Save File</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Export all your game progress including localStorage, cookies, and IndexedDB data
                </p>
                
                <div className="bg-gray-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Save will include current date and time</span>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Create Save File
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'load' && (
            <div className="space-y-4">
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <h3 className="text-white font-medium mb-2">Load Save File</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Restore your game progress from a .kgsave file
                </p>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2 text-xs text-amber-400">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>This will overwrite your current game progress</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".kgsave"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  onClick={handleLoadClick}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Select Save File
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Status/Error Messages */}
          {status && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">{status}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
