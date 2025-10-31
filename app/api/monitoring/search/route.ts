import { getRecentRequests } from "@/lib/monitoring"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const requests = getRecentRequests(100)

    const filtered = requests.filter((r: any) => {
      const matchQuery = r.query?.toLowerCase().includes(query.toLowerCase())
      const matchOperation = r.operationName?.toLowerCase().includes(query.toLowerCase())
      const matchError = r.error?.toLowerCase().includes(query.toLowerCase())

      return matchQuery || matchOperation || matchError
    })

    return Response.json({
      results: filtered,
      total: filtered.length,
      query,
    })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Search failed" }, { status: 500 })
  }
}
