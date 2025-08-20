export interface FileNode {
  type: "file" | "folder"
  name: string
  path: string
  children?: FileNode[]
  content?: string // Added content field for actual file content
  language?: "js" | "ts" | "html" | "css" | "md" // Added language field for syntax highlighting
  meta?: {
    kind?: "about" | "project" | "skill" | "contact" | "playground" // Added playground kind
    tags?: string[]
    featured?: boolean
    templateId?: string // Added templateId for playground templates
  }
}

const playgroundTemplates = {
  "js-worker": {
    files: [
      {
        type: "file" as const,
        name: "main.js",
        path: "/Playground/JS Worker/main.js",
        language: "js" as const,
        content: `// JavaScript Worker Example
console.log("Hello from Worker!");

// Example: Simple calculation
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci(10):", fibonacci(10));

// Example: Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);`,
        meta: { kind: "playground", templateId: "js-worker" },
      },
    ],
  },
  "html-iframe": {
    files: [
      {
        type: "file" as const,
        name: "index.html",
        path: "/Playground/HTML App/index.html",
        language: "html" as const,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Interactive Counter</h1>
        <div class="counter">
            <button id="decrease">-</button>
            <span id="count">0</span>
            <button id="increase">+</button>
        </div>
        <button id="reset">Reset</button>
    </div>
    <script src="app.js"></script>
</body>
</html>`,
        meta: { kind: "playground", templateId: "html-iframe" },
      },
      {
        type: "file" as const,
        name: "style.css",
        path: "/Playground/HTML App/style.css",
        language: "css" as const,
        content: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: #f5f5f5;
}

.container {
    max-width: 400px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    text-align: center;
}

.counter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 2rem 0;
}

button {
    padding: 0.5rem 1rem;
    border: 2px solid #333;
    background: white;
    cursor: pointer;
    font-size: 1rem;
    border-radius: 4px;
    transition: all 0.2s;
}

button:hover {
    background: #333;
    color: white;
}

#count {
    font-size: 2rem;
    font-weight: bold;
    min-width: 3rem;
}`,
        meta: { kind: "playground", templateId: "html-iframe" },
      },
      {
        type: "file" as const,
        name: "app.js",
        path: "/Playground/HTML App/app.js",
        language: "js" as const,
        content: `let count = 0;

const countElement = document.getElementById('count');
const increaseBtn = document.getElementById('increase');
const decreaseBtn = document.getElementById('decrease');
const resetBtn = document.getElementById('reset');

function updateDisplay() {
    countElement.textContent = count;
    console.log('Count updated to:', count);
}

increaseBtn.addEventListener('click', () => {
    count++;
    updateDisplay();
});

decreaseBtn.addEventListener('click', () => {
    count--;
    updateDisplay();
});

resetBtn.addEventListener('click', () => {
    count = 0;
    updateDisplay();
    console.log('Counter reset');
});

console.log('Counter app initialized');`,
        meta: { kind: "playground", templateId: "html-iframe" },
      },
    ],
  },
  "ts-worker": {
    files: [
      {
        type: "file" as const,
        name: "main.ts",
        path: "/Playground/TS Worker/main.ts",
        language: "ts" as const,
        content: `// TypeScript Worker Example
interface User {
  id: number;
  name: string;
  email: string;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(\`Added user: \${user.name}\`);
  }

  getUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }
}

// Example usage
const manager = new UserManager();

manager.addUser({
  id: 1,
  name: "John Doe",
  email: "john@example.com"
});

manager.addUser({
  id: 2,
  name: "Jane Smith", 
  email: "jane@example.com"
});

console.log("All users:", manager.getAllUsers());
console.log("User 1:", manager.getUser(1));`,
        meta: { kind: "playground", templateId: "ts-worker" },
      },
    ],
  },
}

export const fileTree: FileNode = {
  type: "folder",
  name: "Portfolio",
  path: "/",
  children: [
    {
      type: "file",
      name: "About.md",
      path: "/About.md",
      language: "md",
      meta: { kind: "about", featured: true },
    },
    {
      type: "folder",
      name: "Projects",
      path: "/Projects",
      children: [
        {
          type: "file",
          name: "E-Commerce Platform.md",
          path: "/Projects/E-Commerce Platform.md",
          language: "md",
          meta: { kind: "project", tags: ["React", "Node.js", "MongoDB"], featured: true },
        },
        {
          type: "file",
          name: "Task Management App.md",
          path: "/Projects/Task Management App.md",
          language: "md",
          meta: { kind: "project", tags: ["Next.js", "TypeScript", "Prisma"] },
        },
        {
          type: "file",
          name: "Weather Dashboard.md",
          path: "/Projects/Weather Dashboard.md",
          language: "md",
          meta: { kind: "project", tags: ["Vue.js", "API Integration"] },
        },
      ],
    },
    {
      type: "folder",
      name: "Skills",
      path: "/Skills",
      children: [
        {
          type: "file",
          name: "Frontend.md",
          path: "/Skills/Frontend.md",
          language: "md",
          meta: { kind: "skill", tags: ["React", "Vue", "TypeScript"] },
        },
        {
          type: "file",
          name: "Backend.md",
          path: "/Skills/Backend.md",
          language: "md",
          meta: { kind: "skill", tags: ["Node.js", "Python", "PostgreSQL"] },
        },
        {
          type: "file",
          name: "Tools.md",
          path: "/Skills/Tools.md",
          language: "md",
          meta: { kind: "skill", tags: ["Git", "Docker", "AWS"] },
        },
      ],
    },
    {
      type: "file",
      name: "Contact.md",
      path: "/Contact.md",
      language: "md",
      meta: { kind: "contact", featured: true },
    },
    {
      type: "folder",
      name: "Playground",
      path: "/Playground",
      children: [
        {
          type: "folder",
          name: "JS Worker",
          path: "/Playground/JS Worker",
          children: playgroundTemplates["js-worker"].files,
        },
        {
          type: "folder",
          name: "HTML App",
          path: "/Playground/HTML App",
          children: playgroundTemplates["html-iframe"].files,
        },
        {
          type: "folder",
          name: "TS Worker",
          path: "/Playground/TS Worker",
          children: playgroundTemplates["ts-worker"].files,
        },
      ],
    },
  ],
}

export function findFileByPath(path: string, node: FileNode = fileTree): FileNode | null {
  if (node.path === path) return node

  if (node.children) {
    for (const child of node.children) {
      const found = findFileByPath(path, child)
      if (found) return found
    }
  }

  return null
}

export function getAllFiles(node: FileNode = fileTree): FileNode[] {
  const files: FileNode[] = []

  if (node.type === "file") {
    files.push(node)
  }

  if (node.children) {
    for (const child of node.children) {
      files.push(...getAllFiles(child))
    }
  }

  return files
}

export function getPlaygroundTemplates() {
  return playgroundTemplates
}

export function createPlaygroundFromTemplate(templateId: string, name?: string): FileNode[] {
  const template = playgroundTemplates[templateId as keyof typeof playgroundTemplates]
  if (!template) return []

  return template.files.map((file) => ({
    ...file,
    path: name ? file.path.replace(/\/[^/]+\//, `/${name}/`) : file.path,
  }))
}
