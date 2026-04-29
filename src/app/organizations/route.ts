import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, slug } = await req.json()
  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      users: {
        create: { userId: session.user.id, role: 'ADMIN' }
      }
    }
  })
  return NextResponse.json(org)
}
