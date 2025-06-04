"use client"

import { useState } from "react"
import Header from "../../components/Header"
import {
  Settings as SettingsIcon,
  EyeOff as CloakIcon,
  Keyboard as HotkeysIcon,
  Shield as ShieldIcon,
  Info as InfoIcon,
} from "lucide-react"
import CloakSettingsPanel from "../../components/CloakSettingsPanel"
import HotkeySettingsPanel from "../../components/HotkeySettingsPanel"

const categories = [
  { key: "general", label: "General", icon: <SettingsIcon className="w-5 h-5 mr-3" /> },
  { key: "cloak", label: "Cloak", icon: <CloakIcon className="w-5 h-5 mr-3" /> },
  { key: "hotkeys", label: "Hotkeys", icon: <HotkeysIcon className="w-5 h-5 mr-3" /> },
  { key: "privacy", label: "Privacy", icon: <ShieldIcon className="w-5 h-5 mr-3" /> },
  { key: "about", label: "About", icon: <InfoIcon className="w-5 h-5 mr-3" /> },
]

function CategoryOptions({ selected }: { selected: string }) {
  switch (selected) {
    case "general":
      return <div>General settings options go here.</div>
    case "cloak":
      return <CloakSettingsPanel />
    case "hotkeys":
      return <HotkeySettingsPanel />
    case "privacy":
      return <div>Privacy settings options go here.</div>
    case "about":
      return <div>About this app.</div>
    default:
      return <div>Select a category.</div>
  }
}

export default function Settings() {
  const [selected, setSelected] = useState(categories[0].key)

  return (
    <div className="min-h-screen bg-gray-950">
      <Header currentPage="settings" />
      <main className="container mx-auto px-4 py-8 pt-28">
        <div className="flex bg-gray-900 rounded-2xl shadow-xl overflow-hidden min-h-[500px]">
          {/* Categories Sidebar */}
          <aside className="w-72 bg-gray-900 border-r border-gray-800 py-6">
            <nav>
              <ul>
                {categories.map(cat => (
                  <li key={cat.key}>
                    <button
                      className={`flex items-center w-full text-left px-6 py-3 rounded-lg transition-colors duration-150 mb-1
                        ${
                          selected === cat.key
                            ? "bg-gray-800 text-white font-semibold shadow"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      onClick={() => setSelected(cat.key)}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          {/* Options Panel */}
          <section className="flex-1 p-10 bg-gray-950 text-gray-100">
            <h2 className="text-2xl font-bold mb-8 capitalize flex items-center gap-2">
              {categories.find(c => c.key === selected)?.icon}
              {categories.find(c => c.key === selected)?.label}
            </h2>
            <CategoryOptions selected={selected} />
          </section>
        </div>
      </main>
    </div>
  )
}