'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '../ui/Button'

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent whitespace-nowrap"
          onClick={closeMenu}
        >
          KYLIN ESPORTS HUB
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/tournaments" className="hover:text-purple-400 transition-colors">Tournaments</Link>
          <Link href="/community" className="hover:text-purple-400 transition-colors">Community</Link>
          {session ? (
            <>
              <Link href={`/profile/${session.user.id}`} className="hover:text-purple-400">
                {session.user.name || session.user.email}
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}
        </nav>

        {/* Hamburger toggle */}
        <button
          className="md:hidden p-2 -mr-2 text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            // X icon
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-down nav */}
      {menuOpen && (
        <nav className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/tournaments"
              onClick={closeMenu}
              className="block py-3 px-3 rounded-lg hover:bg-white/10 text-base font-medium transition-colors"
            >
              🎮 Tournaments
            </Link>
            <Link
              href="/community"
              onClick={closeMenu}
              className="block py-3 px-3 rounded-lg hover:bg-white/10 text-base font-medium transition-colors"
            >
              💬 Community
            </Link>
            <hr className="border-white/10" />
            {session ? (
              <>
                <Link
                  href={`/profile/${session.user.id}`}
                  onClick={closeMenu}
                  className="block py-3 px-3 rounded-lg hover:bg-white/10 text-base transition-colors"
                >
                  👤 {session.user.name || session.user.email}
                </Link>
                <button
                  onClick={() => { signOut(); closeMenu() }}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-white/10 text-base text-red-400 transition-colors"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                onClick={closeMenu}
                className="block py-3 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-center text-base font-semibold transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
