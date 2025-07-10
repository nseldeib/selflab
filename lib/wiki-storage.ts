export interface WikiEntry {
  id: string
  title: string
  summary: string
  content?: string
  tags: string[]
  category: string
  status: "draft" | "published" | "archived"
  priority: "low" | "medium" | "high"
  isPublic: boolean
  rating: number
  attachments: WikiAttachment[]
  relatedLinks: WikiLink[]
  createdAt: string
  updatedAt: string
  lastEditedAt: string
}

export interface WikiAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface WikiLink {
  id: string
  title: string
  url: string
  description?: string
}

const WIKI_STORAGE_KEY = "selflab_wiki_entries"

export const generateWikiId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function safeGetWikiFromStorage(): WikiEntry[] {
  if (typeof window === "undefined") return []

  try {
    const item = localStorage.getItem(WIKI_STORAGE_KEY)
    return item ? JSON.parse(item) : []
  } catch (error) {
    console.error("Error reading wiki from localStorage:", error)
    return []
  }
}

function safeSetWikiToStorage(entries: WikiEntry[]): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(WIKI_STORAGE_KEY, JSON.stringify(entries))
  } catch (error) {
    console.error("Error writing wiki to localStorage:", error)
  }
}

export function getWikiEntries(): WikiEntry[] {
  return safeGetWikiFromStorage()
}

export function saveWikiEntry(entry: Omit<WikiEntry, "id" | "createdAt" | "updatedAt" | "lastEditedAt">): WikiEntry {
  const entries = getWikiEntries()
  const now = new Date().toISOString()

  const newEntry: WikiEntry = {
    ...entry,
    id: generateWikiId(),
    createdAt: now,
    updatedAt: now,
    lastEditedAt: now,
  }

  entries.push(newEntry)
  safeSetWikiToStorage(entries)

  return newEntry
}

export function updateWikiEntry(id: string, updates: Partial<WikiEntry>): WikiEntry | null {
  const entries = getWikiEntries()
  const index = entries.findIndex((entry) => entry.id === id)

  if (index === -1) return null

  const now = new Date().toISOString()
  const updatedEntry = {
    ...entries[index],
    ...updates,
    updatedAt: now,
    lastEditedAt: now,
  }

  entries[index] = updatedEntry
  safeSetWikiToStorage(entries)

  return updatedEntry
}

export function deleteWikiEntry(id: string): boolean {
  const entries = getWikiEntries()
  const filteredEntries = entries.filter((entry) => entry.id !== id)

  if (filteredEntries.length === entries.length) return false

  safeSetWikiToStorage(filteredEntries)
  return true
}

export function getWikiCategories(): string[] {
  const entries = getWikiEntries()
  const categories = new Set(entries.map((entry) => entry.category))
  return Array.from(categories).filter(Boolean)
}

export function getWikiTags(): string[] {
  const entries = getWikiEntries()
  const tags = new Set(entries.flatMap((entry) => entry.tags))
  return Array.from(tags).filter(Boolean)
}

export function initializeWikiData(): void {
  const existingEntries = getWikiEntries()

  if (existingEntries.length === 0) {
    const sampleEntries: Omit<WikiEntry, "id" | "createdAt" | "updatedAt" | "lastEditedAt">[] = [
      {
        title: "Cold Therapy Benefits",
        summary: "Research and personal findings on cold exposure therapy",
        content:
          "Cold therapy has shown significant benefits for inflammation reduction, mood improvement, and metabolic health.",
        tags: ["cold-therapy", "recovery", "inflammation"],
        category: "Health",
        status: "published",
        priority: "high",
        isPublic: false,
        rating: 5,
        attachments: [],
        relatedLinks: [
          {
            id: generateWikiId(),
            title: "Wim Hof Method",
            url: "https://www.wimhofmethod.com",
            description: "Official Wim Hof breathing and cold exposure techniques",
          },
        ],
      },
      {
        title: "Intermittent Fasting Protocol",
        summary: "My 16:8 intermittent fasting routine and results",
        content: "Started with 16:8 protocol, eating window from 12pm-8pm. Noticed improved focus and energy levels.",
        tags: ["nutrition", "fasting", "protocol"],
        category: "Nutrition",
        status: "published",
        priority: "medium",
        isPublic: true,
        rating: 4,
        attachments: [],
        relatedLinks: [],
      },
    ]

    sampleEntries.forEach((entry) => saveWikiEntry(entry))
  }
}
