#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run() {
  const users = await prisma.user.findMany({ where: { username: null } })
  console.log('Found', users.length, 'users with null username')
  for (const u of users) {
    const email = u.email || 'user'+u.id
    const username = email.split('@')[0]
    await prisma.user.update({ where: { id: u.id }, data: { username } })
    console.log('Updated user', u.id, '->', username)
  }
}

run()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
