"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Search,
  Edit3,
  Save,
  X,
  Trash2,
  Star,
  StarOff,
  ChevronDown,
  ChevronRight,
  LinkIcon,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWiki } from "@/hooks/use-wiki"
import { type WikiEntry, generateWikiId } from "@/lib/wiki-storage"
import { format } from "date-fns"

interface WikiFilters {
  search: string
  category: string
  status: string
  visibility: string
  tag: string
}

export function WikiWidget() {
  const { entries, loading, createEntry, updateEntry, deleteEntry, getCategories, getTags } = useWiki()
  const [filters, setFilters] = useState<WikiFilters>({
    search: "",
    category: "All Categories",
    status: "All Status",
    visibility: "All",
    tag: "All Tags",
  })
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [editingEntries, setEditingEntries] = useState<Set<string>>(new Set())
  const [showNewEntry, setShowNewEntry] = useState(false)

  const categories = getCategories()
  const tags = getTags()

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (
        filters.search &&
        !entry.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !entry.summary.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }
      if (filters.category !== "All Categories" && entry.category !== filters.category) return false
      if (filters.status !== "All Status" && entry.status !== filters.status) return false
      if (filters.visibility !== "All") {
        if (filters.visibility === "public" && !entry.isPublic) return false
        if (filters.visibility === "private" && entry.isPublic) return false
      }
      if (filters.tag !== "All Tags" && !entry.tags.includes(filters.tag)) return false
      return true
    })
  }, [entries, filters])

  const toggleExpanded = (id: string) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        setEditingEntries((editPrev) => {
          const editSet = new Set(editPrev)
          editSet.delete(id)
          return editSet
        })
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleEditing = (id: string) => {
    setEditingEntries((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleCreateEntry = () => {
    const newEntry = {
      title: "New Entry",
      summary: "",
      content: "",
      tags: [],
      category: "General",
      status: "draft" as const,
      priority: "medium" as const,
      isPublic: false,
      rating: 3,
      attachments: [],
      relatedLinks: [],
    }

    const created = createEntry(newEntry)
    setExpandedEntries((prev) => new Set([...prev, created.id]))
    setEditingEntries((prev) => new Set([...prev, created.id]))
    setShowNewEntry(false)
  }

  const handleUpdateEntry = (id: string, updates: Partial<WikiEntry>) => {
    updateEntry(id, updates)
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(id)
      setExpandedEntries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      setEditingEntries((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange?.(star)}
            className={cn("transition-colors", onRatingChange ? "hover:text-yellow-400" : "")}
            disabled={!onRatingChange}
          >
            {star <= rating ? (
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Personal Wiki</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>Personal Wiki</span>
              <Badge variant="secondary">{entries.length}</Badge>
            </CardTitle>
            <CardDescription>Your knowledge base and research notes</CardDescription>
          </div>
          <Button onClick={() => setShowNewEntry(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Entry
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-8 h-9"
            />
          </div>

          <Select
            value={filters.category}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Categories">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.visibility}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, visibility: value }))}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.tag} onValueChange={(value) => setFilters((prev) => ({ ...prev, tag: value }))}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Tags">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {showNewEntry && (
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Create New Entry</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowNewEntry(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Click "New Entry" to create a new wiki entry that you can edit inline.
            </p>
            <div className="flex space-x-2">
              <Button onClick={handleCreateEntry} size="sm">
                Create Entry
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowNewEntry(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No wiki entries found.</p>
            {entries.length === 0 && (
              <Button onClick={handleCreateEntry} className="mt-2" size="sm">
                Create your first entry
              </Button>
            )}
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <WikiEntryCard
              key={entry.id}
              entry={entry}
              isExpanded={expandedEntries.has(entry.id)}
              isEditing={editingEntries.has(entry.id)}
              onToggleExpanded={() => toggleExpanded(entry.id)}
              onToggleEditing={() => toggleEditing(entry.id)}
              onUpdate={(updates) => handleUpdateEntry(entry.id, updates)}
              onDelete={() => handleDeleteEntry(entry.id)}
              renderStars={renderStars}
              categories={categories}
              tags={tags}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

interface WikiEntryCardProps {
  entry: WikiEntry
  isExpanded: boolean
  isEditing: boolean
  onToggleExpanded: () => void
  onToggleEditing: () => void
  onUpdate: (updates: Partial<WikiEntry>) => void
  onDelete: () => void
  renderStars: (rating: number, onRatingChange?: (rating: number) => void) => React.ReactNode
  categories: string[]
  tags: string[]
}

function WikiEntryCard({
  entry,
  isExpanded,
  isEditing,
  onToggleExpanded,
  onToggleEditing,
  onUpdate,
  onDelete,
  renderStars,
  categories,
  tags,
}: WikiEntryCardProps) {
  const [editData, setEditData] = useState(entry)
  const [newTag, setNewTag] = useState("")
  const [newLink, setNewLink] = useState({ title: "", url: "", description: "" })

  const handleSave = () => {
    onUpdate(editData)
    onToggleEditing()
  }

  const handleCancel = () => {
    setEditData(entry)
    onToggleEditing()
  }

  const addTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addLink = () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      setEditData((prev) => ({
        ...prev,
        relatedLinks: [
          ...prev.relatedLinks,
          {
            id: generateWikiId(),
            title: newLink.title.trim(),
            url: newLink.url.trim(),
            description: newLink.description.trim() || undefined,
          },
        ],
      }))
      setNewLink({ title: "", url: "", description: "" })
    }
  }

  const removeLink = (linkId: string) => {
    setEditData((prev) => ({
      ...prev,
      relatedLinks: prev.relatedLinks.filter((link) => link.id !== linkId),
    }))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-600 bg-green-50"
      case "draft":
        return "text-yellow-600 bg-yellow-50"
      case "archived":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onToggleExpanded}
              className="flex items-center space-x-2 hover:bg-gray-50 rounded p-1 -ml-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                  className="font-medium text-lg h-8 border-0 p-0 focus-visible:ring-1"
                />
              ) : (
                <h3 className="font-medium text-lg truncate">{entry.title}</h3>
              )}
            </button>
          </div>

          {isEditing ? (
            <Textarea
              value={editData.summary}
              onChange={(e) => setEditData((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="Entry summary..."
              className="mt-2 text-sm resize-none"
              rows={2}
            />
          ) : (
            <p className="text-sm text-gray-600 mt-1">{entry.summary}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {entry.isPublic ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}

          <Badge className={getPriorityColor(entry.priority)}>{entry.priority}</Badge>

          <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>

          {isExpanded && (
            <div className="flex items-center space-x-1">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} size="sm" variant="outline">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="ghost">
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={onToggleEditing} size="sm" variant="ghost">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button onClick={onDelete} size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {(isEditing ? editData.tags : entry.tags).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
            {isEditing && (
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t">
          {/* Content */}
          <div>
            <Label className="text-sm font-medium">Content</Label>
            {isEditing ? (
              <Textarea
                value={editData.content || ""}
                onChange={(e) => setEditData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Entry content..."
                className="mt-1"
                rows={6}
              />
            ) : (
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                {entry.content || "No content yet."}
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <Label className="text-sm font-medium">Category</Label>
              {isEditing ? (
                <Select
                  value={editData.category}
                  onValueChange={(value) => setEditData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Nutrition">Nutrition</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{entry.category}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium">Status</Label>
              {isEditing ? (
                <Select
                  value={editData.status}
                  onValueChange={(value: "draft" | "published" | "archived") =>
                    setEditData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1 capitalize">{entry.status}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              {isEditing ? (
                <Select
                  value={editData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setEditData((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-600 mt-1 capitalize">{entry.priority}</p>
              )}
            </div>

            {/* Public/Private */}
            <div>
              <Label className="text-sm font-medium">Visibility</Label>
              {isEditing ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Switch
                    checked={editData.isPublic}
                    onCheckedChange={(checked) => setEditData((prev) => ({ ...prev, isPublic: checked }))}
                  />
                  <span className="text-sm">{editData.isPublic ? "Public" : "Private"}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-1">{entry.isPublic ? "Public" : "Private"}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-sm font-medium">Rating</Label>
            <div className="mt-1">
              {renderStars(
                isEditing ? editData.rating : entry.rating,
                isEditing ? (rating) => setEditData((prev) => ({ ...prev, rating })) : undefined,
              )}
            </div>
          </div>

          {/* Tags Management */}
          {isEditing && (
            <div>
              <Label className="text-sm font-medium">Add Tags</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag..."
                  className="h-8"
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                />
                <Button onClick={addTag} size="sm" variant="outline">
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* Related Links */}
          <div>
            <Label className="text-sm font-medium">Related Links</Label>
            <div className="space-y-2 mt-1">
              {(isEditing ? editData.relatedLinks : entry.relatedLinks).map((link) => (
                <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline truncate block"
                      >
                        {link.title}
                      </a>
                      {link.description && <p className="text-xs text-gray-500 truncate">{link.description}</p>}
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      onClick={() => removeLink(link.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              {isEditing && (
                <div className="space-y-2 p-3 border rounded bg-white">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newLink.title}
                      onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Link title..."
                      className="h-8"
                    />
                    <Input
                      value={newLink.url}
                      onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="URL..."
                      className="h-8"
                    />
                  </div>
                  <Input
                    value={newLink.description}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optional)..."
                    className="h-8"
                  />
                  <Button onClick={addLink} size="sm" variant="outline" className="w-full bg-transparent">
                    Add Link
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Created: {format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Updated: {format(new Date(entry.lastEditedAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
