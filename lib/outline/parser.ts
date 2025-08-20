export interface OutlineItem {
  name: string
  kind: "function" | "class" | "method" | "property" | "heading" | "section"
  line: number
  column: number
  level: number
  children?: OutlineItem[]
}

class OutlineParser {
  parseJavaScript(content: string): OutlineItem[] {
    const lines = content.split("\n")
    const items: OutlineItem[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Function declarations
      const functionMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/)
      if (functionMatch) {
        items.push({
          name: functionMatch[1],
          kind: "function",
          line: index + 1,
          column: line.indexOf("function") + 1,
          level: 0,
        })
      }

      // Arrow functions
      const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?$$[^)]*$$\s*=>/)
      if (arrowMatch) {
        items.push({
          name: arrowMatch[1],
          kind: "function",
          line: index + 1,
          column: line.indexOf(arrowMatch[1]) + 1,
          level: 0,
        })
      }

      // Class declarations
      const classMatch = trimmed.match(/^(?:export\s+)?class\s+(\w+)/)
      if (classMatch) {
        items.push({
          name: classMatch[1],
          kind: "class",
          line: index + 1,
          column: line.indexOf("class") + 1,
          level: 0,
        })
      }

      // Methods inside classes
      const methodMatch = trimmed.match(/^(?:async\s+)?(\w+)\s*$$[^)]*$$\s*{/)
      if (methodMatch && !functionMatch) {
        items.push({
          name: methodMatch[1],
          kind: "method",
          line: index + 1,
          column: line.indexOf(methodMatch[1]) + 1,
          level: 1,
        })
      }
    })

    return items
  }

  parseTypeScript(content: string): OutlineItem[] {
    const lines = content.split("\n")
    const items: OutlineItem[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Interface declarations
      const interfaceMatch = trimmed.match(/^(?:export\s+)?interface\s+(\w+)/)
      if (interfaceMatch) {
        items.push({
          name: interfaceMatch[1],
          kind: "class",
          line: index + 1,
          column: line.indexOf("interface") + 1,
          level: 0,
        })
      }

      // Type declarations
      const typeMatch = trimmed.match(/^(?:export\s+)?type\s+(\w+)\s*=/)
      if (typeMatch) {
        items.push({
          name: typeMatch[1],
          kind: "property",
          line: index + 1,
          column: line.indexOf("type") + 1,
          level: 0,
        })
      }

      // Include JavaScript patterns
      const jsItems = this.parseJavaScript(line)
      jsItems.forEach((item) => {
        items.push({
          ...item,
          line: index + 1,
        })
      })
    })

    return items
  }

  parseMarkdown(content: string): OutlineItem[] {
    const lines = content.split("\n")
    const items: OutlineItem[] = []

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length - 1
        const title = headingMatch[2].trim()

        items.push({
          name: title,
          kind: "heading",
          line: index + 1,
          column: 1,
          level,
        })
      }
    })

    return items
  }

  parseHTML(content: string): OutlineItem[] {
    const lines = content.split("\n")
    const items: OutlineItem[] = []

    lines.forEach((line, index) => {
      // HTML headings
      const headingMatch = line.match(/<(h[1-6])[^>]*>([^<]+)<\/h[1-6]>/i)
      if (headingMatch) {
        const level = Number.parseInt(headingMatch[1].charAt(1)) - 1
        const title = headingMatch[2].trim()

        items.push({
          name: title,
          kind: "heading",
          line: index + 1,
          column: line.indexOf("<") + 1,
          level,
        })
      }

      // IDs for navigation
      const idMatch = line.match(/id\s*=\s*["']([^"']+)["']/i)
      if (idMatch) {
        items.push({
          name: `#${idMatch[1]}`,
          kind: "section",
          line: index + 1,
          column: line.indexOf("id=") + 1,
          level: 2,
        })
      }
    })

    return items
  }

  parseCSS(content: string): OutlineItem[] {
    const lines = content.split("\n")
    const items: OutlineItem[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // CSS selectors
      const selectorMatch = trimmed.match(/^([.#]?[\w-]+(?:\s*[>+~]\s*[\w-]+)*)\s*{/)
      if (selectorMatch) {
        items.push({
          name: selectorMatch[1],
          kind: "section",
          line: index + 1,
          column: 1,
          level: 0,
        })
      }
    })

    return items
  }

  parse(content: string, language: string): OutlineItem[] {
    switch (language) {
      case "js":
        return this.parseJavaScript(content)
      case "ts":
        return this.parseTypeScript(content)
      case "md":
        return this.parseMarkdown(content)
      case "html":
        return this.parseHTML(content)
      case "css":
        return this.parseCSS(content)
      default:
        return []
    }
  }
}

export const outlineParser = new OutlineParser()
