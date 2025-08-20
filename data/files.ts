export interface FileNode {
  type: "file" | "folder"
  name: string
  path: string
  children?: FileNode[]
  meta?: {
    kind: "about" | "project" | "skill" | "contact"
    tags?: string[]
    featured?: boolean
  }
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
          meta: { kind: "project", tags: ["React", "Node.js", "MongoDB"], featured: true },
        },
        {
          type: "file",
          name: "Task Management App.md",
          path: "/Projects/Task Management App.md",
          meta: { kind: "project", tags: ["Next.js", "TypeScript", "Prisma"] },
        },
        {
          type: "file",
          name: "Weather Dashboard.md",
          path: "/Projects/Weather Dashboard.md",
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
          meta: { kind: "skill", tags: ["React", "Vue", "TypeScript"] },
        },
        {
          type: "file",
          name: "Backend.md",
          path: "/Skills/Backend.md",
          meta: { kind: "skill", tags: ["Node.js", "Python", "PostgreSQL"] },
        },
        {
          type: "file",
          name: "Tools.md",
          path: "/Skills/Tools.md",
          meta: { kind: "skill", tags: ["Git", "Docker", "AWS"] },
        },
      ],
    },
    {
      type: "file",
      name: "Contact.md",
      path: "/Contact.md",
      meta: { kind: "contact", featured: true },
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
