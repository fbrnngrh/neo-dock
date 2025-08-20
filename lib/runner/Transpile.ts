export interface TranspileResult {
  code: string
  diagnostics: string[]
}

export class TypeScriptTranspiler {
  transpile(code: string): TranspileResult {
    const diagnostics: string[] = []

    try {
      // Simple TypeScript to JavaScript transpilation
      let transpiledCode = code

      // Remove type annotations from variable declarations
      transpiledCode = transpiledCode.replace(/:\s*[\w[\]<>|&,\s]+(?=\s*[=;,)])/g, "")

      // Remove interface declarations
      transpiledCode = transpiledCode.replace(/interface\s+\w+\s*{[^}]*}/g, "")

      // Remove type declarations
      transpiledCode = transpiledCode.replace(/type\s+\w+\s*=\s*[^;]+;/g, "")

      // Remove access modifiers
      transpiledCode = transpiledCode.replace(/\b(private|public|protected|readonly)\s+/g, "")

      // Remove generic type parameters
      transpiledCode = transpiledCode.replace(/<[^>]*>/g, "")

      // Remove return type annotations from functions
      transpiledCode = transpiledCode.replace(/\):\s*[\w[\]<>|&,\s]+(?=\s*{)/g, ")")

      // Remove as type assertions
      transpiledCode = transpiledCode.replace(/\s+as\s+[\w[\]<>|&,\s]+/g, "")

      // Clean up extra whitespace
      transpiledCode = transpiledCode.replace(/\s+/g, " ").trim()

      return {
        code: transpiledCode,
        diagnostics,
      }
    } catch (error) {
      diagnostics.push(`Transpilation error: ${error instanceof Error ? error.message : "Unknown error"}`)
      return {
        code: code, // Return original code if transpilation fails
        diagnostics,
      }
    }
  }
}

export const tsTranspiler = new TypeScriptTranspiler()
