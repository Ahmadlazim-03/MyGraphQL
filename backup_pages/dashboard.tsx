"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/layout"
import MonitoringSection from "@/components/dashboard/monitoring-section"
import HistorySection from "@/components/dashboard/history-section"
import AnalyticsSection from "@/components/dashboard/analytics-section"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back, {user?.username}!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MonitoringSection user={user} />
          </div>
          <AnalyticsSection />
        </div>

        <HistorySection />
      </div>
    </Layout>
  )
}
