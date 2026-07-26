'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetch('/api/tickets?userId=' + session.user.id)
      .then(res => res.json())
      .then(data => setTickets(data))
      .finally(() => setLoading(false))
  }, [session])

  if (!session) {
    redirect('/auth/signin')
    return null
  }

  const isOwnProfile = session.user.id === params.id

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="card p-6 sm:p-8 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
          {session.user.name || session.user.email}
        </h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">{session.user.email}</p>
        {session.user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="inline-block mt-3 text-sm text-purple-400 hover:underline"
          >
            Admin Panel &rarr;
          </Link>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4">My Tickets</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="card p-6 sm:p-8 text-center">
          <p className="text-gray-400 text-lg mb-4">No tickets yet</p>
          <Link href="/tournaments" className="inline-block bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {tickets.map((ticket: any) => (
            <div key={ticket.id} className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{ticket.event?.title || 'Event'}</h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  {new Date(ticket.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded self-start sm:self-auto whitespace-nowrap">
                {ticket.stripePaymentIntentId ? 'Paid' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
