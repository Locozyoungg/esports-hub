'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, removeItem, updateQuantity, totalAmount, clearCart, itemCount } = useCart()
  const router = useRouter()

  const [shipping, setShipping] = useState({
    customerName: '',
    shippingPhone: '',
    shippingCity: '',
    shippingAddress: '',
  })
  const [placing, setPlacing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [error, setError] = useState('')

  const handlePlaceOrder = async () => {
    if (!session) {
      setError('Please sign in to place an order.')
      return
    }
    setPlacing(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            price: i.price,
            quantity: i.quantity,
          })),
          ...shipping,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to place order')
      }
      setOrderPlaced(true)
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setPlacing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Placed!</h1>
        <p className="text-gray-400 mb-6">Your order has been confirmed. We&apos;ll contact you for delivery.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Continue Shopping
          </Link>
          <Link href="/profile" className="border border-white/20 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
            View Orders
          </Link>
        </div>
      </div>
    )
  }

  if (itemCount === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-2">Cart is Empty</h1>
        <p className="text-gray-400 mb-6">Add some items from the shop first!</p>
        <Link href="/shop" className="bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block">
          Browse Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Cart ({itemCount} items)</h2>
          {items.map(item => (
            <div key={item.productId} className="bg-white/5 rounded-xl p-4 flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{item.name}</p>
                <p className="text-green-400 text-sm">KES {item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="ml-2 text-red-400 hover:text-red-300 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Shipping form */}
          <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-3 mt-6">
            <h3 className="text-lg font-semibold">Shipping Details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                placeholder="Full Name"
                value={shipping.customerName}
                onChange={e => setShipping({ ...shipping, customerName: e.target.value })}
                className="bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              />
              <input
                placeholder="Phone Number"
                value={shipping.shippingPhone}
                onChange={e => setShipping({ ...shipping, shippingPhone: e.target.value })}
                className="bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              />
              <input
                placeholder="City"
                value={shipping.shippingCity}
                onChange={e => setShipping({ ...shipping, shippingCity: e.target.value })}
                className="bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              />
              <input
                placeholder="Address"
                value={shipping.shippingAddress}
                onChange={e => setShipping({ ...shipping, shippingAddress: e.target.value })}
                className="bg-black/50 border border-white/20 rounded px-4 py-3 text-base"
              />
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-6 h-fit space-y-4 sticky top-24">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="space-y-2 text-sm">
            {items.map(item => (
              <div key={item.productId} className="flex justify-between text-gray-300">
                <span>{item.name} × {item.quantity}</span>
                <span>KES {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <hr className="border-white/10" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-green-400">KES {totalAmount.toLocaleString()}</span>
          </div>

          {!session && (
            <p className="text-yellow-400 text-xs">
              ⚠️ Please <Link href="/auth/signin" className="underline">sign in</Link> to place your order.
            </p>
          )}

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={placing || !session}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-lg font-semibold transition-colors"
          >
            {placing ? 'Placing Order...' : `Place Order — KES ${totalAmount.toLocaleString()}`}
          </button>

          <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-purple-400">
            &larr; Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
