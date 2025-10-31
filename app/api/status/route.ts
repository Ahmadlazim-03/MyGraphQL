import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { MongoClient } from "mongodb"

export async function GET() {
  const status: any = {
    timestamp: new Date().toISOString(),
    databases: {
      postgresql: { connected: false, data: null, error: null },
      mongodb: { connected: false, data: null, error: null },
    },
  }

  try {
    // Check PostgreSQL connection
    console.log("[v0] Checking PostgreSQL connection...")
    const userCount = await prisma.user.count()
    const mahasiswaCount = await prisma.mahasiswa.count()
    const alumniCount = await prisma.alumni.count()

    status.databases.postgresql = {
      connected: true,
      data: {
        users: userCount,
        mahasiswa: mahasiswaCount,
        alumni: alumniCount,
        connection: "Railway PostgreSQL",
      },
    }
    console.log("[v0] PostgreSQL connected successfully")
  } catch (error: any) {
    console.error("[v0] PostgreSQL error:", error.message)
    status.databases.postgresql.error = error.message
  }

  try {
    // Check MongoDB connection
    console.log("[v0] Checking MongoDB connection...")
    const mongoUri = process.env.MONGODB_URI
    const client = new MongoClient(mongoUri || "mongodb://localhost:27017")

    await client.connect()
    const db = client.db("mygraphql")

    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    let activityLogCount = 0
    let analyticsCount = 0

    if (collectionNames.includes("activityLogs")) {
      activityLogCount = await db.collection("activityLogs").countDocuments()
    }
    if (collectionNames.includes("analytics")) {
      analyticsCount = await db.collection("analytics").countDocuments()
    }

    status.databases.mongodb = {
      connected: true,
      data: {
        collections: collectionNames,
        activityLogs: activityLogCount,
        analytics: analyticsCount,
        connection: "Turntable MongoDB",
      },
    }

    await client.close()
    console.log("[v0] MongoDB connected successfully")
  } catch (error: any) {
    console.error("[v0] MongoDB error:", error.message)
    status.databases.mongodb.error = error.message
  }

  return NextResponse.json(status, {
    status: status.databases.postgresql.connected && status.databases.mongodb.connected ? 200 : 500,
  })
}
