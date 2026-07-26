import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalPageViews,
      recentPageViews,
      totalTickets,
      totalMpesaTickets,
      totalCardTickets,
      totalSalesKES,
      merchandiseSales,
      merchandiseOrders,
      ticketSalesKES,
      totalUsers,
      recentSales,
    ] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({ where: { timestamp: { gte: thirtyDaysAgo } } }),
      prisma.ticket.count(),
      prisma.ticket.count({
        where: { stripePaymentIntentId: { startsWith: 'mpesa-' } },
      }),
      prisma.ticket.count({
        where: {
          stripePaymentIntentId: {
            not: null,
            startsWith: 'pi_',
          },
        },
      }),
      prisma.saleMetric.aggregate({ _sum: { amount: true } }),
      prisma.saleMetric.aggregate({
        _sum: { amount: true },
        where: { type: 'merchandise' },
      }),
      prisma.order.count(),
      prisma.saleMetric.aggregate({
        _sum: { amount: true },
        where: { type: { in: ['ticket', 'mpesa', 'card'] } },
      }),
      prisma.user.count(),
      prisma.saleMetric.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ])

    return NextResponse.json({
      pageViews: { total: totalPageViews, last30Days: recentPageViews },
      tickets: {
        total: totalTickets,
        mpesa: totalMpesaTickets,
        card: totalCardTickets,
      },
      sales: {
        totalKES: totalSalesKES._sum.amount || 0,
        ticketsKES: ticketSalesKES._sum.amount || 0,
        merchandiseKES: merchandiseSales._sum.amount || 0,
        merchandiseOrders,
      },
      users: { total: totalUsers },
      recentSales: recentSales.map(s => ({
        id: s.id,
        type: s.type,
        amount: s.amount,
        description: s.description,
        timestamp: s.timestamp,
      })),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
