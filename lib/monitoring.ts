import { connectMongoDB } from "./mongodb"

export interface GraphQLRequestLog {
  method: string
  duration: number
  status: number
  query?: string
  operationName?: string
  error?: string
  timestamp: Date
}

// In-memory storage for recent requests (for real-time dashboard)
const recentRequests: GraphQLRequestLog[] = []
const MAX_RECENT_REQUESTS = 1000

export async function logGraphQLRequest(log: GraphQLRequestLog) {
  try {
    // Add to in-memory storage
    recentRequests.unshift(log)
    if (recentRequests.length > MAX_RECENT_REQUESTS) {
      recentRequests.pop()
    }

    // Also save to MongoDB for persistence
    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("graphql_requests")

    await collection.insertOne({
      ...log,
      createdAt: new Date(),
      performanceLevel: log.duration > 500 ? "slow" : log.duration > 100 ? "medium" : "fast",
      isError: log.status >= 400 || !!log.error,
    })

    // Keep only last 30 days
    await collection.deleteMany({
      createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })

    // Create index for better search performance
    try {
      await collection.createIndex({ createdAt: -1 })
      await collection.createIndex({ status: 1 })
      await collection.createIndex({ method: 1 })
    } catch (e) {
      // Index may already exist
    }
  } catch (error) {
    console.error("Failed to log GraphQL request:", error)
  }
}

export function getRecentRequests(limit = 50): GraphQLRequestLog[] {
  return recentRequests.slice(0, limit)
}

export async function getRequestMetrics() {
  const recent = recentRequests.slice(0, 100)

  if (recent.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowestRequest: 0,
      fastestRequest: 0,
      errorCount: 0,
      errorRate: 0,
      requestsPerSecond: 0,
    }
  }

  const durations = recent.map((r) => r.duration)
  const errorCount = recent.filter((r) => r.status >= 400 || r.error).length

  return {
    totalRequests: recent.length,
    averageResponseTime: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    slowestRequest: Math.max(...durations),
    fastestRequest: Math.min(...durations),
    errorCount,
    errorRate: ((errorCount / recent.length) * 100).toFixed(2),
    requestsPerSecond: (recent.length / 10).toFixed(2), // Approximate based on recent 10 seconds
  }
}

export async function getRequestTimeline() {
  const recent = recentRequests.slice(0, 100)
  const timeline: { time: string; count: number; avgDuration: number }[] = []

  // Group by 5-second intervals
  for (let i = 0; i < 12; i++) {
    const now = Date.now()
    const start = now - (12 - i) * 5000
    const end = start + 5000

    const requests = recent.filter((r) => r.timestamp.getTime() >= start && r.timestamp.getTime() < end)

    if (requests.length > 0) {
      timeline.push({
        time: new Date(end).toLocaleTimeString(),
        count: requests.length,
        avgDuration: Math.round(requests.reduce((a, b) => a + b.duration, 0) / requests.length),
      })
    }
  }

  return timeline
}

export async function getErrorLog(limit = 50) {
  const errors = recentRequests.filter((r) => r.error).slice(0, limit)
  return errors.map((r) => ({
    timestamp: r.timestamp,
    error: r.error,
    query: r.query,
    status: r.status,
  }))
}

export async function getStatistics() {
  const recent = recentRequests.slice(0, 100)

  if (recent.length === 0) {
    return {
      successCount: 0,
      errorCount: 0,
      avgDuration: 0,
      medianDuration: 0,
      p95Duration: 0,
      p99Duration: 0,
    }
  }

  const durations = recent.map((r) => r.duration).sort((a, b) => a - b)
  const errorCount = recent.filter((r) => r.status >= 400 || r.error).length
  const successCount = recent.length - errorCount

  return {
    successCount,
    errorCount,
    avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
    medianDuration: durations[Math.floor(durations.length / 2)],
    p95Duration: durations[Math.floor(durations.length * 0.95)],
    p99Duration: durations[Math.floor(durations.length * 0.99)],
  }
}
