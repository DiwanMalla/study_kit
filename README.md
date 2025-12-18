# Super Student Kit

A Next.js 14 full-stack application built with Prisma, Clerk authentication, and Google Gemini AI.
The goal of this project is to provide students with an AI-powered study platform that tracks and supports their learning journey in one place.

---

## Tech Stack

- **Next.js 14** (App Router)
- **Prisma ORM** + PostgreSQL
- **Clerk** for authentication
- **Google Gemini API** for AI features
- **Tailwind CSS** for styling

---

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or cloud)
- Clerk account (for authentication keys)
- Google Gemini API key

---

## Setup

### 1. Clone the repository

```sh
git clone https://github.com/DiwanMalla/study_kit.git
cd study_kit
```

---

### 2. Install dependencies

```sh
npm install
# or
yarn install
```

---

### 3. Configure environment variables

Copy the example environment file and fill in your own values:

```sh
cp .env.example .env
```

Example `.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key

GEMINI_API_KEY=your-gemini-api-key
```

---

### 4. Apply Prisma migrations (recommended)

This project uses **Prisma migrations** to keep database schema changes consistent across environments.

Run the following command to apply existing migrations to your local database:

```sh
npx prisma migrate dev
```

This will:

- Create tables based on committed migrations
- Sync your local database schema
- Generate Prisma Client automatically (in most cases)

> ❌ Avoid using `npx prisma db push` for team or production workflows, as it does not create migration history.

---

### 5. (Optional) Generate Prisma Client manually

If Prisma Client is not generated automatically:

```sh
npx prisma generate
```

---

## Running the App

### Development

```sh
npm run dev
```

Visit:
👉 [http://localhost:3000](http://localhost:3000)

---

### Production

```sh
npm run build
npm start
```

---

## Database & Migrations Notes

- All schema changes should be made in `prisma/schema.prisma`
- After modifying the schema, create a new migration:

```sh
npx prisma migrate dev --name meaningful_migration_name
```

Examples:

- `add_flashcards`

- `add_file_uploads`

- `add_user_profile`

- In production, migrations should be applied using:

```sh
npx prisma migrate deploy
```

### Prisma: Accelerate vs Local (best practice)

Short guidance to help you choose which database to target when developing or deploying:

- Use a local or team-managed Postgres database for day-to-day development and testing. Local DBs are fast to iterate against and keep migration history simple.
- Use Prisma Accelerate (the `DATABASE_URL` in this repo) for staging/production where you want the managed performance and scaling benefits. Accelerate can improve latency and reliability in production environments.
- Best practice: keep environments separate. Never point your local dev workflow directly at production/accelerate unless you intentionally want to test against that remote system.
- Use explicit scripts and documented configs (below) to avoid accidental pushes to the wrong DB.

This repo includes two helper configs/scripts:

- `prisma.config.ts` — default config used for local pushes/migrations. It reads `DIRECT_DATABASE_URL` from `.env.local`.
- `prisma.accelerate.config.ts` — temporary config that points at `DATABASE_URL` (Prisma Accelerate). Use it only when you intend to target Accelerate.

Recommended commands (available as npm scripts):

```sh
# push schema to the accelerate DB (explicit)
npm run prisma:push:accelerate

# push schema to the local/direct DB (explicit)
npm run prisma:push:local

# run migration deploy against the configured DB (local/prod depending on your config)
npm run prisma:migrate:deploy
```

Notes:

- Prefer `prisma migrate dev` and committed migrations for team workflows. `db push` is convenient for quick experiments but does not produce a migration history.
- In CI or production, use `prisma migrate deploy` to apply committed migrations safely.
- Document and gate any direct pushes to remote systems (Accelerate) in your team's runbook.

---

## Features

- User authentication with Clerk
- AI-powered chat using Google Gemini
- Study kits, flashcards, quizzes, and file uploads
- Modern, responsive UI with Tailwind CSS

---
