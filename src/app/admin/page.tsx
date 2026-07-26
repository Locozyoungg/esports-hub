'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'

interface Metrics {
  pageViews: { total: number; last30Days: number }
  tickets: { total: number; mpesa: number; card: number }
  sales: { totalKES: number; ticketsKES: number; merchandiseKES: number; merchandiseOrders: number }
  users: { total: number }
  recentSales: Array<{ id: string; type: string; amount: number; description: string; timestamp: string }>
}

export default function AdminPage() {
  const { data: session } = useSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  // ── Tournament creation ──────────────────────────────────────────
  const [newTourney, setNewTourney] = useState({
    title: '', game: '', description: '', startDate: '', prizePool: 0, ticketPrice: 0,
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
    } catch { /* noop */ }
  }, [orgSlug])

  useEffect(() => { loadMpesaSettings() }, [loadMpesaSettings])

  const handleSaveMpesa = async () => {
    setMpesaSaving(true); setMpesaMessage('')
    try {
      const res = await fetch(`/api/organizations/${orgSlug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mpesaPaybill: mpesaPaybill || null, mpesaAccountPrefix: mpesaAccountPrefix || null }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to save') }
      setMpesaMessage('✅ Saved')
    } catch (err) {
      setMpesaMessage(`❌ ${err instanceof Error ? err.message : 'Failed'}`)
    } finally { setMpesaSaving(false) }
  }

  // ── Metrics ───────────────────────────────────────────────────────
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(true)

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then(r => r.json())
      .then(d => { if (!d.error) setMetrics(d) })
      .finally(() => setLoadingMetrics(false))
  }, [])

  // ── All tickets ───────────────────────────────────────────────────
  const [allTickets, setAllTickets] = useState<any[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  const loadAllTickets = useCallback(async () => {
    setLoadingTickets(true)
    try {
      const res = await fetch('/api/admin/all-tickets')
      const data = await res.json()
      if (!data.error) setAllTickets(data)
    } catch { /* noop */ } finally { setLoadingTickets(false) }
  }, [])

  useEffect(() => { loadAllTickets() }, [loadAllTickets])

  // ── Pending M-Pesa tickets ───────────────────────────────────────
  const [pendingTickets, setPendingTickets] = useState<any[]>([])
  const [loadingPending, setLoadingPending] = useState(false)

  const loadPending = useCallback(async () => {
    setLoadingPending(true)
    try {
      const res = await fetch('/api/tickets/pending')
      if (res.ok) { const data = await res.json(); setPendingTickets(data) }
    } catch { /* noop */ } finally { setLoadingPending(false) }
  }, [])

  useEffect(() => { loadPending() }, [loadPending])

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tournaments' | 'tickets' | 'mpesa'>('dashboard')

  const tabs = [
    { key: 'dashboard' as const, label: '📊 Dashboard' },
    { key: 'tournaments' as const, label: '🏆 Tournaments' },
    { key: 'tickets' as const, label: '🎫 Tickets' },
    { key: 'mpesa' as const, label: '💰 M-Pesa' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <h1 className="text-3xl sm:text-4xl font-bold">Admin Panel</h1>

      {/* Tab navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Dashboard tab ────────────────────────────────────────────── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {loadingMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : metrics ? (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard label="Page Views (30d)" value={metrics.pageViews.last30Days.toLocaleString()} icon="👁️" />
                <MetricCard label="Total Tickets" value={metrics.tickets.total.toString()} icon="🎫" />
                <MetricCard label="Total Users" value={metrics.users.total.toString()} icon="👥" />
                <MetricCard label="Total Sales" value={`KES ${metrics.sales.totalKES.toLocaleString()}`} icon="💰" />
              </div>

              {/* Sales breakdown */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-3">Ticket Sales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Tickets</span><span className="font-semibold">{metrics.tickets.total}</span></div>
                    <div className="flex justify-between"><span>M-Pesa</span><span className="text-purple-400">{metrics.tickets.mpesa}</span></div>
                    <div className="flex justify-between"><span>Card</span><span className="text-blue-400">{metrics.tickets.card}</span></div>
                    <hr className="border-white/10" />
                    <div className="flex justify-between font-semibold"><span>Revenue</span><span className="text-green-400">KES {metrics.sales.ticketsKES.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-3">Merchandise Sales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Orders</span><span className="font-semibold">{metrics.sales.merchandiseOrders}</span></div>
                    <hr className="border-white/10" />
                    <div className="flex justify-between font-semibold"><span>Revenue</span><span className="text-green-400">KES {metrics.sales.merchandiseKES.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 sm:p-6">
                  <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {metrics.recentSales.length === 0 ? (
                      <p className="text-gray-500 text-sm">No sales yet</p>
                    ) : metrics.recentSales.slice(0, 5).map(s => (
                      <div key={s.id} className="flex justify-between text-xs">
                        <span className="text-gray-400 truncate mr-2">
                          {s.type === 'ticket' ? '🎫' : s.type === 'merchandise' ? '🛍️' : '💰'} {s.description || s.type}
                        </span>
                        <span className="text-green-400 whitespace-nowrap">KES {s.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Failed to load metrics.</p>
          )}
        </div>
      )}

      {/* ── Tournaments tab ─────────────────────────────────────────── */}
      {activeTab === 'tournaments' && (
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Create Tournament</h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <input placeholder="Title" className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base" onChange={(e) => setNewTourney({ ...newTourney, title: e.target.value })} />
            <input placeholder="Game (e.g. Valorant)" className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base" onChange={(e) => setNewTourney({ ...newTourney, game: e.target.value })} />
            <textarea placeholder="Description" className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base sm:col-span-2" rows={3} onChange={(e) => setNewTourney({ ...newTourney, description: e.target.value })} />
            <input type="datetime-local" className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base" onChange={(e) => setNewTourney({ ...newTourney, startDate: e.target.value })} />
            <div className="flex gap-3">
              <input type="number" placeholder="Prize Pool (KES)" className="flex-1 bg-black/50 border border-white/20 rounded px-4 py-3 text-base" onChange={(e) => setNewTourney({ ...newTourney, prizePool: parseFloat(e.target.value) })} />
              <input type="number" placeholder="Ticket Price (KES)" className="flex-1 bg-black/50 border border-white/20 rounded px-4 py-3 text-base" onChange={(e) => setNewTourney({ ...newTourney, ticketPrice: parseFloat(e.target.value) })} />
            </div>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">Create Tournament</Button>
        </div>
      )}

      {/* ── Tickets tab ──────────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-semibold">All Tickets</h2>
            <button onClick={loadAllTickets} className="text-sm text-purple-400 hover:underline">{loadingTickets ? '...' : 'Refresh'}</button>
          </div>
          {loadingTickets ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />)}</div>
          ) : allTickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tickets purchased yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-xs sm:text-sm min-w-[600px]">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Event</th>
                    <th className="text-left py-2 px-2">Price</th>
                    <th className="text-left py-2 px-2">Method</th>
                    <th className="text-left py-2 px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allTickets.map((t: any) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-2">{t.user?.name || t.user?.email || t.userId}</td>
                      <td className="py-2 px-2">{t.event?.title || '—'}</td>
                      <td className="py-2 px-2">KES {t.event?.ticketPrice || '?'}</td>
                      <td className="py-2 px-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.stripePaymentIntentId?.startsWith('mpesa-') ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                          {t.stripePaymentIntentId?.startsWith('mpesa-') ? 'M-Pesa' : t.stripePaymentIntentId ? 'Card' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-400">{new Date(t.purchaseDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── M-Pesa tab ───────────────────────────────────────────────── */}
      {activeTab === 'mpesa' && (
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">M-Pesa PayBill Settings</h2>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Org Slug</label>
                <input value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">PayBill Number</label>
                <input value={mpesaPaybill} onChange={(e) => setMpesaPaybill(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-400 mb-1">Account Reference Prefix</label>
                <input value={mpesaAccountPrefix} onChange={(e) => setMpesaAccountPrefix(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button onClick={handleSaveMpesa} disabled={mpesaSaving} className="w-full sm:w-auto">{mpesaSaving ? 'Saving...' : 'Save Settings'}</Button>
              {mpesaMessage && <span className={`text-sm ${mpesaMessage.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{mpesaMessage}</span>}
            </div>
            {mpesaPaybill && (
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-purple-300">Pay <strong>PayBill {mpesaPaybill}</strong> with account <strong>{mpesaAccountPrefix || '672912'}XXXXXX-XXXX</strong></p>
              </div>
            )}
          </div>

          {/* Pending orders */}
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-semibold">Pending M-Pesa</h2>
              <button onClick={loadPending} className="text-sm text-purple-400 hover:underline">{loadingPending ? '...' : 'Refresh'}</button>
            </div>
            {pendingTickets.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No pending M-Pesa orders</p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-xs sm:text-sm min-w-[500px]">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="text-left py-2 px-2">User</th><th className="text-left py-2 px-2">Event</th><th className="text-left py-2 px-2">Amount</th><th className="text-left py-2 px-2">Date</th><th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingTickets.map((t: any) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2">{t.user?.email || t.userId}</td>
                        <td className="py-2 px-2">{t.event?.title || t.eventId}</td>
                        <td className="py-2 px-2">KES {t.event?.ticketPrice || '?'}</td>
                        <td className="py-2 px-2 text-gray-400">{new Date(t.purchaseDate).toLocaleDateString()}</td>
                        <td className="py-2 px-2"><span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded-full">Pending</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 sm:p-5">
      <span className="text-2xl">{icon}</span>
      <p className="text-xs sm:text-sm text-gray-400 mt-2">{label}</p>
      <p className="text-xl sm:text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
