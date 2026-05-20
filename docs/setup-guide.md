# Setup Guide

This guide explains how to run Badminton Club Planner locally for development and evaluation.

## 1. Requirements

| Requirement | Recommended Version | Notes |
| --- | --- | --- |
| Node.js | 20 LTS or newer | Required for Next.js, Expo, TypeScript, and Drizzle tooling. |
| npm | Bundled with Node.js | This repository uses npm workspaces. |
| PostgreSQL / Neon DB | PostgreSQL 15+ compatible | Neon is recommended for hosted development. |
| Expo Go | Latest from iOS App Store or Google Play | Required for testing the mobile app on a device. |
| Git | Latest stable | Required for cloning and version control. |

## 2. Clone Repository

```bash
git clone <your-github-repo-url>
cd badminton-planner
```

If your repository name is different, use that folder name instead of `badminton-planner`.

## 3. Install Dependencies

Install all workspace dependencies from the repository root:

```bash
npm install
```

The root workspace installs dependencies for:

- `badminton-web`
- `badminton-mobile`

## 4. Environment Variables

Create local environment files for the web and mobile apps. Template files are committed at:

- `badminton-web/.env.example`
- `badminton-mobile/.env.example`

### Web App

Create `badminton-web/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/dbname?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Mobile App

Create `badminton-mobile/.env`:

```env
BADMINTON_API_URL="http://localhost:3000/api"
```

For a physical mobile device, `localhost` points to the phone, not the development machine. Use your computer's LAN IP address:

```env
BADMINTON_API_URL="http://192.168.1.50:3000/api"
```

### Variable Reference

| Variable | Required | Used By | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Web/backend | Neon PostgreSQL connection string used by Drizzle and the app. |
| `JWT_SECRET` | Yes | Web/backend | Secret used to sign and verify JWT authentication tokens. |
| `NEXT_PUBLIC_APP_URL` | Recommended | Web | Public URL for links, redirects, and deployed environments. |
| `BADMINTON_API_URL` | Yes for mobile | Mobile | Base REST API URL consumed by the Expo app. |

Generate a strong JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## 5. Database Setup

Run Drizzle commands from the repository root using the web workspace.

Generate migrations from the Drizzle schema:

```bash
npm run db:generate --workspace badminton-web
```

Apply migrations to the configured PostgreSQL database:

```bash
npm run db:migrate --workspace badminton-web
```

Seed generated demo data:

```bash
npm run db:seed --workspace badminton-web
```

The seed script creates fictional users, players, venues, groups, sessions, attendance records, comments, events, announcements, and group invitations for evaluation.

## 6. Run Web App

Root convenience command:

```bash
npm run dev:web
```

Current workspace equivalent:

```bash
npm run dev --workspace badminton-web
```

Open:

```text
http://localhost:3000
```

## 7. Run Mobile App

Root convenience command:

```bash
npm run dev:mobile
```

Current workspace equivalent:

```bash
npm run dev --workspace badminton-mobile
```

Then scan the Expo QR code with Expo Go.

For mobile device testing, confirm that `BADMINTON_API_URL` points to an address reachable from the device.

## 8. Run Entire Monorepo

Start the web and mobile development servers together:

```bash
npm run dev
```

The root command uses `concurrently` to run both app workspaces.

## 9. Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run web and mobile development servers together. |
| `npm run dev:web` | Run the Next.js web app and API. |
| `npm run dev:mobile` | Run the Expo mobile app. |
| `npm run build` | Build all workspaces that define a build script. |
| `npm run build:web` | Build the Next.js web app. |
| `npm run build:mobile` | Export the Expo app for web/static hosting. |
| `npm run lint:web` | Lint the web app. |
| `npm run lint:mobile` | Lint the mobile app. |
| `npm run test:web` | Run web unit tests. |
| `npm run dev --workspace badminton-web` | Run the Next.js web app and API. |
| `npm run dev --workspace badminton-mobile` | Run the Expo mobile app. |
| `npm run lint --workspace badminton-web` | Lint the web app. |
| `npm run lint --workspace badminton-mobile` | Lint the mobile app. |
| `npm run db:generate --workspace badminton-web` | Generate Drizzle migrations. |
| `npm run db:migrate --workspace badminton-web` | Apply database migrations. |
| `npm run db:seed --workspace badminton-web` | Seed demo data. |
| `npm run db:seed:performance` | Seed a large non-production performance dataset. |
| `npm run test:performance` | Run the performance smoke-check script. |

## 10. Demo Credentials

All seeded demo accounts use password `pass123`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@badminton.test` | `pass123` |
| Manager | `desislava.ivanova@badminton.test` | `pass123` |
| Coach | `georgi.stoyanov@badminton.test` | `pass123` |
| Coach | `petar.kolev@badminton.test` | `pass123` |
| Parent | `elena.dimitrova@badminton.test` | `pass123` |
| Parent | `ivan.mihaylov@badminton.test` | `pass123` |
| Parent | `silvia.vasileva@badminton.test` | `pass123` |

## 11. Deployment

The capstone deployment uses Netlify for the web/API app, Neon PostgreSQL for the database, and a Netlify-hosted Expo web export for mobile evaluation.

Evaluation URLs:

| Resource | URL |
| --- | --- |
| Web App and REST API | `https://badminton-planner-web-may-2026.netlify.app` |
| Mobile Web Preview | `https://badminton-planner-mobile-may-2026.netlify.app` |
| API Docs Endpoint | `https://badminton-planner-web-may-2026.netlify.app/api/docs` |

See the dedicated [deployment guide](deployment-guide.md) for Netlify build settings, Neon setup, environment variables, and the final submission checklist.

## 12. Common Problems

### Database Connection Issues

Symptoms:

- Drizzle commands fail.
- The web app throws `DATABASE_URL is required`.
- Requests fail when loading groups, sessions, events, or venues.

Checklist:

- Confirm `badminton-web/.env` exists.
- Confirm `DATABASE_URL` is a valid Neon PostgreSQL URL.
- Include `sslmode=require` for Neon.
- Run migrations before starting the app.
- Check that your Neon database is active and not paused.

### JWT Issues

Symptoms:

- Login succeeds but protected API calls return `401`.
- Mobile app appears signed out after requests.
- API returns `Bearer token is invalid or expired`.

Checklist:

- Confirm `JWT_SECRET` is set in `badminton-web/.env`.
- Restart the web dev server after changing `.env`.
- Clear the mobile app session if the secret changed.
- Ensure the mobile request includes `Authorization: Bearer <token>`.

### CORS Issues

Symptoms:

- Browser or mobile web testing reports blocked cross-origin requests.
- API works in the browser but not from another origin.

Checklist:

- Use the configured local API URL.
- Keep mobile requests pointed at `/api` on the Next.js backend.
- Add explicit CORS handling only for external origins that need browser access.
- Avoid using production domains with local development tokens.

### Expo Networking Issues

Symptoms:

- Mobile app cannot reach `http://localhost:3000/api`.
- Requests time out on a physical device.
- Expo Go works in web mode but not on the phone.

Checklist:

- Replace `localhost` with your computer's LAN IP address in `BADMINTON_API_URL`.
- Make sure the phone and development machine are on the same network.
- Allow Node.js/Next.js through the local firewall.
- Restart Expo after editing `badminton-mobile/.env`.
- Verify the API from the phone browser: `http://<your-lan-ip>:3000/api/docs`.

## 13. Evaluation Notes

For capstone evaluation, the recommended flow is:

1. Run migrations and seed data.
2. Start the web app or open the deployed Netlify web URL.
3. Log in with a seeded role-specific demo account.
4. Review dashboard, groups, sessions, attendance, comments, venues, and events.
5. Start the mobile app or open the deployed mobile preview with `BADMINTON_API_URL` pointing to the running API.
6. Test session viewing, attendance, comments, announcements, and event registration from mobile.
