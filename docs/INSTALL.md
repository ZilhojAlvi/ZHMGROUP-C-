# Installation & Database Setup

## 1. Prerequisites

- Node.js ≥ 20
- A PostgreSQL database (any of these work fine):
  - Local install ([postgresapp.com](https://postgresapp.com) on Mac,
    `apt install postgresql` on Linux, or Docker — see below)
  - A hosted provider: [Neon](https://neon.tech), [Supabase](https://supabase.com),
    [Render](https://render.com/docs/databases), [Railway](https://railway.app)
- An SMTP-capable email account for sending verification/reset emails
  (a Gmail account with an **App Password** works well for development)

### Quick local Postgres via Docker

```bash
docker run --name srems-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=srems \
  -p 5432:5432 \
  -d postgres:16
```

This gives you `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/srems?schema=public"`.

---

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

| Variable         | Description                                                             |
| ---------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL connection string                                             |
| `JWT_SECRET`     | Long random string used to sign session cookies. Generate with `openssl rand -base64 48` |
| `APP_URL`        | Public base URL of the app (used to build email links), e.g. `http://localhost:3000` |
| `PORT`           | Port for `next start` (defaults to 3000)                                 |
| `EMAIL_HOST`     | SMTP host, e.g. `smtp.gmail.com`                                         |
| `EMAIL_PORT`     | SMTP port, e.g. `587`                                                    |
| `EMAIL_USER`     | SMTP username / from-address                                             |
| `EMAIL_PASSWORD` | SMTP password or app password                                            |

> If `EMAIL_USER`/`EMAIL_PASSWORD` are left blank, the app **logs**
> verification/reset emails to the server console instead of sending them —
> useful for local development, but must be set before deploying.

### Gmail App Password (optional, for real email sending)

1. Enable 2-Step Verification on the Google account.
2. Go to **Google Account → Security → App passwords**.
3. Create an app password for "Mail" and use it as `EMAIL_PASSWORD`
   (use the full Gmail address as `EMAIL_USER`).

---

## 3. Install dependencies & set up the database

```bash
npm install
npx prisma db push   # creates tables from prisma/schema.prisma
```

This will:
- Create all tables (`users`, `profiles`, `sessions`, `verification_tokens`,
  `properties`, `favorites`, `bookings`, `payments`, `messages`,
  `notifications`, `activity_logs`, `maintenance_tools`)
- Generate the Prisma Client used throughout `src/`

### Optional: seed sample data

```bash
npm run db:seed
```

Creates a small set of **real accounts** (bcrypt-hashed passwords, pre-verified
for convenience) plus sample property listings and maintenance tools, so you
have something to click around. See `prisma/seed.ts` for the exact
credentials it creates — change or delete this file if you don't want any
seed data.

---

## 4. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

To create your own account: go to **Sign up**, fill in the form, then check
the server console (or your inbox, if SMTP is configured) for the
verification link before logging in.

---

## 5. Useful Prisma commands

```bash
npx prisma studio                        # visual database browser
npx prisma db push                       # sync the database to match prisma/schema.prisma
npx prisma db push --accept-data-loss    # same, without the confirmation prompt (used in CI/Render)
npx prisma generate                      # regenerate the Prisma Client (runs automatically on install)
```

---

## 6. Production deployment checklist

- [ ] `DATABASE_URL` points at a production Postgres instance
- [ ] `JWT_SECRET` is a strong, unique random value (not the dev default)
- [ ] `APP_URL` is the real public URL (used in email links)
- [ ] `EMAIL_USER` / `EMAIL_PASSWORD` are configured so verification/reset
      emails actually send
- [ ] `NODE_ENV=production` is set (enables the `secure` flag on cookies —
      requires HTTPS)
- [ ] Run `npx prisma db push --accept-data-loss` as part of your deploy/release step
- [ ] `npm run build && npm run start` (or your platform's Next.js build)

### Notes on the rate limiter

`src/lib/auth/rateLimit.ts` is an in-memory limiter — it works correctly for
a single running instance/process. If you deploy multiple instances behind a
load balancer, swap it for a shared store (e.g. Upstash Redis) using the
same `checkRateLimit()` function signature so no call sites need to change.
