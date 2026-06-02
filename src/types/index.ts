export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor?: string
  mpesaPaybill?: string
  mpesaAccountPrefix?: string
  createdAt: Date
}

export interface MpesaPayment {
  eventId: string
  organizationId: string
  buyerEmail: string
  buyerName?: string
  amount: number
  accountRef: string
}

export interface User {
  id: string
  email: string
  name?: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
}

export interface Tournament {
  id: string
  title: string
  game: string
  description: string
  startDate: Date
  endDate: Date
  prizePool: number
  ticketPrice: number
  imageUrl?: string
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED'
}

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  author: User
  createdAt: Date
  comments: Comment[]
}

export interface Comment {
  id: string
  content: string
  authorId: string
  author: User
  postId: string
  createdAt: Date
}
