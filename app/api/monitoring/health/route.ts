import { recordUptime } from "@/lib/uptime"
import { getRequestMetrics } from "@/lib/monitoring"

export async function GET() {
  try {
    const metrics = await getRequestMetrics()

    const isHealthy = Number(metrics.errorRate) < 10 && metrics.averageResponseTime < 1000

    await recordUptime({
      timestamp: new Date(),
      isUp: isHealthy,
      responseTime: metrics.averageResponseTime,
      statusCode: isHealthy ? 200 : 500,
    })

    return Response.json({
      healthy: isHealthy,
      metrics: {
        responseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        totalRequests: metrics.totalRequests,
      },
      timestamp: new Date(),
    })
  } catch (error) {
    await recordUptime({
      timestamp: new Date(),
      isUp: false,
      statusCode: 500,
    })

    return Response.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 503 },
    )
  }
}
