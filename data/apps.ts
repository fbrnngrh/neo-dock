export interface AppRegistryItem {
  id: "about" | "projects" | "skills" | "contact"
  title: string
  icon: string
  keywords: string[]
}

export const apps: AppRegistryItem[] = [
  {
    id: "about",
    title: "About",
    icon: "👤",
    keywords: ["about", "bio", "profile", "me", "developer", "experience"],
  },
  {
    id: "projects",
    title: "Projects",
    icon: "🚀",
    keywords: ["projects", "work", "portfolio", "code", "apps", "websites"],
  },
  {
    id: "skills",
    title: "Skills",
    icon: "⚡",
    keywords: ["skills", "tech", "technologies", "tools", "languages", "frameworks"],
  },
  {
    id: "contact",
    title: "Contact",
    icon: "📧",
    keywords: ["contact", "email", "social", "connect", "reach", "hire"],
  },
]
