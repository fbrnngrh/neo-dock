"use client"
import { Keyboard, X } from "lucide-react"

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Editor shortcuts
  { keys: ["Cmd/Ctrl", "Enter"], description: "Run active file", category: "Editor" },
  { keys: ["Shift", "Esc"], description: "Stop execution", category: "Editor" },
  { keys: ["Cmd/Ctrl", "S"], description: "Save file", category: "Editor" },
  { keys: ["Cmd/Ctrl", "F"], description: "Find in file", category: "Editor" },
  { keys: ["Cmd/Ctrl", "G"], description: "Go to line", category: "Editor" },
  { keys: ["Cmd/Ctrl", "\\"], description: "Split editor", category: "Editor" },

  // Terminal shortcuts
  { keys: ["Cmd/Ctrl", "`"], description: "Toggle terminal", category: "Terminal" },
  { keys: ["Cmd/Ctrl", "Shift", "C"], description: "Clear terminal", category: "Terminal" },

  // Navigation shortcuts
  { keys: ["Cmd/Ctrl", "P"], description: "Open command palette", category: "Navigation" },
  { keys: ["Cmd/Ctrl", "Shift", "P"], description: "Open command palette (actions)", category: "Navigation" },
  { keys: ["Cmd/Ctrl", "O"], description: "Quick open file", category: "Navigation" },

  // Window shortcuts
  { keys: ["F1"], description: "Show keyboard shortcuts", category: "Help" },
  { keys: ["Esc"], description: "Close dialogs/panels", category: "General" },
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)))

  return (
    <div className="fixed inset-0 bg-neo-bg bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-neo-bg border-2 border-neo-fg rounded-xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-neo-fg bg-neo-bg2">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-neo-fg" />
            <h2 className="text-lg font-bold text-neo-fg">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neo-bg3 rounded transition-colors" title="Close (Esc)">
            <X className="w-5 h-5 text-neo-fg" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-3 border-b border-neo-fg/20 pb-1">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-neo-fg">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-neo-bg2 border border-neo-fg rounded text-xs font-mono text-neo-fg">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && <span className="text-neo-fg opacity-60">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neo-fg/20 bg-neo-bg2">
          <p className="text-xs text-neo-fg opacity-80 text-center">
            Press <kbd className="px-1 py-0.5 bg-neo-bg border border-neo-fg rounded text-xs">F1</kbd> anytime to show
            this help
          </p>
        </div>
      </div>
    </div>
  )
}
