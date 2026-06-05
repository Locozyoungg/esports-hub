'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientSecret = searchParams.get('clientSecret')
  const eventId = searchParams.get('eventId')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!clientSecret || !eventId) {
      setStatus('error')
      setError('Missing payment information')
      return
    }

    // Simulate payment confirmation.
    // In production, use Stripe Elements: stripe.confirmCardPayment(clientSecret)
    const timer = setTimeout(() => {
      setStatus('success')
    }, 1500)

    return () => clearTimeout(timer)
  }, [clientSecret, eventId])

  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="card p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-4 animate-pulse">💳</div>
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-gray-400">Please wait while we confirm your payment...</p>
            <div className="mt-6 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-400 mb-6">
              Your ticket has been purchased. Check your profile to view it.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/tournaments/${eventId}`}
                className="bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Back to Event
              </Link>
              <Link
                href="/profile"
                className="border border-white/20 px-6 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                View Tickets
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-400 mb-6">{error || 'Something went wrong. Please try again.'}</p>
            <button
              onClick={() => router.back()}
              className="border border-white/20 px-6 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// 💡 Default export wrapped in a Suspense boundary for Next.js build optimization
export default function CheckoutPage() {
  return (
    <Suspense 
      fallback={
        <div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-400">
          Loading secure checkouts...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
