"use client"

import { useState } from "react"

export default function MonitoringSection({ user }: { user: any }) {
  const [provider, setProvider] = useState("database")
  const [url, setUrl] = useState("postgres://localhost:5432")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleRunCheck = async () => {
    setLoading(true)
    try {
      const query = `
        mutation RunCheck($provider: String!, $url: String!) {
          runCheck(provider: $provider, url: $url) {
            ok
            connectTimeMs
            sampleQueryMs
            details
          }
        }
      `

      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { provider, url },
        }),
      })

      const data = await response.json()
      setResult(data.data?.runCheck)
    } catch (error) {
      console.error("Check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Monitoring Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="database">Database</option>
            <option value="api">API</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">URL/Connection String</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter connection string or URL"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <button
          onClick={handleRunCheck}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          {loading ? "Running check..." : "Run Check"}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg ${result.ok ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <p className={`font-semibold ${result.ok ? "text-green-800" : "text-red-800"}`}>
            {result.ok ? "✓ Check Passed" : "✗ Check Failed"}
          </p>
          <div className="text-sm mt-2 space-y-1 text-slate-700">
            <p>Connection Time: {result.connectTimeMs?.toFixed(2)}ms</p>
            <p>Query Time: {result.sampleQueryMs?.toFixed(2)}ms</p>
          </div>
        </div>
      )}
    </div>
  )
}
