import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    // Validate required fields
    if (!data.title || !data.game || !data.startDate) {
      return NextResponse.json({ error: 'Missing required fields: title, game, startDate' }, { status: 400 })
    }

    const tournament = await prisma.tournament.create({
      data: {
        title: data.title,
        game: data.game,
        description: data.description || '',
        startDate: new Date(data.startDate),
        endDate: new Date(new Date(data.startDate).getTime() + 2 * 60 * 60 * 1000),
        prizePool: data.prizePool || 0,
        ticketPrice: data.ticketPrice || 0,
        imageUrl: data.imageUrl || null,
        // Create a linked Event for ticket sales
        event: {
          create: {
            title: data.title,
            description: data.description || '',
            startDate: new Date(data.startDate),
            endDate: new Date(new Date(data.startDate).getTime() + 2 * 60 * 60 * 1000),
            ticketPrice: data.ticketPrice || 0,
            status: 'PUBLISHED',
            organization: {
              connectOrCreate: {
                where: { slug: 'esports-hub' },
                create: {
                  name: 'Kylin Esports Hub',
                  slug: 'esports-hub',
                  mpesaPaybill: '542542',
                  mpesaAccountPrefix: '672912',
                },
              },
            },
          },
        },
      },
      include: { event: { include: { organization: { select: { slug: true, mpesaPaybill: true } } } } },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}