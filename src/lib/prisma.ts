import { PrismaClient } from '@prisma/client'

// Singleton pattern untuk environment serverless (Vercel, Railway serverless)
// Hindari membuka banyak koneksi saat cold-start / hot-reload.
declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined
}

const prisma = global.__prisma__ ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.__prisma__ = prisma

export default prisma

// Catatan: gunakan `import prisma from "src/lib/prisma"` di resolver/context
