"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import MetricsCards from "@/components/monitoring/metrics-cards"
import RequestTimeline from "@/components/monitoring/request-timeline"
import RecentRequestsList from "@/components/monitoring/recent-requests-list"
import ErrorLog from "@/components/monitoring/error-log"
import LiveIndicator from "@/components/monitoring/live-indicator"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    const fetchUserAndMetrics = async () => {
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

    fetchUserAndMetrics()
  }, [router])

  useEffect(() => {
    if (!user) return

    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/monitoring/metrics")
        const data = await response.json()

        setMetrics(data.metrics)
        setTimeline(data.timeline)
        setRecentRequests(data.recentRequests)
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchMetrics()

    const interval = setInterval(fetchMetrics, 2000)

    return () => clearInterval(interval)
  }, [user])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">GraphQL API Monitor</h1>
            <p className="text-slate-600 mt-2">Real-time performance metrics and monitoring</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <LiveIndicator />
            <div>
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="text-sm font-medium text-slate-700">{lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        <MetricsCards metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RequestTimeline timeline={timeline} />
          </div>
          <ErrorLog />
        </div>

        <RecentRequestsList requests={recentRequests} />
      </div>
    </Layout>
  )
}
