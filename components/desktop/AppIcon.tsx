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
  switch (type) {
    case "about":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#3B82F6" />
          <circle cx="24" cy="18" r="6" fill="white" />
          <path
            d="M14 36C14 31.5817 17.5817 28 22 28H26C30.4183 28 34 31.5817 34 36V38H14V36Z"
            fill="white"
          />
        </svg>
      )
    case "projects":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#8B5CF6" />
          <rect x="10" y="10" width="28" height="28" rx="3" fill="white" fillOpacity="0.2" />
          <path
            d="M10 16C10 12.6863 12.6863 10 16 10H32C35.3137 10 38 12.6863 38 16V18H10V16Z"
            fill="white"
            fillOpacity="0.3"
          />
          <circle cx="15" cy="14" r="1.5" fill="white" />
          <circle cx="20" cy="14" r="1.5" fill="white" />
          <circle cx="25" cy="14" r="1.5" fill="white" />
          <path
            d="M18 26L22 30L30 22"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case "skills":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#F59E0B" />
          <path
            d="M24 8L27.708 19.292L39 23L27.708 26.708L24 38L20.292 26.708L9 23L20.292 19.292L24 8Z"
            fill="white"
          />
          <circle cx="34" cy="14" r="3" fill="white" fillOpacity="0.7" />
          <circle cx="14" cy="34" r="2.5" fill="white" fillOpacity="0.7" />
        </svg>
      )
    case "contact":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#EF4444" />
          <rect x="10" y="14" width="28" height="20" rx="2" fill="white" />
          <path d="M10 16L24 26L38 16" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 32L17 25" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 32L31 25" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case "ide":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#06B6D4" />
          <rect x="10" y="10" width="28" height="28" rx="2" fill="white" fillOpacity="0.15" />
          <rect x="10" y="10" width="28" height="6" rx="2" fill="white" fillOpacity="0.25" />
          <circle cx="14" cy="13" r="1" fill="white" />
          <circle cx="17.5" cy="13" r="1" fill="white" />
          <circle cx="21" cy="13" r="1" fill="white" />
          <path
            d="M16 24L20 28L16 32"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="23" y1="32" x2="28" y2="32" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case "terminal":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#10B981" />
          <rect x="10" y="12" width="28" height="24" rx="2" fill="#1F2937" />
          <path
            d="M15 20L19 24L15 28"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="22" y1="28" x2="29" y2="28" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    default:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#6B7280" />
          <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2" />
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
      aria-describedby={`${appId}-description`}
      type="button"
    >
      <div className="text-neo-fg pointer-events-none" aria-hidden="true">
        <LineArtIcon type={appId} />
      </div>
      <div
        className="text-sm font-bold text-neo-fg pointer-events-none max-w-20 text-center leading-tight"
        id={`${appId}-description`}
      >
        {title}
      </div>
    </button>
  )
}
