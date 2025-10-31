"use client"

import { useState, useEffect } from "react"

export default function HistorySection() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const query = `
          query {
            getMonitoringHistory(limit: 10) {
              type
              meta
              createdAt
            }
          }
        `

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        })

        const data = await response.json()
        setHistory(data.data?.getMonitoringHistory || [])
      } catch (error) {
        console.error("Failed to fetch history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-slate-600">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Monitoring History</h2>
      <div className="space-y-3">
        {history.length === 0 ? (
          <p className="text-slate-600 text-sm">No history yet</p>
        ) : (
          history.map((item: any, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.type}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
