"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, AlertCircle, Database, Zap } from "lucide-react"

interface StatusResponse {
  timestamp: string
  databases: {
    postgresql: {
      connected: boolean
      data: any
      error: string | null
    }
    mongodb: {
      connected: boolean
      data: any
      error: string | null
    }
  }
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status")
        const data = await response.json()
        setStatus(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white text-lg">Loading database status...</p>
        </div>
      </div>
    )
  }

  const pgConnected = status?.databases.postgresql.connected
  const mongoConnected = status?.databases.mongodb.connected
  const allConnected = pgConnected && mongoConnected

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MyGraphQL Database Status</h1>
          <p className="text-slate-400">Real-time connection monitoring</p>
          {status && (
            <p className="text-slate-500 text-sm mt-2">Last updated: {new Date(status.timestamp).toLocaleString()}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* PostgreSQL Status Card */}
          <div
            className={`rounded-lg p-6 backdrop-blur-sm border ${
              pgConnected ? "bg-green-50/10 border-green-500/20" : "bg-red-50/10 border-red-500/20"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className={`w-6 h-6 ${pgConnected ? "text-green-400" : "text-red-400"}`} />
                <h2 className="text-xl font-semibold text-white">PostgreSQL</h2>
              </div>
              {pgConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
            </div>

            {pgConnected ? (
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-slate-400 text-sm mb-2">Status: Connected</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">
                      Connection:{" "}
                      <span className="font-mono text-blue-300">{status?.databases.postgresql.data?.connection}</span>
                    </p>
                    <p className="text-slate-300">
                      Users:{" "}
                      <span className="font-semibold text-green-400">
                        {status?.databases.postgresql.data?.users || 0}
                      </span>
                    </p>
                    <p className="text-slate-300">
                      Mahasiswa:{" "}
                      <span className="font-semibold text-blue-400">
                        {status?.databases.postgresql.data?.mahasiswa || 0}
                      </span>
                    </p>
                    <p className="text-slate-300">
                      Alumni:{" "}
                      <span className="font-semibold text-purple-400">
                        {status?.databases.postgresql.data?.alumni || 0}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-900/30 rounded p-3">
                <p className="text-red-300 text-sm">
                  Error: {status?.databases.postgresql.error || "Connection failed"}
                </p>
              </div>
            )}
          </div>

          {/* MongoDB Status Card */}
          <div
            className={`rounded-lg p-6 backdrop-blur-sm border ${
              mongoConnected ? "bg-green-50/10 border-green-500/20" : "bg-red-50/10 border-red-500/20"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Database className={`w-6 h-6 ${mongoConnected ? "text-green-400" : "text-red-400"}`} />
                <h2 className="text-xl font-semibold text-white">MongoDB</h2>
              </div>
              {mongoConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-400" />
              )}
            </div>

            {mongoConnected ? (
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <p className="text-slate-400 text-sm mb-2">Status: Connected</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">
                      Connection:{" "}
                      <span className="font-mono text-blue-300">{status?.databases.mongodb.data?.connection}</span>
                    </p>
                    <p className="text-slate-300">
                      Collections:{" "}
                      <span className="font-semibold text-green-400">
                        {status?.databases.mongodb.data?.collections?.length || 0}
                      </span>
                    </p>
                    <p className="text-slate-300">
                      Activity Logs:{" "}
                      <span className="font-semibold text-yellow-400">
                        {status?.databases.mongodb.data?.activityLogs || 0}
                      </span>
                    </p>
                    <p className="text-slate-300">
                      Analytics:{" "}
                      <span className="font-semibold text-orange-400">
                        {status?.databases.mongodb.data?.analytics || 0}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-900/30 rounded p-3">
                <p className="text-red-300 text-sm">Error: {status?.databases.mongodb.error || "Connection failed"}</p>
              </div>
            )}
          </div>
        </div>

        {/* Overall Status */}
        <div
          className={`rounded-lg p-6 backdrop-blur-sm border mb-8 ${
            allConnected ? "bg-blue-50/10 border-blue-500/20" : "bg-yellow-50/10 border-yellow-500/20"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {allConnected ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {allConnected ? "All Systems Operational" : "Connection Issues Detected"}
            </h3>
          </div>
          <p className="text-slate-400">
            {allConnected
              ? "Both PostgreSQL and MongoDB databases are connected and ready to use."
              : "Please check your database connections and environment variables."}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
