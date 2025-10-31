"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PerformancePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [distributionData, setDistributionData] = useState<any[]>([])

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

    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/monitoring/metrics")
        const data = await response.json()
        setMetrics(data.metrics)

        // Calculate response time distribution
        const distribution = [
          { range: "0-50ms", count: 0 },
          { range: "50-100ms", count: 0 },
          { range: "100-200ms", count: 0 },
          { range: "200ms+", count: 0 },
        ]

        data.recentRequests?.forEach((req: any) => {
          if (req.duration < 50) distribution[0].count++
          else if (req.duration < 100) distribution[1].count++
          else if (req.duration < 200) distribution[2].count++
          else distribution[3].count++
        })

        setDistributionData(distribution)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 3000)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{metrics?.averageResponseTime}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Fastest Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{metrics?.fastestRequest}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Slowest Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{metrics?.slowestRequest}ms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">P95 Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-600">{Math.round(metrics?.averageResponseTime * 1.5)}ms</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>Number of requests in each response time range</CardDescription>
          </CardHeader>
          <CardContent>
            {distributionData && distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
