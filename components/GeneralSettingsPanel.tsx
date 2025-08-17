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
    localStorage: {
      totalKeys: number
      totalSize: string
      keys: string[]
    }
    indexedDB: {
      databases: string[]
      totalSize: string
    }
    cookies: {
      totalCookies: number
      totalSize: string
      cookies: string[]
    }
  } | null>(null)

  // Only render on client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const calculateStorageInfo = async () => {
    if (typeof window === 'undefined') return
    
    // Calculate localStorage info
    const localStorageKeys = Object.keys(localStorage)
    let localStorageSize = 0
    
    localStorageKeys.forEach(key => {
      const value = localStorage.getItem(key) || ''
      // Rough estimation: each character is ~2 bytes in UTF-16
      localStorageSize += (key.length + value.length) * 2
    })

    // Calculate IndexedDB info
    let indexedDBInfo: { databases: string[], totalSize: string } = { databases: [], totalSize: '0 B' }
    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases()
        indexedDBInfo.databases = databases.map(db => db.name || 'Unknown')
        // Note: Getting actual size of IndexedDB is complex and not standardized
        indexedDBInfo.totalSize = databases.length > 0 ? 'Unknown' : '0 B'
      }
    } catch (error) {
      console.warn('Could not access IndexedDB:', error)
    }

    // Calculate cookies info
    const cookiesString = document.cookie
    const cookieArray = cookiesString ? cookiesString.split(';').map(c => c.trim().split('=')[0]) : []
    const cookiesSize = cookiesString.length * 2 // Rough estimation

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    setStorageInfo({
      localStorage: {
        totalKeys: localStorageKeys.length,
        totalSize: formatSize(localStorageSize),
        keys: localStorageKeys
      },
      indexedDB: indexedDBInfo,
      cookies: {
        totalCookies: cookieArray.length,
        totalSize: formatSize(cookiesSize),
        cookies: cookieArray
      }
    })
  }

  const handleResetLocalStorage = async () => {
    if (typeof window === 'undefined') return
    
    if (!window.confirm('Are you sure you want to reset local storage? This will clear all your settings and preferences.')) {
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

  const handleClearIndexedDB = async () => {
    if (typeof window === 'undefined') return
    
    if (!window.confirm('Are you sure you want to clear all IndexedDB databases? This action cannot be undone.')) {
      return
    }

    try {
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases()
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        }
        alert('IndexedDB databases cleared successfully!')
        setStorageInfo(null)
      }
    } catch (error) {
      console.error('Error clearing IndexedDB:', error)
      alert('Failed to clear IndexedDB. Please try again.')
    }
  }

  const handleClearCookies = () => {
    if (typeof window === 'undefined') return
    
    if (!window.confirm('Are you sure you want to clear all cookies? This will log you out of most websites.')) {
      return
    }

    try {
      // Clear all cookies for this domain
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
      }
      alert('Cookies cleared successfully!')
      setStorageInfo(null)
    } catch (error) {
      console.error('Error clearing cookies:', error)
      alert('Failed to clear cookies. Please try again.')
    }
  }

  const handleClearAllStorage = async () => {
    if (typeof window === 'undefined') return
    
    if (!window.confirm('Are you sure you want to clear ALL storage data? This includes localStorage, IndexedDB, and cookies. This action cannot be undone.')) {
      return
    }

    setIsResetting(true)
    
    try {
      // Clear localStorage
      localStorage.clear()
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases()
        for (const db of databases) {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
          }
        }
      }
      
      // Clear cookies
      const cookies = document.cookie.split(';')
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
      }
      
      // Show success message
      setResetSuccess(true)
      setStorageInfo(null)
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setResetSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Error clearing all storage:', error)
      alert('Failed to clear all storage data. Please try again.')
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
      {/* Storage Management */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Storage Management
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            Manage your browser's storage data including localStorage, IndexedDB, and cookies.
          </p>
          
          <div className="flex flex-wrap gap-3">
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
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear localStorage
            </button>

            <button
              onClick={handleClearIndexedDB}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear IndexedDB
            </button>

            <button
              onClick={handleClearCookies}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cookies
            </button>
            
            <button
              onClick={handleClearAllStorage}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              {isResetting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isResetting ? 'Clearing...' : 'Clear All Storage'}
            </button>
          </div>

          {/* Success Message */}
          {resetSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Storage has been successfully cleared!
            </div>
          )}

          {/* Storage Info Display */}
          {storageInfo && (
            <div className="space-y-4">
              {/* localStorage Info */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  localStorage
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400">Total Keys:</span>
                    <span className="text-white ml-2 font-mono">{storageInfo.localStorage.totalKeys}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Estimated Size:</span>
                    <span className="text-white ml-2 font-mono">{storageInfo.localStorage.totalSize}</span>
                  </div>
                </div>
                
                {storageInfo.localStorage.keys.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Stored Keys:</h5>
                    <div className="max-h-32 overflow-y-auto">
                      {storageInfo.localStorage.keys.map((key, index) => (
                        <div key={index} className="text-xs text-gray-400 font-mono py-1 px-2 hover:bg-gray-700 rounded">
                          {key}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* IndexedDB Info */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  IndexedDB
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400">Databases:</span>
                    <span className="text-white ml-2 font-mono">{storageInfo.indexedDB.databases.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Estimated Size:</span>
                    <span className="text-white ml-2 font-mono">{storageInfo.indexedDB.totalSize}</span>
                  </div>
                </div>
                
                {storageInfo.indexedDB.databases.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Database Names:</h5>
                    <div className="max-h-32 overflow-y-auto">
                      {storageInfo.indexedDB.databases.map((dbName, index) => (
                        <div key={index} className="text-xs text-gray-400 font-mono py-1 px-2 hover:bg-gray-700 rounded">
                          {dbName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cookies Info */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-yellow-400" />
                  Cookies
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400">Total Cookies:</span>
                    <span className="text-white ml-2 font-mono">{storageInfo.cookies.totalCookies}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Estimated Size:</span>
                    <span className="text-white ml-2 font-mono">{storageInfo.cookies.totalSize}</span>
                  </div>
                </div>
                
                {storageInfo.cookies.cookies.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Cookie Names:</h5>
                    <div className="max-h-32 overflow-y-auto">
                      {storageInfo.cookies.cookies.map((cookieName, index) => (
                        <div key={index} className="text-xs text-gray-400 font-mono py-1 px-2 hover:bg-gray-700 rounded">
                          {cookieName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <strong>Warning:</strong> Clearing storage will remove data including settings, preferences, game saves, and login sessions. IndexedDB and cookies clearing may affect other websites. These actions cannot be undone.
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