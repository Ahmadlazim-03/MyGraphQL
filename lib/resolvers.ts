import prisma from "@/lib/db"
import connectDB from "@/lib/mongodb"
import { ActivityLog } from "@/models/activityLog"
import { Analytics } from "@/models/analytics"
import bcrypt from "bcrypt"
import { generateToken } from "@/lib/auth"

export const resolvers = {
  Query: {
    async me(_: any, __: any, { user }: any) {
      if (!user) return null
      return prisma.user.findUnique({
        where: { id: user.userId },
      })
    },

    async mahasiswa(_: any, { id }: { id: number }) {
      return prisma.mahasiswa.findUnique({
        where: { id },
      })
    },

    async alumni(_: any, { id }: { id: number }) {
      const alumniData = await prisma.alumni.findUnique({
        where: { id },
        include: { pekerjaans: true },
      })
      return alumniData
    },

    async searchMahasiswa(_: any, { query, limit }: { query: string; limit: number }) {
      return prisma.mahasiswa.findMany({
        where: {
          OR: [
            { nama: { contains: query, mode: "insensitive" } },
            { nim: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
      })
    },

    async getMonitoringHistory(_: any, { limit }: { limit: number }) {
      await connectDB()
      const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(limit)
      return logs.map((log: any) => log.toObject())
    },

    async analyticsDaily(_: any, { rangeDays }: { rangeDays: number }) {
      await connectDB()
      const startDate = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)

      const analytics = await Analytics.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])

      return analytics
    },
  },

  Mutation: {
    async login(_: any, { email, password }: { email: string; password: string }) {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new Error("User not found")
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        throw new Error("Invalid password")
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      // Log activity
      await connectDB()
      await ActivityLog.create({
        userId: user.id,
        type: "user_login",
        meta: { email },
      })

      return {
        token,
        user,
      }
    },

    async logout() {
      return true
    },

    async runCheck(_: any, { provider, url }: { provider: string; url: string }, { user }: any) {
      if (!user) throw new Error("Unauthorized")

      const startTime = Date.now()
      const result: any = {
        ok: false,
        connectTimeMs: 0,
        sampleQueryMs: 0,
      }

      try {
        // Simulate check
        result.connectTimeMs = Math.random() * 100
        result.sampleQueryMs = Math.random() * 50
        result.ok = true
        result.details = { provider, url }

        // Log to MongoDB
        await connectDB()
        await ActivityLog.create({
          userId: user.userId,
          type: "check_run",
          meta: { provider, url, status: "success" },
        })

        await Analytics.create({
          event: "check_run",
          userId: user.userId,
          provider,
          url,
          status: "success",
          duration: result.sampleQueryMs,
        })
      } catch (error: any) {
        result.details = { error: error.message }

        await connectDB()
        await ActivityLog.create({
          userId: user.userId,
          type: "check_run",
          meta: { provider, url, status: "failed", error: error.message },
        })
      }

      return result
    },

    async saveConfig(_: any, { provider, url }: { provider: string; url: string }, { user }: any) {
      if (!user) throw new Error("Unauthorized")

      await connectDB()
      await ActivityLog.create({
        userId: user.userId,
        type: "config_saved",
        meta: { provider, url },
      })

      return true
    },

    async createAlumni(_: any, { input }: { input: any }) {
      return prisma.alumni.create({
        data: {
          ...input,
        },
        include: { pekerjaans: true },
      })
    },

    async updateAlumni(_: any, { id, input }: { id: number; input: any }) {
      return prisma.alumni.update({
        where: { id },
        data: input,
        include: { pekerjaans: true },
      })
    },

    async deleteAlumni(_: any, { id }: { id: number }) {
      await prisma.alumni.delete({
        where: { id },
      })
      return true
    },
  },
}
