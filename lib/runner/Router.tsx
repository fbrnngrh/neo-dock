import { WorkerRunner } from "./WorkerRunner"
import type { FileNode } from "@/data/files"

export type RunnerMode = "worker" | "iframe"

export class RunnerRouter {
  private workerRunner: WorkerRunner

  constructor() {
    this.workerRunner = new WorkerRunner(3000)
  }

  determineRunnerMode(file: FileNode): RunnerMode {
    if (!file.language) return "worker"

    switch (file.language) {
      case "html":
        return "iframe"
      case "js":
      case "ts":
        // Check if it's part of an HTML project
        if (file.path.includes("/HTML App/") || file.path.includes("/Playground/HTML")) {
          return "iframe"
        }
        return "worker"
      case "css":
        return "iframe"
      default:
        return "worker"
    }
  }

  async runFile(file: FileNode, relatedFiles?: FileNode[]): Promise<any> {
    const mode = this.determineRunnerMode(file)

    if (mode === "worker") {
      if (!file.content) {
        throw new Error("File has no content to execute")
      }
      return this.workerRunner.run(file.content, file.language as "js" | "ts")
    }

    // For iframe mode, we need to return the files for the IframeRunner component
    if (mode === "iframe") {
      const htmlFile = file.language === "html" ? file : relatedFiles?.find((f) => f.language === "html")
      const cssFile = relatedFiles?.find((f) => f.language === "css")
      const jsFile = file.language === "js" ? file : relatedFiles?.find((f) => f.language === "js")

      return {
        mode: "iframe",
        htmlContent: htmlFile?.content || "<html><body><h1>No HTML content</h1></body></html>",
        cssContent: cssFile?.content || "",
        jsContent: jsFile?.content || "",
      }
    }
  }

  stopExecution(): void {
    this.workerRunner.terminate()
  }

  getRunnerMode(file: FileNode): RunnerMode {
    return this.determineRunnerMode(file)
  }
}

// Singleton instance
export const runnerRouter = new RunnerRouter()
