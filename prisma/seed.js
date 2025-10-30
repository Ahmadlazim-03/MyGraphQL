const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const users = [
    { name: 'Budi', email: 'budi@example.com' },
    { name: 'Siti', email: 'siti@example.com' }
  ]

  const result = await prisma.user.createMany({ data: users, skipDuplicates: true })
  console.log('Seed completed:', result)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
