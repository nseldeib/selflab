"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getWikiEntries,
  saveWikiEntry,
  updateWikiEntry,
  deleteWikiEntry,
  getWikiCategories,
  getWikiTags,
  initializeWikiData,
  type WikiEntry,
} from "@/lib/wiki-storage"

export function useWiki() {
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadEntries = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (!mounted) return

        initializeWikiData()
        const data = getWikiEntries()

        if (mounted) {
          setEntries(data)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error loading wiki entries:", error)
        if (mounted) {
          setEntries([])
          setLoading(false)
        }
      }
    }

    loadEntries()

    return () => {
      mounted = false
    }
  }, [])

  const createEntry = useCallback((entryData: Omit<WikiEntry, "id" | "createdAt" | "updatedAt" | "lastEditedAt">) => {
    try {
      const newEntry = saveWikiEntry(entryData)
      setEntries((prev) => [newEntry, ...prev])
      return newEntry
    } catch (error) {
      console.error("Error creating wiki entry:", error)
      throw error
    }
  }, [])

  const modifyEntry = useCallback((id: string, updates: Partial<WikiEntry>) => {
    try {
      const updatedEntry = updateWikiEntry(id, updates)
      if (updatedEntry) {
        setEntries((prev) => prev.map((entry) => (entry.id === id ? updatedEntry : entry)))
        return updatedEntry
      }
      return null
    } catch (error) {
      console.error("Error updating wiki entry:", error)
      throw error
    }
  }, [])

  const removeEntry = useCallback((id: string) => {
    try {
      const success = deleteWikiEntry(id)
      if (success) {
        setEntries((prev) => prev.filter((entry) => entry.id !== id))
      }
      return success
    } catch (error) {
      console.error("Error deleting wiki entry:", error)
      throw error
    }
  }, [])

  const getCategories = useCallback(() => {
    return getWikiCategories()
  }, [])

  const getTags = useCallback(() => {
    return getWikiTags()
  }, [])

  return {
    entries,
    loading,
    createEntry,
    updateEntry: modifyEntry,
    deleteEntry: removeEntry,
    getCategories,
    getTags,
  }
}
