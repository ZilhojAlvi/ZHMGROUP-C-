# SRMS — Smart Real Estate Management System

A full-stack Smart Real Estate Management System built with **Next.js 16
(App Router)**, **TypeScript**, **Tailwind CSS v4**, a **PostgreSQL**
database via **Prisma**, and **real, secure email/password authentication**.
All UI, pages, routing, design, and business logic from the original build
are preserved — the mock/demo data layer has been replaced end-to-end with
a real backend.

---

## ✨ Highlights

- **Real database** — PostgreSQL via Prisma ORM. Full schema: Users,
  Profiles, Sessions, Verification Tokens, Properties, Favorites, Bookings,
  Payments, Messages, Notifications, Activity Logs, Maintenance Tools.
- **Real authentication** — email/password signup & login, bcrypt password
  hashing, email verification, forgot/reset password, httpOnly JWT session
  cookies, server-side session revocation on logout.
- **Authorization** — customer / agent / admin roles enforced both in
  Next.js `middleware.ts` (edge) and in every API route (`requireUser()`).
- **Production-ready REST API** — `/api/auth/*`, `/api/users/*`,
  `/api/properties/*`, `/api/favorites/*`, `/api/bookings/*`,
  `/api/payments`, `/api/messages`, `/api/notifications/*`,
  `/api/dashboard/report`. See [`docs/API.md`](docs/API.md).
- **Security** — Helmet-equivalent HTTP headers, rate limiting on auth
  endpoints, Zod input validation everywhere, parameterized queries via
  Prisma (no SQL injection surface), account lockout after repeated failed
  logins, generic error messages to prevent user enumeration.
- **Same UI, same UX** — every page, component, animation and layout from
  the original build is unchanged; only the data layer was swapped.

---

## 🚀 Getting started

See [`docs/INSTALL.md`](docs/INSTALL.md) for full setup instructions
(PostgreSQL, environment variables, migrations, seeding). Quick version:

```bash
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, EMAIL_* etc.
npm install
npx prisma db push
npm run db:seed           # optional — creates sample accounts & listings
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create your own
account via **Sign up** — email verification is required before logging in
(or use one of the seeded accounts, see `prisma/seed.ts`).

---

## 🏗️ Architecture

```
src/
  app/
    api/            Next.js Route Handlers = the REST backend (auth, users,
                     properties, favorites, bookings, payments, messages,
                     notifications, dashboard, tools)
    ...              Pages (unchanged from the original UI)
  components/        Reusable, generic UI (ui/, layout/, common/)
  features/          Feature-specific composed components (property/, booking/, dashboard/)
  services/          Frontend API clients (AuthService, PropertyService,
                     BookingService, UserService, ReportService,
                     FavoriteService) — call src/lib/apiClient.ts → /api/*
  hooks/             Reusable React hooks (useAuth, useProperties, useBookings, ...)
  lib/
    auth/            Password hashing, JWT, cookies, email, rate limiting,
                     Zod validators, server-side session resolution
    oop/             OOP class hierarchy (User/Customer/Agent/Admin, Property,
                     Booking, Payment, MaintenanceTool) — unchanged
    prisma.ts        Prisma Client singleton
    mappers.ts       Maps Prisma rows → the app's existing TS types
    apiClient.ts     fetch() wrapper used by services/
  middleware.ts      Edge route protection (auth + role checks)
  store/             Zustand global state (auth, UI/theme, notifications)
  types/             Shared TypeScript interfaces & enums (unchanged)
  utils/             Formatters, validators, constants
prisma/
  schema.prisma      Full database schema
  seed.ts            Optional dev seed script (real bcrypt-hashed accounts)
  seed-data/         Sample properties/tools JSON used only by the seed script
```

**Data flow:** `Page → hook/service → src/lib/apiClient.ts → /api/* route
handler → Prisma → PostgreSQL`

Auth flow: the browser holds only an **httpOnly, secure, SameSite=Lax**
session cookie containing a signed JWT (`{ sub, sid, role, email }`). The
JWT is verified at the edge in `middleware.ts` for route protection, and
re-checked against the `Session` table in `lib/auth/session.ts` on every
API call so a revoked session (logout, password reset) stops working
immediately even though the JWT itself hasn't expired yet.

### OOP model

The original OOP class hierarchy in `src/lib/oop/` (User → Customer / Agent
/ Admin, PropertyModel → Residential / Commercial, Booking, Payment,
MaintenanceTool) is unchanged and still used for client-side calculations
(e.g. `PropertyModel.calculateTax()`). Authentication itself now happens
server-side against the database, not through `User.login()`.

---

## 🔌 REST API

Full endpoint reference: [`docs/API.md`](docs/API.md).

---

## 🔒 Security notes

- Passwords are hashed with **bcrypt** (12 rounds) — plain-text passwords
  are never stored or logged.
- All request bodies are validated with **Zod** schemas
  (`src/lib/auth/validators.ts`); invalid input returns `422` with a
  specific message.
- **Rate limiting** is applied to signup/login/forgot-password/reset-password
  (in-memory, single-instance — see the note in
  `src/lib/auth/rateLimit.ts` about scaling to multiple instances).
- **Helmet-equivalent headers** (`X-Frame-Options`, `X-Content-Type-Options`,
  `Strict-Transport-Security`, etc.) are set in `next.config.ts`.
- Prisma's query builder parameterizes every query — there is no
  string-concatenated SQL anywhere in the codebase.
- React escapes all rendered content by default, and the API never returns
  raw HTML, which covers standard XSS vectors for this app's surface.
- CORS: the frontend and API share an origin (same Next.js app), so no
  cross-origin API access is enabled by default.

---

## 🚢 Deploying

This app now requires a **PostgreSQL database** and **SMTP credentials**.
See [`docs/INSTALL.md`](docs/INSTALL.md) for platform-specific notes
(Render, Railway, Vercel + a hosted Postgres provider, etc.). In short:

1. Provision a PostgreSQL database and set `DATABASE_URL`.
2. Set `JWT_SECRET`, `APP_URL`, and `EMAIL_*` environment variables.
3. Run `npx prisma migrate deploy` as part of your build/release step.
4. Deploy the Next.js app as usual (`next build && next start`).

---

## 🧪 Quality checks

```bash
npm run lint          # ESLint
npx tsc --noEmit       # TypeScript strict type-check
npm run build          # Production build
```

---

## 🎨 Design system

Unchanged from the original build — Deep Blue + White theme, glassmorphism,
rounded cards, soft shadows, fade/scale/float motion (respects
`prefers-reduced-motion`), class-based dark mode.

---

Originally built as an IDP-2 university project to demonstrate clean
architecture and object-oriented design; upgraded here into a
production-ready application with a real database and secure
authentication.
