import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create a sample tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: 'sample-tournament' },
    update: {},
    create: {
      id: 'sample-tournament',
      title: 'Valorant Weekly #1',
      game: 'Valorant',
      description: 'First weekly tournament. Top 3 win cash prizes!',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      prizePool: 500,
      ticketPrice: 10,
      imageUrl: '/valorant-tourney.jpg',
      status: 'UPCOMING',
    },
  })

  console.log({ admin, tournament })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
