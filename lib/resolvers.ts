import prisma from "@/lib/db"
import { getRequestMetrics, getRequestTimeline, getRecentRequests, getErrorLog } from "@/lib/monitoring"

export const resolvers = {
  Query: {
    async me(_: any, __: any, { user }: any) {
      if (!user) return null

      return prisma.user.findUnique({
        where: { id: user.userId },
        select: { 
          id: true, 
          username: true, 
          email: true, 
          role: true, 
          isActive: true, 
          createdAt: true, 
          updatedAt: true 
        },
      })
    },

    async monitoringMetrics() {
      return await getRequestMetrics()
    },

    async requestTimeline() {
      return await getRequestTimeline()
    },

    async recentRequests(_: any, { limit }: { limit: number }) {
      const requests = getRecentRequests(limit)
      return requests.map((r: any) => ({
        ...r,
        timestamp: r.timestamp.toISOString(),
        performanceLevel: r.duration > 500 ? 'slow' : r.duration > 100 ? 'medium' : 'fast',
        isError: r.status >= 400 || !!r.error,
      }))
    },

    async errorLog(_: any, { limit }: { limit: number }) {
      const errors = await getErrorLog(limit)
      return errors.map((e: any) => ({
        method: 'POST',
        duration: 0,
        status: e.status,
        query: e.query,
        error: e.error,
        timestamp: e.timestamp.toISOString(),
        performanceLevel: 'error',
        isError: true,
      }))
    },
  },

  Mutation: {
    async ping() {
      return true
    },
  },
}
