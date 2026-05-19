# Setup Guide

## Requirements
- Node.js 18+
- npm 9+
- PostgreSQL (Neon) or a local Postgres instance
- Expo Go (for mobile testing)

## 1. Clone Repository
```bash
git clone <REPO_URL>
cd badminton-planner
```

## 2. Install Dependencies
```bash
npm install
```

## 3. Environment Variables
Create `.env` files as needed.

**Root or badminton-web/.env**
- `DATABASE_URL` = Neon PostgreSQL connection string
- `JWT_SECRET` = secret for signing JWTs
- `NEXT_PUBLIC_APP_URL` = public URL for the web app

**badminton-mobile/app.config.js** or environment injection
- `BADMINTON_API_URL` = REST API base URL (e.g. `http://localhost:3000/api`)

## 4. Database Setup
From the root:
```bash
npm run db:generate --workspace=badminton-web
npm run db:migrate --workspace=badminton-web
npm run db:seed --workspace=badminton-web
```

## 5. Run Web App
```bash
npm run dev --workspace=badminton-web
```

## 6. Run Mobile App
```bash
npm run dev --workspace=badminton-mobile
```

## 7. Run Entire Monorepo
```bash
npm run dev
```

## Common Problems

**Database connection issues**
- Verify `DATABASE_URL` points to a reachable Neon database
- Confirm your IP is allowed in Neon

**JWT issues**
- Ensure `JWT_SECRET` is set and consistent across web and API
- Re-login after changing secrets

**CORS issues**
- Confirm the mobile API URL matches the web host and port
- Check that the API base URL uses `/api`

**Expo networking issues**
- Use your machine LAN IP instead of `localhost` on real devices
- Ensure the API port is reachable on the same network
