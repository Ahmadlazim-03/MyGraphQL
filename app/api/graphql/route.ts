import { createYoga } from "graphql-yoga"
import { typeDefs } from "@/lib/graphql-schema"
import { resolvers } from "@/lib/resolvers"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { logGraphQLRequest } from "@/lib/monitoring"
import { extractDeviceInfo } from "@/lib/device-info"

const schema = makeExecutableSchema({ typeDefs, resolvers })

const yoga = createYoga({
  schema,
  context: async (ctx) => {
    let user = null

    try {
      const cookieStore = await cookies()
      let token = cookieStore.get("auth_token")?.value

      // Fallback: when running via fetch with an explicit Cookie header, the
      // Next `cookies()` helper may not expose the cookie in some runtimes.
      // Try to read the cookie from the GraphQL request headers provided by
      // GraphQL Yoga's context (ctx.request) if we didn't find it above.
      if (!token && ctx?.request?.headers?.get) {
        const cookieHeader = ctx.request.headers.get("cookie")
        if (cookieHeader) {
          const match = cookieHeader
            .split(";")
            .map((c) => c.trim())
            .find((c) => c.startsWith("auth_token="))
          if (match) {
            token = decodeURIComponent(match.split("=")[1] || "")
          }
        }

        // Also support Authorization: Bearer <token> header as a fallback for
        // programmatic clients that prefer sending the token in the header.
        if (!token) {
          const authHeader = ctx.request.headers.get("authorization")
          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1]
          }
        }
      }

      if (token) {
        try {
          user = await verifyToken(token)
        } catch (error) {
          // Invalid token, continue without user
        }
      }
    } catch (error) {
      // Continue without user context
    }

    return { user }
  },
})

export async function GET(request: Request) {
  const startTime = Date.now()
  try {
    const response = await yoga.fetch(request)
    const duration = Date.now() - startTime
    await logGraphQLRequest({
      method: "GET",
      duration,
      status: response.status,
      timestamp: new Date(),
    })
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    await logGraphQLRequest({
      method: "GET",
      duration,
      status: 500,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    })
    throw error
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  let body: any = null

  try {
    const clonedRequest = request.clone()
    const requestBody = await clonedRequest.json()
    body = requestBody
  } catch (e) {
    // Unable to parse body
  }

  try {
    const response = await yoga.fetch(request)
    const duration = Date.now() - startTime
    
    // Extract device and location info
    const deviceInfo = await extractDeviceInfo(request)
    
    // Skip logging for ALL monitoring-related queries
    const isMonitoringQuery = body?.query && (
      body.query.includes('monitoringMetrics') ||
      body.query.includes('requestTimeline') ||
      body.query.includes('recentRequests') ||
      body.query.includes('errorLog') ||
      (body.query.includes('me {') && !body.query.includes('mahasiswa') && !body.query.includes('alumni'))
    )
    
    // Only log queries to PostgreSQL data (mahasiswa, alumni, etc.)
    if (!isMonitoringQuery) {
      await logGraphQLRequest({
        method: "POST",
        duration,
        status: response.status,
        query: body?.query,
        operationName: body?.operationName,
        timestamp: new Date(),
        ...deviceInfo
      })
    }
    
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    
    const deviceInfo = await extractDeviceInfo(request)
    
    // Always log errors
    await logGraphQLRequest({
      method: "POST",
      duration,
      status: 500,
      query: body?.query,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
      ...deviceInfo
    })
    throw error
  }
}

export async function OPTIONS(request: Request) {
  return yoga.fetch(request)
}
