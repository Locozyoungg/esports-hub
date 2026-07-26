import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/lib/auth-provider'
import { CartProvider } from '@/lib/cart-context'
import { AnalyticsTracker } from '@/components/layout/AnalyticsTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kylin Esports Hub',
  description: 'Tournaments, community, shop, and tickets for competitive gamers',
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
          <CartProvider>
            <AnalyticsTracker />
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
