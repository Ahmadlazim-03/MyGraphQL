"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [errorLog, setErrorLog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  // Mount flag to defer non-critical visuals (animations/blur) until after first paint
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Let the first paint happen, then enable decorative effects
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Fetch user info
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

        if (data.errors || !data.data?.me) {
          router.push("/")
          return
        }

        setUser(data.data.me)
      } catch (error) {
        console.error("Failed to fetch user:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  // Fetch monitoring data
  const fetchMonitoringData = useCallback(async () => {
    if (!user) return

    try {
      const query = `
        query {
          monitoringMetrics {
            totalRequests
            averageResponseTime
            slowestRequest
            fastestRequest
            errorCount
            errorRate
            requestsPerSecond
          }
          requestTimeline {
            time
            count
            avgDuration
          }
          recentRequests(limit: 200) {
            method
            duration
            status
            query
            operationName
            error
            timestamp
            performanceLevel
            isError
            ipAddress
            browser
            os
            device
            country
            city
          }
          errorLog(limit: 10) {
            status
            query
            error
            timestamp
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

      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
        return
      }

      if (data.data) {
        setMetrics(data.data.monitoringMetrics)
        setTimeline(data.data.requestTimeline)
        setRecentRequests(data.data.recentRequests)
        setErrorLog(data.data.errorLog)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error)
    }
  }, [user])

  // Fetch monitoring data on mount and with optional auto-refresh (30s interval)
  useEffect(() => {
    if (!user) return

    fetchMonitoringData()

    if (!autoRefresh) return

    // Reduced from 5s to 30s to reduce server load
    const interval = setInterval(fetchMonitoringData, 30000)

    return () => clearInterval(interval)
  }, [user, fetchMonitoringData, autoRefresh])

  const handleManualRefresh = async () => {
    setRefreshing(true)
    await fetchMonitoringData()
    setTimeout(() => setRefreshing(false), 500)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background Effects */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply opacity-15 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply opacity-15 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply opacity-15 animate-blob animation-delay-4000"></div>
        </div>
      )}

      {/* Header */}
  <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                GraphQL Monitor
              </h1>
              <p className="text-xs text-slate-400">Real-time API Analytics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white font-medium transition-all">
                    Menu
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content sideOffset={8} className="min-w-56 rounded-xl bg-slate-900/90 border border-white/10 backdrop-blur-md p-1 text-sm text-slate-200 shadow-2xl">
                    <div className="px-3 py-2 text-sm font-semibold text-white truncate">
                      {user?.email}
                    </div>
                    <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

                    <DropdownMenu.CheckboxItem
                      checked={!!autoRefresh}
                      onCheckedChange={(v) => setAutoRefresh(!!v)}
                      className="outline-none select-none w-full px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer flex items-center gap-2"
                    >
                      <span className="flex-1">Auto-refresh (30s)</span>
                      <span className={`inline-block w-9 h-5 rounded-full transition-colors ${autoRefresh ? 'bg-purple-500' : 'bg-slate-600'}`}>
                        <span className={`block w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-0.5'}`}></span>
                      </span>
                    </DropdownMenu.CheckboxItem>

                    <DropdownMenu.Item
                      onSelect={(e) => { e.preventDefault(); if (!refreshing) handleManualRefresh(); }}
                      className="outline-none select-none w-full px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      {refreshing ? 'Refreshing…' : 'Refresh now'}
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onSelect={(e) => { e.preventDefault(); setShowSettings(true); }}
                      className="outline-none select-none w-full px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      Settings
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      onSelect={(e) => { e.preventDefault(); router.push('/status'); }}
                      className="outline-none select-none w-full px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      Status
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="my-1 h-px bg-white/10" />

                    <DropdownMenu.Item
                      onSelect={(e) => { e.preventDefault(); handleLogout(); }}
                      className="outline-none select-none w-full px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer text-red-300"
                    >
                      Logout
                    </DropdownMenu.Item>

                    <DropdownMenu.Arrow className="fill-white/10" />
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            user={user}
            onClose={() => setShowSettings(false)}
            onUpdate={(newEmail: string) => {
              setUser({ ...user, email: newEmail })
            }}
          />
        )}

        <div className="space-y-6">
          {/* Live Indicator & Last Update */}
          <div className="flex items-center justify-between rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`relative w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-slate-500'}`}>
                  {mounted && autoRefresh && (
                    <span className="absolute inset-0 rounded-full bg-green-500 animate-ping"></span>
                  )}
                </div>
                <span className="text-sm font-medium text-white">
                  {autoRefresh ? 'Live monitoring' : 'Paused'}
                </span>
              </div>
              <div className="h-4 w-px bg-white/20"></div>
              <span className="text-sm text-slate-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <span className="text-xs text-blue-300">Tip: Manual refresh reduces server load</span>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Requests"
              value={metrics?.totalRequests || 0}
              color="purple"
              subtitle="All-time queries"
            />
            <MetricCard
              title="Avg Response Time"
              value={`${metrics?.averageResponseTime || 0}ms`}
              color="blue"
              subtitle="Query performance"
            />
            <MetricCard
              title="Error Count"
              value={metrics?.errorCount || 0}
              color="red"
              subtitle="Failed requests"
              status={metrics?.errorCount === 0 ? 'Healthy' : 'Errors'}
            />
            <MetricCard
              title="Requests/sec"
              value={metrics?.requestsPerSecond || "0"}
              color="green"
              subtitle="Current rate"
            />
          </div>

          {/* Timeline & Error Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TimelineChart timeline={timeline} />
            </div>
            <ErrorLogCard errors={errorLog} />
          </div>

          {/* Recent Requests */}
          <RecentRequestsTable requests={recentRequests} />
        </div>
      </main>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, color, subtitle, status }: any) {
  const colorClasses = {
    purple: {
      bg: "from-purple-500/10",
      border: "border-purple-500/30",
      iconBg: "bg-purple-500/20",
      badge: "bg-purple-500/20 text-purple-300",
      hover: "hover:shadow-purple-500/20"
    },
    blue: {
      bg: "from-blue-500/10",
      border: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      badge: "bg-blue-500/20 text-blue-300",
      hover: "hover:shadow-blue-500/20"
    },
    red: {
      bg: "from-red-500/10",
      border: "border-red-500/30",
      iconBg: "bg-red-500/20",
      badge: "bg-red-500/20 text-red-300",
      hover: "hover:shadow-red-500/20"
    },
    green: {
      bg: "from-green-500/10",
      border: "border-green-500/30",
      iconBg: "bg-green-500/20",
      badge: "bg-green-500/20 text-green-300",
      hover: "hover:shadow-green-500/20"
    }
  }

  const colors = colorClasses[color as keyof typeof colorClasses]

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border ${colors.border} p-6 hover:bg-white/10 transition-all hover:scale-[1.02] hover:shadow-2xl ${colors.hover}`}>
      <div className={`absolute inset-0 bg-linear-to-br ${colors.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wide text-slate-400">{title}</div>
          {status && (
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
              status === 'Healthy' ? 'bg-green-500/20 text-green-300' : colors.badge
            }`}>
              {status}
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-white mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// Timeline Chart Component
function TimelineChart({ timeline }: any) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Request Timeline</h2>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <span className="text-4xl mb-3">📊</span>
          <p className="text-sm">No timeline data available</p>
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...timeline.map((t: any) => t.count), 1)

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-6">Request Timeline</h2>
      <div className="space-y-3">
        {timeline.map((point: any, idx: number) => (
          <div key={idx} className="group flex items-center gap-3">
            <span className="text-xs text-slate-400 w-16 font-mono">{point.time}</span>
            <div className="flex-1 h-10 bg-white/5 rounded-lg overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors">
              <div
                className="h-full bg-linear-to-r from-purple-500 to-blue-500 flex items-center px-3 transition-all"
                style={{ width: `${Math.max((point.count / maxCount) * 100, 5)}%` }}
              >
                <span className="text-xs text-white font-medium whitespace-nowrap">
                  {point.count} req • {Math.round(point.avgDuration)}ms
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error Log Card Component
function ErrorLogCard({ errors }: any) {
  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-4">Recent Errors</h2>
      {errors && errors.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {errors.map((error: any, idx: number) => (
            <div key={idx} className="border-l-4 border-red-500 pl-3 py-2.5 bg-red-500/10 rounded-r-lg backdrop-blur-sm hover:bg-red-500/20 transition-colors">
              <p className="text-xs font-medium text-red-200">{error.error}</p>
              <p className="text-xs text-red-400 mt-1">{new Date(error.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <p className="text-sm">No errors recorded</p>
        </div>
      )}
    </div>
  )
}

// Recent Requests Table Component
function RecentRequestsTable({ requests }: any) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Recent Requests</h2>
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <p className="text-sm">No requests recorded</p>
        </div>
      </div>
    )
  }

  const total = requests.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const end = start + pageSize
  const items = requests.slice(start, end)

  const changePage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages)
    setPage(next)
  }

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
      <h2 className="text-lg font-bold text-white mb-6">Recent Requests</h2>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 font-semibold text-slate-300">Time</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">Duration</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">Device</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">Location</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">IP Address</th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">Operation</th>
            </tr>
          </thead>
          <tbody>
            {items.map((req: any, idx: number) => (
              <tr key={start + idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-xs">
                  {new Date(req.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      req.isError
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-green-500/20 text-green-300 border border-green-500/30"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      req.performanceLevel === "fast"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : req.performanceLevel === "medium"
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}
                  >
                    {Math.round(req.duration)}ms
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-slate-300">
                      {req.browser || 'Unknown'} • {req.device || 'Unknown'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {req.os || 'Unknown OS'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-slate-400">
                    {(req.country || 'Unknown') + (req.city ? ` — ${req.city}` : '')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-white/5 text-slate-400 rounded-lg text-xs font-mono border border-white/10">
                    {req.ipAddress || 'Unknown'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                  {req.operationName || req.query?.substring(0, 50) || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Showing <span className="text-slate-200">{start + 1}</span>–<span className="text-slate-200">{Math.min(end, total)}</span> of <span className="text-slate-200">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="bg-white/5 border border-white/10 text-slate-300 text-xs rounded-lg px-2 py-1"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={safePage <= 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs text-slate-400">Page {safePage} of {totalPages}</span>
            <button
              onClick={() => changePage(page + 1)}
              disabled={safePage >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings Modal Component
function SettingsModal({ user, onClose, onUpdate }: any) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword) {
      setError("Current password is required")
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (newPassword && newPassword.length < 8) {
      setError("New password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newEmail: newEmail !== user?.email ? newEmail : undefined,
          newPassword: newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update credentials")
        return
      }

      setSuccess("Credentials updated successfully!")
      onUpdate(data.email)

      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-2xl leading-none transition-colors flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current Password *
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
              required
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>📧</span> Change Email
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                New Email (optional)
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>🔐</span> Change Password
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 chars)"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all disabled:opacity-50"
                  disabled={!newPassword}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg font-medium transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-linear-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
