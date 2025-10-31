import { createYoga } from "graphql-yoga"
import { typeDefs } from "@/lib/graphql-schema"
import { resolvers } from "@/lib/resolvers"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { logGraphQLRequest } from "@/lib/monitoring"

const yoga = createYoga({
  schema: {
    typeDefs,
    resolvers,
  },
  context: async (ctx) => {
    let user = null

    try {
      const cookieStore = await cookies()
      const token = cookieStore.get("auth_token")?.value

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
    await logGraphQLRequest({
      method: "POST",
      duration,
      status: response.status,
      query: body?.query,
      operationName: body?.operationName,
      timestamp: new Date(),
    })
    return response
  } catch (error) {
    const duration = Date.now() - startTime
    await logGraphQLRequest({
      method: "POST",
      duration,
      status: 500,
      query: body?.query,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date(),
    })
    throw error
  }
}

export async function OPTIONS(request: Request) {
  return yoga.fetch(request)
}
