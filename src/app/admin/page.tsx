'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function AdminPage() {
  const { data: session } = useSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [newTourney, setNewTourney] = useState({
    title: '',
    game: '',
    description: '',
    startDate: '',
    prizePool: 0,
    ticketPrice: 0,
  })

  const handleCreate = async () => {
    await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTourney),
    })
    alert('Tournament created!')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Admin Panel</h1>
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Create Tournament</h2>
        <input
          placeholder="Title"
          className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
          onChange={(e) => setNewTourney({ ...newTourney, title: e.target.value })}
        />
        <input
          placeholder="Game"
          className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
          onChange={(e) => setNewTourney({ ...newTourney, game: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
          onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })}
        />
        <input
          type="datetime-local"
          className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
          onChange={(e) => setNewTourney({ ...newTourney, startDate: e.target.value })}
        />
        <input
          type="number"
          placeholder="Prize Pool ($)"
          className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
          onChange={(e) => setNewTourney({ ...newTourney, prizePool: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Ticket Price ($)"
          className="w-full bg-black/50 border border-white/20 rounded px-4 py-2"
          onChange={(e) => setNewTourney({ ...newTourney, ticketPrice: parseFloat(e.target.value) })}
        />
        <Button onClick={handleCreate}>Create Tournament</Button>
      </div>
    </div>
  )
}
