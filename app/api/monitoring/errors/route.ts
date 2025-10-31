import { getErrorLog } from "@/lib/monitoring"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const errors = await getErrorLog(limit)

    return Response.json({
      errors,
      count: errors.length,
      timestamp: new Date(),
    })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to get errors" }, { status: 500 })
  }
}
