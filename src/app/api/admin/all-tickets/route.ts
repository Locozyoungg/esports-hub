import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, ticketPrice: true, startDate: true } },
        organization: { select: { name: true } },
      },
      orderBy: { purchaseDate: 'desc' },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 })
  }
}
