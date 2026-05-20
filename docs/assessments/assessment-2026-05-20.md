# Full Stack Apps with AI — Capstone Assessment

Date: 2026-05-20
Project: Badminton Club Planner
Repository: badminton-planner
Assessor: Codex

## Overall Score

| Area | Score | Max |
|---|---:|---:|
| GitHub Commits | 15 | 15 |
| GitHub Commit Days | 15 | 15 |
| Architecture | 5 | 5 |
| Backend | 5 | 5 |
| Database | 5 | 5 |
| Users and Roles | 5 | 5 |
| Scalability | 5 | 5 |
| Web App | 15 | 15 |
| Admin Panel | 5 | 5 |
| Mobile App | 15 | 15 |
| Deployment | 5 | 5 |
| Documentation | 5 | 5 |
| TOTAL | 100 | 100 |

Estimated current capstone score: **100 / 100 base points**.

Bonus readiness is assessed separately at the end because the official instructions say bonus requirements do not count toward the base 100 unless explicitly configured.

## Assessment Methodology

- Inspected repository structure, workspace configuration, web app, mobile app, shared package, database schema, migrations, seed scripts, API routes, service/data helpers, auth, authorization, admin pages, documentation, and generated assets.
- Inspected git history with `git log`.
- Verified local quality gates:
  - `npm run test:web`: passed, 4 test files and 17 tests.
  - `npm run lint:web`: passed.
  - `npm run lint:mobile`: passed.
  - `npm run build:web`: passed.
  - `npm run build:mobile`: passed and exported Expo `dist`.
- Verified public deployment signals with `Invoke-WebRequest`:
  - `https://badminton-planner-web-may-2026.netlify.app/api/docs`: HTTP 200.
  - `https://badminton-planner-mobile-may-2026.netlify.app`: HTTP 200.
  - `POST https://badminton-planner-web-may-2026.netlify.app/api/auth/login` with seeded admin credentials: HTTP 200 and JWT returned.
- Historical assessments are preserved in `docs/assessments/assessment-2026-05-18.md` and `docs/assessments/assessment-2026-05-19.md`; this file adds the dated 2026-05-20 assessment.

## GitHub Commits - 15 / 15

### Evidence Found

- `git log --oneline` shows 60 commits.
- Commit messages show meaningful progression: initial web app, Expo initialization, workspace setup, auth, database schema, seed scripts, dashboard, groups, sessions, attendance, comments, venues, events, mobile screens, admin features, pagination, performance seed, documentation, and deployment updates.
- Recent commits include cleanup and deployment/reference fixes.

### Missing / Weak Areas

- None for the official scoring requirement.

### Why Points Were Deducted

- No points deducted. The project exceeds the 15-commit requirement.

### Recommended Codex Prompt

```text
Inspect the git history and produce a concise capstone-ready development timeline:
- group commits by feature milestone
- highlight meaningful progression across web, backend, database, mobile, deployment, and documentation
- flag any vague commit messages that should be clarified in future work

Do not rewrite git history.
Create or update a documentation file only.
```

## GitHub Commit Days - 15 / 15

### Evidence Found

- Commit dates found across 4 distinct days:
  - 2026-05-17
  - 2026-05-18
  - 2026-05-19
  - 2026-05-20
- The requirement is commits on at least 3 different days, worth 5 points per day up to 15.

### Missing / Weak Areas

- None for the official scoring requirement.

### Why Points Were Deducted

- No points deducted. The project exceeds the 3-day requirement.

### Recommended Codex Prompt

```text
Create a short docs/development-log.md file from the git history:
- summarize work completed on each commit day
- connect each day to capstone criteria
- keep it factual and evidence-based

Do not change application code.
```

## Architecture - 5 / 5

### Evidence Found

- Root `package.json` defines an npm monorepo with workspaces:
  - `badminton-web`
  - `badminton-mobile`
  - `badminton-shared`
- `badminton-web` is a Next.js App Router app and backend runtime.
- `badminton-mobile` is an Expo React Native app using Expo Router.
- `badminton-shared` contains shared API/user types.
- Client-server architecture is documented in `docs/architecture.md`.
- Mobile HTTP communication is implemented through `badminton-mobile/src/lib/api.ts` and screen-level `fetch` calls to `/api/*` endpoints.
- Web/backend organization separates:
  - UI pages in `badminton-web/src/app`
  - REST routes in `badminton-web/src/app/api`
  - services in `badminton-web/src/services`
  - auth helpers in `badminton-web/src/auth`
  - database schema/connection/seeds in `badminton-web/src/db`
  - reusable helpers in `badminton-web/src/lib`
  - reusable components in `badminton-web/src/components`

### Missing / Weak Areas

- The repository uses `badminton-web` and `badminton-mobile` instead of `apps/web` and `apps/mobile`. This still satisfies the architecture requirement because the apps are clearly separated in a monorepo.
- Some server-side business/query logic lives in `src/lib` data helpers rather than a fully formal repository layer. It is still modular and not monolithic.

### Why Points Were Deducted

- No points deducted. The implementation satisfies all architecture requirements.

### Recommended Codex Prompt

```text
Review the web/backend architecture and incrementally clarify service boundaries:
- keep route handlers thin
- keep Server Actions focused on validation, authorization, redirects, and cache refresh
- move reusable domain operations into services or repository-style helpers
- preserve current behavior and file organization

Add or update focused tests only where shared behavior changes.
```

## Backend - 5 / 5

### Evidence Found

- Next.js backend is implemented under `badminton-web/src/app/api`.
- REST API endpoints include:
  - `/api/auth/login`
  - `/api/auth/register`
  - `/api/docs`
  - `/api/sessions`
  - `/api/sessions/[id]`
  - `/api/sessions/[id]/attendance`
  - `/api/sessions/[id]/comments`
  - `/api/sessions/[id]/comments/[commentId]`
  - `/api/events`
  - `/api/events/[id]`
  - `/api/events/[id]/register`
  - `/api/events/[id]/cancel-registration`
  - `/api/groups`
  - `/api/groups/[id]`
  - `/api/announcements`
- Database persistence uses Drizzle and Neon/PostgreSQL through `badminton-web/src/db`.
- Authentication uses JWTs in `badminton-web/src/auth/token.ts`.
- API authentication uses Bearer tokens in `badminton-web/src/auth/api.ts`.
- Services exist for auth, sessions, groups, events, and announcements in `badminton-web/src/services`.
- Route handlers call services/data helpers instead of embedding all business logic directly.
- Server-side authorization evidence includes `getApiUser`, group/session access checks, and role helpers in `badminton-web/src/lib/permissions.ts`.
- Local web build passed and listed all API routes successfully.

### Missing / Weak Areas

- API CORS currently allows `*`, which is acceptable for capstone evaluation but should be narrowed for production.
- No token revocation/refresh-token rotation is implemented. The official backend criterion does not require refresh tokens.

### Why Points Were Deducted

- No points deducted. Backend requirements are met.

### Recommended Codex Prompt

```text
Harden the REST backend for production without rewriting the app:
- restrict CORS to configured allowed origins
- add rate limiting or request throttling guidance for auth endpoints
- add consistent structured logging for API errors
- keep the existing JWT Bearer flow and service architecture
- add tests for the new security behavior
```

## Database - 5 / 5

### Evidence Found

- PostgreSQL/Neon configuration is present in `badminton-web/drizzle.config.ts`.
- Drizzle schema is defined in `badminton-web/src/db/schema.ts`.
- Drizzle migrations are committed under `badminton-web/drizzle`.
- Migration SQL files include:
  - `0000_tiresome_rictor.sql`
  - `0001_eager_daimon_hellstrom.sql`
  - `0002_group_invitations.sql`
  - `0003_venue_archiving.sql`
  - `0004_stale_impossible_man.sql`
  - `0005_performance_indexes.sql`
- Schema defines 11 tables:
  - `users`
  - `players`
  - `venues`
  - `groups`
  - `group_members`
  - `group_invitations`
  - `group_announcements`
  - `sessions`
  - `session_attendance`
  - `session_comments`
  - `events`
  - `event_registrations`
- Tables include relationships, foreign keys, unique indexes, normal indexes, enums, and check constraints.
- Normal seed script: `badminton-web/src/db/seed.ts`.
- Performance seed script: `badminton-web/src/db/seed-performance.ts`.
- `docs/database-schema.md` explains the schema and includes an ERD.
- Official scoring guidance says 2 points per table up to 8 internally, capped at 5. This project exceeds the table requirement.

### Missing / Weak Areas

- No automated backup/restore workflow is committed, but that belongs to the bonus backup category rather than the base database category.

### Why Points Were Deducted

- No points deducted. Database requirements are met.

### Recommended Codex Prompt

```text
Improve database production readiness while preserving the current Drizzle schema:
- add a docs/backup-and-restore.md guide
- add safe restore instructions for Neon/PostgreSQL
- document migration workflow for local, preview, and production environments
- do not change existing migrations unless required by a new feature
```

## Users and Roles - 5 / 5

### Evidence Found

- Register and login are implemented for web via Server Actions in `badminton-web/src/auth/actions.ts`.
- Register and login are implemented for mobile/API via:
  - `badminton-web/src/app/api/auth/login/route.ts`
  - `badminton-web/src/app/api/auth/register/route.ts`
  - `badminton-web/src/services/auth-service.ts`
- Logout is implemented for web through `logoutAction` and for mobile through local token/session clearing in `badminton-mobile/src/auth/auth-context.tsx`.
- Users table includes `role` enum with `admin`, `manager`, `coach`, and `parent`.
- Password hashing uses `bcrypt.hash(..., 12)` for normal auth and bcrypt in seed/performance scripts.
- Password verification uses `bcrypt.compare`.
- JWT generation/verification is implemented with `jose` in `badminton-web/src/auth/token.ts`.
- Protected web routes are enforced in `badminton-web/src/proxy.ts`.
- Protected API routes use Bearer auth through `getApiUser`.
- Admin-only functionality exists and is guarded:
  - `badminton-web/src/app/admin/page.tsx`
  - `badminton-web/src/app/admin/users/page.tsx`
  - `badminton-web/src/app/admin/users/actions.ts`
- Role-based permission helpers are implemented in `badminton-web/src/lib/permissions.ts`.

### Missing / Weak Areas

- No refresh-token system or server-side token revocation list is present.
- Mobile logout clears local token state but does not invalidate the JWT server-side.
- These are production hardening gaps, not required base items in the official criterion.

### Why Points Were Deducted

- No points deducted. Users, roles, authentication, authorization, hashing, JWTs, and admin/special roles are implemented.

### Recommended Codex Prompt

```text
Upgrade authentication incrementally:
- keep the current JWT access token flow
- add optional refresh tokens with secure storage and rotation
- add server-side logout invalidation for refresh tokens
- preserve web cookie auth and mobile Bearer auth
- add tests for login, register, logout, role checks, and protected admin access

Do not rewrite the whole auth system.
```

## Scalability - 5 / 5

### Evidence Found

- API pagination helpers exist in `badminton-web/src/lib/api-validation.ts` and `badminton-web/src/lib/pagination.ts`.
- Paginated API routes include sessions, groups, events, announcements, and session comments.
- Web UI pagination is present for dashboard sessions, groups, events, group detail sublists, admin users, and related workflows.
- Performance seed script creates large data:
  - 3,000 users
  - 2,500 players
  - 50 venues
  - 500 groups
  - 5,000 sessions
  - 15,000 attendance records
  - 15,000 session comments
- The generated performance dataset exceeds the 10,000-record requirement.
- Additional performance indexes are defined in schema and migration `0005_performance_indexes.sql`.
- `docs/performance-test.md` documents the large dataset, tested endpoints, pagination, indexes, and known bottlenecks.
- `scripts/performance-check.mjs` runs API timing checks and writes latest results to `docs/assessments/performance-check-latest.json`.

### Missing / Weak Areas

- Some deep pagination uses offset pagination; keyset pagination would be stronger for very deep pages.
- Session detail attendance is still returned as part of detail data; very large groups would benefit from a dedicated paginated attendance endpoint.

### Why Points Were Deducted

- No points deducted. Pagination, large dataset handling, seed scale, indexes, and performance documentation meet the official requirement.

### Recommended Codex Prompt

```text
Improve large-dataset handling beyond the capstone minimum:
- add a paginated attendance endpoint for session details
- add keyset pagination for sessions and comments where practical
- keep existing page/pageSize API compatibility
- update mobile and web screens incrementally
- add performance tests or assertions for the updated endpoints
```

## Web App - 15 / 15

### Evidence Found

- Next.js App Router web app is implemented in `badminton-web/src/app`.
- Production build passed with `npm run build:web`.
- Build output lists more than 30 web pages/routes, exceeding the 10-screen requirement.
- Screens/workflows include:
  - home
  - login
  - register
  - dashboard
  - profile
  - admin
  - admin users
  - groups
  - group details
  - group create/edit/delete
  - group members
  - group join
  - group session create/edit/delete
  - group announcement create/edit/delete
  - sessions detail
  - venues
  - venue create/edit/delete
  - events
  - event create/detail/edit/delete
- Responsive Tailwind patterns are present throughout pages and components, including `sm:`, `md:`, `lg:`, grid, flex, max-width, and spacing utilities.
- Reusable components exist in `badminton-web/src/components`, including site header, nav link, stat card, session badges, dashboard cards, and UI surfaces.
- UI uses modern visual patterns and lucide icons.
- Protected pages are behind auth middleware/proxy.
- `npm run lint:web` passed.

### Missing / Weak Areas

- README screenshot slots are placeholders and `docs/screenshots` was not found.
- I did not perform visual browser screenshot QA in this assessment; responsiveness was assessed from code patterns and successful build.

### Why Points Were Deducted

- No points deducted. The official Web App requirements are met.

### Recommended Codex Prompt

```text
Polish the web app evaluation package:
- run the app locally
- capture screenshots for dashboard, groups, events, admin users, and mobile-width layouts
- add them under docs/screenshots
- update README screenshot placeholders
- fix any visual overlap or responsiveness issues found during screenshot review

Do not change backend behavior unless a UI bug requires it.
```

## Admin Panel - 5 / 5

### Evidence Found

- Admin dashboard exists at `badminton-web/src/app/admin/page.tsx`.
- Admin users page exists at `badminton-web/src/app/admin/users/page.tsx`.
- Admin user actions exist in `badminton-web/src/app/admin/users/actions.ts`.
- Admin access is protected with server-side role checks:
  - `getCurrentUser()`
  - `canManageUsers(currentUser)`
  - redirect away from admin pages for non-admin users.
- Admin dashboard displays platform totals and shortcuts.
- Admin users page supports user/role management.
- Role helpers and tests exist:
  - `badminton-web/src/lib/permissions.ts`
  - `badminton-web/src/lib/permissions.test.ts`

### Missing / Weak Areas

- Admin audit logs are not implemented.
- Admin role-change history is not stored.
- These would be useful production improvements but are not required by the official admin criterion.

### Why Points Were Deducted

- No points deducted. Admin dashboard, protected routes, admin-only behavior, and user/role management are present.

### Recommended Codex Prompt

```text
Enhance the admin panel without changing its core flow:
- add an admin audit log table and service
- record user role changes with actor, target user, old role, new role, and timestamp
- show recent admin actions on the admin dashboard
- keep all admin routes protected server-side
- add focused tests for audit logging and role-change authorization
```

## Mobile App - 15 / 15

### Evidence Found

- Expo React Native app exists in `badminton-mobile`.
- Expo Router screens are implemented in `badminton-mobile/src/app`.
- `npm run build:mobile` passed and exported `badminton-mobile/dist`.
- Build output listed 13 static mobile web routes.
- Mobile screens include:
  - home
  - login
  - register
  - sessions
  - session details
  - groups
  - group details
  - announcements
  - events
  - event details
  - account
  - not-found/sitemap support from Expo Router
- Mobile app connects to backend REST API through `badminton-mobile/src/lib/api.ts`.
- `BADMINTON_API_URL` is read through `badminton-mobile/app.config.js`.
- Mobile auth uses API login/register and stores tokens through `badminton-mobile/src/auth`.
- Mobile screens send `Authorization: Bearer ${token}` headers for protected API calls.
- End-user functionality includes session viewing, attendance updates, comments, groups, announcements, events, event registration/cancel registration, account, login, logout, and registration.
- `npm run lint:mobile` passed.

### Missing / Weak Areas

- No automated mobile UI tests were found.
- Native device testing was not performed in this assessment; Expo build/export and code inspection were used as evidence.

### Why Points Were Deducted

- No points deducted. The official Expo, API communication, screen count, mobile layout, and end-user functionality requirements are met.

### Recommended Codex Prompt

```text
Add mobile reliability checks:
- add lightweight component or integration tests for auth context and API error handling
- add an Expo web smoke test for login, sessions, session details, attendance, comments, and events
- keep the current Expo Router structure
- document how to run the mobile smoke test locally and before submission
```

## Deployment - 5 / 5

### Evidence Found

- Deployment guide exists at `docs/deployment-guide.md`.
- README lists live evaluation URLs:
  - web/API: `https://badminton-planner-web-may-2026.netlify.app`
  - mobile preview: `https://badminton-planner-mobile-may-2026.netlify.app`
  - API docs: `https://badminton-planner-web-may-2026.netlify.app/api/docs`
- Public deployment checks on 2026-05-20:
  - API docs endpoint returned HTTP 200.
  - Mobile preview returned HTTP 200.
  - Deployed login API returned HTTP 200 and a JWT for seeded admin credentials.
- Web production build passed locally with `npm run build:web`.
- Mobile export passed locally with `npm run build:mobile`.
- Production environment variables are documented:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NEXT_PUBLIC_APP_URL`
  - `BADMINTON_API_URL`
- Environment templates exist:
  - `badminton-web/.env.example`
  - `badminton-mobile/.env.example`
- Expo app reads deployment API URL through `BADMINTON_API_URL`.

### Missing / Weak Areas

- No committed `netlify.toml` or equivalent deployment config was found; deployment is documented through Netlify UI settings instead.
- Real production environment variable values cannot be inspected from the repository, which is correct because secrets should not be committed.

### Why Points Were Deducted

- No points deducted. The live URLs and deployed login API were verified, and required production configuration is documented.

### Recommended Codex Prompt

```text
Make deployment more reproducible:
- add netlify.toml files or root deployment notes for both web/API and mobile preview
- preserve the current Netlify deployment behavior
- document exact build commands, base directories, publish directories, and required environment variables
- do not commit secrets
```

## Documentation - 5 / 5

### Evidence Found

- Root README includes:
  - project description
  - roles
  - feature overview
  - tech stack
  - live demo URLs
  - demo credentials
  - quick start
  - documentation links
- Architecture documentation exists at `docs/architecture.md`.
- Database schema documentation exists at `docs/database-schema.md`.
- Repository structure documentation exists at `docs/repo-structure.md`.
- Local setup guide exists at `docs/setup-guide.md`.
- Deployment guide exists at `docs/deployment-guide.md`.
- Performance documentation exists at `docs/performance-test.md`.
- Root `AGENTS.md` exists and matches the project.
- Package-specific AGENTS files exist in web and mobile.
- Historical assessments exist in `docs/assessments`.

### Missing / Weak Areas

- README screenshot slots are placeholders.
- A short user walkthrough video/link is not present, though not required by the official documentation criterion.

### Why Points Were Deducted

- No points deducted. Documentation requirements are met.

### Recommended Codex Prompt

```text
Improve evaluator-facing documentation:
- replace screenshot placeholders in README with actual screenshots
- add a short demo walkthrough section covering admin, manager, coach, and parent flows
- link the latest assessment and performance report
- keep setup and deployment instructions concise and current
```

## File Storage Bonus - Not Awarded

### Evidence Found

- `users.photoUrl` exists in the database schema.
- Search did not find a complete upload/download API, object storage integration, Cloudflare R2/S3/blob storage client, signed URL generation, or upload UI.

### Missing / Weak Areas

- No file/photo upload/download workflow.
- No object storage integration.
- No signed URLs.
- No storage backup strategy.

### Why Points Were Deducted

- Bonus not awarded because the file storage feature is not implemented.

### Recommended Codex Prompt

```text
Add optional file storage bonus support:
- integrate Cloudflare R2 or another S3-compatible object store
- add secure avatar or venue photo upload
- validate file type and size
- generate signed upload/download URLs where appropriate
- store only public/signed object references in Postgres
- keep local demo mode working without storage credentials

Do not disrupt existing auth, users, venues, or profile flows.
```

## Automated Tests Bonus - Partially Met

### Evidence Found

- Vitest is configured in `badminton-web/vitest.config.ts`.
- Test files exist:
  - `badminton-web/src/lib/api-validation.test.ts`
  - `badminton-web/src/lib/pagination.test.ts`
  - `badminton-web/src/lib/permissions.test.ts`
  - `badminton-web/src/lib/session-status.test.ts`
- `npm run test:web` passed with 4 files and 17 tests.
- `npm run lint:web`, `npm run lint:mobile`, `npm run build:web`, and `npm run build:mobile` passed locally.

### Missing / Weak Areas

- No `.github/workflows` directory was found.
- No CI automation was found.
- No E2E tests with Playwright/Cypress were found.
- No API integration tests against a test database were found.
- Mobile tests were not found.

### Why Points Were Deducted

- Bonus is only partially met because unit tests exist, but integration/E2E tests and GitHub Actions automation are missing.

### Recommended Codex Prompt

```text
Add automated test bonus coverage:
- create GitHub Actions workflow for install, lint:web, lint:mobile, test:web, build:web, and build:mobile
- add API integration tests for auth, sessions, attendance, comments, groups, and events using a test database or mocked DB boundary
- add Playwright smoke tests for login, dashboard, admin users, groups, sessions, events, and mobile web preview
- keep tests deterministic and document required env vars
```

## Automated Backups Bonus - Not Awarded

### Evidence Found

- No backup scripts, scheduled workflows, retention policy, encrypted backup storage, or restore guide were found.
- No `.github/workflows` directory was found.
- File storage is not implemented, so file storage backup is also not applicable yet.

### Missing / Weak Areas

- No automated database backup.
- No scheduled GitHub Actions workflow.
- No retention policy.
- No restore documentation.
- No file storage backup.

### Why Points Were Deducted

- Bonus not awarded because automated backups are not implemented.

### Recommended Codex Prompt

```text
Add optional backup automation:
- create a PostgreSQL/Neon backup script using pg_dump or provider-safe tooling
- create a scheduled GitHub Actions workflow
- upload encrypted backup artifacts to secure external storage
- add retention policy configuration
- add docs/backup-and-restore.md with restore steps
- do not commit credentials or raw backup files
```

## Highest-Impact Next Steps

1. Add GitHub Actions for lint, tests, and builds to strengthen the automated tests bonus.
2. Add actual screenshots to README and `docs/screenshots` for evaluator confidence.
3. Add deployment config files such as `netlify.toml` to make the live deployment reproducible from repository state.
4. Add optional backup automation and restore documentation.
5. Add optional file storage if bonus points become part of the grading configuration.

