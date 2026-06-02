import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/organizations/[slug] — Fetch org details including M-Pesa settings
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug: params.slug },
      include: {
        events: {
          where: { status: 'PUBLISHED' },
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(org)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT /api/organizations/[slug] — Update org settings (admin only)
export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Only allow updating specific fields
    const allowedFields: Record<string, string | undefined> = {
      name: body.name,
      logo: body.logo,
      primaryColor: body.primaryColor,
      mpesaPaybill: body.mpesaPaybill,
      mpesaAccountPrefix: body.mpesaAccountPrefix,
    }

    // Clean up undefined values
    const data: Record<string, string> = {}
    for (const [key, value] of Object.entries(allowedFields)) {
      if (value !== undefined) data[key] = value
    }

    const org = await prisma.organization.update({
      where: { slug: params.slug },
      data,
    })

    return NextResponse.json(org)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}