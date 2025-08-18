"use client"

import type React from "react"
import { useState } from "react"

interface AppIconProps {
  appId: string
  title: string
  icon: string
  onOpen: (appId: string) => void
  isSelected?: boolean
  id?: string
}

const LineArtIcon = ({ type }: { type: string }) => {
  const iconProps = {
    width: 32,
    height: 32,
    stroke: "currentColor",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  }

  switch (type) {
    case "about":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case "projects":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )
    case "skills":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      )
    case "contact":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      )
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

export function AppIcon({ appId, title, icon, onOpen, isSelected = false, id }: AppIconProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    onOpen(appId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      id={id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`
        group flex flex-col items-center gap-2 p-4 bg-neo-bg border-2 border-neo-border transition-all duration-150 select-none rounded-xl
        ${
          isPressed
            ? "shadow-[2px_2px_0_0_var(--neo-shadow)] translate-x-1 translate-y-1"
            : "shadow-neo hover:shadow-[2px_2px_0_0_var(--neo-shadow)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
        }
        ${isSelected ? "ring-2 ring-neo-border ring-offset-2 ring-offset-neo-bg" : ""}
        focus:outline-none focus:ring-2 focus:ring-neo-border focus:ring-offset-2 focus:ring-offset-neo-bg
      `}
      tabIndex={0}
      role="button"
      aria-label={`Open ${title} application`}
      aria-pressed={isPressed}
    >
      <div className="text-neo-fg pointer-events-none">
        <LineArtIcon type={appId} />
      </div>
      <div className="text-sm font-bold text-neo-fg pointer-events-none max-w-20 text-center leading-tight">
        {title}
      </div>
    </button>
  )
}
