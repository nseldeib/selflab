// Local storage utilities for SelfLab data management

export interface Experiment {
  id: string
  name: string
  hypothesis: string
  duration: number
  startDate: string
  endDate: string
  variables: string[]
  metrics: string[]
  notes?: string
  status: "active" | "completed" | "paused"
  progress: number
  createdAt: string
  updatedAt: string
}

export interface DailyLog {
  id: string
  date: string
  sleepHours: number
  mood: string
  energy: number
  notes: string
  protocols: Record<string, boolean>
  customMetrics?: Record<string, number>
  createdAt: string
  updatedAt: string
}

export interface ExperimentTemplate {
  id: string
  name: string
  description: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  duration: number
  goal: string
  rating: number
  variables: string[]
  metrics: string[]
}

const STORAGE_KEYS = {
  EXPERIMENTS: "selflab_experiments",
  DAILY_LOGS: "selflab_daily_logs",
  TEMPLATES: "selflab_templates",
} as const

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]
}

function safeGetFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage:`, error)
    return defaultValue
  }
}

function safeSetToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error writing to localStorage:`, error)
  }
}

export function getExperiments(): Experiment[] {
  return safeGetFromStorage(STORAGE_KEYS.EXPERIMENTS, [])
}

export function saveExperiment(experiment: Omit<Experiment, "id" | "createdAt" | "updatedAt">): Experiment {
  const experiments = getExperiments()
  const now = new Date().toISOString()

  const newExperiment: Experiment = {
    ...experiment,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }

  experiments.push(newExperiment)
  safeSetToStorage(STORAGE_KEYS.EXPERIMENTS, experiments)

  return newExperiment
}

export function updateExperiment(id: string, updates: Partial<Experiment>): Experiment | null {
  const experiments = getExperiments()
  const index = experiments.findIndex((exp) => exp.id === id)

  if (index === -1) return null

  const updatedExperiment = {
    ...experiments[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  experiments[index] = updatedExperiment
  safeSetToStorage(STORAGE_KEYS.EXPERIMENTS, experiments)

  return updatedExperiment
}

export function deleteExperiment(id: string): boolean {
  const experiments = getExperiments()
  const filteredExperiments = experiments.filter((exp) => exp.id !== id)

  if (filteredExperiments.length === experiments.length) return false

  safeSetToStorage(STORAGE_KEYS.EXPERIMENTS, filteredExperiments)
  return true
}

export function getDailyLogs(): DailyLog[] {
  return safeGetFromStorage(STORAGE_KEYS.DAILY_LOGS, [])
}

export function getDailyLogByDate(date: string): DailyLog | null {
  const logs = getDailyLogs()
  return logs.find((log) => log.date === date) || null
}

export function saveDailyLog(log: Omit<DailyLog, "id" | "createdAt" | "updatedAt">): DailyLog {
  const logs = getDailyLogs()
  const existingIndex = logs.findIndex((l) => l.date === log.date)
  const now = new Date().toISOString()

  if (existingIndex >= 0) {
    const updatedLog = {
      ...logs[existingIndex],
      ...log,
      updatedAt: now,
    }
    logs[existingIndex] = updatedLog
    safeSetToStorage(STORAGE_KEYS.DAILY_LOGS, logs)
    return updatedLog
  } else {
    const newLog: DailyLog = {
      ...log,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    logs.push(newLog)
    safeSetToStorage(STORAGE_KEYS.DAILY_LOGS, logs)
    return newLog
  }
}

export function getExperimentStats() {
  const experiments = getExperiments()
  const logs = getDailyLogs()

  const activeExperiments = experiments.filter((exp) => exp.status === "active")
  const completedExperiments = experiments.filter((exp) => exp.status === "completed")

  const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let currentStreak = 0
  const today = new Date()

  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].date)
    const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === i) {
      currentStreak++
    } else {
      break
    }
  }

  return {
    activeExperiments: activeExperiments.length,
    completedExperiments: completedExperiments.length,
    totalLogs: logs.length,
    currentStreak,
    experiments: activeExperiments,
  }
}

export function getTemplates(): ExperimentTemplate[] {
  return safeGetFromStorage(STORAGE_KEYS.TEMPLATES, [])
}

export function initializeTemplates(): void {
  const existingTemplates = getTemplates()

  if (existingTemplates.length === 0) {
    const defaultTemplates: ExperimentTemplate[] = [
      {
        id: "template-1",
        name: "Cold Shower Protocol",
        description: "Gradual cold exposure to improve energy, mood, and resilience",
        category: "Temperature",
        difficulty: "Beginner",
        duration: 30,
        goal: "Energy & Mood",
        rating: 4.8,
        variables: ["Water Temperature", "Duration", "Time of Day"],
        metrics: ["Energy Level", "Mood", "Sleep Quality", "Stress Level"],
      },
      {
        id: "template-2",
        name: "Intermittent Fasting 16:8",
        description: "16-hour fast with 8-hour eating window to improve metabolic health",
        category: "Nutrition",
        difficulty: "Beginner",
        duration: 21,
        goal: "Weight & Focus",
        rating: 4.6,
        variables: ["Eating Window", "Food Choices", "Hydration"],
        metrics: ["Weight", "Focus", "Energy", "Hunger Levels"],
      },
      {
        id: "template-3",
        name: "Blue Light Blocking",
        description: "Block blue light 2 hours before bed to improve sleep quality",
        category: "Sleep",
        difficulty: "Beginner",
        duration: 14,
        goal: "Sleep Quality",
        rating: 4.7,
        variables: ["Blue Light Glasses", "Screen Time", "Room Lighting"],
        metrics: ["Sleep Quality", "Sleep Duration", "Morning Alertness"],
      },
      {
        id: "template-4",
        name: "Wim Hof Breathing",
        description: "Controlled breathing technique for stress reduction and energy",
        category: "Breathing",
        difficulty: "Intermediate",
        duration: 28,
        goal: "Stress & Energy",
        rating: 4.9,
        variables: ["Breathing Rounds", "Hold Duration", "Practice Time"],
        metrics: ["Stress Level", "Energy", "Focus", "Heart Rate Variability"],
      },
      {
        id: "template-5",
        name: "Polyphasic Sleep",
        description: "Alternative sleep schedule with multiple short naps",
        category: "Sleep",
        difficulty: "Advanced",
        duration: 60,
        goal: "Time & Productivity",
        rating: 3.8,
        variables: ["Sleep Schedule", "Nap Duration", "Core Sleep"],
        metrics: ["Alertness", "Productivity", "Mood", "Cognitive Performance"],
      },
      {
        id: "template-6",
        name: "Elimination Diet",
        description: "Remove common allergens to identify food sensitivities",
        category: "Nutrition",
        difficulty: "Intermediate",
        duration: 45,
        goal: "Health & Digestion",
        rating: 4.4,
        variables: ["Eliminated Foods", "Reintroduction Schedule"],
        metrics: ["Digestion", "Energy", "Mood", "Skin Quality", "Inflammation"],
      },
    ]

    safeSetToStorage(STORAGE_KEYS.TEMPLATES, defaultTemplates)
  }
}

export function initializeApp(): void {
  initializeTemplates()
}
