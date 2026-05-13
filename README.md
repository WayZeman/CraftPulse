<div align="center">

# CraftPulse

**Платформа моніторингу українських Minecraft серверів**

Сучасний production-ready full-stack застосунок на Next.js 15, з реальним моніторингом, голосуванням, відгуками та повноцінною адмін-панеллю.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)](https://www.prisma.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Features

- **Реальний моніторинг** Minecraft Java + Bedrock серверів кожні 2 хвилини
- **Чесний рейтинг** з антифрод-системою (24h cooldown, HMAC hash IP)
- **Featured на головній** — слоти, які керуються адмінами (без платних тарифів у застосунку)
- **Discord + Google OAuth** через Auth.js v5
- **Аналітика** — графіки гравців, uptime, версій (recharts)
- **Адмін-панель** — модерація, користувачі, скарги, теги
- **Сучасний UI** — глассморфізм, aurora-фон, Framer Motion, dark mode
- **SEO-first** — динамічний `sitemap.xml`, `robots.txt`, OpenGraph картки, JSON-LD
- **Edge middleware** — захищені маршрути з role-based авторизацією
- **Rate limiting** через Upstash Redis + sliding window
- **Прогресивне завантаження** — Suspense streaming, ISR, Server Components

---

## 🧱 Tech stack

| Шар           | Технології                                          |
| ------------- | --------------------------------------------------- |
| Framework     | Next.js 15 (App Router), React 19, TypeScript 5     |
| UI            | TailwindCSS 3.4, Radix UI, Framer Motion, Lucide    |
| Database      | Neon PostgreSQL + Prisma 6                          |
| Cache / Queue | Upstash Redis (sliding-window rate limit)           |
| Auth          | Auth.js v5 (Discord + Google OAuth)                 |
| Monitoring    | `minecraft-server-util` (Java + Bedrock)            |
| Hosting       | Vercel (Edge Middleware + Cron Jobs + ISR)          |
| Charts        | Recharts                                            |

---

## 📁 Project structure

```
.
├── app/                       # Next.js App Router
│   ├── (legal)/               # /terms, /privacy, /contact
│   ├── admin/                 # Admin panel (MOD+/ADMIN/OWNER)
│   ├── api/                   # Route handlers (auth, cron, ping, og, health)
│   ├── dashboard/             # User dashboard
│   ├── login/                 # OAuth login
│   ├── servers/               # Catalog + detail + add
│   ├── globals.css            # Design system tokens
│   ├── layout.tsx
│   ├── page.tsx               # Home
│   ├── sitemap.ts / robots.ts / manifest.ts
│   └── icon.svg
├── actions/                   # Server Actions (vote, review, server, admin)
├── components/
│   ├── ui/                    # Shadcn-style primitives
│   ├── home/                  # Hero, featured, CTAs
│   ├── server/                # ServerCard, charts, voting
│   └── layout/                # Navbar, footer, logo, providers
├── hooks/                     # use-debounce, use-media-query
├── lib/                       # db, redis, utils, auth-helpers, rate-limit, validations, env
├── prisma/                    # schema.prisma + seed.ts
├── services/                  # Domain logic: minecraft, monitoring, servers, notifications
├── types/                     # next-auth.d.ts
├── auth.ts / auth.config.ts   # Auth.js v5 setup
├── middleware.ts              # Edge route protection
├── docker-compose.yml         # Local PostgreSQL + Redis
├── vercel.json                # Cron schedules + headers
└── next.config.ts / tailwind.config.ts / tsconfig.json
```

---

## 🚀 Quick start (local development)

### 1. Clone & install

```bash
git clone <your-repo>
cd craftpulse
npm install
```

### 2. Start Docker (PostgreSQL + Redis)

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
DATABASE_URL="postgresql://craftpulse:craftpulse@localhost:5432/craftpulse"
DIRECT_URL="postgresql://craftpulse:craftpulse@localhost:5432/craftpulse"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_TRUST_HOST="true"
```

(OAuth keys + Upstash are optional locally — Redis falls back to in-memory; auth works once you add OAuth creds.)

### 4. Migrate + seed

```bash
npm run db:push     # creates tables
npm run db:seed     # adds tags, badges, demo servers
```

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🌐 Production deployment (Vercel + Neon + Upstash)

### Step 1 — Neon PostgreSQL

1. Create a project at [neon.tech](https://neon.tech)
2. Enable **connection pooling** (PgBouncer)
3. Copy two strings:
   - **Pooled** → `DATABASE_URL` (used by runtime)
   - **Direct** → `DIRECT_URL` (used by migrations)
4. Add `?sslmode=require&pgbouncer=true&connect_timeout=15` to the pooled URL

### Step 2 — Upstash Redis

1. Create a global database at [upstash.com](https://upstash.com)
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Step 3 — OAuth providers

**Discord** — [Developer Portal](https://discord.com/developers/applications):
- Redirect URI: `https://yourdomain.com/api/auth/callback/discord`

**Google** — [Cloud Console](https://console.cloud.google.com/apis/credentials):
- Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

### Step 4 — Vercel

1. Import the repo to Vercel
2. Add **environment variables** from `.env.example` in **Production**:
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET`, `AUTH_DISCORD_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`
   - `UPSTASH_REDIS_REST_URL/TOKEN`
   - `CRON_SECRET` (long random string)
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
   - `ADMIN_BOOTSTRAP_EMAILS=your@email.com` (auto-promote to OWNER on first login)
3. Run migrations once locally pointing at production:
   ```bash
   DATABASE_URL="<DIRECT_URL>" npx prisma migrate deploy
   npm run db:seed     # optional, adds default tags + badges
   ```
4. Cron jobs are already configured in `vercel.json`:
   - `*/2 * * * *` — `/api/cron/monitor` (pings servers every 2 min)
   - `15 * * * *` — `/api/cron/rollup` (hourly snapshot + prune)
5. Deploy. Done.

> 🔐 The cron endpoints are protected by `CRON_SECRET` — Vercel automatically passes it via the `Authorization: Bearer …` header for paid plans, or you can call them as `?secret=…`.

---

## 🛡️ Security

| Mechanism                                | Where                                |
| ---------------------------------------- | ------------------------------------ |
| Edge middleware role guard               | `middleware.ts` + `auth.config.ts`   |
| Sliding-window rate limit                | `lib/rate-limit.ts` (Upstash)        |
| CSRF (built into Auth.js + Server Actions)| Next.js / Auth.js                    |
| Vote anti-fraud (cooldown + IP/UA hash)  | `actions/vote.ts`                    |
| Strict input validation                  | `lib/validations.ts` (Zod)           |
| Security headers (XSS, frame, referrer)  | `next.config.ts`                     |
| Secure cookies + JWT sessions            | Auth.js v5                           |

---

## 🎮 Minecraft monitoring

The monitoring pipeline runs in three stages:

1. **`/api/cron/monitor`** (every 2 min) — pings up to 100 servers per invocation with concurrency 10, persists `UptimeLog`, updates `Server` denormalized columns, invalidates Redis cache.
2. **`/api/cron/rollup`** (hourly) — aggregates `UptimeLog` rows into `PingSnapshot` (1h buckets) for charts; prunes raw logs older than 7 days.
3. **Per-request ping** at `/api/servers/[slug]/status` and `/api/ping` — cached in Redis for 30–60s.

Java edition uses SLP (Server List Ping) handshake with SRV record resolution; Bedrock uses RakNet `Unconnected Ping`.

---

## 📜 Scripts

```bash
npm run dev              # Turbopack dev server
npm run build            # Production build (incl. prisma generate)
npm run start            # Serve production build
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run db:push          # Push schema to DB (dev)
npm run db:migrate       # Create + apply migration (dev)
npm run db:deploy        # Apply migrations (prod)
npm run db:seed          # Seed tags/badges/demo servers
npm run db:studio        # Prisma Studio
```

---

## 🧭 Roles & permissions

| Role         | Capabilities                                            |
| ------------ | ------------------------------------------------------- |
| `USER`       | Vote, review, add server (goes to moderation queue)     |
| `VERIFIED`   | Servers auto-approved on submit                         |
| `MODERATOR`  | Moderation queue, resolve reports, hide servers         |
| `ADMIN`      | All of MOD + user role management, tags, featured slots |
| `OWNER`      | All of ADMIN + can promote others to OWNER              |

Set `ADMIN_BOOTSTRAP_EMAILS` to auto-promote your email to `OWNER` on first login.

---

## 🎨 Design system

- **Dark by default**, single-source HSL tokens in `app/globals.css`
- **Glassmorphism** elevated tiles (`.showcase-card`, `.glass`)
- **Aurora** + animated grid backgrounds (`.aurora-bg`, `.grid-bg`)
- **Animated gradient text** for hero (`.text-gradient`)
- **Live status indicators** with pulse-glow (`.status-online`)
- **Shimmer skeletons** for streaming loading states
- All typography uses **Geist Sans** with Cyrillic subset for Ukrainian

---

## 📈 Performance & SEO

- **Server Components** by default; client only where interaction is required
- **Streaming with Suspense** on home + catalog
- **ISR** on home (`revalidate = 60`)
- **Edge caching** of static assets via `vercel.json` headers
- **Dynamic OG images** at `/api/og?slug=...`
- **JSON-LD** structured data on home + server pages
- **Sitemap** auto-generated from DB with up to 10k server URLs

---

## 🤝 Contributing

PRs are welcome. Open an issue for big changes first.

## 📄 License

MIT © CraftPulse Team
