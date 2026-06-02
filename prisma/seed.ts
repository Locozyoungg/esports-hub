import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin user ────────────────────────────────────────────────────
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
  console.log('✓ Admin user:', admin.email)

  // ── Sample user ───────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('user123', 10)
  const sampleUser = await prisma.user.upsert({
    where: { email: 'player@example.com' },
    update: {},
    create: {
      email: 'player@example.com',
      name: 'Player One',
      password: userPassword,
      role: 'USER',
    },
  })
  console.log('✓ Sample user:', sampleUser.email)

  // ── Default organization ──────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'esports-hub' },
    update: {},
    create: {
      name: 'Esports Hub',
      slug: 'esports-hub',
      primaryColor: '#8b5cf6',
      mpesaPaybill: '247247',
      mpesaAccountPrefix: 'ESH-',
    },
  })
  console.log('✓ Organization:', org.name)

  // Add admin to the org
  await prisma.organizationUser.upsert({
    where: { userId_organizationId: { userId: admin.id, organizationId: org.id } },
    update: {},
    create: {
      userId: admin.id,
      organizationId: org.id,
      role: 'ADMIN',
    },
  })

  // ── Sample event ──────────────────────────────────────────────────
  const event = await prisma.event.upsert({
    where: { id: 'sample-event' },
    update: {},
    create: {
      id: 'sample-event',
      title: 'Valorant Weekly #1',
      description: 'First weekly tournament. Top 3 win cash prizes!',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      ticketPrice: 10,
      totalTickets: 100,
      soldTickets: 0,
      imageUrl: '/valorant-tourney.jpg',
      status: 'PUBLISHED',
      organizationId: org.id,
    },
  })
  console.log('✓ Sample event:', event.title)

  // ── Sample tournament (linked to event) ──────────────────────────
  const tournament = await prisma.tournament.upsert({
    where: { id: 'sample-tournament' },
    update: {},
    create: {
      id: 'sample-tournament',
      title: 'Valorant Weekly #1',
      game: 'Valorant',
      description: 'First weekly tournament. Top 3 win cash prizes!',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      prizePool: 500,
      ticketPrice: 10,
      imageUrl: '/valorant-tourney.jpg',
      status: 'UPCOMING',
      eventId: event.id,
    },
  })
  console.log('✓ Sample tournament:', tournament.title)

  // ── Sample community post ────────────────────────────────────────
  const post = await prisma.post.upsert({
    where: { id: 'welcome-post' },
    update: {},
    create: {
      id: 'welcome-post',
      title: 'Welcome to the Esports Hub!',
      content:
        'Welcome to the community! Use this space to discuss strategies, find teammates, share highlights, and stay up to date on upcoming tournaments.\n\nFeel free to create your own posts and start conversations. See you in the arena!',
      authorId: admin.id,
    },
  })
  console.log('✓ Sample post:', post.title)

  console.log('\n✅ Database seeded successfully.')
  console.log('   Admin: admin@example.com / admin123')
  console.log('   User:  player@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })