'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import LiveChat from '@/components/tournament/LiveChat'
import Bracket3D from '@/components/tournament/Bracket3D'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'



interface TournamentData {
  id: string
  title: string
  game: string
  description: string
  startDate: string
  prizePool: number
  ticketPrice: number
  status: string
  event: { id: string; organization?: { slug: string; mpesaPaybill?: string; mpesaAccountPrefix?: string } } | null
  matches?: Array<{ teamA: string; teamB: string }>
}

export default function TournamentDetail() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [tournament, setTournament] = useState<TournamentData | null>(null)
  const [hasTicket, setHasTicket] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [showMpesaOptions, setShowMpesaOptions] = useState(false)
  const [mpesaData, setMpesaData] = useState<{
    paybill: string
    accountRef: string
    amount: number
    eventTitle: string
    ticketId: string
  } | null>(null)
  const [mpesaCreating, setMpesaCreating] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/tournaments/${id}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to load tournament')
        }
        const data = await res.json()
        if (cancelled) return
        setTournament(data)

        if (session?.user && data.event) {
          const ticketRes = await fetch(`/api/tickets/check?eventId=${data.event.id}`)
          if (ticketRes.ok) {
            const ticketData = await ticketRes.json()
            if (!cancelled) setHasTicket(ticketData.hasTicket)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, session])

  const handleBuyTicket = async () => {
    if (!tournament?.event) return
    setBuying(true)
    try {
      const res = await fetch('/api/tickets/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: tournament.event.id }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Payment failed')
      }
      const { clientSecret } = await res.json()
      window.location.href = `/checkout?clientSecret=${clientSecret}&eventId=${tournament.event.id}`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment')
    } finally {
      setBuying(false)
    }
  }

  const handleMpesaPayment = async () => {
    if (!tournament?.event) return
    setMpesaCreating(true)
    setError('')
    try {
      const res = await fetch('/api/tickets/create-mpesa-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: tournament.event.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'M-Pesa payment failed')
      setMpesaData(data.mpesa)
      setShowMpesaOptions(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create M-Pesa order')
    } finally {
      setMpesaCreating(false)
    }
  }

  const handleDismissMpesa = () => {
    setShowMpesaOptions(false)
    setMpesaData(null)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-white/10 rounded w-1/3" />
          <div className="h-6 bg-white/10 rounded w-2/3" />
          <div className="h-64 sm:h-96 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-400">{error}</p>
        <Link href="/tournaments" className="text-purple-400 hover:underline mt-4 inline-block">
          &larr; Back to tournaments
        </Link>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Tournament not found</h2>
        <Link href="/tournaments" className="text-purple-400 hover:underline">
          &larr; Back to tournaments
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{tournament.title}</h1>
          <p className="text-gray-400 mt-1">🎮 {tournament.game}</p>
        </div>
        {tournament.event && !hasTicket ? (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button onClick={handleBuyTicket} disabled={buying} className="w-full sm:w-auto">
              {buying ? 'Processing...' : `Pay Card $${tournament.ticketPrice}`}
            </Button>
            {(tournament.event as any)?.organization?.mpesaPaybill ? (
              <Button
                variant="outline"
                onClick={handleMpesaPayment}
                disabled={mpesaCreating}
                className="w-full sm:w-auto"
              >
                {mpesaCreating ? 'Creating...' : 'Pay M-Pesa'}
              </Button>
            ) : null}
          </div>
        ) : hasTicket ? (
          <span className="bg-green-600 px-4 py-2 rounded-full text-sm sm:text-base">✅ Ticket Owned</span>
        ) : null}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left: Bracket & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">Match Bracket</h2>
            <Bracket3D matches={tournament.matches || []} />
          </div>
          <div className="bg-white/5 rounded-xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <p className="text-gray-300 text-sm sm:text-base">{tournament.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Prize Pool</span>
                <p className="text-base sm:text-lg font-semibold">${tournament.prizePool}</p>
              </div>
              <div>
                <span className="text-gray-400">Starts</span>
                <p className="text-base sm:text-lg font-semibold">
                  {new Date(tournament.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Status</span>
                <p className="text-base sm:text-lg font-semibold capitalize">{tournament.status.toLowerCase()}</p>
              </div>
              <div>
                <span className="text-gray-400">Ticket Price</span>
                <p className="text-base sm:text-lg font-semibold">${tournament.ticketPrice}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Chat */}
        <div className="bg-white/5 rounded-xl p-4 h-[400px] sm:h-[600px] flex flex-col">
          <h2 className="text-xl font-semibold mb-3">Live Discussion</h2>
          <LiveChat tournamentId={id as string} userId={session?.user?.id} />
        </div>
      </div>

      {/* ── M-Pesa payment overlay ──────────────────────────────── */}
      {showMpesaOptions && mpesaData && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">📱</div>
              <h2 className="text-xl sm:text-2xl font-bold">Pay with M-Pesa</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Send the exact amount via M-Pesa PayBill
              </p>
            </div>

            <div className="bg-black/50 rounded-xl p-3 sm:p-4 space-y-3 text-sm sm:text-base">
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400 shrink-0">Event</span>
                <span className="font-semibold text-right">{mpesaData.eventTitle}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400 shrink-0">Amount</span>
                <span className="font-semibold text-lg sm:text-xl text-green-400">
                  KES {(mpesaData.amount * 150).toLocaleString()}
                </span>
              </div>
              <hr className="border-white/10" />
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400 shrink-0">PayBill</span>
                <span className="font-mono font-bold text-base sm:text-lg text-purple-400">
                  {mpesaData.paybill}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-400 shrink-0">Account</span>
                <span className="font-mono font-bold text-sm sm:text-lg text-purple-400 break-all text-right">
                  {mpesaData.accountRef}
                </span>
              </div>
            </div>

            <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-yellow-200">
              <p className="font-semibold mb-1">Instructions</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                <li>Open M-Pesa on your phone</li>
                <li>Select <strong>Lipa na M-Pesa</strong></li>
                <li>Select <strong>PayBill</strong></li>
                <li>Enter PayBill: <strong>{mpesaData.paybill}</strong></li>
                <li>Enter Account: <strong>{mpesaData.accountRef}</strong></li>
                <li>Enter Amount: <strong>KES {(mpesaData.amount * 150).toLocaleString()}</strong></li>
                <li>Confirm and send</li>
              </ol>
              <p className="mt-2 text-xs text-yellow-400">
                Your ticket will be confirmed once payment is verified by an admin.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDismissMpesa}
                className="flex-1 border border-white/20 rounded-lg py-3 hover:bg-white/10 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDismissMpesa()
                  setHasTicket(true)
                }}
                className="flex-1 bg-purple-600 rounded-lg py-3 hover:bg-purple-700 transition-colors text-sm sm:text-base"
              >
                I&apos;ve Sent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
