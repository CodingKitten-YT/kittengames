"use client"

import type React from "react"

interface SectionHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

export default function SectionHeader({ title, description, icon, children }: SectionHeaderProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 mb-6">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className="text-purple-400">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              {description && (
                <p className="text-sm text-gray-400 mt-1">{description}</p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center space-x-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}