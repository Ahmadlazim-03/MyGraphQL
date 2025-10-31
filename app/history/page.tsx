"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "all",
    method: "all",
  })

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
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/monitoring/metrics")
        const data = await response.json()
        let filteredRequests = data.recentRequests || []

        if (filters.status !== "all") {
          filteredRequests = filteredRequests.filter((r: any) => {
            if (filters.status === "success") return r.status === 200
            if (filters.status === "error") return r.status >= 400 || r.error
            return true
          })
        }

        if (filters.method !== "all") {
          filteredRequests = filteredRequests.filter((r: any) => r.method === filters.method)
        }

        setRequests(filteredRequests)
      } catch (error) {
        console.error("Failed to fetch requests:", error)
      }
    }

    if (user) {
      fetchRequests()
      const interval = setInterval(fetchRequests, 3000)
      return () => clearInterval(interval)
    }
  }, [user, filters])

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
            <CardTitle>Request History</CardTitle>
            <CardDescription>View all GraphQL API requests with detailed information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="success">Success (200)</option>
                <option value="error">Errors (400+)</option>
              </select>

              <select
                value={filters.method}
                onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Operation</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Query</th>
                  </tr>
                </thead>
                <tbody>
                  {requests && requests.length > 0 ? (
                    requests.map((req, i) => (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {new Date(req.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                            {req.method}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              req.status === 200
                                ? "bg-green-100 text-green-700"
                                : req.status >= 400
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={req.duration > 100 ? "text-orange-600 font-semibold" : "text-green-600"}>
                            {req.duration}ms
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 truncate max-w-xs" title={req.operationName}>
                          {req.operationName || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-500 truncate max-w-xs" title={req.query}>
                          {req.query ? req.query.substring(0, 30) + "..." : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
