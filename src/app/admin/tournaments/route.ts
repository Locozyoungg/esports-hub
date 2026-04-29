import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await req.json()
  const tournament = await prisma.tournament.create({
    data: {
      title: data.title,
      game: data.game,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(new Date(data.startDate).getTime() + 2 * 60 * 60 * 1000), // +2h
      prizePool: data.prizePool,
      ticketPrice: data.ticketPrice,
    },
  })
  return NextResponse.json(tournament)
}
