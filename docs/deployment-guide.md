# Deployment Guide

This guide documents the capstone deployment shape used for Badminton Club Planner:

- Web/API app: Next.js on Netlify.
- Database: Neon PostgreSQL.
- Mobile app evaluation build: Expo static web export deployed on Netlify.

The URLs below are evaluation placeholders and should be replaced with the final deployed URLs before submission.

| Resource | URL |
| --- | --- |
| Web App and REST API | `https://badminton-planner-web.netlify.app` |
| Mobile Web Preview | `https://badminton-planner-mobile.netlify.app` |
| API Docs Endpoint | `https://badminton-planner-web.netlify.app/api/docs` |

## 1. Neon Database

1. Create a Neon project and PostgreSQL database.
2. Copy the pooled or direct connection string.
3. Ensure the connection string includes SSL, for example `sslmode=require`.
4. Store the connection string only in local `.env` files or Netlify environment variables.

Required variable for the web app:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/badminton_planner?sslmode=require"
```

After configuring `DATABASE_URL`, run migrations and seed data from the repository root:

```bash
npm run db:migrate
npm run db:seed --workspace badminton-web
```

For large dataset evaluation, seed performance data only in non-production databases:

```bash
npm run db:seed:performance
```

## 2. Web/API Deployment on Netlify

Create a Netlify site connected to this repository.

Recommended Netlify settings:

| Setting | Value |
| --- | --- |
| Base directory | `badminton-web` |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | `20` or newer |

Netlify should detect the Next.js app and enable its Next.js runtime. The deployed web app also serves the REST API under `/api`.

Add these Netlify environment variables for the web site:

| Variable | Example |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Long random secret used for JWT signing |
| `NEXT_PUBLIC_APP_URL` | `https://badminton-planner-web.netlify.app` |

Generate a strong JWT secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Do not commit real secrets.

## 3. Mobile Web Preview Deployment on Netlify

The Expo app can be exported as a static web build for capstone evaluation.

Create a second Netlify site connected to this repository.

Recommended Netlify settings:

| Setting | Value |
| --- | --- |
| Base directory | `badminton-mobile` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `20` or newer |

Add this Netlify environment variable for the mobile preview site:

```env
BADMINTON_API_URL="https://badminton-planner-web.netlify.app/api"
```

Local verification command:

```bash
npm run build:mobile
```

The export writes static files to:

```text
badminton-mobile/dist
```

## 4. Local Environment Templates

Template files are committed for evaluators:

- `badminton-web/.env.example`
- `badminton-mobile/.env.example`

Create local `.env` files from those templates and replace the placeholder values:

```bash
cp badminton-web/.env.example badminton-web/.env
cp badminton-mobile/.env.example badminton-mobile/.env
```

On Windows PowerShell:

```powershell
Copy-Item badminton-web\.env.example badminton-web\.env
Copy-Item badminton-mobile\.env.example badminton-mobile\.env
```

## 5. Demo Accounts

The seed script creates these demo accounts. All use password `pass123`.

| Role | Email |
| --- | --- |
| Admin | `admin@badminton.test` |
| Manager | `desislava.ivanova@badminton.test` |
| Coach | `georgi.stoyanov@badminton.test` |
| Coach | `petar.kolev@badminton.test` |
| Parent | `elena.dimitrova@badminton.test` |
| Parent | `ivan.mihaylov@badminton.test` |
| Parent | `silvia.vasileva@badminton.test` |

## 6. Production Smoke Test

After deployment:

1. Open the web app URL.
2. Log in as `admin@badminton.test` with `pass123`.
3. Confirm dashboard, admin users, groups, sessions, venues, events, and profile load.
4. Open `https://badminton-planner-web.netlify.app/api/docs`.
5. Open the mobile preview URL.
6. Log in as a parent account.
7. Confirm sessions, session details, attendance, comments, groups, announcements, events, and account screens load.
8. Confirm mobile API requests point to the deployed web API.

## 7. Final Submission Checklist

- Replace placeholder Netlify URLs with final URLs in `README.md` and this guide.
- Confirm Netlify web environment variables are set.
- Confirm Netlify mobile `BADMINTON_API_URL` points to the deployed web API.
- Run `npm run lint:web`, `npm run lint:mobile`, and `npm run test:web`.
- Run `npm run build:mobile` and confirm `badminton-mobile/dist` is generated.
- Do not commit `.env` files or real secrets.
