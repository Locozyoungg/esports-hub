import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// 💡 Pass the required configuration object as the second argument
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-01' as any,
})

export async function POST(req: Request) {
  try {
    const { eventId, buyerEmail, buyerName } = await req.json()

    if (!eventId || !buyerEmail) {
      return NextResponse.json(
        { error: 'eventId and buyerEmail are required' },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.totalTickets && event.soldTickets >= event.totalTickets) {
      return NextResponse.json({ error: 'Sold out' }, { status: 400 })
    }

    if (event.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Event is cancelled' }, { status: 400 })
    }

    // Create or find user by email (guest checkout)
    let user = await prisma.user.findUnique({ where: { email: buyerEmail } })
    if (!user) {
      // Generate a random secure password for guest accounts
      const tempPassword = await bcrypt.hash(
        Math.random().toString(36).slice(2) + Date.now().toString(36),
        10
      )
      user = await prisma.user.create({
        data: {
          email: buyerEmail,
          name: buyerName || buyerEmail.split('@')[0],
          password: tempPassword,
          role: 'USER',
        },
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(event.ticketPrice * 100),
      currency: 'usd',
      metadata: {
        eventId,
        userId: user.id,
        organizationId: event.organizationId,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      userId: user.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
