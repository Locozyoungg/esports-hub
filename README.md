# Esports Hub 🎮

**Tournaments, community, and digital ticketing for competitive gamers.**

Esports Hub is a full-stack event platform where organizations can publish ticketed experiences, players can browse tournaments, buy tickets via Stripe or M-Pesa, and discuss matches in real-time chat.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Database | PostgreSQL via [Prisma](https://www.prisma.io/) ORM |
| Auth | [NextAuth.js](https://next-auth.js.org/) v4 (Credentials) |
| Card Payments | [Stripe](https://stripe.com/) Payment Intents + Webhooks |
| Mobile Payments | [M-Pesa](https://www.safaricom.co.ke/personal/m-pesa) PayBill (manual confirmation flow) |
| Real-time | [Socket.IO](https://socket.io/) (live chat) |
| 3D Visualization | [Three.js](https://threejs.org/) via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) |
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
```

### Domain model

- **Organization** — White-label event hosts. Has a unique `slug` for branded paths, customizable `primaryColor`, and configurable `mpesaPaybill` / `mpesaAccountPrefix` for mobile money payments.
- **Event** — A ticketed experience (tournament, concert, meetup) owned by an Organization. Tracks capacity (`totalTickets` / `soldTickets`), price, and status (`DRAFT`, `PUBLISHED`, `SOLD_OUT`, `CANCELLED`).
- **Tournament** — A competitive event with game, prize pool, bracket structure. Optionally linked to an Event for ticket sales.
- **Ticket** — A purchased entry to an Event, tied to a User and Organization. Created upon successful Stripe payment intent or pending M-Pesa payment.
- **User** — Standard or admin role. Can belong to multiple Organizations. Guest checkout creates users with a random hashed password.

---

## Features

### Completed

- **User auth** — Sign-in with email/password via NextAuth.js (Credentials provider). JWT session with `id` and `role`.
- **Role-based admin** — Admin panel at `/admin` for creating tournaments (auto-linked to an Event and a default Organization) and managing M-Pesa settings.
- **Card payments (Stripe)** — Stripe PaymentIntent creation with sold-out, cancelled-event, and capacity checks. Webhook handler creates tickets idempotently.
- **Mobile payments (M-Pesa)** — Users can pay via M-Pesa PayBill on tournament pages. Pending orders appear in the admin panel for manual confirmation.
- **Guest checkout** — Public API (`/api/public/tickets`) enables card purchasing without an existing account.
- **Webhook handling** — Stripe webhook at `/api/webhooks/stripe` creates tickets and increments `soldTickets`. Idempotent via `stripePaymentIntentId` dedup.
- **Ticket verification** — `/api/tickets/check?eventId=` returns whether the current user holds a ticket.
- **Profile page** — `/profile/[id]` shows user info and ticket list.
- **Community** — Posts and comments at `/community` with create and detail views.
- **Live chat** — Socket.IO-based real-time chat on tournament detail pages (room-per-tournament).
- **3D bracket** — Three.js visualization of match brackets on tournament pages.
- **Responsive UI** — Dark theme with gradient accents, loading skeletons, error states, and empty states throughout.
- **Seed data** — `npx prisma db seed` creates admin + sample user, organization with default M-Pesa PayBill, event, tournament, and a welcome post.

### Planned / In progress

- Stripe Elements integration for card collection on the checkout page (currently simulates payment).
- Match/round bracket data model and real bracket rendering.
- Organization management dashboard.
- Email confirmations after ticket purchase.
- Tournament registration flow (players sign up for brackets).

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe account (test mode)

### 1. Clone and install

```bash
git clone <repo-url> esports-hub
cd esports-hub
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/esports_hub"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

Generate a `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

M-Pesa uses the Organization table's `mpesaPaybill` field (configured via the admin panel). No additional environment variables needed.

### 3. Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to PostgreSQL (creates tables)
npx prisma db push

# Seed with sample data
npx prisma db seed
```

### 4. Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### 5. Start

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
│   ├── admin/                   # Admin panel
│   │   ├── page.tsx             # Tournament form + M-Pesa settings + pending orders
│   │   └── tournaments/
│   │       └── route.ts         # POST /admin/tournaments
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts         # NextAuth handler
│   │   ├── organizations/
│   │   │   └── [slug]/route.ts  # GET/PUT org (M-Pesa settings)
│   │   ├── posts/route.ts       # Community posts CRUD
│   │   ├── tickets/
│   │   │   ├── route.ts         # GET user tickets
│   │   │   ├── check/route.ts   # GET ticket ownership check
│   │   │   ├── pending/route.ts # GET pending M-Pesa orders (admin)
│   │   │   ├── create-mpesa-payment/route.ts  # POST M-Pesa order
│   │   │   └── create-payment-intent/route.ts # POST Stripe payment
│   │   ├── tournaments/[id]/
│   │   │   └── route.ts         # GET tournament detail (includes org M-Pesa)
│   │   ├── public/tickets/
│   │   │   └── route.ts         # POST guest checkout
│   │   ├── socket/io.ts         # Socket.IO server
│   │   └── webhooks/stripe/
│   │       └── route.ts         # Stripe event handler
│   ├── auth/signin/page.tsx
│   ├── checkout/page.tsx        # Payment confirmation screen
│   ├── community/
│   │   ├── page.tsx             # Post listing
│   │   └── post/[id]/page.tsx   # Post detail + comments
│   ├── organizations/
│   │   └── [slug]/events/
│   │       └── route.ts         # POST event under org
│   ├── profile/[id]/page.tsx    # User profile + ticket list
│   ├── tournaments/
│   │   ├── page.tsx             # Tournament listing
│   │   └── [id]/page.tsx        # Tournament detail + chat + bracket + M-Pesa overlay
│   ├── layout.tsx
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Tailwind directives
├── components/
│   ├── community/
│   │   ├── CreatePost.tsx
│   │   └── PostCard.tsx
│   ├── layout/
│   │   ├── Header.tsx           # Nav, auth-aware
│   │   └── Footer.tsx
│   ├── tournament/
│   │   ├── Bracket3D.tsx        # Three.js bracket visualization
│   │   └── LiveChat.tsx         # Socket.IO chat component
│   └── ui/
│       ├── Button.tsx           # Variant-based button (cva)
│       └── Card.tsx             # Styled card wrapper
├── lib/
│   ├── auth.ts                  # NextAuth server config (authOptions)
│   ├── auth-provider.tsx        # Client-side SessionProvider
│   ├── prisma.ts                # Singleton Prisma client
│   └── utils.ts                 # cn() helper
└── types/
    ├── index.ts                 # Domain interfaces (including Organization, MpesaPayment)
    └── next-auth.d.ts           # Session type augmentation
```

---

## API Reference

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/callback/credentials` | No | Sign in (NextAuth built-in) |
| GET  | `/api/auth/session` | No | Get current session |

### Tickets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tickets?userId=` | Yes | List user tickets (self or admin) |
| GET | `/api/tickets/check?eventId=` | Optional | Check ticket ownership |
| POST | `/api/tickets/create-payment-intent` | Yes | Create Stripe PaymentIntent |
| POST | `/api/tickets/create-mpesa-payment` | Yes | Create pending M-Pesa order (returns paybill + account ref) |
| GET | `/api/tickets/pending` | Admin | List all tickets awaiting M-Pesa confirmation |
| POST | `/api/public/tickets` | No | Guest checkout (creates user if needed) |

### Tournaments & Events

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tournaments` | No | List all tournaments |
| GET | `/api/tournaments/[id]` | No | Tournament detail (includes linked event + org M-Pesa settings) |
| POST | `/admin/tournaments` | Admin | Create tournament + linked event + org |
| POST | `/api/organizations/[slug]/events` | Org member | Create event under organization |

### Organizations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/organizations` | Yes | Create organization |
| GET | `/api/organizations/[slug]` | No | Fetch org details (M-Pesa settings, events) |
| PUT | `/api/organizations/[slug]` | Admin | Update org settings (name, M-Pesa paybill, account prefix) |

### Community

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/posts` | No | List posts with authors and comments |
| POST | `/api/posts` | Yes | Create post |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Stripe event handling (idempotent ticket creation) |

### Real-time

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `/api/socket` | Socket.IO (WebSocket) | Live chat per tournament room |

---

## M-Pesa Payment Flow

M-Pesa payments use a **manual confirmation** flow:

1. **Admin configures** the PayBill number and account prefix in the admin panel (`/admin`) under "M-Pesa PayBill Settings".
2. **On the tournament detail page**, users see a "Pay M-Pesa" button when the organization has a PayBill configured.
3. **User clicks "Pay M-Pesa"** → the system creates a pending ticket record and displays an overlay with:
   - PayBill number
   - Account reference (generated from the prefix + event/user IDs)
   - Amount in KES (display rate: 150 KES/USD for reference)
   - Step-by-step M-Pesa instructions
4. **User sends payment** via M-Pesa on their phone using the displayed details.
5. **User clicks "I've Sent"** — the overlay dismisses and marks the ticket as owned locally (pending status remains in the database).
6. **Admin verifies** the payment cleared and confirms the order via the "Pending M-Pesa Orders" table at `/admin`.
7. **Pending tickets** are those with `stripePaymentIntentId: null` — they appear automatically in the admin pending list.

> Note: The M-Pesa feature handles the **PayBill (business number)** flow. For Till Number or Buy Goods flows, customize the overlay instructions in `src/app/tournaments/[id]/page.tsx`.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret |
| `NEXTAUTH_URL` | Yes | Application base URL |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For checkout | Stripe publishable key (pk_test_...) |

M-Pesa uses database-stored configuration (Organization table) and does not require additional environment variables.

---

## Scripts

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run linter
```

Postinstall automatically runs `prisma generate`.

---

## Deployment

The app is a standard Next.js application. Deploy to any Node.js host:

```bash
npm run build
npm run start
```

Required environment variables must be set on the hosting platform. The Stripe webhook endpoint URL must be registered in your Stripe dashboard.

---

## License

MIT