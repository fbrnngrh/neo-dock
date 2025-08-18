"use client"

import { skills } from "@/data/skills"

const categoryLabels = {
  frontend: "Frontend",
  backend: "Backend",
  tools: "Tools",
  cloud: "Cloud",
  db: "Database",
  testing: "Testing",
}

const levelStyles = {
  beginner: "bg-neo-bg3 text-neo-fg",
  intermediate: "bg-neo-bg2 text-neo-fg",
  advanced: "bg-neo-fg text-neo-bg",
  expert: "bg-neo-fg text-neo-bg font-extrabold",
}

export function SkillsView() {
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, typeof skills>,
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-neo-fg">Skills</h1>
        <p className="text-lg font-medium text-neo-fg">Technologies I wield with brutal efficiency.</p>
      </div>

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category} className="bg-neo-bg2 border-4 border-neo-border shadow-neo rounded-none p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 bg-neo-fg border-2 border-neo-border rounded-none"></div>
              <h2 className="text-2xl font-bold text-neo-fg">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySkills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between p-3 bg-neo-bg3 border-2 border-neo-border rounded-none"
                >
                  <span className="font-bold text-sm text-neo-fg">{skill.name}</span>
                  <span
                    className={`px-2 py-1 text-xs font-bold border-2 border-neo-border rounded-none ${levelStyles[skill.level]}`}
                  >
                    {skill.level.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-4">
        <h3 className="text-lg font-bold mb-3 text-neo-fg">Skill Levels</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(levelStyles).map(([level, styles]) => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-3 h-3 border-2 border-neo-border rounded-none ${styles}`}></div>
              <span className="text-sm font-bold text-neo-fg">{level.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
