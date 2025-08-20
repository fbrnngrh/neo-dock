"use client"

import { useState, useEffect } from "react"
import { AlertCircle, AlertTriangle, Info, FileText } from "lucide-react"
import { problemsCollector, type Problem } from "@/lib/problems/collector"

interface ProblemsPanelProps {
  onProblemClick: (filePath: string, line: number, column: number) => void
}

export function ProblemsPanel({ onProblemClick }: ProblemsPanelProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [filter, setFilter] = useState<"all" | "errors" | "warnings" | "info">("all")

  useEffect(() => {
    const unsubscribe = problemsCollector.subscribe(setProblems)
    setProblems(problemsCollector.getAllProblems())
    return unsubscribe
  }, [])

  const getIconForSeverity = (severity: Problem["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const filteredProblems = problems.filter((problem) => {
    if (filter === "all") return true
    if (filter === "errors") return problem.severity === "error"
    if (filter === "warnings") return problem.severity === "warning"
    if (filter === "info") return problem.severity === "info"
    return true
  })

  const problemCounts = {
    errors: problems.filter((p) => p.severity === "error").length,
    warnings: problems.filter((p) => p.severity === "warning").length,
    info: problems.filter((p) => p.severity === "info").length,
  }

  const handleProblemClick = (problem: Problem) => {
    onProblemClick(problem.filePath, problem.line, problem.column)
  }

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg">
      {/* Header */}
      <div className="px-3 py-2 border-b-2 border-neo-fg">
        <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider mb-2">Problems</h3>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded border border-neo-fg ${
              filter === "all" ? "bg-neo-fg text-neo-bg" : "bg-neo-bg text-neo-fg hover:bg-neo-bg2"
            }`}
          >
            All ({problems.length})
          </button>
          <button
            onClick={() => setFilter("errors")}
            className={`px-2 py-1 rounded border border-neo-fg ${
              filter === "errors" ? "bg-neo-fg text-neo-bg" : "bg-neo-bg text-neo-fg hover:bg-neo-bg2"
            }`}
          >
            <AlertCircle className="w-3 h-3 inline mr-1 text-red-500" />
            {problemCounts.errors}
          </button>
          <button
            onClick={() => setFilter("warnings")}
            className={`px-2 py-1 rounded border border-neo-fg ${
              filter === "warnings" ? "bg-neo-fg text-neo-bg" : "bg-neo-bg text-neo-fg hover:bg-neo-bg2"
            }`}
          >
            <AlertTriangle className="w-3 h-3 inline mr-1 text-yellow-500" />
            {problemCounts.warnings}
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="overflow-y-auto">
        {filteredProblems.length === 0 ? (
          <div className="p-4 text-center text-neo-fg opacity-60">
            {filter === "all" ? "No problems found" : `No ${filter} found`}
          </div>
        ) : (
          filteredProblems.map((problem, index) => {
            const fileName = problem.filePath.split("/").pop() || problem.filePath

            return (
              <div
                key={`${problem.filePath}-${problem.line}-${index}`}
                className="p-3 cursor-pointer hover:bg-neo-bg2 border-b border-neo-fg border-opacity-20"
                onClick={() => handleProblemClick(problem)}
              >
                <div className="flex items-start gap-2">
                  {getIconForSeverity(problem.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-neo-fg font-medium mb-1">{problem.message}</div>
                    <div className="flex items-center gap-2 text-xs text-neo-fg opacity-60">
                      <FileText className="w-3 h-3" />
                      <span>{fileName}</span>
                      <span>•</span>
                      <span>
                        Line {problem.line}:{problem.column}
                      </span>
                      {problem.code && (
                        <>
                          <span>•</span>
                          <span>{problem.code}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
