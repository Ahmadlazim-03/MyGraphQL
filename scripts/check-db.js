// Simple Node script (CommonJS) to verify Prisma DB connectivity and read users
// Run with: node scripts/check-db.js (ensure DATABASE_URL is set in env or .env)
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 5 })
    console.log('Connected to DB. Sample users:', users)
  } catch (err) {
    console.error('DB check failed:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
