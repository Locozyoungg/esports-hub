'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
        >
          Compete. Connect. Conquer.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto px-2"
        >
          Weekly esports tournaments, real‑time community chat, and exclusive digital tickets.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
        >
          <Link href="/tournaments" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">View Tournaments</Button>
          </Link>
          <Link href="/community" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">Join Community</Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard
            icon="🎮"
            title="Weekly Tournaments"
            desc="Compete in Valorant, League, CS2 and more. Cash prizes every week."
          />
          <FeatureCard
            icon="💬"
            title="Live Match Threads"
            desc="Real‑time chat, emoji reactions, and voice channels during matches."
          />
          <FeatureCard
            icon="🎫"
            title="NFT‑Style Tickets"
            desc="Digital collectible tickets with loyalty rewards and resale royalties."
          />
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  )
}
