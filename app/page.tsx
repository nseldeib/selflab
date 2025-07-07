"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Plus, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { useAppData } from "@/hooks/use-app-data"
import { useDailyLogs } from "@/hooks/use-daily-logs"
import { useExperiments } from "@/hooks/use-experiments"

export default function Dashboard() {
  const { stats, initialized } = useAppData() // Removed refreshStats from destructuring
  const { getTodaysLog } = useDailyLogs()
  const { getActiveExperiments } = useExperiments()

  // Removed the problematic useEffect that was calling refreshStats

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading your experiments...</p>
        </div>
      </div>
    )
  }

  const todaysLog = getTodaysLog()
  const activeExperiments = getActiveExperiments()

  const dashboardStats = [
    {
      label: "Active Experiments",
      value: stats.activeExperiments.toString(),
      icon: Zap,
      color: "text-blue-600",
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak} days`,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Total Logs",
      value: stats.totalLogs.toString(),
      icon: Calendar,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600 mt-1">{"Here's what's happening with your experiments"}</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/log">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Log Today
            </Button>
          </Link>
          <Link href="/experiments/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Experiment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl bg-gray-50", stat.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Log Preview */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{"Today's Log"}</span>
            </CardTitle>
            <CardDescription>Quick check-in for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todaysLog ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sleep Hours</span>
                  <Badge variant="secondary">{todaysLog.sleepHours}h</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Energy Level</span>
                  <Badge variant="secondary">{todaysLog.energy}/10</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mood</span>
                  <Badge variant="secondary">
                    {todaysLog.mood === "excellent"
                      ? "😄 Excellent"
                      : todaysLog.mood === "good"
                        ? "😊 Good"
                        : todaysLog.mood === "neutral"
                          ? "😐 Neutral"
                          : todaysLog.mood === "low"
                            ? "😕 Low"
                            : todaysLog.mood === "very-low"
                              ? "😢 Very Low"
                              : "Not set"}
                  </Badge>
                </div>
                <Link href="/log">
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    Update Today's Log
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 text-center py-4">No log entry for today yet</p>
                <Link href="/log">
                  <Button variant="outline" className="w-full bg-transparent">
                    Complete Today's Log
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Experiments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Active Experiments</span>
            </CardTitle>
            <CardDescription>Your ongoing biohacking experiments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeExperiments.length > 0 ? (
              <>
                {activeExperiments.slice(0, 3).map((experiment) => {
                  const startDate = new Date(experiment.startDate)
                  const endDate = new Date(experiment.endDate)
                  const now = new Date()
                  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                  const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)
                  const daysLeft = Math.max(totalDays - elapsedDays, 0)

                  return (
                    <div key={experiment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{experiment.name}</span>
                        <Badge variant={progress > 80 ? "default" : progress > 50 ? "secondary" : "destructive"}>
                          {progress > 80 ? "Excellent" : progress > 50 ? "On Track" : "Behind"}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-gray-500">{daysLeft} days remaining</p>
                    </div>
                  )
                })}
                <Link href="/experiments">
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Experiments
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 text-center py-4">No active experiments yet</p>
                <Link href="/experiments/new">
                  <Button variant="outline" className="w-full bg-transparent">
                    Start Your First Experiment
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
