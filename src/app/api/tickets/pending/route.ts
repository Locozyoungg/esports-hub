// GET /api/tickets/pending — admin only: list tickets awaiting M-Pesa confirmation
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

    // Pending M-Pesa tickets: those with no stripePaymentIntentId
    const pending = await prisma.ticket.findMany({
      where: { stripePaymentIntentId: null },
      include: {
        user: { select: { id: true, email: true, name: true } },
        event: { select: { id: true, title: true, ticketPrice: true } },
        organization: { select: { id: true, name: true, mpesaPaybill: true } },
      },
      orderBy: { purchaseDate: 'desc' },
    })

    return NextResponse.json(pending)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}