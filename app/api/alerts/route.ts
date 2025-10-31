import { getActiveAlerts, getAlertHistory, acknowledgeAlert, resolveAlert } from "@/lib/alerts"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    if (action === "history") {
      const limit = Number.parseInt(searchParams.get("limit") || "100")
      const history = await getAlertHistory(limit)
      return Response.json({ alerts: history })
    }

    const active = getActiveAlerts()
    return Response.json({ alerts: active, count: active.length })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to get alerts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, alertId } = body

    if (action === "acknowledge") {
      const alert = await acknowledgeAlert(alertId, body.userId)
      return Response.json({ alert })
    }

    if (action === "resolve") {
      const alert = await resolveAlert(alertId)
      return Response.json({ alert })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to process alert" }, { status: 500 })
  }
}
