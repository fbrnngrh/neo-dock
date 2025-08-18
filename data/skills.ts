export interface Skill {
  name: string
  category: "frontend" | "backend" | "tools" | "cloud" | "db" | "testing"
  level: "beginner" | "intermediate" | "advanced" | "expert"
}

export const skills: Skill[] = [
  // Frontend
  { name: "React", category: "frontend", level: "expert" },
  { name: "TypeScript", category: "frontend", level: "expert" },
  { name: "Next.js", category: "frontend", level: "advanced" },
  { name: "Tailwind CSS", category: "frontend", level: "expert" },
  { name: "Framer Motion", category: "frontend", level: "advanced" },

  // Backend
  { name: "Node.js", category: "backend", level: "advanced" },
  { name: "Python", category: "backend", level: "intermediate" },
  { name: "GraphQL", category: "backend", level: "advanced" },
  { name: "REST APIs", category: "backend", level: "expert" },

  // Tools
  { name: "Git", category: "tools", level: "expert" },
  { name: "Webpack", category: "tools", level: "advanced" },
  { name: "Vite", category: "tools", level: "advanced" },
  { name: "Turborepo", category: "tools", level: "intermediate" },

  // Cloud
  { name: "Vercel", category: "cloud", level: "expert" },
  { name: "AWS", category: "cloud", level: "intermediate" },
  { name: "Docker", category: "cloud", level: "advanced" },

  // Database
  { name: "PostgreSQL", category: "db", level: "advanced" },
  { name: "MongoDB", category: "db", level: "intermediate" },
  { name: "Redis", category: "db", level: "intermediate" },

  // Testing
  { name: "Jest", category: "testing", level: "advanced" },
  { name: "Playwright", category: "testing", level: "intermediate" },
  { name: "Cypress", category: "testing", level: "intermediate" },
]
