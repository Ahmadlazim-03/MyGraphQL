import { connectMongoDB } from "./mongodb"

export interface Alert {
  id: string
  type: "error" | "warning" | "info"
  severity: "critical" | "high" | "medium" | "low"
  title: string
  message: string
  threshold?: any
  createdAt: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  acknowledgedBy?: string
}

const activeAlerts: Map<string, Alert> = new Map()

export async function createAlert(alert: Omit<Alert, "id" | "createdAt">) {
  try {
    const id = `${alert.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullAlert: Alert = {
      ...alert,
      id,
      createdAt: new Date(),
    }

    activeAlerts.set(id, fullAlert)

    // Persist to MongoDB
    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("alerts")

    await collection.insertOne(fullAlert)

    return fullAlert
  } catch (error) {
    console.error("Failed to create alert:", error)
    throw error
  }
}

export async function acknowledgeAlert(alertId: string, userId?: string) {
  try {
    const alert = activeAlerts.get(alertId)
    if (!alert) {
      throw new Error("Alert not found")
    }

    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = userId
    activeAlerts.set(alertId, alert)

    // Update in MongoDB
    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("alerts")

    await collection.updateOne(
      { id: alertId },
      {
        $set: {
          acknowledgedAt: new Date(),
          acknowledgedBy: userId,
        },
      },
    )

    return alert
  } catch (error) {
    console.error("Failed to acknowledge alert:", error)
    throw error
  }
}

export async function resolveAlert(alertId: string) {
  try {
    const alert = activeAlerts.get(alertId)
    if (!alert) {
      throw new Error("Alert not found")
    }

    alert.resolvedAt = new Date()
    activeAlerts.set(alertId, alert)

    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("alerts")

    await collection.updateOne(
      { id: alertId },
      {
        $set: {
          resolvedAt: new Date(),
        },
      },
    )

    // Remove from active alerts after 1 hour
    setTimeout(
      () => {
        activeAlerts.delete(alertId)
      },
      60 * 60 * 1000,
    )

    return alert
  } catch (error) {
    console.error("Failed to resolve alert:", error)
    throw error
  }
}

export function getActiveAlerts(): Alert[] {
  return Array.from(activeAlerts.values()).filter((a) => !a.resolvedAt)
}

export function getAlertById(id: string): Alert | undefined {
  return activeAlerts.get(id)
}

export async function getAlertHistory(limit = 100): Promise<Alert[]> {
  try {
    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("alerts")

    const alerts = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray()

    return alerts as Alert[]
  } catch (error) {
    console.error("Failed to get alert history:", error)
    return []
  }
}

export async function checkMetricsAndCreateAlerts(metrics: any) {
  try {
    const activeAlerts = getActiveAlerts()

    // Check error rate
    const errorRate = Number.parseFloat(metrics.errorRate)
    if (errorRate > 5 && !activeAlerts.some((a) => a.id.includes("high-error-rate"))) {
      await createAlert({
        type: "error",
        severity: "high",
        title: "High Error Rate Detected",
        message: `Error rate is ${errorRate}% - exceeds 5% threshold`,
        threshold: { current: errorRate, threshold: 5 },
      })
    }

    // Check response time
    if (metrics.averageResponseTime > 500 && !activeAlerts.some((a) => a.id.includes("slow-response"))) {
      await createAlert({
        type: "warning",
        severity: "medium",
        title: "Slow Response Times",
        message: `Average response time is ${metrics.averageResponseTime}ms`,
        threshold: { current: metrics.averageResponseTime, threshold: 500 },
      })
    }

    // Check error count
    if (metrics.errorCount > 10 && !activeAlerts.some((a) => a.id.includes("high-error-count"))) {
      await createAlert({
        type: "error",
        severity: "high",
        title: "Multiple API Errors",
        message: `${metrics.errorCount} errors detected in recent requests`,
        threshold: { current: metrics.errorCount, threshold: 10 },
      })
    }

    // Resolve alerts if conditions improve
    for (const alert of activeAlerts) {
      if (alert.id.includes("high-error-rate") && errorRate <= 5) {
        await resolveAlert(alert.id)
      }
      if (alert.id.includes("slow-response") && metrics.averageResponseTime <= 500) {
        await resolveAlert(alert.id)
      }
      if (alert.id.includes("high-error-count") && metrics.errorCount <= 10) {
        await resolveAlert(alert.id)
      }
    }
  } catch (error) {
    console.error("Failed to check metrics for alerts:", error)
  }
}
