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
          <defs>
            <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="aboutShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#aboutGrad)" filter="url(#aboutShadow)"/>
          <circle cx="24" cy="17" r="6.5" fill="white" opacity="0.95"/>
          <path
            d="M13 37C13 31.4772 17.4772 27 23 27H25C30.5228 27 35 31.4772 35 37V39H13V37Z"
            fill="white"
            opacity="0.95"
          />
          <circle cx="24" cy="17" r="5" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
        </svg>
      )
    case "projects":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="projectsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
            <filter id="projectsShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#projectsGrad)" filter="url(#projectsShadow)"/>
          <rect x="9" y="9" width="30" height="30" rx="4" fill="white" fillOpacity="0.15" />
          <path
            d="M9 17C9 12.5817 12.5817 9 17 9H31C35.4183 9 39 12.5817 39 17V19H9V17Z"
            fill="white"
            fillOpacity="0.25"
          />
          <circle cx="14" cy="14" r="1.5" fill="white" opacity="0.9"/>
          <circle cx="19" cy="14" r="1.5" fill="white" opacity="0.9"/>
          <circle cx="24" cy="14" r="1.5" fill="white" opacity="0.9"/>
          <path
            d="M17 27L22 32L31 23"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </svg>
      )
    case "skills":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="skillsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <filter id="skillsShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
            <filter id="starGlow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#skillsGrad)" filter="url(#skillsShadow)"/>
          <path
            d="M24 7L28.326 19.674L41 24L28.326 28.326L24 41L19.674 28.326L7 24L19.674 19.674L24 7Z"
            fill="white"
            opacity="0.95"
            filter="url(#starGlow)"
          />
          <circle cx="35" cy="13" r="3.5" fill="white" fillOpacity="0.6" />
          <circle cx="13" cy="35" r="2.5" fill="white" fillOpacity="0.6" />
        </svg>
      )
    case "contact":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="contactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <filter id="contactShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#contactGrad)" filter="url(#contactShadow)"/>
          <rect x="9" y="13" width="30" height="22" rx="3" fill="white" opacity="0.95"/>
          <path
            d="M9 16L24 27L39 16"
            stroke="#ec4899"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path d="M9 33L17 25" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
          <path d="M39 33L31 25" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        </svg>
      )
    case "ide":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="ideGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <filter id="ideShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#ideGrad)" filter="url(#ideShadow)"/>
          <rect x="9" y="9" width="30" height="30" rx="3" fill="rgba(0,0,0,0.4)" />
          <rect x="9" y="9" width="30" height="7" rx="3" fill="white" fillOpacity="0.15" />
          <circle cx="13" cy="12.5" r="1.2" fill="white" opacity="0.8"/>
          <circle cx="17" cy="12.5" r="1.2" fill="white" opacity="0.8"/>
          <circle cx="21" cy="12.5" r="1.2" fill="white" opacity="0.8"/>
          <path
            d="M15 25L20 30L15 35"
            stroke="#60a5fa"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="23" y1="35" x2="29" y2="35" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case "terminal":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="terminalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="terminalShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#terminalGrad)" filter="url(#terminalShadow)"/>
          <rect x="8" y="10" width="32" height="28" rx="3" fill="rgba(10,10,10,0.8)" />
          <path
            d="M14 19L19 24L14 29"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="22" y1="29" x2="30" y2="29" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
          <circle cx="15" cy="15" r="1" fill="#34d399" opacity="0.6"/>
          <circle cx="19" cy="15" r="1" fill="#34d399" opacity="0.6"/>
        </svg>
      )
    default:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="defaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
            <filter id="defaultShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#defaultGrad)" filter="url(#defaultShadow)"/>
          <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2.5" opacity="0.9"/>
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
        group flex flex-col items-center gap-2 p-3 bg-white/80 backdrop-blur-sm border border-border transition-all duration-200 select-none rounded-xl
        ${
          isPressed
            ? "scale-95 shadow-sm"
            : "shadow-sm hover:shadow-md hover:scale-105 hover:bg-white"
        }
        ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
      `}
      tabIndex={0}
      role="button"
      aria-label={`Open ${title} application`}
      aria-pressed={isPressed}
      aria-describedby={`${appId}-description`}
      type="button"
    >
      <div className="pointer-events-none transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
        <LineArtIcon type={appId} />
      </div>
      <div
        className="text-xs font-semibold text-foreground pointer-events-none max-w-20 text-center leading-tight"
        id={`${appId}-description`}
      >
        {title}
      </div>
    </button>
  )
}
