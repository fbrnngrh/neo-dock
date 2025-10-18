"use client"

import { useMobile } from "@/hooks/use-mobile" // Added mobile detection

interface DockProps {
  runningApps: string[]
  minimizedApps: string[]
  onAppSelect: (appId: string) => void
  onSystemAction?: (action: string) => void
  apps: Array<{ id: string; title: string }>
  onOpenApp: (appId: string) => void
}

const AppIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "about":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#EF4444" />
          <rect x="10" y="14" width="28" height="20" rx="2" fill="white" />
          <path d="M10 16L24 26L38 16" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 32L17 25" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
          <path d="M38 32L31 25" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case "ide":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
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
    case "system":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#6B7280" />
          <rect x="10" y="10" width="12" height="12" rx="2" fill="white" fillOpacity="0.9" />
          <rect x="26" y="10" width="12" height="12" rx="2" fill="white" fillOpacity="0.7" />
          <rect x="10" y="26" width="12" height="12" rx="2" fill="white" fillOpacity="0.7" />
          <rect x="26" y="26" width="12" height="12" rx="2" fill="white" fillOpacity="0.5" />
        </svg>
      )
    default:
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="12" fill="#6B7280" />
          <circle cx="24" cy="24" r="8" stroke="white" strokeWidth="2" />
        </svg>
      )
  }
}

export function Dock({ runningApps, minimizedApps, onAppSelect, onSystemAction, apps, onOpenApp }: DockProps) {
  const isMobile = useMobile()

  return (
    <nav
      role="navigation"
      aria-label="Application dock"
      className={`
        absolute left-1/2 transform -translate-x-1/2 z-50
        ${isMobile ? "bottom-2" : "bottom-4"} 
      `}
    >
      <div
        className={`
          bg-neo-bg border-2 border-neo-border shadow-neo backdrop-blur-sm
          ${isMobile ? "rounded-2xl px-4 py-3" : "rounded-full px-8 py-4"}
        `}
      >
        <div className={`flex items-center ${isMobile ? "gap-4" : "gap-6"}`}>
          <div className={`flex items-center ${isMobile ? "gap-2" : "gap-3"}`} role="group" aria-label="Applications">
            {apps.map((app) => {
              const isRunning = runningApps.includes(app.id)
              const isMinimized = minimizedApps.includes(app.id)

              return (
                <button
                  key={app.id}
                  onClick={() => {
                    if (isRunning) {
                      onAppSelect(app.id)
                    } else {
                      onOpenApp(app.id)
                    }
                  }}
                  className={`
                    relative text-neo-fg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 neo-focus rounded-lg hover:bg-neo-bg2
                    ${isMobile ? "p-3" : "p-2"}
                  `}
                  aria-label={isRunning ? `${isMinimized ? "Restore" : "Focus"} ${app.title}` : `Open ${app.title}`}
                  aria-pressed={isRunning && !isMinimized}
                  role="button"
                  tabIndex={0}
                >
                  <AppIcon type={app.id} />
                  {isRunning && (
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 bg-neo-fg transition-all duration-150 ${
                        isMinimized
                          ? `w-2 h-2 rounded-sm ${isMobile ? "-bottom-1" : "-bottom-1"}` // Solid square for minimized
                          : `w-1.5 h-1.5 rounded-full ${isMobile ? "-bottom-1" : "-bottom-1"}` // Dot for running
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className={`bg-neo-border opacity-30 ${isMobile ? "w-px h-8" : "w-px h-6"}`} aria-hidden="true"></div>

          <button
            onClick={() => onSystemAction?.("menu")}
            className={`
              text-neo-fg hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform neo-focus rounded-lg hover:bg-neo-bg2
              ${isMobile ? "p-3" : "p-2"}
            `}
            aria-label="Open system menu"
            role="button"
            tabIndex={0}
          >
            <AppIcon type="system" />
          </button>

          {runningApps.length === 0 && (
            <>
              <div
                className={`bg-neo-border opacity-30 ${isMobile ? "w-px h-8" : "w-px h-6"}`}
                aria-hidden="true"
              ></div>
              <div
                className={`font-bold text-neo-fg tracking-wider ${isMobile ? "text-base" : "text-sm"}`}
                aria-label="Neo-OS branding"
              >
                NEO-OS
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
