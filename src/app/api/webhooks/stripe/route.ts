import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// 💡 Pass the required configuration object as the second argument
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-01' as any,
})

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event: Stripe.Event

  // 💡 LOCAL DEVELOPMENT BYPASS
  if (process.env.NODE_ENV === 'development') {
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json(
        { error: `Mock parsing failed: ${message}` },
        { status: 400 }
      )
    }
  } else {
    // Strict production security check
    if (!sig) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      )
    }
  }

  // Handle successful payments
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const { eventId, userId, organizationId } = paymentIntent.metadata || {}

    if (!eventId || !userId || !organizationId) {
      console.warn('Missing metadata on payment intent', {
        id: paymentIntent.id,
        metadata: paymentIntent.metadata,
      })
      return NextResponse.json({ received: true })
    }

    // Check if the ticket was already created (webhook can fire duplicates)
    const existing = await prisma.ticket.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    })
    if (existing) {
      return NextResponse.json({ received: true, info: 'duplicate' })
    }

    // Provision the tournament/event ticket
    await prisma.ticket.create({
      data: {
        userId,
        eventId,
        organizationId,
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    // Increment slot metrics on your event model
    await prisma.event.update({
      where: { id: eventId },
      data: { soldTickets: { increment: 1 } },
    })
  }

  return NextResponse.json({ received: true })
}
