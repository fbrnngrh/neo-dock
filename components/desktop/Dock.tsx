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
          <defs>
            <linearGradient id="dockAboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="dockShadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25"/>
            </filter>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockAboutGrad)" filter="url(#dockShadow)"/>
          <circle cx="24" cy="17" r="5.5" fill="white" opacity="0.95"/>
          <path
            d="M14 37C14 32.5817 17.5817 29 22 29H26C30.4183 29 34 32.5817 34 37V38H14V37Z"
            fill="white"
            opacity="0.95"
          />
        </svg>
      )
    case "projects":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockProjectsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockProjectsGrad)" filter="url(#dockShadow)"/>
          <rect x="11" y="11" width="26" height="26" rx="3" fill="white" fillOpacity="0.15" />
          <path
            d="M11 17C11 13.6863 13.6863 11 17 11H31C34.3137 11 37 13.6863 37 17V18H11V17Z"
            fill="white"
            fillOpacity="0.25"
          />
          <circle cx="15" cy="14.5" r="1.2" fill="white" opacity="0.9"/>
          <circle cx="19" cy="14.5" r="1.2" fill="white" opacity="0.9"/>
          <circle cx="23" cy="14.5" r="1.2" fill="white" opacity="0.9"/>
          <path
            d="M18 27L22 31L30 23"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </svg>
      )
    case "skills":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockSkillsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockSkillsGrad)" filter="url(#dockShadow)"/>
          <path
            d="M24 9L27.708 19.292L38 23L27.708 26.708L24 37L20.292 26.708L10 23L20.292 19.292L24 9Z"
            fill="white"
            opacity="0.95"
          />
          <circle cx="34" cy="14" r="2.5" fill="white" fillOpacity="0.6" />
          <circle cx="14" cy="34" r="2" fill="white" fillOpacity="0.6" />
        </svg>
      )
    case "contact":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockContactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockContactGrad)" filter="url(#dockShadow)"/>
          <rect x="11" y="15" width="26" height="18" rx="2.5" fill="white" opacity="0.95"/>
          <path
            d="M11 17.5L24 26L37 17.5"
            stroke="#ec4899"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path d="M11 31L17 25" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
          <path d="M37 31L31 25" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        </svg>
      )
    case "ide":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockIdeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockIdeGrad)" filter="url(#dockShadow)"/>
          <rect x="11" y="11" width="26" height="26" rx="2.5" fill="rgba(0,0,0,0.4)" />
          <rect x="11" y="11" width="26" height="6" rx="2.5" fill="white" fillOpacity="0.15" />
          <circle cx="14.5" cy="14" r="1" fill="white" opacity="0.8"/>
          <circle cx="18" cy="14" r="1" fill="white" opacity="0.8"/>
          <circle cx="21.5" cy="14" r="1" fill="white" opacity="0.8"/>
          <path
            d="M17 26L21 30L17 34"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="23" y1="34" x2="28" y2="34" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case "terminal":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockTerminalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockTerminalGrad)" filter="url(#dockShadow)"/>
          <rect x="10" y="12" width="28" height="24" rx="2.5" fill="rgba(10,10,10,0.75)" />
          <path
            d="M15 21L19 25L15 29"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line x1="22" y1="29" x2="29" y2="29" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="15" cy="16" r="0.8" fill="#34d399" opacity="0.6"/>
          <circle cx="18" cy="16" r="0.8" fill="#34d399" opacity="0.6"/>
        </svg>
      )
    case "system":
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockSystemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockSystemGrad)" filter="url(#dockShadow)"/>
          <rect x="12" y="12" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
          <rect x="26" y="12" width="10" height="10" rx="2" fill="white" fillOpacity="0.7" />
          <rect x="12" y="26" width="10" height="10" rx="2" fill="white" fillOpacity="0.7" />
          <rect x="26" y="26" width="10" height="10" rx="2" fill="white" fillOpacity="0.5" />
        </svg>
      )
    default:
      return (
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="dockDefaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="100%" stopColor="#6b7280" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#dockDefaultGrad)" filter="url(#dockShadow)"/>
          <circle cx="24" cy="24" r="7" stroke="white" strokeWidth="2" opacity="0.9"/>
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
          bg-card/80 backdrop-blur-xl border border-border shadow-lg
          ${isMobile ? "rounded-2xl px-4 py-3" : "rounded-2xl px-6 py-3"}
        `}
      >
        <div className={`flex items-center ${isMobile ? "gap-4" : "gap-4"}`}>
          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-1.5"}`} role="group" aria-label="Applications">
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
                    relative hover:scale-110 transition-transform duration-200 rounded-xl hover:bg-muted
                    ${isMobile ? "p-2" : "p-1.5"}
                  `}
                  aria-label={isRunning ? `${isMinimized ? "Restore" : "Focus"} ${app.title}` : `Open ${app.title}`}
                  aria-pressed={isRunning && !isMinimized}
                  role="button"
                  tabIndex={0}
                >
                  <AppIcon type={app.id} />
                  {isRunning && (
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 bg-primary transition-all duration-150 ${
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

          <div className={`bg-border ${isMobile ? "w-px h-8" : "w-px h-6"}`} aria-hidden="true"></div>

          <button
            onClick={() => onSystemAction?.("menu")}
            className={`
              hover:scale-110 transition-transform duration-200 rounded-xl hover:bg-muted
              ${isMobile ? "p-2" : "p-1.5"}
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
                className={`bg-border ${isMobile ? "w-px h-8" : "w-px h-6"}`}
                aria-hidden="true"
              ></div>
              <div
                className={`font-bold text-foreground tracking-wider ${isMobile ? "text-base" : "text-sm"}`}
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
