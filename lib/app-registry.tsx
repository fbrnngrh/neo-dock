import type React from "react"
import { AboutView } from "@/components/views/AboutView"
import { ProjectsView } from "@/components/views/ProjectsView"
import { SkillsView } from "@/components/views/SkillsView"
import { ContactView } from "@/components/views/ContactView"
import { IDEView } from "@/components/views/IDEView"
import { TerminalView } from "@/components/views/TerminalView" // Added TerminalView import
import { apps } from "@/data/apps"

export interface AppRegistryItem {
  id: string
  title: string
  icon: string
  component: React.ComponentType
  keywords: string[]
}

export const appRegistry: AppRegistryItem[] = apps.map((app) => ({
  ...app,
  component: getAppComponent(app.id),
}))

function getAppComponent(appId: string): React.ComponentType {
  switch (appId) {
    case "about":
      return AboutView
    case "projects":
      return ProjectsView
    case "skills":
      return SkillsView
    case "contact":
      return ContactView
    case "ide":
      return IDEView
    case "terminal": // Added proper TerminalView component mapping
      return TerminalView
    default:
      return () => <div>Unknown app: {appId}</div>
  }
}

export function getAppById(appId: string): AppRegistryItem | undefined {
  return appRegistry.find((app) => app.id === appId)
}
