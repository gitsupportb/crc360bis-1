"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const pcaComponents = [
  {
    name: "Gouvernance",
    progress: 95,
    status: "En cours",
    description: "Validation de la politique PCA prévue pour le T1 2025",
  },
  {
    name: "Plan de secours métiers",
    progress: 75,
    status: "En cours",
    description: "Poursuite des travaux d'élaboration des BIA",
  },
  {
    name: "Site de repli",
    progress: 75,
    status: "En cours",
    description: "Site MOUKAWAMA identifié et en cours d'aménagement",
  },
  {
    name: "Plan de maintien conditions opérationnelles",
    progress: 65,
    status: "En cours",
    description: "Tests et exercices de simulation en cours",
  },
]

const yearlyProgress = [
  { year: "2023", completed: 100, inProgress: 0, notStarted: 0 },
  { year: "2024", completed: 76, inProgress: 14, notStarted: 10 },
]

export function PCADashboard() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Evolution du PCA</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyProgress}>
              <XAxis dataKey="year" />
              <YAxis />
              <Bar dataKey="completed" name="Réalisé" stackId="a" fill="#4CAF50" />
              <Bar dataKey="inProgress" name="En cours" stackId="a" fill="#FF6600" />
              <Bar dataKey="notStarted" name="Non démarré" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composantes du PCA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {pcaComponents.map((component) => (
              <div key={component.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{component.name}</div>
                    <div className="text-sm text-muted-foreground">{component.description}</div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      component.progress >= 90
                        ? "text-green-500"
                        : component.progress >= 75
                          ? "text-orange-500"
                          : "text-yellow-500"
                    }`}
                  >
                    {component.progress}%
                  </span>
                </div>
                <Progress value={component.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

