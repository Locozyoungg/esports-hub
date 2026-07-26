'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'

export default function AdminPage() {
  const { data: session } = useSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  // ── Tournament creation ──────────────────────────────────────────
  const [newTourney, setNewTourney] = useState({
    title: '',
    game: '',
    description: '',
    startDate: '',
    prizePool: 0,
    ticketPrice: 0,
  })

  const handleCreate = async () => {
    await fetch('/admin/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTourney),
    })
    alert('Tournament created!')
  }

  // ── M-Pesa settings ──────────────────────────────────────────────
  const [mpesaPaybill, setMpesaPaybill] = useState('')
  const [mpesaAccountPrefix, setMpesaAccountPrefix] = useState('')
  const [mpesaSaving, setMpesaSaving] = useState(false)
  const [mpesaMessage, setMpesaMessage] = useState('')
  const [orgSlug, setOrgSlug] = useState('esports-hub')

  const loadMpesaSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/organizations/${orgSlug}`)
      if (!res.ok) return
      const org = await res.json()
      setMpesaPaybill(org.mpesaPaybill || '')
      setMpesaAccountPrefix(org.mpesaAccountPrefix || '')
    } catch {
      // org not found yet — noop
    }
  }, [orgSlug])

  useEffect(() => {
    loadMpesaSettings()
  }, [loadMpesaSettings])

  const handleSaveMpesa = async () => {
    setMpesaSaving(true)
    setMpesaMessage('')
    try {
      const res = await fetch(`/api/organizations/${orgSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mpesaPaybill: mpesaPaybill || null,
          mpesaAccountPrefix: mpesaAccountPrefix || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      setMpesaMessage('✅ M-Pesa settings saved')
    } catch (err) {
      setMpesaMessage(`❌ ${err instanceof Error ? err.message : 'Failed to save'}`)
    } finally {
      setMpesaSaving(false)
    }
  }

  // ── Pending M-Pesa tickets ───────────────────────────────────────
  const [pendingTickets, setPendingTickets] = useState<any[]>([])
  const [loadingPending, setLoadingPending] = useState(false)

  const loadPending = useCallback(async () => {
    setLoadingPending(true)
    try {
      const res = await fetch('/api/tickets/pending')
      if (res.ok) {
        const data = await res.json()
        setPendingTickets(data)
      }
    } catch {
      // noop
    } finally {
      setLoadingPending(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
      <h1 className="text-3xl sm:text-4xl font-bold">Admin Panel</h1>

      {/* ── Create Tournament ─────────────────────────────────────── */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Create Tournament</h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <input
            placeholder="Title"
            className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
            onChange={(e) => setNewTourney({ ...newTourney, title: e.target.value })}
          />
          <input
            placeholder="Game (e.g. Valorant)"
            className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
            onChange={(e) => setNewTourney({ ...newTourney, game: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base sm:col-span-2"
            rows={3}
            onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })}
          />
          <input
            type="datetime-local"
            className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
            onChange={(e) => setNewTourney({ ...newTourney, startDate: e.target.value })}
          />
          <div className="flex gap-3 sm:gap-4">
            <input
              type="number"
              placeholder="Prize Pool ($)"
              className="flex-1 bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              onChange={(e) => setNewTourney({ ...newTourney, prizePool: parseFloat(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Ticket Price ($)"
              className="flex-1 bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              onChange={(e) => setNewTourney({ ...newTourney, ticketPrice: parseFloat(e.target.value) })}
            />
          </div>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">Create Tournament</Button>
      </div>

      {/* ── M-Pesa PayBill Settings ───────────────────────────────── */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold">M-Pesa PayBill Settings</h2>
        <p className="text-sm text-gray-400">
          Configure M-Pesa PayBill details so users can pay via mobile money.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Organization Slug</label>
            <input
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              placeholder="esports-hub"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">M-Pesa PayBill Number</label>
            <input
              value={mpesaPaybill}
              onChange={(e) => setMpesaPaybill(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              placeholder="e.g. 247247"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Account Reference Prefix</label>
            <input
              value={mpesaAccountPrefix}
              onChange={(e) => setMpesaAccountPrefix(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              placeholder="e.g. 672912"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button onClick={handleSaveMpesa} disabled={mpesaSaving} className="w-full sm:w-auto">
            {mpesaSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          {mpesaMessage && (
            <span className={`text-sm ${mpesaMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
              {mpesaMessage}
            </span>
          )}
        </div>

        {mpesaPaybill && (
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-semibold text-purple-300 mb-1">Preview — what users will see</p>
            <p className="text-xs sm:text-sm text-gray-300 break-all">
              Pay <strong>PayBill {mpesaPaybill}</strong> with account{' '}
              <strong>{mpesaAccountPrefix || '672912'}XXXXXX-XXXX</strong>
            </p>
          </div>
        )}
      </div>

      {/* ── Pending M-Pesa Orders ─────────────────────────────────── */}
      <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-semibold">Pending M-Pesa Orders</h2>
          <button
            onClick={loadPending}
            className="text-sm text-purple-400 hover:underline"
          >
            {loadingPending ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loadingPending ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : pendingTickets.length === 0 ? (
          <div className="bg-black/30 rounded-lg p-6 text-center">
            <p className="text-gray-500">No pending M-Pesa orders</p>
            <p className="text-xs text-gray-600 mt-1">
              Tickets without a Stripe payment ID appear here until confirmed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Event</th>
                  <th className="text-left py-2 px-2">Amount</th>
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingTickets.map((t: any) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2">{t.user?.email || t.userId}</td>
                    <td className="py-2 px-2">{t.event?.title || t.eventId}</td>
                    <td className="py-2 px-2">${t.event?.ticketPrice || '?'}</td>
                    <td className="py-2 px-2 text-gray-400">
                      {new Date(t.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                        Awaiting Payment
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
