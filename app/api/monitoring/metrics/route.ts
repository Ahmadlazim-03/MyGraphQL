import { getRequestMetrics, getRequestTimeline, getRecentRequests } from "@/lib/monitoring"

export async function GET() {
  try {
    const metrics = await getRequestMetrics()
    const timeline = await getRequestTimeline()
    const recentRequests = getRecentRequests(20)

    return Response.json({
      metrics,
      timeline,
      recentRequests,
      timestamp: new Date(),
    })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to get metrics" }, { status: 500 })
  }
}
