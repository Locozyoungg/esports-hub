import './styles/globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Esports Hub',
  description: 'Tournaments, community, and tickets for competitive gamers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
