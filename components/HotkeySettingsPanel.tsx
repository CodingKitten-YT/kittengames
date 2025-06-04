"use client"

import React, { useState, useEffect } from "react"
import { Plus, Trash2, Edit2, AlertTriangle, CheckCircle, ExternalLink, Code, Keyboard, X } from "lucide-react"

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

interface ScriptAnalysis {
  summary: string
  warnings: string[]
  riskLevel: "low" | "medium" | "high"
}

const MODIFIER_KEYS = ["ctrl", "alt", "shift", "meta"]

function analyzeScript(script: string): ScriptAnalysis {
  const warnings: string[] = []
  let riskLevel: "low" | "medium" | "high" = "low"
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    { pattern: /document\.cookie/gi, warning: "Accesses browser cookies", risk: "high" },
    { pattern: /localStorage|sessionStorage/gi, warning: "Accesses browser storage", risk: "medium" },
    { pattern: /fetch|XMLHttpRequest|axios/gi, warning: "Makes network requests", risk: "medium" },
    { pattern: /eval\(/gi, warning: "Uses eval() function", risk: "high" },
    { pattern: /innerHTML|outerHTML/gi, warning: "Modifies page HTML", risk: "medium" },
    { pattern: /window\.open|location\.href/gi, warning: "Navigates to URLs", risk: "low" },
    { pattern: /alert|confirm|prompt/gi, warning: "Shows popup dialogs", risk: "low" },
    { pattern: /document\.write/gi, warning: "Writes to document", risk: "medium" },
    { pattern: /setTimeout|setInterval/gi, warning: "Uses timers", risk: "low" },
  ]

  dangerousPatterns.forEach(({ pattern, warning, risk }) => {
    if (pattern.test(script)) {
      warnings.push(warning)
      if (risk === "high") riskLevel = "high"
      else if (risk === "medium" && riskLevel !== "high") riskLevel = "medium"
    }
  })

  // Generate summary
  let summary = "Basic JavaScript execution"
  if (script.includes("window.location") || script.includes("location.href")) {
    summary = "Navigates to a different page"
  } else if (script.includes("document.") && script.includes("style")) {
    summary = "Modifies page styling"
  } else if (script.includes("alert") || script.includes("confirm")) {
    summary = "Shows user notifications"
  } else if (script.includes("console.")) {
    summary = "Logs information to console"
  }

  return { summary, warnings, riskLevel }
}

export default function HotkeySettingsPanel() {
  const [hotkeys, setHotkeys] = useState<Hotkey[]>([])
  const [editingHotkey, setEditingHotkey] = useState<Hotkey | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null)

  // Load hotkeys from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("kittengames-hotkeys")
    if (saved) {
      try {
        setHotkeys(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load hotkeys:", e)
      }
    }
  }, [])

  // Save hotkeys to localStorage
  const saveHotkeys = (newHotkeys: Hotkey[]) => {
    setHotkeys(newHotkeys)
    localStorage.setItem("kittengames-hotkeys", JSON.stringify(newHotkeys))
  }

  const addHotkey = (hotkey: Omit<Hotkey, "id">) => {
    const newHotkey: Hotkey = {
      ...hotkey,
      id: Date.now().toString()
    }
    saveHotkeys([...hotkeys, newHotkey])
    setShowAddForm(false)
  }

  const updateHotkey = (updatedHotkey: Hotkey) => {
    saveHotkeys(hotkeys.map(h => h.id === updatedHotkey.id ? updatedHotkey : h))
    setEditingHotkey(null)
  }

  const deleteHotkey = (id: string) => {
    saveHotkeys(hotkeys.filter(h => h.id !== id))
  }

  const toggleHotkey = (id: string) => {
    saveHotkeys(hotkeys.map(h => h.id === id ? { ...h, enabled: !h.enabled } : h))
  }

  const formatHotkeyDisplay = (key: string, modifiers: string[]) => {
    const sequence = []
    
    // Add modifiers first in specific order (matches useHotkeys hook)
    if (modifiers.includes("ctrl")) sequence.push("Ctrl")
    if (modifiers.includes("alt")) sequence.push("Alt") 
    if (modifiers.includes("shift")) sequence.push("Shift")
    if (modifiers.includes("meta")) sequence.push("⌘")
    
    // Add the main key
    const displayKey = key === " " ? "Space" : key.toUpperCase()
    sequence.push(displayKey)
    
    return sequence.join(" → ")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Keyboard Shortcuts</h3>
          <p className="text-gray-400 text-sm">
            Create custom keyboard shortcuts with sequential key presses. Press keys in order (e.g. Ctrl → Alt → Q) to trigger actions. Works even when game iframes are focused.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Hotkey
        </button>
      </div>

      {/* Hotkeys List */}
      <div className="space-y-3">
        {hotkeys.map(hotkey => (
          <div
            key={hotkey.id}
            className={`bg-gray-800 rounded-lg p-4 border-l-4 ${
              hotkey.enabled ? "border-green-500" : "border-gray-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <kbd className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm font-mono">
                    {formatHotkeyDisplay(hotkey.key, hotkey.modifiers)}
                  </kbd>
                  <span className="text-white font-medium">{hotkey.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    hotkey.action === "redirect" ? "bg-blue-900 text-blue-300" :
                    hotkey.action === "newTab" ? "bg-green-900 text-green-300" :
                    "bg-purple-900 text-purple-300"
                  }`}>
                    {hotkey.action === "newTab" ? "New Tab" : hotkey.action === "redirect" ? "Redirect" : "JavaScript"}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  {hotkey.action === "javascript" ? (
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Custom JavaScript
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      {hotkey.url}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleHotkey(hotkey.id)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    hotkey.enabled ? "bg-green-600" : "bg-gray-600"
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    hotkey.enabled ? "translate-x-6" : "translate-x-0.5"
                  }`} />
                </button>
                <button
                  onClick={() => setEditingHotkey(hotkey)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteHotkey(hotkey.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {hotkeys.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hotkeys configured. Click "Add Hotkey" to create your first shortcut.
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingHotkey) && (
        <HotkeyForm
          hotkey={editingHotkey}
          onSave={(hotkey) => {
            if ('id' in hotkey) {
              updateHotkey(hotkey)
            } else {
              addHotkey(hotkey)
            }
          }}
          onCancel={() => {
            setShowAddForm(false)
            setEditingHotkey(null)
            setScriptAnalysis(null)
          }}
          onScriptAnalyze={(script) => setScriptAnalysis(analyzeScript(script))}
          scriptAnalysis={scriptAnalysis}
        />
      )}
    </div>
  )
}

interface HotkeyFormProps {
  hotkey?: Hotkey | null
  onSave: (hotkey: Hotkey | Omit<Hotkey, "id">) => void
  onCancel: () => void
  onScriptAnalyze: (script: string) => void
  scriptAnalysis: ScriptAnalysis | null
}

function HotkeyForm({ hotkey, onSave, onCancel, onScriptAnalyze, scriptAnalysis }: HotkeyFormProps) {
  const [name, setName] = useState(hotkey?.name || "")
  const [key, setKey] = useState(hotkey?.key || "")
  const [modifiers, setModifiers] = useState<string[]>(hotkey?.modifiers || [])
  const [action, setAction] = useState<"redirect" | "newTab" | "javascript">(hotkey?.action || "redirect")
  const [url, setUrl] = useState(hotkey?.url || "")
  const [script, setScript] = useState(hotkey?.script || "")
  const [attributes, setAttributes] = useState<Record<string, any>>(hotkey?.attributes || {})
  const [enabled, setEnabled] = useState(hotkey?.enabled ?? true)
  const [isRecording, setIsRecording] = useState(false)
  const [keyInput, setKeyInput] = useState("")

  // Update keyInput when key/modifiers change
  React.useEffect(() => {
    if (key) {
      const modifierSymbols = {
        ctrl: "Ctrl",
        alt: "Alt", 
        shift: "Shift",
        meta: "⌘"
      }
      
      const displayModifiers = modifiers.map(m => modifierSymbols[m as keyof typeof modifierSymbols]).join(" + ")
      const displayKey = key === " " ? "Space" : key.toUpperCase()
      
      setKeyInput(displayModifiers ? `${displayModifiers} + ${displayKey}` : displayKey)
    } else {
      setKeyInput("")
    }
  }, [key, modifiers])

  const handleKeyInputFocus = () => {
    setIsRecording(true)
    setKeyInput("Press any key combination...")
  }

  const handleKeyInputBlur = () => {
    if (isRecording && !key) {
      setKeyInput("")
    }
    setIsRecording(false)
  }

  const handleKeyRecording = (event: React.KeyboardEvent) => {
    if (!isRecording) return
    
    event.preventDefault()
    event.stopPropagation()

    // Skip if only modifier keys are pressed
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
      return
    }

    // Special handling for common keys
    let recordedKey = event.key
    if (event.key === ' ') recordedKey = ' '
    else if (event.key === 'Escape') recordedKey = 'Escape'
    else if (event.key === 'Enter') recordedKey = 'Enter'
    else if (event.key === 'Tab') recordedKey = 'Tab'
    else if (event.key.length === 1) recordedKey = event.key.toLowerCase()

    // Record the key combination
    const recordedModifiers: string[] = []
    if (event.ctrlKey) recordedModifiers.push('ctrl')
    if (event.altKey) recordedModifiers.push('alt')
    if (event.shiftKey) recordedModifiers.push('shift')
    if (event.metaKey) recordedModifiers.push('meta')

    setKey(recordedKey)
    setModifiers(recordedModifiers)
    setIsRecording(false)
    
    // Blur the input to show the recorded key
    ;(event.target as HTMLElement).blur()
  }

  const clearKey = () => {
    setKey("")
    setModifiers([])
    setKeyInput("")
  }

  const handleScriptChange = (newScript: string) => {
    setScript(newScript)
    if (newScript.trim()) {
      onScriptAnalyze(newScript)
    }
  }

  const handleSave = () => {
    if (!name || !key) return

    const hotkeyData = {
      name,
      key,
      modifiers,
      action,
      url: action !== "javascript" ? url : undefined,
      script: action === "javascript" ? script : undefined,
      attributes: action === "javascript" ? attributes : undefined,
      enabled
    }

    if (hotkey) {
      onSave({ ...hotkeyData, id: hotkey.id })
    } else {
      onSave(hotkeyData)
    }
  }

  const addAttribute = () => {
    const newKey = `attr${Object.keys(attributes).length + 1}`
    setAttributes({ ...attributes, [newKey]: "" })
  }

  const updateAttribute = (oldKey: string, newKey: string, value: any) => {
    const newAttributes = { ...attributes }
    delete newAttributes[oldKey]
    newAttributes[newKey] = value
    setAttributes(newAttributes)
  }

  const removeAttribute = (key: string) => {
    const newAttributes = { ...attributes }
    delete newAttributes[key]
    setAttributes(newAttributes)
  }

  const isValid = name && key && (action === "javascript" ? script : url)

  const formatHotkeyDisplay = (key: string, modifiers: string[]) => {
    const sequence = []
    
    // Add modifiers first in specific order (matches useHotkeys hook)
    if (modifiers.includes("ctrl")) sequence.push("Ctrl")
    if (modifiers.includes("alt")) sequence.push("Alt") 
    if (modifiers.includes("shift")) sequence.push("Shift")
    if (modifiers.includes("meta")) sequence.push("⌘")
    
    // Add the main key
    const displayKey = key === " " ? "Space" : key.toUpperCase()
    sequence.push(displayKey)
    
    return sequence.join(" → ")
  }

  // Example JavaScript scripts
  const exampleScripts = [
    {
      name: "Quick Tab Switch",
      description: "Switch to Google quickly when teacher approaches",
      script: `// Quick teacher panic button - opens Google in current tab
window.location.href = 'https://www.google.com/search?q=homework+help';`
    },
    {
      name: "Hide Game Fullscreen",
      description: "Exit fullscreen and navigate away quickly",
      script: `// Exit fullscreen and go to educational site
if (document.fullscreenElement) {
  document.exitFullscreen();
}
setTimeout(() => {
  window.location.href = 'https://www.khanacademy.org';
}, 100);`
    },
    {
      name: "Fake Loading Screen",
      description: "Shows a fake loading overlay on the page",
      script: `// Create fake loading screen
const overlay = document.createElement('div');
overlay.style.cssText = \`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: white; z-index: 999999; display: flex;
  align-items: center; justify-content: center;
  font-family: Arial, sans-serif; font-size: 18px;
\`;
overlay.innerHTML = '<div>Loading educational content...<br><div style="margin-top:20px;">⏳</div></div>';
document.body.appendChild(overlay);

// Remove after 3 seconds or on click
setTimeout(() => overlay.remove(), 3000);
overlay.onclick = () => overlay.remove();`
    },
    {
      name: "Minimize All Windows",
      description: "Attempt to minimize browser (works in some browsers)",
      script: `// Try to minimize the window (browser dependent)
try {
  window.blur();
  window.minimize && window.minimize();
} catch(e) {
  // Fallback: Navigate to innocent page
  window.location.href = 'https://classroom.google.com';
}`
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-white mb-4">
          {hotkey ? "Edit Hotkey" : "Add Hotkey"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Quick Google"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hotkey Combination</label>
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={keyInput}
                  onChange={() => {}} // Read-only, controlled by keyboard events
                  onFocus={handleKeyInputFocus}
                  onBlur={handleKeyInputBlur}
                  onKeyDown={handleKeyRecording}
                  className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                    isRecording ? 'focus:ring-blue-500 text-blue-400' : 'focus:ring-blue-500'
                  } font-mono`}
                  placeholder="Click to record hotkey (e.g., Q for Shift+Q)"
                  readOnly={!isRecording}
                />
                {key && (
                  <button
                    onClick={clearKey}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Click the input field and press your desired key combination. For example, pressing "Q" will record "Shift+Q".
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as "redirect" | "newTab" | "javascript")}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="redirect">Redirect (same tab)</option>
              <option value="newTab">Open in new tab</option>
              <option value="javascript">Run JavaScript</option>
            </select>
          </div>

          {action !== "javascript" ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">JavaScript Code</label>
                <details className="relative">
                  <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                    View Examples
                  </summary>
                  <div className="absolute right-0 top-6 bg-gray-700 rounded-lg p-4 w-80 max-h-60 overflow-y-auto z-10 shadow-xl">
                    <div className="space-y-3">
                      {exampleScripts.map((example, i) => (
                        <div key={i} className="border-b border-gray-600 pb-2 last:border-b-0">
                          <h4 className="text-sm font-medium text-white">{example.name}</h4>
                          <p className="text-xs text-gray-400 mb-2">{example.description}</p>
                          <button
                            onClick={() => {
                              setScript(example.script)
                              handleScriptChange(example.script)
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                          >
                            Use This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
              <textarea
                value={script}
                onChange={(e) => handleScriptChange(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={6}
                placeholder="console.log('Hello world!');"
              />
              
              {scriptAnalysis && (
                <div className={`mt-2 p-3 rounded-lg ${
                  scriptAnalysis.riskLevel === "high" ? "bg-red-900 border border-red-700" :
                  scriptAnalysis.riskLevel === "medium" ? "bg-yellow-900 border border-yellow-700" :
                  "bg-green-900 border border-green-700"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {scriptAnalysis.riskLevel === "high" ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-sm font-medium">Script Analysis</span>
                  </div>
                  <p className="text-sm mb-2">{scriptAnalysis.summary}</p>
                  {scriptAnalysis.warnings.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Detected:</p>
                      <ul className="text-xs space-y-1">
                        {scriptAnalysis.warnings.map((warning, i) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Attributes section for JavaScript */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Script Attributes (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                  >
                    Add Attribute
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Add custom attributes that can be accessed in your script via <code className="bg-gray-600 px-1 rounded">this.attributes</code>
                </p>
                <div className="space-y-2">
                  {Object.entries(attributes).map(([key, value], index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateAttribute(key, e.target.value, value)}
                        className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm"
                        placeholder="Attribute name"
                      />
                      <span className="text-gray-400">=</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateAttribute(key, key, e.target.value)}
                        className="flex-1 bg-gray-600 text-white rounded px-2 py-1 text-sm"
                        placeholder="Attribute value"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(key)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {Object.keys(attributes).length === 0 && (
                    <p className="text-xs text-gray-500 italic">No attributes defined</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="enabled" className="text-sm text-gray-300">Enable this hotkey</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
          >
            {hotkey ? "Update" : "Add"} Hotkey
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}