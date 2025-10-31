"use client"

import { useState, useEffect } from "react"

interface Alert {
  id: string
  type: string
  severity: string
  title: string
  message: string
  createdAt: Date
  acknowledgedAt?: Date
}

export default function AlertNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch("/api/alerts")
        const data = await response.json()
        setAlerts(data.alerts || [])
      } catch (error) {
        console.error("Failed to fetch alerts:", error)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAcknowledge = async (alertId: string) => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge", alertId }),
      })
      setDismissed((prev) => new Set([...prev, alertId]))
    } catch (error) {
      console.error("Failed to acknowledge alert:", error)
    }
  }

  const handleResolve = async (alertId: string) => {
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", alertId }),
      })
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id))

  if (visibleAlerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 space-y-3 z-50 max-w-md">
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-lg shadow-lg p-4 border-l-4 ${
            alert.severity === "critical" || alert.severity === "high"
              ? "bg-red-50 border-red-400"
              : alert.severity === "medium"
                ? "bg-yellow-50 border-yellow-400"
                : "bg-blue-50 border-blue-400"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p
                className={`font-semibold ${
                  alert.severity === "critical" || alert.severity === "high"
                    ? "text-red-700"
                    : alert.severity === "medium"
                      ? "text-yellow-700"
                      : "text-blue-700"
                }`}
              >
                {alert.title}
              </p>
              <p
                className={`text-sm mt-1 ${
                  alert.severity === "critical" || alert.severity === "high"
                    ? "text-red-600"
                    : alert.severity === "medium"
                      ? "text-yellow-600"
                      : "text-blue-600"
                }`}
              >
                {alert.message}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleAcknowledge(alert.id)}
                className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded transition"
              >
                Ack
              </button>
              <button
                onClick={() => handleResolve(alert.id)}
                className="text-xs px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
