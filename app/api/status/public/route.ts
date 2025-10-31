import { getUptimePercentage, getUptimeStatus, getActiveIncidents } from "@/lib/uptime"
import { getRequestMetrics } from "@/lib/monitoring"

export async function GET() {
  try {
    const metrics = await getRequestMetrics()
    const uptime24h = getUptimePercentage(24)
    const uptime7d = getUptimePercentage(168)
    const status = getUptimeStatus()
    const activeIncidents = getActiveIncidents()

    return Response.json({
      status,
      timestamp: new Date(),
      uptime: {
        percentage24h: uptime24h,
        percentage7d: uptime7d,
      },
      metrics: {
        totalRequests: metrics.totalRequests,
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        errorCount: metrics.errorCount,
      },
      incidents: {
        active: activeIncidents.length,
        list: activeIncidents,
      },
      statusPage: {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/public/status`,
        lastUpdated: new Date(),
      },
    })
  } catch (error) {
    return Response.json(
      {
        status: "degraded",
        error: error instanceof Error ? error.message : "Failed to get status",
      },
      { status: 200 },
    )
  }
}
