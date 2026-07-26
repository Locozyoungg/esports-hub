import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ hasTicket: false })

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'eventId query param required' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        userId: session.user.id,
        eventId,
      },
    })
    return NextResponse.json({ hasTicket: !!ticket, ticketId: ticket?.id || null })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}