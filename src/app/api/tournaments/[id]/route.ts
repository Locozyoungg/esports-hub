import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 💡 Await the params object before grabbing the dynamic id
  const { id } = await context.params

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: id },
      include: {
        registrations: { include: { user: true } },
        event: {
          include: {
            organization: {
              select: { slug: true, mpesaPaybill: true, mpesaAccountPrefix: true },
            },
          },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
    }

    return NextResponse.json(tournament)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
