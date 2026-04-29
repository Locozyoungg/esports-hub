'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '../ui/Button'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          ESPORTS HUB
        </Link>
        <nav className="flex gap-6 items-center">
          <Link href="/tournaments" className="hover:text-purple-400">Tournaments</Link>
          <Link href="/community" className="hover:text-purple-400">Community</Link>
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
      </div>
    </header>
  )
}
