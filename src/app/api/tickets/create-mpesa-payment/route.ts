import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/tickets/create-mpesa-payment
// Creates a pending ticket record for an M-Pesa payment.
// The user must complete the transaction via M-Pesa paybill.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    const { eventId, buyerName } = await req.json()

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
    }

    // Resolve user: authenticated session or require email for guests
    let userId: string
    let buyerEmail: string

    if (session?.user?.id) {
      userId = session.user.id
      buyerEmail = session.user.email || 'user@unknown'
    } else {
      return NextResponse.json(
        { error: 'Sign in required to use M-Pesa. Use guest checkout for card payments.' },
        { status: 401 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Event is cancelled' }, { status: 400 })
    }

    if (event.totalTickets && event.soldTickets >= event.totalTickets) {
      return NextResponse.json({ error: 'Sold out' }, { status: 400 })
    }

    const org = event.organization
    if (!org.mpesaPaybill) {
      return NextResponse.json(
        { error: 'M-Pesa payments not configured for this organization' },
        { status: 400 }
      )
    }

    // Generate account reference: prefix + eventId suffix + userId suffix
    const prefix = org.mpesaAccountPrefix || 'ESH-'
    const shortEventId = eventId.slice(-6).toUpperCase()
    const shortUserId = userId.slice(-4).toUpperCase()
    const accountRef = `${prefix}${shortEventId}-${shortUserId}`

    // Create pending ticket (no stripePaymentIntentId means pending M-Pesa)
    const pendingTicket = await prisma.ticket.create({
      data: {
        userId,
        eventId: event.id,
        organizationId: org.id,
        // stripePaymentIntentId intentionally null — admin confirms manually
      },
    })

    return NextResponse.json({
      success: true,
      ticketId: pendingTicket.id,
      mpesa: {
        paybill: org.mpesaPaybill,
        accountRef,
        amount: Math.round(event.ticketPrice),
        eventTitle: event.title,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}