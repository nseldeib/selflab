"use client"

import { useState, useEffect } from "react"
import { getDailyLogs, getDailyLogByDate, saveDailyLog, formatDate, type DailyLog } from "@/lib/storage"

export function useDailyLogs() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadLogs = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (!mounted) return

        const data = getDailyLogs()

        if (mounted) {
          setLogs(data)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error loading daily logs:", error)
        if (mounted) {
          setLogs([])
          setLoading(false)
        }
      }
    }

    loadLogs()

    return () => {
      mounted = false
    }
  }, [])

  const getLogByDate = (date: Date | string) => {
    const dateString = typeof date === "string" ? date : formatDate(date)
    return getDailyLogByDate(dateString)
  }

  const saveLog = (logData: Omit<DailyLog, "id" | "createdAt" | "updatedAt">) => {
    try {
      const savedLog = saveDailyLog(logData)

      setLogs((prev) => {
        const existingIndex = prev.findIndex((log) => log.date === savedLog.date)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = savedLog
          return updated
        } else {
          return [...prev, savedLog]
        }
      })

      return savedLog
    } catch (error) {
      console.error("Error saving daily log:", error)
      throw error
    }
  }

  const getTodaysLog = () => {
    const today = formatDate(new Date())
    return logs.find((log) => log.date === today) || null
  }

  const getRecentLogs = (days = 7) => {
    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return sortedLogs.slice(0, days)
  }

  return {
    logs,
    loading,
    getLogByDate,
    saveLog,
    getTodaysLog,
    getRecentLogs,
  }
}
