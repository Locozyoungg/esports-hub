import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ hasTicket: false })

  const { searchParams } = new URL(req.url)
  const tournamentId = searchParams.get('tournamentId')

  const ticket = await prisma.ticket.findFirst({
    where: {
      userId: session.user.id,
      tournamentId: tournamentId!,
    },
  })
  return NextResponse.json({ hasTicket: !!ticket })
}
