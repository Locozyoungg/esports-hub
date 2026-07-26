import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
    }

    const { items, shippingAddress, shippingCity, shippingPhone, customerName } = await req.json()

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totalAmount = items.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: 'PAID',
        stripePaymentId: `manual-${Date.now()}`,
        shippingAddress: shippingAddress || '',
        shippingCity: shippingCity || '',
        shippingPhone: shippingPhone || '',
        customerName: customerName || session.user.name || '',
        customerEmail: session.user.email || '',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    })

    // Record sale metric
    await prisma.saleMetric.create({
      data: {
        type: 'merchandise',
        amount: totalAmount,
        description: `Order #${order.id.slice(-8)}`,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}
