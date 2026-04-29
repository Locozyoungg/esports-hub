import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { author: true, comments: { include: { author: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content } = await req.json()
  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
    },
  })
  return NextResponse.json(post)
}
