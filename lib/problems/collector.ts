export interface Problem {
  filePath: string
  line: number
  column: number
  message: string
  severity: "error" | "warning" | "info"
  source: "syntax" | "runtime" | "typescript"
  code?: string
}

class ProblemsCollector {
  private static instance: ProblemsCollector
  private problems: Map<string, Problem[]> = new Map()
  private listeners: Set<(problems: Problem[]) => void> = new Set()

  static getInstance(): ProblemsCollector {
    if (!ProblemsCollector.instance) {
      ProblemsCollector.instance = new ProblemsCollector()
    }
    return ProblemsCollector.instance
  }

  addProblems(filePath: string, problems: Problem[]): void {
    this.problems.set(filePath, problems)
    this.notifyListeners()
  }

  removeProblems(filePath: string): void {
    this.problems.delete(filePath)
    this.notifyListeners()
  }

  getAllProblems(): Problem[] {
    const allProblems: Problem[] = []
    for (const problems of this.problems.values()) {
      allProblems.push(...problems)
    }
    return allProblems.sort((a, b) => {
      // Sort by severity (error > warning > info), then by file, then by line
      const severityOrder = { error: 0, warning: 1, info: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      if (a.filePath !== b.filePath) {
        return a.filePath.localeCompare(b.filePath)
      }
      return a.line - b.line
    })
  }

  getProblemsForFile(filePath: string): Problem[] {
    return this.problems.get(filePath) || []
  }

  subscribe(listener: (problems: Problem[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    const allProblems = this.getAllProblems()
    this.listeners.forEach((listener) => listener(allProblems))
  }

  // Basic syntax checking for JavaScript/TypeScript
  checkJavaScriptSyntax(content: string, filePath: string): Problem[] {
    const problems: Problem[] = []
    const lines = content.split("\n")

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // Check for common syntax errors

      // Unclosed brackets/braces/parentheses
      const openBrackets = (line.match(/\[/g) || []).length
      const closeBrackets = (line.match(/\]/g) || []).length
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length

      if (openBrackets > closeBrackets) {
        problems.push({
          filePath,
          line: lineNumber,
          column: line.lastIndexOf("[") + 1,
          message: "Unclosed bracket",
          severity: "error",
          source: "syntax",
          code: "unclosed-bracket",
        })
      }

      if (openBraces > closeBraces) {
        problems.push({
          filePath,
          line: lineNumber,
          column: line.lastIndexOf("{") + 1,
          message: "Unclosed brace",
          severity: "error",
          source: "syntax",
          code: "unclosed-brace",
        })
      }

      if (openParens > closeParens) {
        problems.push({
          filePath,
          line: lineNumber,
          column: line.lastIndexOf("(") + 1,
          message: "Unclosed parenthesis",
          severity: "error",
          source: "syntax",
          code: "unclosed-paren",
        })
      }

      // Missing semicolons (warning)
      const trimmed = line.trim()
      if (
        trimmed &&
        !trimmed.endsWith(";") &&
        !trimmed.endsWith("{") &&
        !trimmed.endsWith("}") &&
        !trimmed.startsWith("//") &&
        !trimmed.startsWith("/*") &&
        !trimmed.includes("//") &&
        trimmed.match(/^(const|let|var|return|throw)\s+/)
      ) {
        problems.push({
          filePath,
          line: lineNumber,
          column: line.length,
          message: "Missing semicolon",
          severity: "warning",
          source: "syntax",
          code: "missing-semicolon",
        })
      }

      // Unused variables (basic detection)
      const varMatch = trimmed.match(/^(?:const|let|var)\s+(\w+)/)
      if (varMatch) {
        const varName = varMatch[1]
        const restOfContent = lines.slice(index + 1).join("\n")
        if (!restOfContent.includes(varName)) {
          problems.push({
            filePath,
            line: lineNumber,
            column: line.indexOf(varName) + 1,
            message: `'${varName}' is defined but never used`,
            severity: "warning",
            source: "syntax",
            code: "unused-variable",
          })
        }
      }
    })

    return problems
  }

  // Runtime error collection
  addRuntimeError(filePath: string, error: Error, line?: number): void {
    const problem: Problem = {
      filePath,
      line: line || 1,
      column: 1,
      message: error.message,
      severity: "error",
      source: "runtime",
      code: error.name,
    }

    const existingProblems = this.problems.get(filePath) || []
    const runtimeProblems = existingProblems.filter((p) => p.source !== "runtime")
    runtimeProblems.push(problem)

    this.problems.set(filePath, runtimeProblems)
    this.notifyListeners()
  }

  clearRuntimeErrors(filePath: string): void {
    const existingProblems = this.problems.get(filePath) || []
    const nonRuntimeProblems = existingProblems.filter((p) => p.source !== "runtime")

    if (nonRuntimeProblems.length === 0) {
      this.problems.delete(filePath)
    } else {
      this.problems.set(filePath, nonRuntimeProblems)
    }

    this.notifyListeners()
  }
}

export const problemsCollector = ProblemsCollector.getInstance()
