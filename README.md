# Kylin Esports Hub 🎮

**Tournaments, community, merchandise, and digital ticketing for competitive gamers.**

Kylin Esports Hub is a full-stack esports platform where players can browse tournaments, buy tickets via Stripe or M-Pesa, shop for gaming gear and branded merchandise, and discuss matches in real-time chat.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Database | PostgreSQL via [Prisma](https://www.prisma.io/) ORM |
| Auth | [NextAuth.js](https://next-auth.js.org/) v4 (Credentials + JWT) |
| Card Payments | [Stripe](https://stripe.com/) Payment Intents + Webhooks |
| Mobile Payments | [M-Pesa](https://www.safaricom.co.ke/personal/m-pesa) PayBill — auto-confirmed |
| Real-time | [Socket.IO](https://socket.io/) (live tournament chat) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| UI Primitives | [class-variance-authority](https://cva-docs.vercel.app/) + [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) |

---

## Architecture

```
Organization   ─── owns ───→   Event      ─── sold via ───→   Ticket
                                   ↑
                              linked to
                                   ↓
Tournament   ─── has ───→   TournamentRegistration

Product      ─── ordered via ───→   OrderItem   ─── belongs to ───→   Order

PageView / SaleMetric   ─── analytics
```

### Domain model

- **Organization** — White-label event host. Has a unique `slug`, customizable `primaryColor`, and M-Pesa `mpesaPaybill` / `mpesaAccountPrefix`.
- **Event** — A ticketed experience owned by an Organization. Tracks capacity, price (KES), and status.
- **Tournament** — A competitive event with game, prize pool, bracket, optionally linked to an Event for ticket sales.
- **Ticket** — A purchased entry to an Event. Auto-confirmed for M-Pesa; created on Stripe webhook for card payments.
- **Product** — Merchandise item with name, description, price (KES), category, stock, and image.
- **Order / OrderItem** — Purchased merchandise with shipping details and payment status.
- **PageView / SaleMetric** — Analytics tracking for visits and revenue.
- **User** — Standard or admin role. Can belong to multiple Organizations.

---

## Features

### 🎮 Tournaments & Events
- Browse upcoming tournaments with game, prize pool, and ticket price
- Tournament detail with match bracket, live chat, and ticket purchase
- Admin panel to create tournaments (auto-linked to Event + Organization)

### 💰 Payments
- **Card (Stripe)** — PaymentIntent flow with webhook confirmation, capacity checks, sold-out guard
- **M-Pesa PayBill** — Auto-confirmed instant tickets. PayBill 542542, account reference generated per transaction
- **Currency** — All prices in KES (Kenyan Shillings)

### 🛒 Merchandise Shop
- Product catalog at `/shop` with category filters (Gaming Gear, Apparel, Accessories, Other)
- Add-to-cart with quantity controls via `CartProvider` context
- Checkout at `/shop/checkout` with shipping form and order placement
- 16 seeded products: hoodies, T-shirts, jerseys, mouse, keyboard, headset, chair, stickers, gift cards

### 🎫 Tickets
- Auto-confirmed M-Pesa tickets — no admin verification needed
- Downloadable/printable ticket page at `/tickets/[id]` with QR placeholder
- Profile page shows ticket history with status badges

### 👥 Community
- Post listing and detail pages at `/community`
- Create posts and comments
- Real-time Socket.IO chat on tournament detail pages

### 📊 Admin Dashboard
- **Dashboard tab** — KPI cards (page views, tickets, users, sales revenue), sales breakdown (tickets vs merchandise), recent activity feed
- **Tournaments tab** — Create new tournaments with KES pricing
- **Tickets tab** — Full ticket list with user, event, price, payment method, and date
- **M-Pesa tab** — PayBill settings + pending payments table

### 📈 Analytics
- Automatic pageview tracking on every route via `AnalyticsTracker`
- Sale metrics recorded for tickets and merchandise orders
- Admin dashboard aggregates: 30-day views, revenue by type, recent sales feed

### 📱 Mobile-Friendly
- Hamburger menu with slide-down navigation
- 44px+ touch targets on all interactive elements
- Responsive headings, full-width buttons on mobile, scrollable data tables
- Adaptive grids and stacked layouts throughout

### 🎨 Branded Design
- Logo in header with gradient text styling
- Dark theme with violet/purple/fuchsia brand accents
- Consistent color system via Tailwind brand tokens

---

## Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL) or local PostgreSQL 14+

### 1. Clone and install

```bash
git clone <repo-url> kylin-esports-hub
cd kylin-esports-hub
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/esports_hub?schema=public"
NEXTAUTH_SECRET="your-random-base64-secret"

# Optional — set for Cloudflare Tunnel / custom domain
# NEXTAUTH_URL="https://your-domain.com"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

Generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

> **Note:** `NEXTAUTH_URL` is optional. When unset, NextAuth auto-detects from request headers — works with both `localhost` and Cloudflare Tunnel.

### 3. Database

```bash
# Start PostgreSQL via Docker
docker run -d --name esports-hub-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=esports_hub \
  -p 5432:5432 postgres:16-alpine

# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL
npx prisma db push

# Seed sample data (users, org, event, tournament, post)
npx prisma db seed

# Seed merchandise products
npx ts-node prisma/seed-products.ts
```

### 4. Start

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Default accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `admin123` |
| User | `player@example.com` | `user123` |

---

## Project structure

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard + tournaments + tickets + M-Pesa tabs
│   │   └── tournaments/route.ts        # POST create tournament
│   ├── api/
│   │   ├── admin/
│   │   │   ├── metrics/route.ts        # GET admin KPIs
│   │   │   └── all-tickets/route.ts    # GET all tickets (admin)
│   │   ├── analytics/
│   │   │   ├── pageview/route.ts       # POST track page visit
│   │   │   └── sale/route.ts           # POST record sale metric
│   │   ├── auth/[...nextauth]/route.ts # NextAuth handler
│   │   ├── orders/route.ts             # GET/POST orders
│   │   ├── organizations/
│   │   │   └── [slug]/route.ts         # GET/PUT org settings
│   │   ├── posts/route.ts              # Community posts CRUD
│   │   ├── products/route.ts           # GET/POST products
│   │   ├── tickets/
│   │   │   ├── [id]/route.ts           # GET single ticket detail
│   │   │   ├── route.ts                # GET user tickets
│   │   │   ├── check/route.ts          # GET ticket ownership check
│   │   │   ├── pending/route.ts        # GET pending M-Pesa (admin)
│   │   │   ├── create-mpesa-payment/route.ts  # POST auto-confirmed M-Pesa ticket
│   │   │   └── create-payment-intent/route.ts # POST Stripe payment
│   │   ├── tournaments/[id]/route.ts   # GET tournament detail
│   │   ├── public/tickets/route.ts     # POST guest checkout
│   │   ├── socket/io.ts                # Socket.IO server
│   │   └── webhooks/stripe/route.ts    # Stripe event handler
│   ├── auth/signin/page.tsx
│   ├── checkout/page.tsx               # Card payment confirmation
│   ├── community/
│   │   ├── page.tsx                    # Post listing
│   │   └── post/[id]/page.tsx          # Post detail + comments
│   ├── profile/[id]/page.tsx           # User profile + ticket list
│   ├── shop/
│   │   ├── page.tsx                    # Product catalog with category filters
│   │   └── checkout/page.tsx           # Cart review + shipping + place order
│   ├── tickets/[id]/page.tsx           # Printable/downloadable ticket
│   ├── tournaments/
│   │   ├── page.tsx                    # Tournament listing
│   │   └── [id]/page.tsx               # Detail + bracket + chat + M-Pesa overlay
│   ├── layout.tsx                      # Root layout (auth + cart + analytics providers)
│   ├── page.tsx                        # Landing page
│   └── globals.css                     # Tailwind + brand utilities
├── components/
│   ├── community/
│   │   ├── CreatePost.tsx
│   │   └── PostCard.tsx
│   ├── layout/
│   │   ├── Header.tsx                  # Logo + nav + hamburger menu
│   │   ├── Footer.tsx
│   │   └── AnalyticsTracker.tsx        # Per-route pageview tracking
│   ├── tournament/
│   │   ├── Bracket3D.tsx               # Match bracket display
│   │   └── LiveChat.tsx                # Socket.IO chat component
│   └── ui/
│       ├── Button.tsx                  # Variant-based button (cva)
│       └── Card.tsx                    # Styled card wrapper
├── lib/
│   ├── auth.ts                         # NextAuth server config
│   ├── auth-provider.tsx               # Client SessionProvider wrapper
│   ├── cart-context.tsx                # Cart state (add/remove/quantity/total)
│   ├── prisma.ts                       # Singleton Prisma client
│   └── utils.ts                        # cn() helper
└── types/
    ├── index.ts                        # Domain interfaces
    └── next-auth.d.ts                  # Session type augmentation

prisma/
├── schema.prisma                       # Full schema (9 models + enums)
├── seed.ts                             # Users + org + event + tournament + post
└── seed-products.ts                    # 16 merchandise products
```

---

## API Reference

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/callback/credentials` | No | Sign in |
| GET  | `/api/auth/session` | No | Get current session |

### Tickets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tickets?userId=` | Yes | List user tickets |
| GET | `/api/tickets/[id]` | Yes | Single ticket detail (owner or admin) |
| GET | `/api/tickets/check?eventId=` | Optional | Check ticket ownership (returns ticketId) |
| POST | `/api/tickets/create-payment-intent` | Yes | Create Stripe PaymentIntent |
| POST | `/api/tickets/create-mpesa-payment` | Yes | Create auto-confirmed M-Pesa ticket |
| POST | `/api/public/tickets` | No | Guest checkout |

### Tournaments & Events

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tournaments/[id]` | No | Tournament detail (includes org M-Pesa settings) |
| POST | `/admin/tournaments` | Admin | Create tournament + linked event + org |

### Shop & Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products?category=` | No | List products (optional category filter) |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/orders` | Yes | List user orders |
| POST | `/api/orders` | Yes | Place order from cart |

### Organizations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/organizations/[slug]` | No | Fetch org details |
| PUT | `/api/organizations/[slug]` | Admin | Update org settings (name, M-Pesa) |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/metrics` | Admin | Dashboard KPIs (views, tickets, sales, users) |
| GET | `/api/admin/all-tickets` | Admin | All tickets with user/event/payment info |
| GET | `/api/tickets/pending` | Admin | Pending M-Pesa tickets |

### Community

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | No | List posts with authors and comments |
| POST | `/api/posts` | Yes | Create post |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analytics/pageview` | Record page visit (path + referrer) |
| POST | `/api/analytics/sale` | Record sale metric (type, amount, description) |

### Webhooks & Real-time

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `/api/webhooks/stripe` | HTTP POST | Stripe event handling (idempotent ticket creation) |
| `/api/socket` | Socket.IO (WebSocket) | Live chat per tournament room |

---

## M-Pesa Payment Flow

M-Pesa payments use an **auto-confirmed** flow:

1. **Admin configures** the PayBill number and account prefix in `/admin` → M-Pesa tab.
2. **On the tournament detail page**, users see a "Pay M-Pesa" button when the organization has a PayBill configured.
3. **User clicks "Pay M-Pesa"** → system creates a ticket and displays an overlay with:
   - PayBill number: **542542**
   - Account reference (e.g., `672912EVENT1-XY12` — prefix + event/user ID suffix)
   - Amount in KES
   - Step-by-step M-Pesa instructions
4. **User sends payment** via M-Pesa on their phone using the displayed details.
5. **User clicks "I've Sent"** → overlay closes, ticket is **auto-confirmed**, and a "View / Download Ticket" link appears.
6. The ticket is immediately available under the user's profile and at `/tickets/[id]`.

> The account reference format is `{prefix}{last-6-of-eventId}-{last-4-of-userId}`. This ensures each transaction has a unique reference the admin can use to reconcile payments.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret |
| `NEXTAUTH_URL` | No | Base URL — unset for auto-detect (works with Cloudflare Tunnel) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For checkout | Stripe publishable key (pk_test_...) |

M-Pesa configuration is stored in the database (Organization table) — no environment variables needed.

---

## Scripts

```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Production build
npm run start            # Start production server
npx prisma db push       # Sync schema to database
npx prisma db seed       # Seed users + org + event + tournament + post
npx ts-node prisma/seed-products.ts  # Seed 16 merchandise products
```

Postinstall automatically runs `prisma generate`.

---

## Cloudflare Tunnel

For remote access, the app is configured to work behind Cloudflare Tunnel:

- **`NEXTAUTH_URL`** is unset → NextAuth auto-detects from request headers
- **`allowedDevOrigins`** in `next.config.mjs` allows the tunnel domain for HMR
- The `AnalyticsTracker` works regardless of access origin

To set up:
```bash
cloudflared tunnel --url http://localhost:3000
```

Then set `NEXTAUTH_URL` in `.env.local` to your tunnel URL if needed.

---

## License

MIT
