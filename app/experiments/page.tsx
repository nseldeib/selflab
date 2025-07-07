"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useExperiments } from "@/hooks/use-experiments"

export default function ExperimentsPage() {
  const { experiments, loading } = useExperiments()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading experiments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
          <p className="text-gray-600 mt-1">Track and manage your biohacking experiments</p>
        </div>
        <Link href="/experiments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Experiment
          </Button>
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments yet</h3>
            <p className="text-gray-500 mb-6">
              Start your first biohacking experiment to begin tracking your progress.
            </p>
            <Link href="/experiments/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Experiment
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {experiments.map((experiment) => {
            const startDate = new Date(experiment.startDate)
            const endDate = new Date(experiment.endDate)
            const now = new Date()
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
            const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)

            return (
              <Card key={experiment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{experiment.name}</CardTitle>
                      <CardDescription className="text-sm">{experiment.hypothesis}</CardDescription>
                    </div>
                    <Badge variant={experiment.status === "active" ? "default" : "secondary"}>
                      {experiment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{experiment.duration} days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{experiment.metrics.length} metrics</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Tracking:</p>
                    <div className="flex flex-wrap gap-1">
                      {experiment.metrics.slice(0, 3).map((metric) => (
                        <Badge key={metric} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                      {experiment.metrics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{experiment.metrics.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      View Details
                    </Button>
                    {experiment.status === "active" && (
                      <Link href="/log" className="flex-1">
                        <Button size="sm" className="w-full">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Log Data
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
