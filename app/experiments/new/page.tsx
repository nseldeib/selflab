"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useExperiments } from "@/hooks/use-experiments"
import { useRouter } from "next/navigation"

export default function NewExperimentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [formData, setFormData] = useState({
    name: "",
    hypothesis: "",
    duration: "",
    variables: [] as string[],
    metrics: [] as string[],
    notes: "",
  })

  const { createExperiment } = useExperiments()
  const router = useRouter()

  const steps = [
    { number: 1, title: "Basic Info", description: "Name and hypothesis" },
    { number: 2, title: "Duration", description: "Timeline and dates" },
    { number: 3, title: "Variables", description: "What you're testing" },
    { number: 4, title: "Metrics", description: "What you're measuring" },
    { number: 5, title: "Review", description: "Confirm and create" },
  ]

  const availableVariables = [
    "Diet Changes",
    "Exercise Routine",
    "Sleep Schedule",
    "Supplements",
    "Temperature Exposure",
    "Light Exposure",
    "Meditation",
    "Fasting",
    "Hydration",
    "Stress Management",
  ]

  const availableMetrics = [
    "Energy Level",
    "Mood",
    "Sleep Quality",
    "Focus",
    "Stress Level",
    "Weight",
    "Heart Rate",
    "HRV",
    "Blood Pressure",
    "Body Temperature",
  ]

  const handleVariableToggle = (variable: string) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.includes(variable)
        ? prev.variables.filter((v) => v !== variable)
        : [...prev.variables, variable],
    }))
  }

  const handleMetricToggle = (metric: string) => {
    setFormData((prev) => ({
      ...prev,
      metrics: prev.metrics.includes(metric) ? prev.metrics.filter((m) => m !== metric) : [...prev.metrics, metric],
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Experiment Name</Label>
              <Input
                id="name"
                placeholder="e.g., Cold Shower Protocol"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hypothesis">Hypothesis</Label>
              <Textarea
                id="hypothesis"
                placeholder="What do you expect to happen? e.g., Cold showers will improve my energy levels and mood"
                value={formData.hypothesis}
                onChange={(e) => setFormData((prev) => ({ ...prev, hypothesis: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 Week</SelectItem>
                  <SelectItem value="14">2 Weeks</SelectItem>
                  <SelectItem value="21">3 Weeks</SelectItem>
                  <SelectItem value="30">1 Month</SelectItem>
                  <SelectItem value="60">2 Months</SelectItem>
                  <SelectItem value="90">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Variables Being Tested</Label>
              <p className="text-sm text-gray-600 mt-1">Select what you'll be changing or implementing</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableVariables.map((variable) => (
                <div key={variable} className="flex items-center space-x-2">
                  <Checkbox
                    id={variable}
                    checked={formData.variables.includes(variable)}
                    onCheckedChange={() => handleVariableToggle(variable)}
                  />
                  <Label htmlFor={variable} className="text-sm font-normal">
                    {variable}
                  </Label>
                </div>
              ))}
            </div>
            {formData.variables.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Variables:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Metrics to Track</Label>
              <p className="text-sm text-gray-600 mt-1">Choose what you'll measure to evaluate success</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableMetrics.map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric}
                    checked={formData.metrics.includes(metric)}
                    onCheckedChange={() => handleMetricToggle(metric)}
                  />
                  <Label htmlFor={metric} className="text-sm font-normal">
                    {metric}
                  </Label>
                </div>
              ))}
            </div>
            {formData.metrics.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Metrics:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.metrics.map((metric) => (
                    <Badge key={metric} variant="secondary">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Review Your Experiment</h3>
              <p className="text-sm text-gray-600">Make sure everything looks correct before creating</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-medium">Name</Label>
                <p className="text-sm text-gray-700">{formData.name}</p>
              </div>

              <div>
                <Label className="font-medium">Hypothesis</Label>
                <p className="text-sm text-gray-700">{formData.hypothesis}</p>
              </div>

              <div>
                <Label className="font-medium">Duration</Label>
                <p className="text-sm text-gray-700">{formData.duration} days</p>
              </div>

              <div>
                <Label className="font-medium">Variables ({formData.variables.length})</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-medium">Metrics ({formData.metrics.length})</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.metrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details or considerations..."
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleCreateExperiment = () => {
    if (!formData.name || !formData.hypothesis || !formData.duration || !startDate || !endDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      createExperiment({
        name: formData.name,
        hypothesis: formData.hypothesis,
        duration: Number.parseInt(formData.duration),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        variables: formData.variables,
        metrics: formData.metrics,
        notes: formData.notes,
        status: "active",
        progress: 0,
      })

      router.push("/experiments")
    } catch (error) {
      console.error("Error creating experiment:", error)
      alert("Failed to create experiment. Please try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Experiments
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Experiment</h1>
        <p className="text-gray-600 mt-1">Design your personal biohacking experiment</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600",
                )}
              >
                {step.number}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && <div className="w-12 h-px bg-gray-300 mx-4" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-500">NAME</Label>
                <p className="text-sm font-medium">{formData.name || "Untitled Experiment"}</p>
              </div>

              {formData.hypothesis && (
                <div>
                  <Label className="text-xs font-medium text-gray-500">HYPOTHESIS</Label>
                  <p className="text-sm">{formData.hypothesis}</p>
                </div>
              )}

              {formData.duration && (
                <div>
                  <Label className="text-xs font-medium text-gray-500">DURATION</Label>
                  <p className="text-sm">{formData.duration} days</p>
                </div>
              )}

              {formData.variables.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-gray-500">VARIABLES</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {formData.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.variables.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {formData.metrics.length > 0 && (
                <div>
                  <Label className="text-xs font-medium text-gray-500">METRICS</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.metrics.slice(0, 3).map((metric) => (
                      <Badge key={metric} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                    {formData.metrics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{formData.metrics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {currentStep < 5 ? (
          <Button onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleCreateExperiment}>Create Experiment</Button>
        )}
      </div>
    </div>
  )
}
