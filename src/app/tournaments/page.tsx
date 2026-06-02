import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default async function TournamentsPage() {
  const tournaments = await prisma.tournament.findMany({
    orderBy: { startDate: 'asc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Upcoming Tournaments</h1>

      {tournaments.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-2xl mb-2">🎮</p>
          <p className="text-gray-400 text-lg mb-2">No tournaments yet</p>
          <p className="text-gray-500 text-sm">
            Check back soon for upcoming competitions.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
              <img
                src={tournament.imageUrl || '/default-tourney.jpg'}
                alt={tournament.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-5">
                <h2 className="text-2xl font-bold mb-2">{tournament.title}</h2>
                <p className="text-gray-400 mb-2">{tournament.game}</p>
                <p className="text-sm mb-1">
                  📅 {new Date(tournament.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm mb-3">
                  🏆 Prize: ${tournament.prizePool}
                </p>
                <p className="text-sm mb-4">
                  🎟️ Ticket: ${tournament.ticketPrice}
                </p>
                <Link href={`/tournaments/${tournament.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}