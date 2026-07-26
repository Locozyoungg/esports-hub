'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.ok) {
      router.push('/')
    } else {
      setError('Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/5 rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              required
            />
          </div>
          <Button type="submit" className="w-full py-3 text-base" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
          Demo: admin@example.com / admin123
        </p>
      </div>
    </div>
  )
}
