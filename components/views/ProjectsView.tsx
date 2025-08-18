"use client"

import { useProjectsFilter } from "@/hooks/use-projects-filter"
import { projects } from "@/data/projects"

export function ProjectsView() {
  const {
    selectedTag,
    searchQuery,
    allTags,
    filteredProjects,
    setSelectedTag,
    setSearchQuery,
    clearFilters,
    hasActiveFilters,
  } = useProjectsFilter()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-neo-fg">Projects</h1>
        <p className="text-lg font-medium text-neo-fg">Building the future, one brutal line of code at a time.</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-neo-bg2 border-4 border-neo-border shadow-neo rounded-none p-4 space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="project-search" className="block text-sm font-bold mb-2 text-neo-fg">
            Search Projects
          </label>
          <input
            id="project-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or tags..."
            className="w-full p-3 border-4 border-neo-border rounded-none neo-focus font-mono text-sm bg-neo-bg3 text-neo-fg placeholder-neo-fg-muted caret-neo-fg"
          />
        </div>

        {/* Tag Filter */}
        <div>
          <label className="block text-sm font-bold mb-2 text-neo-fg">Filter by Technology</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={clearFilters}
              className={`px-3 py-2 text-sm font-bold border-4 border-neo-border rounded-none transition-all duration-200 neo-focus ${
                !hasActiveFilters
                  ? "bg-neo-fg text-neo-bg"
                  : "bg-neo-bg text-neo-fg hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
              }`}
            >
              All ({filteredProjects.length})
            </button>
            {allTags.map((tag) => {
              const tagCount = projects.filter((p) => p.tags.includes(tag)).length
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-2 text-sm font-bold border-4 border-neo-border rounded-none transition-all duration-200 neo-focus ${
                    selectedTag === tag
                      ? "bg-neo-fg text-neo-bg"
                      : "bg-neo-bg text-neo-fg hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px]"
                  }`}
                >
                  {tag} ({tagCount})
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t-2 border-neo-border">
            <span className="text-sm font-bold text-neo-fg">Active filters:</span>
            {selectedTag && (
              <span className="bg-neo-bg3 border-2 border-neo-border rounded-none px-2 py-1 text-xs font-bold flex items-center gap-1 text-neo-fg">
                Tag: {selectedTag}
                <button
                  onClick={() => setSelectedTag(null)}
                  className="ml-1 hover:bg-neo-fg hover:text-neo-bg w-4 h-4 flex items-center justify-center text-xs transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-neo-bg3 border-2 border-neo-border rounded-none px-2 py-1 text-xs font-bold flex items-center gap-1 text-neo-fg">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:bg-neo-fg hover:text-neo-bg w-4 h-4 flex items-center justify-center text-xs transition-colors"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="bg-neo-fg text-neo-bg border-2 border-neo-border rounded-none px-2 py-1 text-xs font-bold hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="bg-neo-bg3 border-4 border-neo-border rounded-none p-3">
        <p className="text-sm font-bold text-neo-fg">
          Showing {filteredProjects.length} of {projects.length} projects
          {hasActiveFilters && " (filtered)"}
        </p>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.slug}
              className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-6 hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-neo-fg">{project.title}</h3>
                    {project.featured && (
                      <span className="bg-neo-fg text-neo-bg border-2 border-neo-border rounded-none px-2 py-1 text-xs font-bold">
                        FEATURED
                      </span>
                    )}
                  </div>
                </div>
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-20 h-20 object-cover border-4 border-neo-border rounded-none flex-shrink-0 neo-grayscale"
                />
              </div>

              <p className="text-base leading-6 mb-4 text-neo-fg2">{project.blurb}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-1 text-xs font-bold border-2 border-neo-border rounded-none transition-all duration-200 hover:shadow-[2px_2px_0_0_var(--neo-shadow)] hover:translate-x-[-2px] hover:translate-y-[-2px] ${
                      selectedTag === tag ? "bg-neo-fg text-neo-bg" : "bg-neo-bg2 text-neo-fg hover:bg-neo-bg3"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neo-fg text-neo-bg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] px-4 py-2 text-sm font-bold transition-all duration-200 neo-focus"
                  >
                    Live Demo
                  </a>
                )}
                {project.links.repo && (
                  <a
                    href={project.links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-neo-bg2 text-neo-fg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] px-4 py-2 text-sm font-bold transition-all duration-200 neo-focus"
                  >
                    Source Code
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-neo-bg border-4 border-neo-border shadow-neo rounded-none p-8 text-center">
          <div className="text-6xl mb-4 text-neo-fg">◯</div>
          <h3 className="text-2xl font-bold mb-2 text-neo-fg">No Projects Found</h3>
          <p className="text-neo-fg-muted mb-4">
            {hasActiveFilters ? "No projects match your current filters." : "No projects available at the moment."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-neo-fg text-neo-bg border-4 border-neo-border shadow-neo rounded-none hover:shadow-[4px_4px_0_0_var(--neo-shadow)] hover:translate-x-[-4px] hover:translate-y-[-4px] px-6 py-3 font-bold transition-all duration-200 neo-focus"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
