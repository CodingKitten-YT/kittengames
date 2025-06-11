"use client"

import { useState, useEffect } from "react"
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  Database,
  RefreshCw,
  Info as InfoIcon,
} from "lucide-react"

export default function GeneralSettingsPanel() {
  const [isResetting, setIsResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [storageInfo, setStorageInfo] = useState<{
    totalKeys: number
    totalSize: string
    keys: string[]
  } | null>(null)

  // Only render on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const calculateStorageInfo = () => {
    if (typeof window === 'undefined') return
    
    const keys = Object.keys(localStorage)
    let totalSize = 0
    
    keys.forEach(key => {
      const value = localStorage.getItem(key) || ''
      // Rough estimation: each character is ~2 bytes in UTF-16
      totalSize += (key.length + value.length) * 2
    })

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    setStorageInfo({
      totalKeys: keys.length,
      totalSize: formatSize(totalSize),
      keys
    })
  }

  const handleResetLocalStorage = async () => {
    if (typeof window === 'undefined') return
    
    if (!window.confirm('Are you sure you want to reset all local storage? This will clear all your settings and preferences.')) {
      return
    }

    setIsResetting(true)
    
    try {
      // Clear localStorage
      localStorage.clear()
      
      // Show success message
      setResetSuccess(true)
      setStorageInfo(null)
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error resetting localStorage:', error)
      alert('Failed to reset local storage. Please try again.')
    } finally {
      setIsResetting(false)
    }
  }

  // Don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="space-y-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="flex gap-4">
              <div className="h-10 bg-gray-700 rounded w-32"></div>
              <div className="h-10 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Local Storage Management */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Local Storage Management
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            Manage your browser's local storage data. This includes settings, preferences, and cached data.
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={calculateStorageInfo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Check Storage Info
            </button>
            
            <button
              onClick={handleResetLocalStorage}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              {isResetting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isResetting ? 'Resetting...' : 'Reset All Data'}
            </button>
          </div>

          {/* Success Message */}
          {resetSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Local storage has been successfully reset!
            </div>
          )}

          {/* Storage Info Display */}
          {storageInfo && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="font-semibold text-white mb-3">Storage Information</h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-400">Total Keys:</span>
                  <span className="text-white ml-2 font-mono">{storageInfo.totalKeys}</span>
                </div>
                <div>
                  <span className="text-gray-400">Estimated Size:</span>
                  <span className="text-white ml-2 font-mono">{storageInfo.totalSize}</span>
                </div>
              </div>
              
              {storageInfo.keys.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Stored Keys:</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {storageInfo.keys.map((key, index) => (
                      <div key={index} className="text-xs text-gray-400 font-mono py-1 px-2 hover:bg-gray-700 rounded">
                        {key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Warning:</strong> Resetting local storage will remove all your personalized settings, including cloak settings, game launch preferences, and any other saved data. This action cannot be undone.
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <InfoIcon className="w-5 h-5 text-purple-400" />
          App Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-white font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Build Date:</span>
              <span className="text-white font-mono">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User Agent:</span>
              <span className="text-white font-mono text-xs truncate max-w-48" title={typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}>
                {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'N/A'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Screen Resolution:</span>
              <span className="text-white font-mono">
                {typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Viewport Size:</span>
              <span className="text-white font-mono">
                {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time Zone:</span>
              <span className="text-white font-mono">
                {typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}