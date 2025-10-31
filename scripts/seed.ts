import prisma from "@/lib/db"
import connectDB from "@/lib/mongodb"
import { ActivityLog } from "@/models/activityLog"
import { Analytics } from "@/models/analytics"
import bcrypt from "bcrypt"

async function main() {
  console.log("Starting seed...")

  // Connect to MongoDB
  await connectDB()

  // Clear existing data
  console.log("Clearing existing data...")
  await prisma.pekerjaanAlumni.deleteMany({})
  await prisma.alumni.deleteMany({})
  await prisma.mahasiswa.deleteMany({})
  await prisma.user.deleteMany({})

  // Seed admin user
  console.log("Creating admin user...")
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

  // Seed sample mahasiswa
  console.log("Creating sample mahasiswa...")
  const mahasiswaData = [
    {
      nim: "10101001",
      nama: "Ahmad Rizki",
      jurusan: "Teknik Informatika",
      angkatan: 2021,
      email: "ahmad.rizki@student.edu",
      userId: adminUser.id,
    },
    {
      nim: "10101002",
      nama: "Siti Nurhaliza",
      jurusan: "Sistem Informasi",
      angkatan: 2021,
      email: "siti.nurhaliza@student.edu",
      userId: adminUser.id,
    },
    {
      nim: "10102001",
      nama: "Budi Santoso",
      jurusan: "Teknik Elektro",
      angkatan: 2022,
      email: "budi.santoso@student.edu",
      userId: adminUser.id,
    },
  ]

  for (const data of mahasiswaData) {
    await prisma.mahasiswa.create({ data })
  }

  // Seed sample alumni with pekerjaan
  console.log("Creating sample alumni...")
  const alumni1 = await prisma.alumni.create({
    data: {
      nim: "10099001",
      nama: "Eka Putri Wijaya",
      jurusan: "Teknik Informatika",
      angkatan: 2019,
      tahunLulus: 2023,
      email: "eka.putri@alumni.edu",
      userId: adminUser.id,
      pekerjaans: {
        create: [
          {
            namaPerusahaan: "PT Teknologi Indonesia",
            posisiJabatan: "Senior Developer",
            bidangIndustri: "Software Development",
            lokasiKerja: "Jakarta",
            tanggalMulaiKerja: "2023-07-01",
            statusPekerjaan: "aktif",
          },
        ],
      },
    },
  })

  // Seed activity logs
  console.log("Creating activity logs...")
  for (let i = 0; i < 5; i++) {
    await ActivityLog.create({
      userId: adminUser.id,
      type: "user_login",
      meta: { email: "admin@example.com" },
    })
  }

  // Seed analytics data (last 7 days)
  console.log("Creating analytics data...")
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    for (let j = 0; j < Math.floor(Math.random() * 10) + 5; j++) {
      await Analytics.create({
        event: "check_run",
        userId: adminUser.id,
        provider: ["database", "api", "service"][Math.floor(Math.random() * 3)],
        url: "localhost:5432",
        status: "success",
        duration: Math.random() * 100,
        createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
      })
    }
  }

  console.log("Seed completed successfully!")
  console.log(`\nDemo User Created:`)
  console.log(`Email: admin@example.com`)
  console.log(`Password: admin123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
