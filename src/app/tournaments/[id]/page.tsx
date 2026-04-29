'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import LiveChat from '@/components/tournament/LiveChat'
import Bracket3D from '@/components/tournament/Bracket3D'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function TournamentDetail() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [tournament, setTournament] = useState<any>(null)
  const [hasTicket, setHasTicket] = useState(false)

  useEffect(() => {
    fetch(`/api/tournaments/${id}`)
      .then(res => res.json())
      .then(setTournament)
    if (session?.user) {
      // check if user has ticket
      fetch(`/api/tickets/check?tournamentId=${id}`)
        .then(res => res.json())
        .then(data => setHasTicket(data.hasTicket))
    }
  }, [id, session])

  if (!tournament) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{tournament.title}</h1>
        {!hasTicket ? (
          <Link href={`/tournaments/${id}/ticket`}>
            <Button>Buy Ticket ${tournament.ticketPrice}</Button>
          </Link>
        ) : (
          <span className="bg-green-600 px-4 py-2 rounded-full">✅ Ticket Owned</span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Bracket & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-2xl font-semibold mb-3">Match Bracket</h2>
            <Bracket3D matches={tournament.matches || []} />
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <p>{tournament.description}</p>
            <p className="mt-2">🎮 Game: {tournament.game}</p>
            <p>💰 Prize Pool: ${tournament.prizePool}</p>
            <p>📅 Starts: {new Date(tournament.startDate).toLocaleString()}</p>
          </div>
        </div>

        {/* Right: Live Chat */}
        <div className="bg-white/5 rounded-xl p-4 h-[600px] flex flex-col">
          <h2 className="text-xl font-semibold mb-3">Live Discussion</h2>
          <LiveChat tournamentId={id as string} userId={session?.user?.id} />
        </div>
      </div>
    </div>
  )
}
