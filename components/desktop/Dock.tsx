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
  const iconProps = {
    width: 24,
    height: 24,
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
    case "ide":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="18" height="10" x="3" y="11" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="m12 7-2 4h4l-2-4Z" />
        </svg>
      )
    case "terminal":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <polyline points="4,17 10,11 4,5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      )
    case "system":
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
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
