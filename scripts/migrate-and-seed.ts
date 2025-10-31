import { PrismaClient } from "@prisma/client"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function seedPostgres() {
  console.log("[v0] Starting PostgreSQL migration and seeding...")

  try {
    // Create User (Admin)
    console.log("[v0] Creating admin user...")
    const hashedPassword = await bcrypt.hash("admin123", 10)

    const adminUser = await prisma.user.create({
      data: {
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
      },
    })
    console.log("[v0] Admin user created:", adminUser)

    // Create Mahasiswa
    console.log("[v0] Creating mahasiswa records...")
    const mahasiswa1 = await prisma.mahasiswa.create({
      data: {
        nim: "2021001",
        nama: "Budi Santoso",
        jurusan: "Teknik Informatika",
        angkatan: 2021,
        email: "budi@example.com",
        userId: adminUser.id,
      },
    })
    console.log("[v0] Mahasiswa 1 created:", mahasiswa1)

    const mahasiswa2 = await prisma.mahasiswa.create({
      data: {
        nim: "2021002",
        nama: "Siti Nurhaliza",
        jurusan: "Teknik Elektro",
        angkatan: 2021,
        email: "siti@example.com",
        userId: adminUser.id,
      },
    })
    console.log("[v0] Mahasiswa 2 created:", mahasiswa2)

    // Create Alumni
    console.log("[v0] Creating alumni records...")
    const alumni1 = await prisma.alumni.create({
      data: {
        nim: "2020001",
        nama: "Ahmad Wijaya",
        jurusan: "Teknik Informatika",
        angkatan: 2020,
        tahunLulus: 2024,
        email: "ahmad@example.com",
        userId: adminUser.id,
      },
    })
    console.log("[v0] Alumni 1 created:", alumni1)

    // Create Pekerjaan Alumni
    console.log("[v0] Creating pekerjaan alumni records...")
    const pekerjaan1 = await prisma.pekerjaanAlumni.create({
      data: {
        alumniId: alumni1.id,
        namaPerusahaan: "PT Teknologi Maju",
        posisiJabatan: "Software Engineer",
        bidangIndustri: "Technology",
        lokasiKerja: "Jakarta",
        tanggalMulaiKerja: "2024-01-15",
        statusPekerjaan: "aktif",
      },
    })
    console.log("[v0] Pekerjaan alumni created:", pekerjaan1)

    console.log("[v0] PostgreSQL seeding completed successfully!")
    return { success: true, data: { adminUser, mahasiswa1, mahasiswa2, alumni1, pekerjaan1 } }
  } catch (error) {
    console.error("[v0] PostgreSQL seeding error:", error)
    throw error
  }
}

async function seedMongoDB() {
  console.log("[v0] Starting MongoDB seeding...")

  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/mygraphql")

  try {
    await client.connect()
    const db = client.db("mygraphql")

    // Create collections
    console.log("[v0] Creating MongoDB collections...")
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("activityLogs")) {
      await db.createCollection("activityLogs")
      console.log("[v0] Created activityLogs collection")
    }

    if (!collectionNames.includes("analytics")) {
      await db.createCollection("analytics")
      console.log("[v0] Created analytics collection")
    }

    if (!collectionNames.includes("realtimeUpdates")) {
      await db.createCollection("realtimeUpdates")
      console.log("[v0] Created realtimeUpdates collection")
    }

    // Insert sample data
    console.log("[v0] Inserting activity logs...")
    const activityLogsCollection = db.collection("activityLogs")
    const activityResult = await activityLogsCollection.insertMany([
      {
        userId: 1,
        action: "LOGIN",
        resource: "USER",
        resourceId: 1,
        timestamp: new Date(),
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      },
      {
        userId: 1,
        action: "CREATE",
        resource: "MAHASISWA",
        resourceId: 1,
        timestamp: new Date(),
        ipAddress: "127.0.0.1",
        userAgent: "Mozilla/5.0",
      },
    ])
    console.log("[v0] Activity logs inserted:", activityResult.insertedIds)

    console.log("[v0] Inserting analytics data...")
    const analyticsCollection = db.collection("analytics")
    const analyticsResult = await analyticsCollection.insertMany([
      {
        date: new Date(),
        event: "USER_LOGIN",
        count: 5,
        duration: 1800,
      },
      {
        date: new Date(),
        event: "MAHASISWA_CREATED",
        count: 2,
        duration: 500,
      },
    ])
    console.log("[v0] Analytics data inserted:", analyticsResult.insertedIds)

    console.log("[v0] MongoDB seeding completed successfully!")
    return { success: true }
  } catch (error) {
    console.error("[v0] MongoDB seeding error:", error)
    throw error
  } finally {
    await client.close()
  }
}

async function main() {
  console.log("[v0] Starting database migration and seeding process...")

  try {
    // Run migrations first
    console.log("[v0] Running Prisma migrations...")
    const { execSync } = require("child_process")
    execSync("npx prisma migrate deploy", { stdio: "inherit" })
    console.log("[v0] Migrations completed!")

    // Seed PostgreSQL
    const postgresResult = await seedPostgres()

    // Seed MongoDB
    const mongoResult = await seedMongoDB()

    console.log("[v0] All seeding completed successfully!")
    console.log("[v0] Results:", { postgresResult, mongoResult })
  } catch (error) {
    console.error("[v0] Error during seeding:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
