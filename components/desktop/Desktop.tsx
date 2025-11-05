"use client"

import type { ReactNode } from "react"

interface DesktopProps {
  children: ReactNode
  wallpaper?: string
  onContextHelp?: () => void
}

export function Desktop({ children, wallpaper, onContextHelp }: DesktopProps) {
  return (
    <div
      role="main"
      aria-label="Neo-OS Desktop"
      className="h-screen w-screen overflow-hidden relative"
      style={{
        background:
          wallpaper ||
          `
          linear-gradient(135deg, #fafafa 0%, #f3f4f6 50%, #e5e7eb 100%)
        `,
        backgroundSize: wallpaper ? "cover" : "cover",
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextHelp?.()
      }}
    >
      {/* Desktop content area with subtle grid */}
      <div
        aria-label="Desktop workspace"
        className="relative h-full w-full p-4"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  )
}
