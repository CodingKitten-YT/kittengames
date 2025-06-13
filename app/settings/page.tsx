"use client"

import React, { useState } from "react"
import Header from "../../components/Header"
import {
  Settings as SettingsIcon,
  EyeOff as CloakIcon,
  Rocket as LaunchIcon,
  Shield as ShieldIcon, // This import seems unused in the provided context, but keeping it if used elsewhere
  Info as InfoIcon,   // This import seems unused, but keeping it
} from "lucide-react"
import CloakSettingsPanel from "../../components/CloakSettingsPanel"
import GameLaunchSettingsPanel from "../../components/GameLaunchSettingsPanel"
import GeneralSettingsPanel from "../../components/GeneralSettingsPanel"

const categories = [
  { key: "general", label: "General", icon: <SettingsIcon className="w-5 h-5" /> },
  { key: "cloak", label: "Cloak", icon: <CloakIcon className="w-5 h-5" /> },
  { key: "hotkeys", label: "Game Launch", icon: <LaunchIcon className="w-5 h-5" /> },
]

function CategoryOptions({ selected }: { selected: string }) {
  switch (selected) {
    case "general":
      return <GeneralSettingsPanel />
    case "cloak":
      return <CloakSettingsPanel />
    case "hotkeys":
      return <GameLaunchSettingsPanel />
    default:
      return <div>Select a category.</div>
  }
}

export default function Settings() {
  const [selected, setSelected] = useState(categories[0].key)
  const currentCategory = categories.find(c => c.key === selected);

  return (
    <div className="min-h-screen bg-gray-950">
      <Header currentPage="settings" />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex bg-gray-900 rounded-2xl shadow-xl overflow-hidden min-h-[600px]">
          {/* Categories Sidebar */}
          <aside className="w-64 bg-gray-900/50 backdrop-blur-sm py-6">
            <nav className="px-3">
              <ul>
                {categories.map(cat => (
                  <li key={cat.key}>
                    <button
                      className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out mb-1 relative
                        ${
                          selected === cat.key
                            ? "bg-gray-700/60 text-white font-medium"
                            : "text-gray-300 hover:bg-gray-800/40 hover:text-gray-100"
                        }`}
                      onClick={() => setSelected(cat.key)}
                    >
                      {selected === cat.key && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-purple-500 rounded-r-md"></span>
                      )}
                      <span className="mr-3">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          {/* Options Panel */}
          <section className="flex-1 p-10 bg-gray-950/70 backdrop-blur-sm text-gray-100">
            <h2 className="text-3xl font-bold mb-10 capitalize flex items-center gap-3 text-white">
              {currentCategory?.icon && (
                <span className="p-2 bg-gray-800 rounded-lg">
                  {currentCategory.icon}
                </span>
              )}
              {currentCategory?.label}
            </h2>
            <CategoryOptions selected={selected} />
          </section>
        </div>
      </main>
    </div>
  )
}