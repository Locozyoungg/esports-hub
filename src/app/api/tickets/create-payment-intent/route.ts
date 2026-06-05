import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 💡 Added the required configuration object as the second argument
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-01' as any,
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventId } = await req.json()

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 })
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.ticketPrice * 100),
      currency: 'usd',
      metadata: {
        eventId,
        userId: session.user.id,
        organizationId: event.organizationId,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
