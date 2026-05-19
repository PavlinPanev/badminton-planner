# Badminton Web

Next.js web app and backend API for Badminton Club Planner.

## Responsibilities

- Club manager and coach web workflows.
- Authentication, secure session cookies, and JWT issuing.
- REST API routes consumed by the Expo mobile app.
- Drizzle ORM schema, migrations, database connection, and seed scripts.
- Server Actions for web form mutations.

## Local Setup

Create `badminton-web/.env` from `badminton-web/.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/badminton_planner?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Run from the repository root:

```bash
npm install
npm run db:migrate
npm run db:seed --workspace badminton-web
npm run dev:web
```

Open `http://localhost:3000`.

## Deployment

The capstone deployment target is Netlify with Neon PostgreSQL.

Recommended Netlify settings:

| Setting | Value |
| --- | --- |
| Base directory | `badminton-web` |
| Build command | `npm run build` |
| Publish directory | `.next` |

Required Netlify environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

See [../docs/deployment-guide.md](../docs/deployment-guide.md) for the full deployment checklist.
