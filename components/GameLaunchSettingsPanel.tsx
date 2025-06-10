"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

// Context for global access
type GameLaunchSettings = {
  openMode: "same-tab" | "new-tab" | "about-blank" // "html-blob" removed
  confirmClose: boolean
  updateSettings?: (settings: Partial<GameLaunchSettings>) => void
}

const GameLaunchSettingsContext = createContext<GameLaunchSettings | undefined>(undefined)

export function useGameLaunchSettings() {
  const context = useContext(GameLaunchSettingsContext)
  if (context === undefined) {
    console.warn("useGameLaunchSettings: Context is undefined. Falling back to getCurrentSettings(). Ensure component is within GameLaunchSettingsProvider for reactive updates.");
    return { ...getCurrentSettings(), updateSettings: undefined }; 
  }
  return context
}

// Provider component for wrapping the app
export function GameLaunchSettingsProvider({ children }: { children: ReactNode }) {
  const [openMode, setOpenMode] = useState<"same-tab" | "new-tab" | "about-blank">("same-tab") // "html-blob" removed
  const [confirmClose, setConfirmClose] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadSettings()
    if (saved) {
      // Ensure saved.openMode is a valid type, default if not
      const validOpenModes: Array<GameLaunchSettings["openMode"]> = ["same-tab", "new-tab", "about-blank"];
      if (saved.openMode && validOpenModes.includes(saved.openMode as any)) {
        setOpenMode(saved.openMode as "same-tab" | "new-tab" | "about-blank")
      } else {
        setOpenMode("same-tab") // Default if saved mode is invalid (e.g. old "html-blob")
      }
      setConfirmClose(!!saved.confirmClose)
    } else {
      saveSettings({ openMode: "same-tab", confirmClose: false })
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage on change, only after initial load
  useEffect(() => {
    if (isLoaded) {
      saveSettings({ openMode, confirmClose })
    }
  }, [openMode, confirmClose, isLoaded])

  const updateSettings = (newSettings: Partial<GameLaunchSettings>) => {
    if (newSettings.openMode !== undefined) {
      setOpenMode(newSettings.openMode)
    }
    if (newSettings.confirmClose !== undefined) {
      setConfirmClose(newSettings.confirmClose)
    }
  }

  return (
    <GameLaunchSettingsContext.Provider value={{ openMode, confirmClose, updateSettings }}>
      {children}
    </GameLaunchSettingsContext.Provider>
  )
}

const STORAGE_KEY = "kittengames-game-launch-settings"

function loadSettings(): Partial<GameLaunchSettings> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw);
    // Filter out "html-blob" if it exists from older settings
    if (parsed.openMode === "html-blob") {
        parsed.openMode = "same-tab"; // or "new-tab" or "about-blank" as a default
    }
    return parsed;
  } catch (error) {
    console.error("Error loading settings:", error)
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function saveSettings(settings: { openMode: "same-tab" | "new-tab" | "about-blank", confirmClose: boolean }) { // "html-blob" removed
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function getCurrentSettings(): GameLaunchSettings {
  if (typeof window === "undefined") {
    return { openMode: "same-tab", confirmClose: false }
  }
  const saved = loadSettings()
  // Ensure saved.openMode is a valid type, default if not
  const validOpenModes: Array<GameLaunchSettings["openMode"]> = ["same-tab", "new-tab", "about-blank"];
  let currentOpenMode: "same-tab" | "new-tab" | "about-blank" = "same-tab";
  if (saved?.openMode && validOpenModes.includes(saved.openMode as any)) {
    currentOpenMode = saved.openMode as "same-tab" | "new-tab" | "about-blank";
  }

  return {
    openMode: currentOpenMode,
    confirmClose: !!saved?.confirmClose,
  }
}

export function launchGame(url: string) {
  if (!url || typeof window === 'undefined') {
    console.error("launchGame: URL is missing or window is undefined.");
    return;
  }

  const settings = getCurrentSettings();
  console.log("launchGame: Using settings:", settings); 
  window.onbeforeunload = null; // Clear any existing global onbeforeunload handler

  const cloakTabTitle = localStorage.getItem("cloakedTabName") || "Game";
  const cloakTabIcon = localStorage.getItem("cloakedTabIcon") || "";

  const createFullPageIframeHTML = (targetUrl: string, title: string, iconUrl: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${iconUrl ? `<link rel="icon" href="${iconUrl}">` : ""}
        <style>
          html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background-color: #000; }
          iframe { border: none; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <iframe src="${targetUrl}" allowfullscreen></iframe>
        ${iconUrl ? `<img src="${iconUrl}" style="display:none;">` : ""}
      </body>
    </html>`;

  if (settings.openMode === "about-blank") {
    console.log("launchGame: Mode is 'about-blank'. Opening new tab.");
    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      console.log("launchGame: 'about-blank' tab opened successfully. Writing content.");
      const iframeHTML = createFullPageIframeHTML(url, cloakTabTitle, cloakTabIcon);
      newTab.document.write(iframeHTML);
      newTab.document.close();
    } else {
      console.error("launchGame: Failed to open 'about-blank' tab. Popup likely blocked.");
      alert("Popup blocked for 'about:blank' mode. Please allow popups for this site.");
      window.open(url, '_blank'); // Fallback to simple new tab
    }
  } else if (settings.openMode === "new-tab") {
    console.log("launchGame: Mode is 'new-tab'. Opening in new tab.");
    window.open(url, '_blank');
  } else { // same-tab
    console.log("launchGame: Mode is 'same-tab'. Navigating in current tab.");
    // The onbeforeunload logic is now handled by the PlayGame component itself
    window.location.href = url;
  }
}

// UI Component for the settings panel
export default function GameLaunchSettingsPanel() {
  const context = useGameLaunchSettings();

  let displayOpenMode = context?.openMode;
  let displayConfirmClose = context?.confirmClose;

  if (context === undefined || context.updateSettings === undefined) {
    const currentStoredSettings = getCurrentSettings();
    displayOpenMode = currentStoredSettings.openMode;
    displayConfirmClose = currentStoredSettings.confirmClose;
  }

  const updateSettingsInContext = context?.updateSettings;

  const handleOpenModeChange = (newMode: "same-tab" | "new-tab" | "about-blank") => { // "html-blob" removed
    console.log("handleOpenModeChange: New mode selected:", newMode);
    const currentSettings = getCurrentSettings(); 
    saveSettings({ openMode: newMode, confirmClose: currentSettings.confirmClose });
    console.log("handleOpenModeChange: Immediately saved to localStorage:", { openMode: newMode, confirmClose: currentSettings.confirmClose });

    if (updateSettingsInContext) {
      updateSettingsInContext({ openMode: newMode });
    } else {
      console.warn("GameLaunchSettingsPanel: updateSettings (context) not available. Settings saved directly to localStorage.");
    }
  };

  const handleConfirmCloseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmClose = e.target.checked;
    console.log("handleConfirmCloseChange: New confirmClose:", newConfirmClose);
    const currentSettings = getCurrentSettings(); 
    saveSettings({ openMode: currentSettings.openMode, confirmClose: newConfirmClose });
    console.log("handleConfirmCloseChange: Immediately saved to localStorage:", { openMode: currentSettings.openMode, confirmClose: newConfirmClose });

    if (updateSettingsInContext) {
      updateSettingsInContext({ confirmClose: newConfirmClose });
    } else {
      console.warn("GameLaunchSettingsPanel: updateSettings (context) not available. Settings saved directly to localStorage.");
    }
  };
  
  const openModeToDisplay = displayOpenMode ?? getCurrentSettings().openMode;
  const confirmCloseToDisplay = displayConfirmClose ?? getCurrentSettings().confirmClose;

  const launchOptions = [
    { value: "same-tab", label: "Same Tab", description: "Games open in the current tab." },
    { value: "new-tab", label: "New Tab", description: "Games open in a fresh browser tab." },
    { value: "about-blank", label: "Cloaked (about:blank)", description: "Uses an 'about:blank' tab. Helps bypass some restrictions." },
    // "html-blob" option removed
  ] as const;

  return (
    <div className="space-y-8 text-gray-100">
      <section>
        <h3 className="text-lg font-semibold mb-4 text-white">Open Games In</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {launchOptions.map((option) => (
            <label
              key={option.value}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-150 ease-in-out border-2
                ${openModeToDisplay === option.value
                  ? "bg-purple-600 border-purple-400 text-white shadow-lg" 
                  : "bg-gray-800 border-gray-700 hover:border-purple-500 hover:bg-gray-750"
                }
                ${option.value === "about-blank" ? "md:col-span-2" : ""}` // Added this line
              }
            >
              <input
                type="radio"
                name="openMode"
                value={option.value}
                checked={openModeToDisplay === option.value}
                onChange={() => handleOpenModeChange(option.value as "same-tab" | "new-tab" | "about-blank")}
                className="sr-only"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{option.label}</span>
                <p className="text-xs text-gray-300 mt-1">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3 text-white">Confirm Before Closing</h3>
        <label
          htmlFor="confirmClose"
          className="flex items-center justify-between p-4 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-750 transition-all duration-150 ease-in-out shadow-md border-2 border-gray-700 hover:border-purple-500"
        >
          <div>
            <span className="font-medium text-sm">Enable Confirmation</span>
            <p className="text-xs text-gray-300 mt-0.5">
              Ask before leaving a game (applies to 'Same Tab' mode or compact header back button).
            </p>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="confirmClose"
              className="sr-only peer"
              checked={!!confirmCloseToDisplay} 
              onChange={handleConfirmCloseChange}
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </div>
        </label>
      </section>
    </div>
  );
}
