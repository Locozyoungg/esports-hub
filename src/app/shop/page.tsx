'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  stock: number
}

const CATEGORIES = [
  { value: 'ALL', label: 'All' },
  { value: 'GAMING_GEAR', label: '🎮 Gaming Gear' },
  { value: 'APPAREL', label: '👕 Apparel' },
  { value: 'ACCESSORIES', label: '🎧 Accessories' },
  { value: 'OTHER', label: '📦 Other' },
]

const CATEGORY_LABELS: Record<string, string> = {
  GAMING_GEAR: 'Gaming Gear',
  APPAREL: 'Apparel',
  ACCESSORIES: 'Accessories',
  OTHER: 'Other',
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('ALL')
  const { items, addItem, itemCount } = useCart()

  useEffect(() => {
    setLoading(true)
    const params = category !== 'ALL' ? `?category=${category}` : ''
    fetch(`/api/products${params}`)
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Shop</h1>
          <p className="text-gray-400 mt-1">Gaming gear, apparel & accessories</p>
        </div>
        <Link
          href="/shop/checkout"
          className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          🛒 Cart {itemCount > 0 && `(${itemCount})`}
        </Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.value
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white/5 rounded-xl animate-pulse">
              <div className="h-48 bg-white/10 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-6 bg-white/10 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400 text-lg">No products in this category yet</p>
          <p className="text-gray-500 text-sm mt-2">Check back soon for new items!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all group"
            >
              <div className="h-48 bg-gradient-to-br from-purple-900/40 to-black flex items-center justify-center relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">
                    {product.category === 'GAMING_GEAR' ? '🎮' :
                     product.category === 'APPAREL' ? '👕' :
                     product.category === 'ACCESSORIES' ? '🎧' : '📦'}
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-black/70 text-xs px-2 py-1 rounded-full text-gray-300">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm sm:text-base group-hover:text-purple-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-green-400">
                    KES {product.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      imageUrl: product.imageUrl,
                    })}
                    disabled={product.stock <= 0}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
