"use client"

import type React from "react"

interface SectionHeaderProps {
  title: string
  icon?: React.ReactNode
  count?: number
  gradient?: boolean
}

export default function SectionHeader({ title, icon, count, gradient = false }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-purple-400">
              {icon}
            </div>
          )}
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
        </div>
        {count !== undefined && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400 bg-gray-800/60 px-3 py-1.5 rounded-full border border-gray-700/50">
              {count} {count === 1 ? 'game' : 'games'}
            </span>
          </div>
        )}
      </div>
      <div className="mt-3 h-px bg-gradient-to-r from-purple-500/30 via-gray-700/50 to-transparent"></div>
    </div>
  )
}