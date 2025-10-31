import { getRecentRequests, getErrorLog } from "@/lib/monitoring"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const requests = getRecentRequests(limit)
    const errors = await getErrorLog(limit)

    if (format === "csv") {
      // Export as CSV
      const csv = [
        "Timestamp,Method,Status,Duration(ms),OperationName,Query",
        ...requests.map((r) =>
          [
            new Date(r.timestamp).toISOString(),
            r.method,
            r.status,
            r.duration,
            r.operationName || "",
            (r.query || "").replace(/"/g, '""'),
          ].join(","),
        ),
      ].join("\n")

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="graphql-requests-${Date.now()}.csv"`,
        },
      })
    }

    // Default JSON export
    return Response.json({
      requests,
      errors,
      exportedAt: new Date(),
      total: requests.length,
    })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Export failed" }, { status: 500 })
  }
}
