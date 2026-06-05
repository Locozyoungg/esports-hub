import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // 💡 Await the params object before extracting the slug
  const { slug } = await context.params

  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const org = await prisma.organization.findUnique({
    where: { slug: slug },
    include: { users: { where: { userId: session.user.id } } }
  })
  if (!org || org.users.length === 0) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const data = await req.json()
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      ticketPrice: data.ticketPrice,
      totalTickets: data.totalTickets,
      imageUrl: data.imageUrl,
      organizationId: org.id,
      status: 'DRAFT'
    }
  })
  return NextResponse.json(event)
}
