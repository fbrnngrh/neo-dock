"use client"

import type { FileNode } from "@/data/files"

interface InspectorPaneProps {
  file: FileNode | null
}

export function InspectorPane({ file }: InspectorPaneProps) {
  if (!file) {
    return (
      <div className="w-64 bg-neo-bg border-l-2 border-neo-fg p-4">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-4">Inspector</h3>
        <p className="text-sm text-neo-fg opacity-60">No file selected</p>
      </div>
    )
  }

  return (
    <div className="w-64 bg-neo-bg border-l-2 border-neo-fg p-4">
      <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-4">Inspector</h3>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-neo-fg mb-2">File Info</h4>
          <div className="space-y-1">
            <div className="text-xs text-neo-fg opacity-80">
              <span className="font-medium">Name:</span> {file.name}
            </div>
            <div className="text-xs text-neo-fg opacity-80">
              <span className="font-medium">Path:</span> {file.path}
            </div>
            <div className="text-xs text-neo-fg opacity-80">
              <span className="font-medium">Type:</span> {file.type}
            </div>
          </div>
        </div>

        {file.meta && (
          <div>
            <h4 className="text-sm font-medium text-neo-fg mb-2">Metadata</h4>
            <div className="space-y-2">
              <div className="text-xs text-neo-fg opacity-80">
                <span className="font-medium">Kind:</span> {file.meta.kind}
              </div>

              {file.meta.featured && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neo-fg rounded-full" />
                  <span className="text-xs font-medium text-neo-fg">Featured</span>
                </div>
              )}

              {file.meta.tags && file.meta.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-neo-fg block mb-1">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {file.meta.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-neo-bg2 border border-neo-fg rounded text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
