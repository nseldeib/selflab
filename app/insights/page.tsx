"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts"
import { TrendingUp, Target } from "lucide-react"
import { useDailyLogs } from "@/hooks/use-daily-logs"
import { useExperiments } from "@/hooks/use-experiments"
import { format } from "date-fns"

export default function InsightsPage() {
  const { logs } = useDailyLogs()
  const { experiments } = useExperiments()

  // Generate energy data from logs
  const energyData = logs
    .slice(-30) // Last 30 days
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => ({
      date: format(new Date(log.date), "MMM d"),
      baseline: 6, // Baseline assumption
      experiment: log.energy,
    }))

  // Generate mood data from logs
  const moodData = logs
    .slice(-28) // Last 4 weeks
    .reduce((acc, log, index) => {
      const weekIndex = Math.floor(index / 7)
      if (!acc[weekIndex]) {
        acc[weekIndex] = { date: `Week ${weekIndex + 1}`, values: [] }
      }
      const moodValue =
        log.mood === "excellent" ? 9 : log.mood === "good" ? 7 : log.mood === "neutral" ? 5 : log.mood === "low" ? 3 : 1
      acc[weekIndex].values.push(moodValue)
      return acc
    }, [] as any[])
    .map((week) => ({
      date: week.date,
      value: week.values.reduce((sum: number, val: number) => sum + val, 0) / week.values.length,
    }))

  // Generate sleep data from logs
  const sleepData = logs
    .slice(-30)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => ({
      date: format(new Date(log.date), "MMM d"),
      hours: log.sleepHours,
      quality: log.energy, // Using energy as proxy for sleep quality
    }))

  const experimentsData = [
    {
      name: "Cold Shower Protocol",
      status: "Active",
      progress: 65,
      insights: [
        "Energy levels increased by 35% on average",
        "Best results seen in morning sessions",
        "Mood improvement most noticeable after week 2",
      ],
    },
    {
      name: "Intermittent Fasting 16:8",
      status: "Active",
      progress: 80,
      insights: [
        "Focus improved significantly during fasting window",
        "Weight decreased by 3.2 lbs",
        "Afternoon energy crashes eliminated",
      ],
    },
    {
      name: "Blue Light Blocking",
      status: "Completed",
      progress: 100,
      insights: [
        "Sleep quality improved by 28%",
        "Fall asleep 15 minutes faster on average",
        "Morning alertness increased",
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-600 mt-1">Analyze your experiment results and track progress</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="sleep">Sleep</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Energy Increase</p>
                    <p className="text-2xl font-bold text-green-600">+35%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sleep Quality</p>
                    <p className="text-2xl font-bold text-blue-600">+28%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Experiments</p>
                    <p className="text-2xl font-bold text-gray-900">3 Active</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <Target className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Experiment Results */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Experiment Results</h2>
            {experimentsData.map((experiment) => (
              <Card key={experiment.name} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{experiment.name}</CardTitle>
                      <CardDescription>Key insights and patterns</CardDescription>
                    </div>
                    <Badge variant={experiment.status === "Active" ? "default" : "secondary"}>
                      {experiment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {experiment.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Energy Levels Over Time</CardTitle>
              <CardDescription>Baseline vs Experiment Period</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  baseline: {
                    label: "Baseline",
                    color: "hsl(var(--chart-1))",
                  },
                  experiment: {
                    label: "Experiment",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="var(--color-baseline)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line type="monotone" dataKey="experiment" stroke="var(--color-experiment)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Mood Trends</CardTitle>
              <CardDescription>Weekly average mood scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Mood Score",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <BarChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sleep" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sleep Analysis</CardTitle>
              <CardDescription>Hours and quality over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  hours: {
                    label: "Sleep Hours",
                    color: "hsl(var(--chart-4))",
                  },
                  quality: {
                    label: "Sleep Quality",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[300px]"
              >
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="hours" stroke="var(--color-hours)" strokeWidth={2} />
                  <Line type="monotone" dataKey="quality" stroke="var(--color-quality)" strokeWidth={2} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
