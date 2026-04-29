import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    // Extract all metadata fields
    const { tournamentId, userId, eventId, organizationId } = paymentIntent.metadata

    // Create ticket with tournamentId (original schema)
    await prisma.ticket.create({
      data: {
        userId,
        tournamentId,
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    // Create ticket with eventId + organizationId (extended schema)
    await prisma.ticket.create({
      data: {
        userId,
        eventId,
        organizationId,
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    // Increment soldTickets on the event
    await prisma.event.update({
      where: { id: eventId },
      data: { soldTickets: { increment: 1 } },
    })
  }

  return NextResponse.json({ received: true })
}
