import type { NextRequest } from "next/server"
import { createYoga } from "graphql-yoga"
import { typeDefs } from "@/lib/graphql-schema"
import { resolvers } from "@/lib/resolvers"
import { verifyToken } from "@/lib/auth"

const yoga = createYoga({
  schema: {
    typeDefs,
    resolvers,
  },
  context: async (ctx) => {
    const token = ctx.request.headers.get("Authorization")?.replace("Bearer ", "")
    let user = null
    if (token) {
      try {
        user = await verifyToken(token)
      } catch (error) {
        // Invalid token, continue without user
      }
    }
    return { user }
  },
})

export async function GET(request: NextRequest) {
  return yoga.fetch(request)
}

export async function POST(request: NextRequest) {
  return yoga.fetch(request)
}

export async function OPTIONS(request: NextRequest) {
  return yoga.fetch(request)
}
