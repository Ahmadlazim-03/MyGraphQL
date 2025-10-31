"use client"

import { useState, useEffect } from "react"

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const query = `
          query {
            analyticsDaily(rangeDays: 7) {
              _id
              count
              avgDuration
            }
          }
        `

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })

        const data = await response.json()
        setAnalytics(data.data?.analyticsDaily || [])
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-slate-600">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Analytics (7 Days)</h2>
      <div className="space-y-3">
        {analytics.length === 0 ? (
          <p className="text-slate-600 text-sm">No analytics data</p>
        ) : (
          analytics.map((day: any, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div>
                <p className="font-medium text-slate-900">{day._id}</p>
                <p className="text-xs text-slate-500">Avg: {day.avgDuration?.toFixed(2)}ms</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{day.count}</p>
                <p className="text-xs text-slate-500">checks</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
