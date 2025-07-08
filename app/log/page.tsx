"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useDailyLogs } from "@/hooks/use-daily-logs"
import { useExperiments } from "@/hooks/use-experiments"
import { formatDate } from "@/lib/storage"

export default function LogPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [sleepHours, setSleepHours] = useState([7])
  const [mood, setMood] = useState("")
  const [energy, setEnergy] = useState([7])
  const [notes, setNotes] = useState("")
  const [protocols, setProtocols] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const { getLogByDate, saveLog } = useDailyLogs()
  const { getActiveExperiments } = useExperiments()

  // Load existing log data when date changes
  useEffect(() => {
    const loadLogData = () => {
      const dateString = formatDate(selectedDate)
      const existingLog = getLogByDate(dateString)
      const activeExperiments = getActiveExperiments()

      if (existingLog) {
        setSleepHours([existingLog.sleepHours])
        setMood(existingLog.mood)
        setEnergy([existingLog.energy])
        setNotes(existingLog.notes)
        setProtocols(existingLog.protocols || {})
      } else {
        // Reset form for new date
        setSleepHours([7])
        setMood("")
        setEnergy([7])
        setNotes("")
        // Initialize protocols for active experiments
        const initialProtocols: Record<string, boolean> = {}
        activeExperiments.forEach((exp) => {
          initialProtocols[exp.id] = false
        })
        setProtocols(initialProtocols)
      }
      setDataLoaded(true)
    }

    loadLogData()
  }, [selectedDate]) // Only depend on selectedDate

  const moodOptions = [
    { emoji: "😢", label: "Very Low", value: "very-low" },
    { emoji: "😕", label: "Low", value: "low" },
    { emoji: "😐", label: "Neutral", value: "neutral" },
    { emoji: "😊", label: "Good", value: "good" },
    { emoji: "😄", label: "Excellent", value: "excellent" },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveLog({
        date: formatDate(selectedDate),
        sleepHours: sleepHours[0],
        mood,
        energy: energy[0],
        notes,
        protocols,
      })
      alert("Log saved successfully!")
    } catch (error) {
      console.error("Error saving log:", error)
      alert("Failed to save log. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setDataLoaded(false) // Reset data loaded state when date changes
    }
  }

  // Don't render until data is loaded to prevent hydration issues
  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading log data...</p>
        </div>
      </div>
    )
  }

  const activeExperiments = getActiveExperiments()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Log</h1>
          <p className="text-gray-600 mt-1">Track your daily metrics and experiment progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Log Form */}
        <div className="space-y-6">
          {/* Sleep */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sleep</CardTitle>
              <CardDescription>How did you sleep last night?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hours of Sleep: {sleepHours[0]} hours</Label>
                <Slider
                  value={sleepHours}
                  onValueChange={setSleepHours}
                  max={12}
                  min={3}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>3h</span>
                  <span>12h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mood */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Mood</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-colors text-center",
                      mood === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Energy */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Energy Level</CardTitle>
              <CardDescription>Rate your energy level today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Energy: {energy[0]}/10</Label>
                <Slider value={energy} onValueChange={setEnergy} max={10} min={1} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>Any additional observations or thoughts?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="How did you feel today? Any notable events or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Experiment Protocols */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Active Experiments</CardTitle>
              <CardDescription>Did you follow your protocols today?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeExperiments.length > 0 ? (
                activeExperiments.map((experiment) => (
                  <div key={experiment.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{experiment.name}</p>
                      <p className="text-xs text-gray-500">{experiment.variables.join(", ")}</p>
                    </div>
                    <Checkbox
                      checked={protocols[experiment.id] || false}
                      onCheckedChange={(checked) => {
                        setProtocols((prev) => ({
                          ...prev,
                          [experiment.id]: !!checked,
                        }))
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No active experiments to track</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Selected Date</span>
                <span className="font-medium">{format(selectedDate, "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Experiments</span>
                <span className="font-medium">{activeExperiments.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Protocols Completed</span>
                <span className="font-medium">
                  {Object.values(protocols).filter(Boolean).length}/{activeExperiments.length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Log"}
          </Button>
        </div>
      </div>
    </div>
  )
}
