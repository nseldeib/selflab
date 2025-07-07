"use client"

import { useState, useEffect, useCallback } from "react"
import { getExperimentStats, initializeApp } from "@/lib/storage"

interface AppStats {
  activeExperiments: number
  completedExperiments: number
  totalLogs: number
  currentStreak: number
  experiments: any[]
}

export function useAppData() {
  const [stats, setStats] = useState<AppStats>({
    activeExperiments: 0,
    completedExperiments: 0,
    totalLogs: 0,
    currentStreak: 0,
    experiments: [],
  })
  const [initialized, setInitialized] = useState(false)

  const refreshStats = useCallback(() => {
    try {
      const appStats = getExperimentStats()
      setStats(appStats)
    } catch (error) {
      console.error("Error refreshing stats:", error)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (!mounted) return

        initializeApp()
        const appStats = getExperimentStats()

        if (mounted) {
          setStats(appStats)
          setInitialized(true)
        }
      } catch (error) {
        console.error("Error initializing app:", error)
        if (mounted) {
          setStats({
            activeExperiments: 0,
            completedExperiments: 0,
            totalLogs: 0,
            currentStreak: 0,
            experiments: [],
          })
          setInitialized(true)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
    }
  }, []) // Empty dependency array - only run once

  return {
    stats,
    initialized,
    refreshStats,
  }
}
