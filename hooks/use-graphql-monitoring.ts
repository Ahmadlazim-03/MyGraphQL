"use client"

import { useEffect, useState, useRef } from "react"

export interface MonitoringUpdate {
  type: "connected" | "metrics_update" | "error"
  data?: any
  message?: string
  timestamp: string
}

export function useGraphQLMonitoring(enabled = true) {
  const [updates, setUpdates] = useState<MonitoringUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!enabled) return

    const connect = () => {
      const eventSource = new EventSource("/api/monitoring/events")

      eventSource.onopen = () => {
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as MonitoringUpdate
          setUpdates((prev) => [data, ...prev.slice(0, 49)])
        } catch (error) {
          console.error("Failed to parse SSE message:", error)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        eventSource.close()
        // Attempt to reconnect after 3 seconds
        setTimeout(connect, 3000)
      }

      eventSourceRef.current = eventSource
    }

    connect()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [enabled])

  return {
    updates,
    isConnected,
    lastUpdate: updates[0]?.timestamp,
  }
}
