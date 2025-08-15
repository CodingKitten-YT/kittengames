"use client"

import React, { useState, useEffect, useContext, createContext } from "react"
import { Plus, Trash2, Edit3, Save, X, Keyboard } from "lucide-react"

export interface HotkeyAction {
  id: string
  name: string
  description: string
  type: 'redirect' | 'refresh' | 'back' | 'forward' | 'fullscreen' | 'escape' | 'close-tab' | 'new-tab'
  data?: {
    url?: string
  }
}

export interface Hotkey {
  id: string
  keys: string[]
  action: HotkeyAction
  enabled: boolean
  description?: string
}

const defaultActions: HotkeyAction[] = [
  {
    id: 'redirect-home',
    name: 'Go Home',
    description: 'Redirect to homepage',
    type: 'redirect',
    data: { url: '/' }
  },
  {
    id: 'redirect-games',
    name: 'Go to Games',
    description: 'Redirect to games page',
    type: 'redirect',
    data: { url: '/apps' }
  },
  {
    id: 'refresh-page',
    name: 'Refresh Page',
    description: 'Refresh the current page',
    type: 'refresh'
  },
  {
    id: 'go-back',
    name: 'Go Back',
    description: 'Go back in browser history',
    type: 'back'
  },
  {
    id: 'go-forward',
    name: 'Go Forward', 
    description: 'Go forward in browser history',
    type: 'forward'
  },
  {
    id: 'toggle-fullscreen',
    name: 'Toggle Fullscreen',
    description: 'Enter/exit fullscreen mode',
    type: 'fullscreen'
  },
  {
    id: 'escape-game',
    name: 'Escape Game',
    description: 'Exit game and go back',
    type: 'escape'
  }
]

const defaultHotkeys: Hotkey[] = []

interface HotkeysSettings {
  enabled: boolean
  hotkeys: Hotkey[]
  actions: HotkeyAction[]
}

const defaultSettings: HotkeysSettings = {
  enabled: true,
  hotkeys: defaultHotkeys,
  actions: defaultActions
}

const HotkeysContext = createContext<{
  settings: HotkeysSettings
  updateSettings: (settings: HotkeysSettings) => void
}>({
  settings: defaultSettings,
  updateSettings: () => {}
})

export function HotkeysProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<HotkeysSettings>(defaultSettings)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const saved = localStorage.getItem('kittengames-hotkeys-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (e) {
        console.error('Failed to parse hotkeys settings:', e)
      }
    }
  }, [isClient])

  const updateSettings = (newSettings: HotkeysSettings) => {
    setSettings(newSettings)
    if (isClient) {
      localStorage.setItem('kittengames-hotkeys-settings', JSON.stringify(newSettings))
    }
  }

  return (
    <HotkeysContext.Provider value={{ settings, updateSettings }}>
      {children}
    </HotkeysContext.Provider>
  )
}

export function useHotkeys() {
  return useContext(HotkeysContext)
}

function KeyComboInput({ 
  keys, 
  onChange, 
  placeholder = "Press keys..." 
}: { 
  keys: string[]
  onChange: (keys: string[]) => void
  placeholder?: string
}) {
  const [recording, setRecording] = useState(false)
  const [currentKeys, setCurrentKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!recording) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      const key = e.key
      setCurrentKeys(prev => new Set(Array.from(prev).concat(key)))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      // Convert Set to array and update
      const keysArray = Array.from(currentKeys)
      if (keysArray.length > 0) {
        onChange(keysArray)
        setRecording(false)
        setCurrentKeys(new Set())
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [recording, currentKeys, onChange])

  const displayKeys = recording && currentKeys.size > 0 
    ? Array.from(currentKeys).join(' + ') 
    : keys.join(' + ') || placeholder

  return (
    <button
      type="button"
      className={`px-3 py-2 border rounded-lg font-mono text-sm transition-colors ${
        recording 
          ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
      }`}
      onClick={() => {
        setRecording(!recording)
        setCurrentKeys(new Set())
      }}
    >
      {recording ? 'Recording...' : displayKeys}
    </button>
  )
}

function HotkeyEditor({ 
  hotkey, 
  actions, 
  onSave, 
  onCancel 
}: { 
  hotkey?: Hotkey
  actions: HotkeyAction[]
  onSave: (hotkey: Hotkey) => void
  onCancel: () => void
}) {
  const [keys, setKeys] = useState<string[]>(hotkey?.keys || [])
  const [selectedActionId, setSelectedActionId] = useState(hotkey?.action.id || '')
  const [enabled, setEnabled] = useState(hotkey?.enabled ?? true)
  const [description, setDescription] = useState(hotkey?.description || '')
  
  // Quick redirect fields
  const [quickRedirectUrl, setQuickRedirectUrl] = useState('')
  const [useQuickRedirect, setUseQuickRedirect] = useState(false)

  const selectedAction = actions.find(a => a.id === selectedActionId)

  const handleSave = () => {
    if (keys.length === 0) return

    let actionToUse = selectedAction

    // If using quick redirect, create a temporary action
    if (useQuickRedirect && quickRedirectUrl.trim()) {
      actionToUse = {
        id: 'temp-redirect-' + Date.now(),
        name: `Redirect to ${quickRedirectUrl}`,
        description: `Navigate to ${quickRedirectUrl}`,
        type: 'redirect' as const,
        data: { url: quickRedirectUrl.trim() }
      }
    }

    if (!actionToUse) return

    const newHotkey: Hotkey = {
      id: hotkey?.id || Date.now().toString(),
      keys,
      action: actionToUse,
      enabled,
      description: description.trim() || actionToUse.description
    }

    onSave(newHotkey)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {hotkey ? 'Edit Hotkey' : 'Add New Hotkey'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={keys.length === 0 || (!useQuickRedirect && !selectedAction) || (useQuickRedirect && !quickRedirectUrl.trim())}
            className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Key Combination</label>
          <KeyComboInput keys={keys} onChange={setKeys} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Action Type</label>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="use-existing"
                name="action-type"
                checked={!useQuickRedirect}
                onChange={() => setUseQuickRedirect(false)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600"
              />
              <label htmlFor="use-existing" className="text-sm">
                Use existing action
              </label>
            </div>
            
            {!useQuickRedirect && (
              <select
                value={selectedActionId}
                onChange={(e) => setSelectedActionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
              >
                <option value="">Select an action...</option>
                {actions.map(action => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="quick-redirect"
                name="action-type"
                checked={useQuickRedirect}
                onChange={() => setUseQuickRedirect(true)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600"
              />
              <label htmlFor="quick-redirect" className="text-sm">
                Quick redirect to URL
              </label>
            </div>

            {useQuickRedirect && (
              <input
                type="url"
                value={quickRedirectUrl}
                onChange={(e) => setQuickRedirectUrl(e.target.value)}
                placeholder="https://example.com or /path"
                className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description (Optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            useQuickRedirect && quickRedirectUrl 
              ? `Redirect to ${quickRedirectUrl}` 
              : selectedAction?.description || "Describe this hotkey..."
          }
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded"
        />
        <label htmlFor="enabled" className="text-sm">
          Enable this hotkey
        </label>
      </div>
    </div>
  )
}

function ActionEditor({
  action,
  onSave,
  onCancel
}: {
  action?: HotkeyAction
  onSave: (action: HotkeyAction) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(action?.name || '')
  const [description, setDescription] = useState(action?.description || '')
  const [type, setType] = useState<HotkeyAction['type']>(action?.type || 'redirect')
  const [url, setUrl] = useState(action?.data?.url || '')

  const handleSave = () => {
    if (!name.trim()) return

    const newAction: HotkeyAction = {
      id: action?.id || Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      type,
      data: type === 'redirect' ? { url } : undefined
    }

    onSave(newAction)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {action ? 'Edit Action' : 'Add New Action'}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            Save
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Action name..."
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as HotkeyAction['type'])}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
          >
            <option value="redirect">Redirect to URL</option>
            <option value="refresh">Refresh Page</option>
            <option value="back">Go Back</option>
            <option value="forward">Go Forward</option>
            <option value="fullscreen">Toggle Fullscreen</option>
            <option value="escape">Escape Game</option>
            <option value="close-tab">Close Tab</option>
            <option value="new-tab">New Tab</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this action does..."
          className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
        />
      </div>

      {type === 'redirect' && (
        <div>
          <label className="block text-sm font-medium mb-2">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com or /path"
            className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg"
          />
        </div>
      )}
    </div>
  )
}

export default function HotkeysSettingsPanel() {
  const { settings, updateSettings } = useHotkeys()
  const [editingHotkey, setEditingHotkey] = useState<Hotkey | null>(null)
  const [editingAction, setEditingAction] = useState<HotkeyAction | null>(null)
  const [showingHotkeyEditor, setShowingHotkeyEditor] = useState(false)
  const [showingActionEditor, setShowingActionEditor] = useState(false)
  const [activeTab, setActiveTab] = useState<'hotkeys' | 'actions'>('hotkeys')

  const toggleEnabled = () => {
    updateSettings({
      ...settings,
      enabled: !settings.enabled
    })
  }

  const saveHotkey = (hotkey: Hotkey) => {
    let updatedActions = settings.actions
    
    // If this hotkey uses a temporary action (from quick redirect), add it to actions
    if (hotkey.action.id.startsWith('temp-redirect-')) {
      const newAction = {
        ...hotkey.action,
        id: 'redirect-' + Date.now() // Give it a permanent ID
      }
      updatedActions = [...settings.actions, newAction]
      hotkey = {
        ...hotkey,
        action: newAction
      }
    }

    const updatedHotkeys = editingHotkey
      ? settings.hotkeys.map(h => h.id === hotkey.id ? hotkey : h)
      : [...settings.hotkeys, hotkey]

    updateSettings({
      ...settings,
      hotkeys: updatedHotkeys,
      actions: updatedActions
    })

    setEditingHotkey(null)
    setShowingHotkeyEditor(false)
  }

  const deleteHotkey = (id: string) => {
    updateSettings({
      ...settings,
      hotkeys: settings.hotkeys.filter(h => h.id !== id)
    })
  }

  const saveAction = (action: HotkeyAction) => {
    const updatedActions = editingAction
      ? settings.actions.map(a => a.id === action.id ? action : a)
      : [...settings.actions, action]

    // Update hotkeys that use this action
    const updatedHotkeys = settings.hotkeys.map(hotkey => {
      if (hotkey.action.id === action.id) {
        return {
          ...hotkey,
          action: action
        }
      }
      return hotkey
    })

    updateSettings({
      ...settings,
      actions: updatedActions,
      hotkeys: updatedHotkeys
    })

    setEditingAction(null)
    setShowingActionEditor(false)
  }

  const deleteAction = (id: string) => {
    // Don't delete if it's being used by a hotkey
    const isUsed = settings.hotkeys.some(h => h.action.id === id)
    if (isUsed) {
      alert('Cannot delete action that is being used by a hotkey')
      return
    }

    updateSettings({
      ...settings,
      actions: settings.actions.filter(a => a.id !== id)
    })
  }

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div>
          <h3 className="text-lg font-medium mb-1">Enable Hotkeys</h3>
          <p className="text-sm text-gray-400">
            Allow keyboard shortcuts to work throughout the site
          </p>
        </div>
        <button
          onClick={toggleEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.enabled ? 'bg-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('hotkeys')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'hotkeys'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Keyboard className="w-4 h-4 inline mr-2" />
              Hotkeys
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === 'actions'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Edit3 className="w-4 h-4 inline mr-2" />
              Actions
            </button>
          </div>

          {/* Hotkeys Tab */}
          {activeTab === 'hotkeys' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Configured Hotkeys</h3>
                <button
                  onClick={() => setShowingHotkeyEditor(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  <Plus size={16} />
                  Add Hotkey
                </button>
              </div>

              {showingHotkeyEditor && (
                <HotkeyEditor
                  hotkey={editingHotkey || undefined}
                  actions={settings.actions}
                  onSave={saveHotkey}
                  onCancel={() => {
                    setShowingHotkeyEditor(false)
                    setEditingHotkey(null)
                  }}
                />
              )}

              <div className="space-y-2">
                {settings.hotkeys.map(hotkey => (
                  <div
                    key={hotkey.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      hotkey.enabled
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-gray-800/50 border-gray-700/50 opacity-60'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <code className="px-2 py-1 bg-gray-700 rounded text-sm font-mono">
                          {hotkey.keys.join(' + ')}
                        </code>
                        <span className="text-purple-400 text-sm">→</span>
                        <span className="font-medium">{hotkey.action.name}</span>
                      </div>
                      <p className="text-sm text-gray-400">{hotkey.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingHotkey(hotkey)
                          setShowingHotkeyEditor(true)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-300"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => deleteHotkey(hotkey.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {settings.hotkeys.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hotkeys configured</p>
                    <p className="text-sm">Add your first hotkey to get started</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Available Actions</h3>
                <button
                  onClick={() => setShowingActionEditor(true)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  <Plus size={16} />
                  Add Action
                </button>
              </div>

              {showingActionEditor && (
                <ActionEditor
                  action={editingAction || undefined}
                  onSave={saveAction}
                  onCancel={() => {
                    setShowingActionEditor(false)
                    setEditingAction(null)
                  }}
                />
              )}

              <div className="space-y-2">
                {settings.actions.map(action => {
                  const isUsed = settings.hotkeys.some(h => h.action.id === action.id)
                  const isDefault = defaultActions.some(a => a.id === action.id)
                  
                  return (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{action.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            action.type === 'redirect' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {action.type}
                          </span>
                          {isUsed && (
                            <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">
                              In Use
                            </span>
                          )}
                          {isDefault && (
                            <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{action.description}</p>
                        {action.data?.url && (
                          <p className="text-xs text-gray-500 font-mono mt-1">{action.data.url}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAction(action)
                            setShowingActionEditor(true)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-300"
                        >
                          <Edit3 size={16} />
                        </button>
                        {!isDefault && (
                          <button
                            onClick={() => deleteAction(action.id)}
                            disabled={isUsed}
                            className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isUsed ? "Cannot delete action that is being used" : "Delete action"}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
