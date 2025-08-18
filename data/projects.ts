export interface Project {
  slug: string
  title: string
  blurb: string
  tags: string[]
  image: string
  links: {
    demo?: string
    repo?: string
  }
  featured: boolean
}

export const projects: Project[] = [
  {
    slug: "neo-dashboard",
    title: "Neo Dashboard",
    blurb: "A brutalist admin dashboard with no-nonsense design and powerful functionality.",
    tags: ["React", "TypeScript", "Tailwind"],
    image: "/placeholder-8z514.png",
    links: {
      demo: "https://demo.example.com",
      repo: "https://github.com/example/neo-dashboard",
    },
    featured: true,
  },
  {
    slug: "command-center",
    title: "Command Center",
    blurb: "Terminal-inspired web app for managing development workflows.",
    tags: ["Next.js", "Node.js", "CLI"],
    image: "/terminal-command-interface.png",
    links: {
      demo: "https://demo.example.com",
      repo: "https://github.com/example/command-center",
    },
    featured: true,
  },
  {
    slug: "brutal-ui",
    title: "Brutal UI Kit",
    blurb: "Component library embracing the raw power of Neo-Brutalism.",
    tags: ["React", "Storybook", "Design System"],
    image: "/brutalist-ui-components.png",
    links: {
      demo: "https://demo.example.com",
      repo: "https://github.com/example/brutal-ui",
    },
    featured: false,
  },
]
