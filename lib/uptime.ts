import { connectMongoDB } from "./mongodb"

export interface UptimeRecord {
  timestamp: Date
  isUp: boolean
  responseTime?: number
  statusCode?: number
}

export interface IncidentRecord {
  id: string
  startTime: Date
  endTime?: Date
  duration?: number
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  resolved: boolean
}

const uptimeHistory: UptimeRecord[] = []
const incidents: Map<string, IncidentRecord> = new Map()

export async function recordUptime(record: UptimeRecord) {
  try {
    uptimeHistory.unshift(record)
    if (uptimeHistory.length > 43200) {
      // Keep 12 hours of data (1 per second)
      uptimeHistory.pop()
    }

    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("uptime_records")

    await collection.insertOne(record)

    // Keep only 30 days
    await collection.deleteMany({
      timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    })
  } catch (error) {
    console.error("Failed to record uptime:", error)
  }
}

export function getUptimePercentage(hours = 24): number {
  const now = Date.now()
  const timeWindow = hours * 60 * 60 * 1000
  const records = uptimeHistory.filter((r) => now - r.timestamp.getTime() <= timeWindow)

  if (records.length === 0) return 100

  const upRecords = records.filter((r) => r.isUp).length
  return ((upRecords / records.length) * 100).toFixed(2) as any
}

export function getUptimeStatus(): "operational" | "degraded" | "down" {
  const recent = uptimeHistory.slice(0, 10)
  if (recent.length === 0) return "operational"

  const upCount = recent.filter((r) => r.isUp).length
  const upPercentage = (upCount / recent.length) * 100

  if (upPercentage === 100) return "operational"
  if (upPercentage >= 90) return "degraded"
  return "down"
}

export async function createIncident(incident: Omit<IncidentRecord, "id">) {
  try {
    const id = `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const fullIncident: IncidentRecord = {
      ...incident,
      id,
    }

    incidents.set(id, fullIncident)

    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("incidents")

    await collection.insertOne(fullIncident)

    return fullIncident
  } catch (error) {
    console.error("Failed to create incident:", error)
    throw error
  }
}

export async function resolveIncident(incidentId: string) {
  try {
    const incident = incidents.get(incidentId)
    if (!incident) throw new Error("Incident not found")

    incident.endTime = new Date()
    incident.duration = incident.endTime.getTime() - incident.startTime.getTime()
    incident.resolved = true

    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("incidents")

    await collection.updateOne(
      { id: incidentId },
      {
        $set: {
          endTime: incident.endTime,
          duration: incident.duration,
          resolved: true,
        },
      },
    )

    return incident
  } catch (error) {
    console.error("Failed to resolve incident:", error)
    throw error
  }
}

export function getActiveIncidents(): IncidentRecord[] {
  return Array.from(incidents.values()).filter((i) => !i.resolved)
}

export async function getIncidentHistory(limit = 20): Promise<IncidentRecord[]> {
  try {
    const client = await connectMongoDB()
    const db = client.db("monitoring")
    const collection = db.collection("incidents")

    const incidents = await collection.find({}).sort({ startTime: -1 }).limit(limit).toArray()

    return incidents as IncidentRecord[]
  } catch (error) {
    console.error("Failed to get incident history:", error)
    return []
  }
}
