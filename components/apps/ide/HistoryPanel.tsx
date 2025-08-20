"use client"

import { useState, useEffect } from "react"
import { Clock, RotateCcw, FileText } from "lucide-react"
import { historyStore, type FileVersion, type DiffLine } from "@/lib/history/store"
import type { FileNode } from "@/data/files"

interface HistoryPanelProps {
  activeFile: FileNode | null
  onRevert: (content: string) => void
}

export function HistoryPanel({ activeFile, onRevert }: HistoryPanelProps) {
  const [versions, setVersions] = useState<FileVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<FileVersion | null>(null)
  const [showDiff, setShowDiff] = useState(false)
  const [diff, setDiff] = useState<DiffLine[]>([])

  useEffect(() => {
    if (!activeFile) {
      setVersions([])
      setSelectedVersion(null)
      return
    }

    const fileVersions = historyStore.getVersions(activeFile.path)
    setVersions(fileVersions)
    setSelectedVersion(null)
    setShowDiff(false)
  }, [activeFile])

  const handleVersionSelect = (version: FileVersion) => {
    setSelectedVersion(version)

    if (activeFile) {
      const currentVersion = historyStore.getCurrentVersion(activeFile.path)
      if (currentVersion && currentVersion.ts !== version.ts) {
        const diffLines = historyStore.generateDiff(version.content, currentVersion.content)
        setDiff(diffLines)
        setShowDiff(true)
      } else {
        setShowDiff(false)
      }
    }
  }

  const handleRevert = (version: FileVersion) => {
    if (activeFile && confirm("Are you sure you want to revert to this version?")) {
      const revertedContent = historyStore.revertToVersion(activeFile.path, version.ts)
      if (revertedContent) {
        onRevert(revertedContent)
        // Refresh versions list
        const updatedVersions = historyStore.getVersions(activeFile.path)
        setVersions(updatedVersions)
        setSelectedVersion(null)
        setShowDiff(false)
      }
    }
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - ts

    if (diffMs < 60000) {
      return "Just now"
    } else if (diffMs < 3600000) {
      return `${Math.floor(diffMs / 60000)}m ago`
    } else if (diffMs < 86400000) {
      return `${Math.floor(diffMs / 3600000)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b-2 border-neo-fg">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">History</h3>
        {activeFile && (
          <div className="text-xs text-neo-fg opacity-60 mt-1">
            {activeFile.name} • {versions.length} versions
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Versions List */}
        <div className="w-1/2 border-r-2 border-neo-fg overflow-y-auto">
          {versions.length === 0 ? (
            <div className="p-4 text-center text-neo-fg opacity-60">
              {activeFile ? "No version history" : "No file selected"}
            </div>
          ) : (
            versions
              .slice()
              .reverse()
              .map((version, index) => (
                <div
                  key={version.ts}
                  className={`p-3 cursor-pointer border-b border-neo-fg border-opacity-20 hover:bg-neo-bg2 ${
                    selectedVersion?.ts === version.ts ? "bg-neo-bg2" : ""
                  }`}
                  onClick={() => handleVersionSelect(version)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-neo-fg opacity-60" />
                    <span className="text-sm font-medium text-neo-fg">{formatTimestamp(version.ts)}</span>
                    {index === 0 && <span className="text-xs text-neo-fg opacity-60">(current)</span>}
                  </div>
                  <div className="text-xs text-neo-fg opacity-60 mb-2">{version.description}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRevert(version)
                      }}
                      className="text-xs px-2 py-1 bg-neo-bg border border-neo-fg rounded hover:bg-neo-bg2"
                      disabled={index === 0}
                    >
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      Revert
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Diff View */}
        <div className="flex-1 overflow-y-auto">
          {showDiff && diff.length > 0 ? (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-neo-fg" />
                <span className="text-sm font-medium text-neo-fg">Changes</span>
              </div>
              <div className="font-mono text-xs">
                {diff.map((line, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 px-2 py-1 ${
                      line.type === "added"
                        ? "bg-green-100 text-green-800"
                        : line.type === "removed"
                          ? "bg-red-100 text-red-800"
                          : "text-neo-fg opacity-60"
                    }`}
                  >
                    <span className="w-8 text-right opacity-60">{line.lineNumber}</span>
                    <span className="w-4">{line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}</span>
                    <span className="flex-1">{line.content}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-neo-fg opacity-60">
              {selectedVersion ? "No changes to show" : "Select a version to see changes"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
