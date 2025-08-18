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
      className="h-screen w-screen overflow-hidden relative bg-neo-bg"
      style={{
        background:
          wallpaper ||
          `
          linear-gradient(135deg, #f5f2e8 0%, #ebe7dc 100%),
          radial-gradient(circle at 20px 20px, rgba(26, 26, 26, 0.15) 2px, transparent 2px)
        `,
        backgroundSize: wallpaper ? "cover" : "cover, 40px 40px",
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onContextHelp?.()
      }}
    >
      {/* Desktop content area */}
      <div
        className="relative h-full w-full p-4"
        style={{
          backgroundImage: `radial-gradient(circle at center, rgba(26, 26, 26, 0.12) 1.5px, transparent 1.5px)`,
          backgroundSize: "32px 32px",
          backgroundPosition: "0 0, 16px 16px",
        }}
      >
        {children}
      </div>
    </div>
  )
}
