This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Prisma 7 + SQLite)

The app uses **Prisma 7** with a **local SQLite** database. The DB file is `prisma/dev.db` (created on first migrate).

1. **Generate the Prisma client** (required after clone and before first run):
   ```bash
   npm run db:generate
   ```

2. **Create the database and tables** (if not already done):
   ```bash
   npm run db:migrate
   ```
   Use a migration name when prompted (e.g. `init`).

3. **Optional**: Open [Prisma Studio](https://www.prisma.io/studio) to view/edit data:
   ```bash
   npm run db:studio
   ```

- **API**: `GET /api/users` and `POST /api/users` (body: `{ "email": "...", "name": "..." }`) use the database.
- **Config**: `DATABASE_URL` in `.env` points to `file:./prisma/dev.db`. Connection is configured in `prisma.config.ts` and the app uses `@prisma/adapter-better-sqlite3` in `lib/db.ts`.

## Monorepo: sharing Prisma and lib with apps

The repo root holds the **single** Prisma schema (`prisma/`), generated client, and shared lib (`lib/`, `app/lib/`). Apps in `apps/` (e.g. `survey`, `admin`) use the same schema and helpers via path mapping.

- **In `apps/survey` and `apps/admin`**: `@/` is mapped to the repo root, so you can import shared code from root:
  - `import { prisma } from "@/lib/db"`
  - `import { writeSurveyAnswer } from "@/app/lib/survey-answer"`
  - `import { getSurvey, getQuestion } from "@/lib/survey"`
  - `import { SENTIMENT_KEYS, SENTIMENT_LABELS } from "@/lib/sentiments"`
- **App-local imports** in each app use the `~/*` alias (e.g. `~/app/page`).
- Run `npm run db:generate` (and migrations) from the **repo root**; all apps share the same DB and client.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
