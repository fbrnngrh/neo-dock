"use client"

export interface Snippet {
  id: string
  trigger: string
  name: string
  description: string
  body: string
  language?: string
}

class SnippetsEngine {
  private static instance: SnippetsEngine
  private snippets: Map<string, Snippet> = new Map()

  private constructor() {
    this.loadSnippets()
    this.initializeDefaultSnippets()
  }

  static getInstance(): SnippetsEngine {
    if (!SnippetsEngine.instance) {
      SnippetsEngine.instance = new SnippetsEngine()
    }
    return SnippetsEngine.instance
  }

  private loadSnippets() {
    try {
      const saved = localStorage.getItem("neo.ide.snippets")
      if (saved) {
        const snippetsArray: Snippet[] = JSON.parse(saved)
        snippetsArray.forEach((snippet) => {
          this.snippets.set(snippet.trigger, snippet)
        })
      }
    } catch (error) {
      console.error("Failed to load snippets:", error)
    }
  }

  private saveSnippets() {
    try {
      const snippetsArray = Array.from(this.snippets.values())
      localStorage.setItem("neo.ide.snippets", JSON.stringify(snippetsArray))
    } catch (error) {
      console.error("Failed to save snippets:", error)
    }
  }

  private initializeDefaultSnippets() {
    const defaultSnippets: Snippet[] = [
      {
        id: "for-loop",
        trigger: "/for",
        name: "For Loop",
        description: "Basic for loop",
        body: `for (let i = 0; i < array.length; i++) {
  const element = array[i];
  // code
}`,
        language: "js",
      },
      {
        id: "fetch-api",
        trigger: "/fetch",
        name: "Fetch API",
        description: "Async fetch request",
        body: `const response = await fetch('url');
const data = await response.json();
// handle data`,
        language: "js",
      },
      {
        id: "debounce",
        trigger: "/debounce",
        name: "Debounce Function",
        description: "Debounce utility function",
        body: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`,
        language: "js",
      },
      {
        id: "react-component",
        trigger: "/component",
        name: "React Component",
        description: "Basic React functional component",
        body: `function ComponentName() {
  return (
    <div>
      // component content
    </div>
  );
}

export default ComponentName;`,
        language: "js",
      },
      {
        id: "usestate",
        trigger: "/useState",
        name: "useState Hook",
        description: "React useState hook",
        body: `const [state, setState] = useState(initialValue);`,
        language: "js",
      },
      {
        id: "useeffect",
        trigger: "/useEffect",
        name: "useEffect Hook",
        description: "React useEffect hook",
        body: `useEffect(() => {
  // effect code
  
  return () => {
    // cleanup
  };
}, [dependencies]);`,
        language: "js",
      },
    ]

    defaultSnippets.forEach((snippet) => {
      if (!this.snippets.has(snippet.trigger)) {
        this.snippets.set(snippet.trigger, snippet)
      }
    })

    this.saveSnippets()
  }

  getAllSnippets(): Snippet[] {
    return Array.from(this.snippets.values())
  }

  getSnippetByTrigger(trigger: string): Snippet | null {
    return this.snippets.get(trigger) || null
  }

  addSnippet(snippet: Snippet): void {
    this.snippets.set(snippet.trigger, snippet)
    this.saveSnippets()
  }

  updateSnippet(snippet: Snippet): void {
    this.snippets.set(snippet.trigger, snippet)
    this.saveSnippets()
  }

  deleteSnippet(trigger: string): void {
    this.snippets.delete(trigger)
    this.saveSnippets()
  }

  // Expand snippet with placeholder replacement
  expandSnippet(snippet: Snippet, placeholders: Record<string, string> = {}): string {
    let expanded = snippet.body

    // Replace numbered placeholders ${1:default}, ${2:default}, etc.
    expanded = expanded.replace(/\$\{(\d+):([^}]*)\}/g, (match, num, defaultValue) => {
      return placeholders[num] || defaultValue || `[${num}]`
    })

    // Replace simple placeholders ${variable}
    expanded = expanded.replace(/\$\{([^}:]+)\}/g, (match, variable) => {
      return placeholders[variable] || `[${variable}]`
    })

    return expanded
  }

  // Get suggestions based on current input
  getSuggestions(input: string, language?: string): Snippet[] {
    const suggestions = Array.from(this.snippets.values()).filter((snippet) => {
      const matchesTrigger = snippet.trigger.toLowerCase().includes(input.toLowerCase())
      const matchesLanguage = !language || !snippet.language || snippet.language === language
      return matchesTrigger && matchesLanguage
    })

    return suggestions.sort((a, b) => {
      // Prioritize exact trigger matches
      if (a.trigger === input) return -1
      if (b.trigger === input) return 1

      // Then by trigger similarity
      const aStartsWith = a.trigger.toLowerCase().startsWith(input.toLowerCase())
      const bStartsWith = b.trigger.toLowerCase().startsWith(input.toLowerCase())

      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1

      return a.trigger.localeCompare(b.trigger)
    })
  }
}

export const snippetsEngine = SnippetsEngine.getInstance()
