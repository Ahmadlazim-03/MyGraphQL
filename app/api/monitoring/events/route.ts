export async function GET(request: Request) {
  // Set headers for Server-Sent Events
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  }

  const encoder = new TextEncoder()
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "connected",
            message: "Connected to monitoring service",
            timestamp: new Date().toISOString(),
          })}\n\n`,
        ),
      )

      // Send heartbeat and metrics every 2 seconds
      const interval = setInterval(async () => {
        try {
          // Fetch latest metrics
          const { getRequestMetrics } = await import("@/lib/monitoring")
          const metrics = await getRequestMetrics()

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "metrics_update",
                data: metrics,
                timestamp: new Date().toISOString(),
              })}\n\n`,
            ),
          )
        } catch (error) {
          console.error("Error fetching metrics for SSE:", error)
        }
      }, 2000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(customReadable, { headers })
}
