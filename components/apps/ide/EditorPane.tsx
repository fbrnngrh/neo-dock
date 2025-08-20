"use client"

import type { FileNode } from "@/data/files"
import { profile } from "@/data/profile"
import { projects } from "@/data/projects"
import { skills } from "@/data/skills"
import { CodeEditor } from "./CodeEditor"
import { findFileByPath } from "@/data/files"

interface EditorPaneProps {
  file: FileNode | null
  onRunResult?: (result: any) => void
}

export function EditorPane({ file, onRunResult }: EditorPaneProps) {
  if (!file) {
    return (
      <div className="flex-1 bg-neo-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-neo-fg mb-2">No file selected</h3>
          <p className="text-sm text-neo-fg opacity-60">Select a file from the explorer to start coding</p>
        </div>
      </div>
    )
  }

  // For playground files, use the code editor
  if (file.meta?.kind === "playground" || (file.language && ["js", "ts", "html", "css"].includes(file.language))) {
    // Get related files for HTML projects
    const relatedFiles: FileNode[] = []
    if (file.path.includes("/HTML App/") || file.path.includes("/Playground/HTML")) {
      const folderPath = file.path.substring(0, file.path.lastIndexOf("/"))
      const htmlFile = findFileByPath(`${folderPath}/index.html`)
      const cssFile = findFileByPath(`${folderPath}/style.css`)
      const jsFile = findFileByPath(`${folderPath}/app.js`)

      if (htmlFile && htmlFile.path !== file.path) relatedFiles.push(htmlFile)
      if (cssFile && cssFile.path !== file.path) relatedFiles.push(cssFile)
      if (jsFile && jsFile.path !== file.path) relatedFiles.push(jsFile)
    }

    return <CodeEditor file={file} onRunResult={onRunResult} relatedFiles={relatedFiles} />
  }

  const renderContent = () => {
    switch (file.meta?.kind) {
      case "about":
        return (
          <div className="space-y-6">
            <div className="bg-neo-bg2 border-2 border-neo-fg rounded-xl p-6">
              <h2 className="text-xl font-bold text-neo-fg mb-4">About Me</h2>
              <p className="text-neo-fg leading-relaxed mb-4">{profile.bio}</p>
              <div className="flex flex-wrap gap-2">
                {(profile.interests || []).map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neo-bg3 border-2 border-neo-fg rounded-lg text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-neo-bg2 border-2 border-neo-fg rounded-xl p-6">
              <h3 className="text-lg font-bold text-neo-fg mb-3">Experience</h3>
              <p className="text-neo-fg">{profile.experience}</p>
            </div>
          </div>
        )

      case "project":
        const project = projects.find((p) => file.name.includes(p.title))
        if (!project) return <div>Project not found</div>

        return (
          <div className="space-y-6">
            <div className="bg-neo-bg2 border-2 border-neo-fg rounded-xl p-6">
              <h2 className="text-xl font-bold text-neo-fg mb-4">{project.title}</h2>
              <p className="text-neo-fg leading-relaxed mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(project.tags || []).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-neo-bg3 border-2 border-neo-fg rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-neo-fg text-neo-bg border-2 border-neo-fg rounded-lg font-medium hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                  >
                    View Demo
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-neo-bg border-2 border-neo-fg rounded-lg font-medium hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                  >
                    View Code
                  </a>
                )}
              </div>
            </div>
          </div>
        )

      case "skill":
        const skillCategory = file.name.replace(".md", "").toLowerCase()
        const categorySkills = skills.filter((skill) => skill.category.toLowerCase() === skillCategory)

        return (
          <div className="space-y-6">
            <div className="bg-neo-bg2 border-2 border-neo-fg rounded-xl p-6">
              <h2 className="text-xl font-bold text-neo-fg mb-4">{file.name.replace(".md", "")} Skills</h2>
              <div className="grid gap-4">
                {categorySkills.map((skill, index) => (
                  <div key={index} className="bg-neo-bg3 border-2 border-neo-fg rounded-lg p-4">
                    <h3 className="font-bold text-neo-fg mb-2">{skill.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-neo-fg">Level:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-3 h-3 border-2 border-neo-fg ${
                              level <= skill.level ? "bg-neo-fg" : "bg-neo-bg"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-neo-fg opacity-80">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "contact":
        return (
          <div className="space-y-6">
            <div className="bg-neo-bg2 border-2 border-neo-fg rounded-xl p-6">
              <h2 className="text-xl font-bold text-neo-fg mb-4">Get In Touch</h2>
              <p className="text-neo-fg leading-relaxed mb-6">
                I'm always interested in new opportunities and collaborations. Feel free to reach out if you'd like to
                work together!
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-neo-fg">Email:</span>
                  <a href={`mailto:${profile.email}`} className="text-neo-fg underline hover:no-underline">
                    {profile.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-neo-fg">Location:</span>
                  <span className="text-neo-fg">{profile.location}</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-neo-bg2 border-2 border-neo-fg rounded-xl p-6">
            <h2 className="text-xl font-bold text-neo-fg mb-4">{file.name}</h2>
            <p className="text-neo-fg">File content would be displayed here.</p>
          </div>
        )
    }
  }

  return <div className="flex-1 bg-neo-bg p-6 overflow-y-auto">{renderContent()}</div>
}
