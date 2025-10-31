"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, AlertTriangle, BarChart3 } from "lucide-react"

interface StatusData {
  status: "operational" | "degraded" | "down"
  timestamp: string
  uptime: {
    percentage24h: number
    percentage7d: number
  }
  metrics: {
    totalRequests: number
    averageResponseTime: number
    errorRate: string
    errorCount: number
  }
  incidents: {
    active: number
    list: any[]
  }
}

export default function PublicStatusPage() {
  const [status, setStatus] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status/public")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to fetch status:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()

    if (!autoRefresh) return

    const interval = setInterval(fetchStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading status...</p>
        </div>
      </div>
    )
  }

  const statusColor = {
    operational: "bg-green-50 border-green-200",
    degraded: "bg-yellow-50 border-yellow-200",
    down: "bg-red-50 border-red-200",
  }

  const statusIcon = {
    operational: <CheckCircle className="w-8 h-8 text-green-600" />,
    degraded: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
    down: <AlertCircle className="w-8 h-8 text-red-600" />,
  }

  const statusText = {
    operational: "All Systems Operational",
    degraded: "Degraded Performance",
    down: "Service Down",
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">GraphQL API Status</h1>
              <p className="text-slate-600 mt-1">Real-time monitoring and uptime tracking</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Auto-refresh: {autoRefresh ? "ON" : "OFF"}</p>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-sm px-3 py-1 mt-2 border border-slate-300 rounded hover:bg-slate-50 transition"
              >
                {autoRefresh ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
          {status && (
            <p className="text-xs text-slate-500">Last updated: {new Date(status.timestamp).toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Status Card */}
        {status && (
          <div className={`border-2 rounded-lg p-6 ${statusColor[status.status]}`}>
            <div className="flex items-center gap-4">
              <div>{statusIcon[status.status]}</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{statusText[status.status]}</h2>
                <p className="text-slate-600 mt-1">
                  {status.status === "operational" &&
                    "The GraphQL API is running smoothly with all systems operational."}
                  {status.status === "degraded" &&
                    "The API is operational but experiencing degraded performance. We are investigating."}
                  {status.status === "down" &&
                    "The API is currently unavailable. Our team is working to restore service."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Uptime Cards */}
        {status && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <p className="text-sm text-slate-600 mb-2">Uptime (Last 24 Hours)</p>
              <p className="text-3xl font-bold text-blue-600">{status.uptime.percentage24h}%</p>
              <p className="text-xs text-slate-500 mt-2">
                {100 - Number(status.uptime.percentage24h) > 0
                  ? `${(100 - Number(status.uptime.percentage24h)).toFixed(2)}% downtime`
                  : "No downtime"}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <p className="text-sm text-slate-600 mb-2">Uptime (Last 7 Days)</p>
              <p className="text-3xl font-bold text-blue-600">{status.uptime.percentage7d}%</p>
              <p className="text-xs text-slate-500 mt-2">
                {100 - Number(status.uptime.percentage7d) > 0
                  ? `${(100 - Number(status.uptime.percentage7d)).toFixed(2)}% downtime`
                  : "No downtime"}
              </p>
            </div>
          </div>
        )}

        {/* Metrics */}
        {status && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Current Metrics</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900">{status.metrics.totalRequests}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg Response</p>
                <p className="text-2xl font-bold text-slate-900">{status.metrics.averageResponseTime}ms</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Error Rate</p>
                <p
                  className={`text-2xl font-bold ${Number(status.metrics.errorRate) > 5 ? "text-red-600" : "text-green-600"}`}
                >
                  {status.metrics.errorRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Errors</p>
                <p className="text-2xl font-bold text-slate-900">{status.metrics.errorCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Incidents */}
        {status && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Incidents</h3>

            {status.incidents.active > 0 ? (
              <div className="space-y-3">
                {status.incidents.list.map((incident, i) => (
                  <div key={i} className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded">
                    <p className="font-semibold text-slate-900">{incident.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{incident.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Started: {new Date(incident.startTime).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                <p className="text-green-700 font-medium">No active incidents</p>
                <p className="text-sm text-green-600">All systems operating normally</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-slate-100 rounded-lg p-4 text-center">
          <p className="text-sm text-slate-600">
            This status page is publicly available and updates automatically. For detailed monitoring, visit the{" "}
            <a href="/dashboard" className="text-blue-600 hover:underline">
              monitoring dashboard
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
