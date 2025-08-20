export interface CLICommand {
  id: string
  help: string
  args: string[]
  example: string
}

export interface CommandResult {
  type: "success" | "error" | "info"
  message: string
  action?: {
    type: "open-app" | "filter-projects" | "copy-text" | "toggle-theme" | "close-windows" | "focus-window"
    payload?: any
  }
}

export const availableCommands: CLICommand[] = [
  {
    id: "help",
    help: "Show available commands and their usage",
    args: [],
    example: "help",
  },
  {
    id: "open",
    help: "Open an application or section",
    args: ["app"],
    example: "open projects",
  },
  {
    id: "projects",
    help: "Filter projects by tags",
    args: ["--tag", "--mode"],
    example: "projects --tag react,nextjs --mode and",
  },
  {
    id: "skills",
    help: "Show skills by group",
    args: ["--group"],
    example: "skills --group frontend",
  },
  {
    id: "contact",
    help: "Contact actions",
    args: ["--copy-email"],
    example: "contact --copy-email",
  },
  {
    id: "theme",
    help: "Toggle theme settings",
    args: ["invert"],
    example: "theme invert",
  },
  {
    id: "close-all-windows",
    help: "Close all open windows",
    args: [],
    example: "close-all-windows",
  },
  {
    id: "focus-next-window",
    help: "Focus the next window",
    args: [],
    example: "focus-next-window",
  },
]

export function parseCommand(input: string): CommandResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { type: "error", message: "Please enter a command. Type 'help' for available commands." }
  }

  const parts = trimmed.split(/\s+/)
  const command = parts[0].toLowerCase()
  const args = parts.slice(1)

  switch (command) {
    case "help":
      return {
        type: "info",
        message: generateHelpMessage(),
      }

    case "open":
      if (args.length === 0) {
        return {
          type: "error",
          message: "Usage: open <app>\nAvailable apps: about, projects, skills, contact, ide, terminal",
        }
      }
      const appName = args[0].toLowerCase()
      const validApps = ["about", "projects", "skills", "contact", "ide", "terminal"]

      if (!validApps.includes(appName)) {
        return { type: "error", message: `Unknown app: ${appName}\nAvailable apps: ${validApps.join(", ")}` }
      }

      return {
        type: "success",
        message: `Opening ${appName}...`,
        action: { type: "open-app", payload: { appId: appName } },
      }

    case "projects":
      return parseProjectsCommand(args)

    case "skills":
      return parseSkillsCommand(args)

    case "contact":
      if (args.includes("--copy-email")) {
        return {
          type: "success",
          message: "Email copied to clipboard!",
          action: { type: "copy-text", payload: { text: "developer@example.com" } },
        }
      }
      return { type: "error", message: "Usage: contact --copy-email" }

    case "theme":
      if (args[0] === "invert") {
        return {
          type: "success",
          message: "Theme inverted!",
          action: { type: "toggle-theme" },
        }
      }
      return { type: "error", message: "Usage: theme invert" }

    case "close-all-windows":
      return {
        type: "success",
        message: "Closing all windows...",
        action: { type: "close-windows" },
      }

    case "focus-next-window":
      return {
        type: "success",
        message: "Focusing next window...",
        action: { type: "focus-window" },
      }

    default:
      return {
        type: "error",
        message: `Unknown command: ${command}\nType 'help' for available commands.`,
      }
  }
}

function generateHelpMessage(): string {
  let message = "Available commands:\n\n"

  availableCommands.forEach((cmd) => {
    message += `${cmd.id.padEnd(20)} ${cmd.help}\n`
    message += `${"".padEnd(20)} Example: ${cmd.example}\n\n`
  })

  return message
}

function parseProjectsCommand(args: string[]): CommandResult {
  let tags: string[] = []
  let mode: "and" | "or" = "and"

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tag" && i + 1 < args.length) {
      tags = args[i + 1].split(",").map((tag) => tag.trim())
      i++ // Skip the next argument as it's the tag value
    } else if (args[i] === "--mode" && i + 1 < args.length) {
      const modeValue = args[i + 1].toLowerCase()
      if (modeValue === "and" || modeValue === "or") {
        mode = modeValue
      }
      i++ // Skip the next argument as it's the mode value
    }
  }

  if (tags.length === 0) {
    return { type: "error", message: "Usage: projects --tag <tag1,tag2> [--mode and|or]" }
  }

  return {
    type: "success",
    message: `Filtering projects by tags: ${tags.join(", ")} (${mode.toUpperCase()} mode)`,
    action: { type: "filter-projects", payload: { tags, mode } },
  }
}

function parseSkillsCommand(args: string[]): CommandResult {
  if (args.length === 0 || args[0] !== "--group") {
    return { type: "error", message: "Usage: skills --group <frontend|backend|tools|cloud|db|testing>" }
  }

  if (args.length < 2) {
    return { type: "error", message: "Please specify a group: frontend, backend, tools, cloud, db, testing" }
  }

  const group = args[1].toLowerCase()
  const validGroups = ["frontend", "backend", "tools", "cloud", "db", "testing"]

  if (!validGroups.includes(group)) {
    return { type: "error", message: `Invalid group: ${group}\nValid groups: ${validGroups.join(", ")}` }
  }

  return {
    type: "success",
    message: `Opening skills filtered by group: ${group}`,
    action: { type: "open-app", payload: { appId: "skills", filter: group } },
  }
}

export function getCommandSuggestions(input: string): string[] {
  const trimmed = input.trim().toLowerCase()

  if (!trimmed) {
    return availableCommands.map((cmd) => cmd.id)
  }

  const suggestions: string[] = []

  // Command name suggestions
  availableCommands.forEach((cmd) => {
    if (cmd.id.startsWith(trimmed)) {
      suggestions.push(cmd.id)
    }
  })

  // Argument suggestions based on current command
  const parts = trimmed.split(/\s+/)
  const command = parts[0]

  if (command === "open" && parts.length === 2) {
    const apps = ["about", "projects", "skills", "contact", "ide", "terminal"]
    apps.forEach((app) => {
      if (app.startsWith(parts[1])) {
        suggestions.push(`open ${app}`)
      }
    })
  }

  return suggestions.slice(0, 5) // Limit to 5 suggestions
}
