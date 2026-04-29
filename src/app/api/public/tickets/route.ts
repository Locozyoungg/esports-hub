import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { eventId, buyerEmail, buyerName } = await req.json()
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organization: true }
  })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // Optional: check capacity
  if (event.totalTickets && event.soldTickets >= event.totalTickets) {
    return NextResponse.json({ error: 'Sold out' }, { status: 400 })
  }

  // Create or find user by email (guest checkout)
  let user = await prisma.user.findUnique({ where: { email: buyerEmail } })
  if (!user) {
    user = await prisma.user.create({
      data: { email: buyerEmail, name: buyerName, password: '' } // no password for guest
    })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(event.ticketPrice * 100),
    currency: 'usd',
    metadata: { eventId, userId: user.id, organizationId: event.organizationId }
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
