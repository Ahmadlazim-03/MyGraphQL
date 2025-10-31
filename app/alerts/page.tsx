"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AlertsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const query = `
          query {
            me {
              id
              username
              email
              role
            }
          }
        `

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        })

        const data = await response.json()

        if (data.data?.me) {
          setUser(data.data.me)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  useEffect(() => {
    if (!user) return

    const fetchAndAnalyze = async () => {
      try {
        const response = await fetch("/api/monitoring/metrics")
        const data = await response.json()
        setMetrics(data.metrics)

        const generatedAlerts: any[] = []

        // High error rate alert
        if (Number.parseFloat(data.metrics.errorRate) > 5) {
          generatedAlerts.push({
            id: 1,
            type: "error",
            severity: "high",
            title: "High Error Rate Detected",
            message: `Error rate is ${data.metrics.errorRate}% - above 5% threshold`,
            timestamp: new Date(),
          })
        }

        // Slow response time alert
        if (data.metrics.averageResponseTime > 500) {
          generatedAlerts.push({
            id: 2,
            type: "warning",
            severity: "medium",
            title: "Slow Response Times",
            message: `Average response time is ${data.metrics.averageResponseTime}ms - above 500ms threshold`,
            timestamp: new Date(),
          })
        }

        // High error count alert
        if (data.metrics.errorCount > 10) {
          generatedAlerts.push({
            id: 3,
            type: "error",
            severity: "high",
            title: "Multiple Errors",
            message: `${data.metrics.errorCount} errors detected in recent requests`,
            timestamp: new Date(),
          })
        }

        setAlerts(generatedAlerts)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchAndAnalyze()
    const interval = setInterval(fetchAndAnalyze, 5000)
    return () => clearInterval(interval)
  }, [user])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Active alerts and warnings for the GraphQL API</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 p-4 rounded ${
                      alert.severity === "high" ? "bg-red-50 border-red-400" : "bg-yellow-50 border-yellow-400"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${alert.severity === "high" ? "text-red-700" : "text-yellow-700"}`}
                        >
                          {alert.title}
                        </p>
                        <p className={`text-sm mt-1 ${alert.severity === "high" ? "text-red-600" : "text-yellow-600"}`}>
                          {alert.message}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 ml-4">{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-600 mb-2">No active alerts</p>
                <p className="text-sm text-slate-500">All systems operating within normal parameters</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{metrics?.totalRequests}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Error Count</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.errorCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Error Rate</p>
                <p className="text-2xl font-bold text-orange-600">{metrics?.errorRate}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Response</p>
                <p className="text-2xl font-bold text-blue-600">{metrics?.averageResponseTime}ms</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">RPS</p>
                <p className="text-2xl font-bold text-green-600">{metrics?.requestsPerSecond}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
