import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tournamentId } = await req.json()
  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } })
  if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(tournament.ticketPrice * 100),
    currency: 'usd',
    metadata: { tournamentId, userId: session.user.id }
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
