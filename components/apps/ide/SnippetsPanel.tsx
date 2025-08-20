"use client"

import { useState, useEffect } from "react"
import { Code, Plus, Edit, Trash2, Search } from "lucide-react"
import { snippetsEngine, type Snippet } from "@/lib/snippets/engine"

interface SnippetsPanelProps {
  onSnippetInsert: (snippet: Snippet) => void
}

export function SnippetsPanel({ onSnippetInsert }: SnippetsPanelProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditor, setShowEditor] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [formData, setFormData] = useState({
    trigger: "",
    name: "",
    description: "",
    body: "",
    language: "",
  })

  useEffect(() => {
    loadSnippets()
  }, [])

  const loadSnippets = () => {
    setSnippets(snippetsEngine.getAllSnippets())
  }

  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleNewSnippet = () => {
    setEditingSnippet(null)
    setFormData({
      trigger: "",
      name: "",
      description: "",
      body: "",
      language: "",
    })
    setShowEditor(true)
  }

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet)
    setFormData({
      trigger: snippet.trigger,
      name: snippet.name,
      description: snippet.description,
      body: snippet.body,
      language: snippet.language || "",
    })
    setShowEditor(true)
  }

  const handleSaveSnippet = () => {
    if (!formData.trigger || !formData.name || !formData.body) {
      alert("Please fill in all required fields")
      return
    }

    const snippet: Snippet = {
      id: editingSnippet?.id || `snippet-${Date.now()}`,
      trigger: formData.trigger,
      name: formData.name,
      description: formData.description,
      body: formData.body,
      language: formData.language || undefined,
    }

    if (editingSnippet) {
      snippetsEngine.updateSnippet(snippet)
    } else {
      snippetsEngine.addSnippet(snippet)
    }

    loadSnippets()
    setShowEditor(false)
  }

  const handleDeleteSnippet = (snippet: Snippet) => {
    if (confirm(`Are you sure you want to delete "${snippet.name}"?`)) {
      snippetsEngine.deleteSnippet(snippet.trigger)
      loadSnippets()
    }
  }

  const handleSnippetClick = (snippet: Snippet) => {
    onSnippetInsert(snippet)
  }

  if (showEditor) {
    return (
      <div className="h-full bg-neo-bg border-r-2 border-neo-fg flex flex-col">
        {/* Editor Header */}
        <div className="px-3 py-2 border-b-2 border-neo-fg">
          <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">
            {editingSnippet ? "Edit Snippet" : "New Snippet"}
          </h3>
        </div>

        {/* Editor Form */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neo-fg mb-1">Trigger *</label>
              <input
                type="text"
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                placeholder="/trigger"
                className="w-full px-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg outline-none focus:border-neo-fg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neo-fg mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Snippet name"
                className="w-full px-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg outline-none focus:border-neo-fg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neo-fg mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                className="w-full px-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg outline-none focus:border-neo-fg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neo-fg mb-1">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg outline-none focus:border-neo-fg"
              >
                <option value="">Any</option>
                <option value="js">JavaScript</option>
                <option value="ts">TypeScript</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neo-fg mb-1">Body *</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Snippet content with ${1:placeholder} syntax"
                rows={10}
                className="w-full px-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg font-mono outline-none focus:border-neo-fg resize-none"
              />
              <div className="text-xs text-neo-fg opacity-60 mt-1">Use ${"{1:default}"} for placeholders</div>
            </div>
          </div>
        </div>

        {/* Editor Actions */}
        <div className="p-3 border-t-2 border-neo-fg flex gap-2">
          <button
            onClick={handleSaveSnippet}
            className="px-4 py-2 bg-neo-fg text-neo-bg border-2 border-neo-fg rounded font-medium hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
          >
            Save
          </button>
          <button
            onClick={() => setShowEditor(false)}
            className="px-4 py-2 bg-neo-bg border-2 border-neo-fg rounded font-medium hover:bg-neo-bg2"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-neo-bg border-r-2 border-neo-fg flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b-2 border-neo-fg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-neo-fg uppercase tracking-wider">Snippets</h3>
          <button
            onClick={handleNewSnippet}
            className="p-1 hover:bg-neo-bg2 rounded border border-neo-fg"
            title="New Snippet"
          >
            <Plus className="w-4 h-4 text-neo-fg" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neo-fg opacity-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snippets..."
            className="w-full pl-8 pr-3 py-2 bg-neo-bg2 border-2 border-neo-fg rounded text-sm text-neo-fg placeholder-neo-fg placeholder-opacity-60 outline-none focus:border-neo-fg"
          />
        </div>
      </div>

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSnippets.length === 0 ? (
          <div className="p-4 text-center text-neo-fg opacity-60">
            {searchQuery ? "No snippets found" : "No snippets available"}
          </div>
        ) : (
          filteredSnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="p-3 cursor-pointer hover:bg-neo-bg2 border-b border-neo-fg border-opacity-20"
              onClick={() => handleSnippetClick(snippet)}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-neo-fg" />
                  <span className="font-medium text-neo-fg">{snippet.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditSnippet(snippet)
                    }}
                    className="p-1 hover:bg-neo-bg3 rounded"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3 text-neo-fg" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSnippet(snippet)
                    }}
                    className="p-1 hover:bg-neo-bg3 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 text-neo-fg" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-neo-fg opacity-60 mb-1">{snippet.description}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-neo-bg2 border border-neo-fg rounded font-mono">{snippet.trigger}</span>
                {snippet.language && (
                  <span className="px-2 py-1 bg-neo-bg2 border border-neo-fg rounded uppercase">
                    {snippet.language}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
