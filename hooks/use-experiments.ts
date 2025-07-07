"use client"

import { useState, useEffect } from "react"
import { getExperiments, saveExperiment, updateExperiment, deleteExperiment, type Experiment } from "@/lib/storage"

export function useExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadExperiments = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100))

        if (!mounted) return

        const data = getExperiments()

        if (mounted) {
          setExperiments(data)
          setLoading(false)
        }
      } catch (error) {
        console.error("Error loading experiments:", error)
        if (mounted) {
          setExperiments([])
          setLoading(false)
        }
      }
    }

    loadExperiments()

    return () => {
      mounted = false
    }
  }, [])

  const createExperiment = (experimentData: Omit<Experiment, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newExperiment = saveExperiment(experimentData)
      setExperiments((prev) => [...prev, newExperiment])
      return newExperiment
    } catch (error) {
      console.error("Error creating experiment:", error)
      throw error
    }
  }

  const modifyExperiment = (id: string, updates: Partial<Experiment>) => {
    try {
      const updatedExperiment = updateExperiment(id, updates)
      if (updatedExperiment) {
        setExperiments((prev) => prev.map((exp) => (exp.id === id ? updatedExperiment : exp)))
        return updatedExperiment
      }
      return null
    } catch (error) {
      console.error("Error updating experiment:", error)
      throw error
    }
  }

  const removeExperiment = (id: string) => {
    try {
      const success = deleteExperiment(id)
      if (success) {
        setExperiments((prev) => prev.filter((exp) => exp.id !== id))
      }
      return success
    } catch (error) {
      console.error("Error deleting experiment:", error)
      throw error
    }
  }

  const getActiveExperiments = () => {
    return experiments.filter((exp) => exp.status === "active")
  }

  const getCompletedExperiments = () => {
    return experiments.filter((exp) => exp.status === "completed")
  }

  return {
    experiments,
    loading,
    createExperiment,
    updateExperiment: modifyExperiment,
    deleteExperiment: removeExperiment,
    getActiveExperiments,
    getCompletedExperiments,
  }
}
