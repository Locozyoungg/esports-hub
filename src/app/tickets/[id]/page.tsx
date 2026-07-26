'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface TicketData {
  id: string
  purchaseDate: string
  stripePaymentIntentId: string | null
  event: {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    ticketPrice: number
    imageUrl: string | null
    organization: { name: string; slug: string }
  } | null
  organization: { name: string; slug: string }
  user: { name: string | null; email: string }
}

export default function TicketPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    fetch(`/api/tickets/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load ticket')
        return res.json()
      })
      .then(data => {
        setTicket(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, session])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Ticket Not Found</h1>
        <p className="text-gray-400 mb-6">{error || 'This ticket does not exist or you don\'t have access.'}</p>
        <Link href="/tournaments" className="text-purple-400 hover:underline">
          &larr; Browse Tournaments
        </Link>
      </div>
    )
  }

  const isMpesa = ticket.stripePaymentIntentId?.startsWith('mpesa-')
  const isPaid = !!ticket.stripePaymentIntentId

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      {/* Back link — hidden when printing */}
      <div className="print:hidden mb-6">
        <Link href="/tournaments" className="text-purple-400 hover:underline text-sm">
          &larr; Back to Tournaments
        </Link>
      </div>

      {/* ── Printable ticket card ──────────────────────────────────── */}
      <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="bg-purple-600 text-white p-6 sm:p-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-200 text-xs sm:text-sm uppercase tracking-wider font-semibold">
                {ticket.organization?.name || 'Kylin Esports Hub'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">
                {ticket.event?.title || 'Event Ticket'}
              </h1>
            </div>
            <div className="text-right text-purple-200 text-xs sm:text-sm">
              <p className="uppercase tracking-wide font-semibold">Ticket</p>
              <p className="font-mono text-white text-xs mt-1">
                #{ticket.id.slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Event info */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Event</p>
              <p className="font-semibold text-sm sm:text-base">{ticket.event?.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Date</p>
              <p className="font-semibold text-sm sm:text-base">
                {ticket.event?.startDate ? new Date(ticket.event.startDate).toLocaleDateString('en-KE', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) : 'TBA'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Ticket Holder</p>
              <p className="font-semibold text-sm sm:text-base">
                {ticket.user?.name || ticket.user?.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Payment</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isMpesa ? 'M-Pesa' : isPaid ? 'Card (Stripe)' : 'Pending'}
              </span>
            </div>
          </div>

          <hr className="border-dashed border-gray-200" />

          {/* Ticket details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Price</p>
              <p className="font-bold text-purple-600 text-lg">
                KES {ticket.event?.ticketPrice || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order #</p>
              <p className="font-mono font-semibold text-sm">{ticket.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Purchased</p>
              <p className="font-semibold text-sm">
                {new Date(ticket.purchaseDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</p>
              <p className="font-bold text-green-600 text-sm">CONFIRMED</p>
            </div>
          </div>

          {/* QR placeholder — in production use a real QR library */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="inline-block border-4 border-gray-800 p-3 rounded-lg">
              <div className="w-32 h-32 sm:w-40 sm:h-40 grid grid-cols-7 grid-rows-7 gap-0.5">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div
                    key={i}
                    className={Math.random() > 0.45 ? 'bg-gray-900' : 'bg-transparent'}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-mono">
              Ticket ID: {ticket.id}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Present this ticket at the event entrance for scanning.
            </p>
          </div>

          {/* Event description */}
          {ticket.event?.description && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">About this event</p>
              {ticket.event.description}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 sm:px-8 py-4 flex justify-between items-center text-xs text-gray-500">
          <span>{ticket.organization?.name || 'Kylin Esports Hub'}</span>
          <span>Generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* ── Action buttons ───────────────────────────────────────── */}
      <div className="print:hidden mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-6 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download / Print Ticket
        </button>
        <Link
          href={`/tournaments/${ticket.event?.id || ''}`}
          className="flex-1 border border-white/20 hover:bg-white/10 text-white rounded-lg py-3 px-6 font-medium transition-colors text-center"
        >
          Back to Event
        </Link>
      </div>
    </div>
  )
}
