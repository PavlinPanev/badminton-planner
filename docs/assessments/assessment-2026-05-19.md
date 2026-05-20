# Full Stack Apps with AI — Capstone Assessment

Date: 2026-05-19
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
| Web App | 14 | 15 |
| Admin Panel | 5 | 5 |
| Mobile App | 14.5 | 15 |
| Deployment | 4 | 5 |
| Documentation | 5 | 5 |
| TOTAL | 97.5 | 100 |

Estimated current capstone score: **97.5 / 100**.

This assessment inspected repository structure, git history, package/workspace setup, Next.js backend routes, auth code, service/data helpers, Drizzle schema and migrations, seed scripts, web pages, mobile screens, docs, deployment signals, generated assets, and bonus areas. Automated checks run during assessment:

- `npm run test --workspace badminton-web`: passed, 4 test files and 17 tests.
- `npm run lint --workspace badminton-web`: passed with 3 unused type-import warnings.
- `npm run lint --workspace badminton-mobile`: passed.

## GitHub Commits — 15 / 15

### Evidence Found
- `git rev-list --count HEAD` reports **54 commits**.
- Commit messages show meaningful progression from repository initialization, Expo setup, database schema, auth, dashboard, attendance, sessions, mobile screens, admin, pagination, performance seed, docs, tests, and validation.
- Recent history includes targeted feature commits such as API validation, pagination, permissions, admin user management, performance indexes, and mobile screen improvements.

### Missing / Weak Areas
- No functional weakness for this criterion.

### Why Points Were Deducted
- No points deducted. The project exceeds the 15-commit maximum scoring threshold.

### Recommended Codex Prompt

```text
Review the git history and identify any noisy or accidental commits that should be cleaned up before final submission.
Do not rewrite history unless I explicitly confirm.
Create a short release summary grouped by feature area, using the current commit history as evidence.
```

## GitHub Commit Days — 15 / 15

### Evidence Found
- Git history contains commits on **2026-05-17**, **2026-05-18**, and **2026-05-19**.
- This satisfies the requirement for commits on at least 3 different days.
- Work appears spread across initialization, feature development, database/auth work, mobile improvements, docs, and performance/scalability additions.

### Missing / Weak Areas
- No functional weakness for this criterion.

### Why Points Were Deducted
- No points deducted. The project meets the 3-day maximum scoring threshold.

### Recommended Codex Prompt

```text
Create a concise development timeline from the git history:
- group commits by date
- summarize what was added each day
- highlight the progression from setup to full-stack implementation
- produce a section suitable for the capstone README
```

## Architecture — 5 / 5

### Evidence Found
- Root `package.json` defines npm workspaces for `badminton-web`, `badminton-mobile`, and `badminton-shared`.
- `badminton-web` is a Next.js app with App Router pages, API routes, auth helpers, Drizzle DB code, server actions, services, and UI components.
- `badminton-mobile` is an Expo React Native app using Expo Router.
- `badminton-shared` contains shared API/user types consumed by web and mobile.
- Mobile communicates with the backend through REST calls in `badminton-mobile/src/lib/api.ts` and screen fetches using `Authorization: Bearer ...`.
- Service/data layers exist in `badminton-web/src/services` and `badminton-web/src/lib`.
- Docs include `docs/architecture.md`, with diagrams and explicit client-server flow.

### Missing / Weak Areas
- Some backend business logic is split between `src/services` and data helpers under `src/lib`; this is acceptable, but the boundary could be documented more tightly.
- Web Server Actions still contain some direct database access, especially auth and admin role updates. This does not break the criterion, but a stricter production architecture would push more mutation logic into services.

### Why Points Were Deducted
- No points deducted. The implementation clearly satisfies monorepo, Next.js, Expo, client-server, REST, service/data separation, and modular organization requirements.

### Recommended Codex Prompt

```text
Inspect the web backend architecture and tighten service-layer consistency:
- move reusable mutation business logic out of Server Actions into service modules
- keep route handlers and actions focused on parsing, auth, redirects, and responses
- preserve the current folder structure and avoid broad rewrites
- update docs/architecture.md with the final service boundary
```

## Backend — 5 / 5

### Evidence Found
- Next.js backend is implemented under `badminton-web/src/app/api`.
- REST API routes include auth, groups, sessions, attendance, comments, events, registrations, announcements, and docs.
- Database persistence is handled through Drizzle in `badminton-web/src/db`.
- Authentication exists through JWT helpers in `badminton-web/src/auth/token.ts`, web cookies in `session.ts`, and Bearer token validation in `api.ts`.
- Password login and registration are implemented in `badminton-web/src/services/auth-service.ts`.
- Authorization checks exist in route/service/data flows, including group access, session access, attendance ownership, comment editing, event actions, and admin pages.
- Business logic is meaningfully separated into service modules such as `auth-service.ts`, `groups-service.ts`, `sessions-service.ts`, `events-service.ts`, and `announcements-service.ts`.

### Missing / Weak Areas
- No refresh-token rotation or token revocation list is present. This is not required by the official base criterion, but it would improve production readiness.
- CORS is currently permissive for API routes (`Access-Control-Allow-Origin: *`), which is convenient for evaluation but should be restricted in production.

### Why Points Were Deducted
- No points deducted. The required backend capabilities are present and supported by real code.

### Recommended Codex Prompt

```text
Harden the backend authentication and API security without changing the app architecture:
- restrict CORS by environment-configured allowed origins
- add JWT expiration handling documentation and client behavior
- optionally add refresh-token storage and logout invalidation
- keep existing REST response shapes stable
- add focused tests for unauthorized, forbidden, and expired-token API cases
```

## Database — 5 / 5

### Evidence Found
- PostgreSQL/Neon support is configured through `badminton-web/drizzle.config.ts` and `DATABASE_URL`.
- Drizzle schema exists at `badminton-web/src/db/schema.ts`.
- Committed migrations exist under `badminton-web/drizzle`, including performance index migration `0005_performance_indexes.sql`.
- Schema defines more than the minimum 4 tables: users, players, venues, groups, group members, invitations, announcements, sessions, attendance, comments, events, and event registrations.
- Relationships are defined with Drizzle `relations(...)`.
- Indexes and unique indexes exist for common lookup paths such as users by email, sessions by group/date/venue/coach, attendance by session/player, comments by session/time, event registrations, and group membership.
- Seed scripts exist: `src/db/seed.ts` and `src/db/seed-performance.ts`.

### Missing / Weak Areas
- Migration metadata should be kept synchronized carefully if migrations are edited manually.
- No database restore/backup workflow is committed, but that belongs to the bonus backup criterion rather than the base database criterion.

### Why Points Were Deducted
- No points deducted. The table count alone exceeds the internal 2-points-per-table guidance, and the final database score is capped at 5.

### Recommended Codex Prompt

```text
Audit the Drizzle database layer for final submission:
- verify migration metadata matches committed SQL migrations
- document every table relationship and important index
- add a short migration/seed verification checklist
- do not change schema unless an inconsistency is found
```

## Users and Roles — 5 / 5

### Evidence Found
- Register and login exist for both web and REST API flows.
- Web logout exists through `logoutAction()` clearing the session cookie.
- Mobile logout exists in `badminton-mobile/src/auth/auth-context.tsx` by clearing stored token/user values.
- `users` table has email, password hash, name, role, photo URL, created/updated timestamps.
- Roles are modeled as `admin`, `manager`, `coach`, and `parent`.
- Password hashing uses bcrypt with a cost factor of 12 for registration.
- JWT creation and verification are implemented with `jose`.
- Admin-only functionality exists under `/admin` and `/admin/users`, guarded server-side.
- Admin user management can update global user roles and prevents demoting the last admin.
- Permission helpers exist in `badminton-web/src/lib/permissions.ts` with tests.

### Missing / Weak Areas
- No password reset or email verification flow was found. These are production features but not required by the official base criterion.
- Mobile logout is local-token logout only; there is no backend token invalidation because JWTs are stateless.

### Why Points Were Deducted
- No points deducted. Register, login, logout, users, roles, authentication, authorization, password hashing, JWT tokens, and admin/special roles are implemented.

### Recommended Codex Prompt

```text
Upgrade users and roles toward production readiness:
- add password reset request and reset-confirm flows
- add server-side tests for admin-only and manager/coach/parent permissions
- document the role matrix in README and docs/architecture.md
- preserve existing JWT/session behavior unless a safe token revocation design is added
```

## Scalability — 5 / 5

### Evidence Found
- API pagination is implemented via `parsePaginationParams`, `paginationMeta`, `limit`, and `offset`.
- REST list endpoints for groups, sessions, events, announcements, and comments expose paging metadata.
- UI pagination exists in web pages such as dashboard, admin users, groups/events, and group details.
- Mobile list screens request paged API results using `page` and `pageSize`.
- `badminton-web/src/db/seed-performance.ts` creates a large performance dataset:
  - 3,000 users
  - 2,500 players
  - 50 venues
  - 500 groups
  - 5,000 sessions
  - 15,000 attendance records
  - 15,000 comments
  - plus memberships and related rows
- Performance indexes are present in schema and migration files.
- `scripts/performance-check.mjs` and `docs/performance-test.md` document performance verification.

### Missing / Weak Areas
- Pagination is offset-based rather than cursor-based; acceptable for the requirement, but cursor pagination would scale better for very large changing datasets.
- Automated performance checks are local/script-based, not part of CI.

### Why Points Were Deducted
- No points deducted. The requirement asks for pagination, large dataset handling, at least 10,000 seeded records, indexes, and performance considerations; all are represented.

### Recommended Codex Prompt

```text
Strengthen scalability verification:
- add automated performance smoke checks for key API list endpoints
- record expected response-time thresholds in docs/performance-test.md
- consider cursor pagination for sessions, comments, and events
- preserve the existing page/pageSize API contract for mobile compatibility
```

## Web App — 14 / 15

### Evidence Found
- More than 10 web pages/routes exist, including home, login, register, dashboard, profile, groups, group details, group edit/delete, members, sessions, session details, venues, venue create/edit/delete, events, event details/create/edit/delete, admin dashboard, and admin users.
- Reusable web components exist in `badminton-web/src/components`, including site header, nav links, stat cards, dashboard session cards, session badges, and shared surface components.
- Tailwind CSS is used via Next/Tailwind configuration and app styles.
- Protected pages use server-side authentication redirects.
- Web UI covers manager and coach workflows: groups, sessions, attendance, comments, events, venues, invitations, members, and profile.
- Profile/settings page exists at `badminton-web/src/app/profile/page.tsx`.
- Lint passes with warnings only.

### Missing / Weak Areas
- No Playwright or browser screenshot verification was found for desktop/mobile browser responsiveness.
- README screenshot placeholders exist, but actual web screenshots were not found.
- Some UI uses large decorative gradient sections; the app is functional, but final capstone polish would benefit from verified screenshots and a slightly more operations-focused visual pass.

### Why Points Were Deducted
- Deducted 1 point because responsiveness and visual polish were inspected from code structure, not verified in-browser with screenshots, and screenshot/generated visual evidence is incomplete.

### Recommended Codex Prompt

```text
Polish and verify the web app UI for final capstone review:
- run the app locally and capture screenshots for dashboard, groups, session detail, events, admin, and profile
- check desktop and mobile browser layouts
- fix any text overflow, spacing, or responsive issues found
- save screenshots under docs/screenshots and update README links
- keep changes focused on UI polish and evidence, not new features
```

## Admin Panel — 5 / 5

### Evidence Found
- Admin dashboard exists at `badminton-web/src/app/admin/page.tsx`.
- Admin user management exists at `badminton-web/src/app/admin/users/page.tsx`.
- Admin pages check `getCurrentUser()` and redirect non-admins to `/dashboard`.
- Admin role checks use `canManageUsers`.
- User role update action enforces admin-only access server-side.
- Role management includes protection against demoting the last admin.
- Admin dashboard exposes platform-wide totals and shortcuts to users, groups, venues, and events.

### Missing / Weak Areas
- No dedicated tests were found for admin page redirects or admin role mutation behavior.
- Admin features are sufficient, but could be expanded with audit logs or user search/filtering.

### Why Points Were Deducted
- No points deducted. The admin dashboard, protected admin routes, and user/role management satisfy the criterion.

### Recommended Codex Prompt

```text
Add focused admin-panel hardening:
- add tests or route-level checks proving non-admin users cannot update roles
- add search and role filtering to /admin/users
- add a small audit trail for role changes
- preserve the current admin UI and last-admin protection
```

## Mobile App — 14.5 / 15

### Evidence Found
- Expo React Native app is configured in `badminton-mobile/package.json` and `app.json`.
- Expo Router layout exists in `badminton-mobile/src/app/_layout.tsx`.
- Mobile screens exceed the 5-screen requirement: index, login, register, sessions, session details, groups, group details, announcements, events, event details, and account.
- Mobile app connects to the backend REST API using `badminton-mobile/src/lib/api.ts`.
- Screens use Bearer tokens for protected API calls.
- Auth context handles login, register, logout, token restore, and protected navigation.
- Native token storage uses Expo SecureStore, with localStorage fallback for web.
- End-user functionality includes session viewing, attendance actions, comments, event registration/cancellation, groups, announcements, and account/logout.
- Reusable mobile components and theme files exist.
- Mobile lint passed.
- Expo web export was generated successfully with `npm run build --workspace badminton-mobile`, producing `badminton-mobile/dist`.
- README and deployment docs now include a Netlify mobile preview URL placeholder for final replacement.

### Missing / Weak Areas
- No automated mobile UI tests or screenshot evidence were found.
- Mobile app appears focused on parent/player workflows, which matches the requirement, but coach/manager mobile workflows are limited compared to web.

### Why Points Were Deducted
- Deducted 0.5 point because the mobile implementation and export are strong, but screenshot evidence and real-device verification are still not committed.

### Recommended Codex Prompt

```text
Prepare the Expo mobile app for capstone evaluation:
- run an Expo web export or EAS preview build
- document the preview/build URL in README
- capture screenshots for login, sessions, session details, events, group details, and account
- verify BADMINTON_API_URL works from a real device or Expo Go
- fix any layout issues found during device testing
```

## Deployment — 4 / 5

### Evidence Found
- Build/dev scripts exist for root, web, and mobile.
- Docs now target Netlify for the Next.js web/API app, Neon for PostgreSQL, and Netlify-hosted Expo web export for mobile evaluation.
- Required environment variables are referenced in code/docs:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `BADMINTON_API_URL`
  - `NEXT_PUBLIC_APP_URL`
- Mobile Expo config reads `BADMINTON_API_URL`.
- Database config supports Neon-compatible PostgreSQL.
- `badminton-web/.env.example` and `badminton-mobile/.env.example` are committed with safe placeholder values.
- `docs/deployment-guide.md` documents Netlify build settings, Neon setup, environment variables, demo accounts, and smoke tests.
- README includes assumed evaluation URLs:
  - `https://badminton-planner-web-may-2026.netlify.app`
  - `https://badminton-planner-mobile-may-2026.netlify.app`
  - `https://badminton-planner-web-may-2026.netlify.app/api/docs`
- Expo mobile web export was generated locally into `badminton-mobile/dist`.

### Missing / Weak Areas
- The documented Netlify URLs are assumed evaluation URLs and still need to be replaced with the final real URLs before submission if the site names differ.
- Public app functionality was not verified by Codex against a live Netlify deployment.
- No Netlify build logs or deployment badges are committed.

### Why Points Were Deducted
- Deducted 1 point because deployment documentation, env templates, assumed URLs, and Expo export evidence are present, but Codex did not verify the public Netlify deployments directly.

### Recommended Codex Prompt

```text
Verify final deployment evidence for the capstone:
- replace assumed Netlify URLs with final deployed URLs
- open the web app, API docs endpoint, and mobile preview
- confirm seeded demo credentials work
- capture final deployment screenshots or build logs
- keep .env.example files generic and do not commit real secrets
```

## Documentation — 5 / 5

### Evidence Found
- Root `README.md` includes project description, tech stack, roles, features, REST API overview, screenshots section, assumed live demo URLs, seeded demo credentials, quick start, and docs links.
- `docs/architecture.md` explains monorepo, frontend, backend, mobile, service layer, request flow, auth flow, API communication, and database access.
- `docs/database-schema.md` documents database schema.
- `docs/deployment-guide.md` documents Netlify, Neon, JWT secrets, database URL, mobile API URL, Expo export, and smoke testing.
- `docs/repo-structure.md` documents repository organization.
- `docs/setup-guide.md` documents local setup, environment variables, migrations, seeding, and troubleshooting.
- `docs/performance-test.md` documents performance testing.
- Root `AGENTS.md` exists, with app-specific `AGENTS.md` files in web and mobile.
- Historical assessments exist under `docs/assessments`, including 2026-05-18 and this 2026-05-19 report.
- App-specific README files now describe the web and mobile packages instead of framework starter text.

### Missing / Weak Areas
- README screenshot paths are placeholders; actual screenshot files were not found.
- The Netlify URLs are assumed evaluation URLs and should be replaced with the final deployed URLs before submission if they differ.

### Why Points Were Deducted
- No points deducted. The required documentation areas are covered; final URL replacement remains an operational checklist item.

### Recommended Codex Prompt

```text
Finalize capstone documentation before submission:
- replace assumed Netlify URLs with final live deployed links if they differ
- replace screenshot placeholders with actual files under docs/screenshots
- run through the deployment-guide smoke test and record any final notes
- keep docs consistent with current scripts, routes, env vars, and seeded demo accounts
```

## File Storage Bonus — Not Awarded

### Evidence Found
- `users.photoUrl` exists in the schema and shared types.
- Documentation/search mentions photo URL fields.

### Missing / Weak Areas
- No upload/download API was found.
- No Cloudflare R2, S3, blob, signed URL, or object storage integration was found.
- No upload UI was found.
- No file validation or storage backup strategy was found.

### Why Points Were Deducted
- Bonus not awarded because a complete file storage implementation is not present.

### Recommended Codex Prompt

```text
Add optional file storage bonus support:
- integrate Cloudflare R2 or another S3-compatible provider
- add secure avatar or venue photo upload
- validate file type and size
- generate signed upload/download URLs where appropriate
- store only public/signed file references in the database
- keep local demo mode working without storage credentials
```

## Automated Tests Bonus — Partially Present

### Evidence Found
- Vitest is configured for `badminton-web`.
- Test files exist for API validation, pagination, permissions, and session status.
- Assessment run passed: 4 test files, 17 tests.

### Missing / Weak Areas
- No integration tests for REST API routes were found.
- No E2E tests with Playwright/Cypress were found.
- No mobile tests were found.
- No GitHub Actions workflow was found.

### Why Points Were Deducted
- Bonus only partially supported. Unit tests exist and pass, but integration/E2E/CI automation is missing.

### Recommended Codex Prompt

```text
Expand automated test coverage for the capstone:
- add API route integration tests for auth, sessions, attendance, comments, events, and admin permissions
- add Playwright smoke tests for login, dashboard, groups, sessions, events, admin, and profile
- add a GitHub Actions workflow that runs lint, tests, and build checks
- keep tests deterministic and avoid requiring production secrets
```

## Automated Backups Bonus — Not Awarded

### Evidence Found
- No backup scripts, scheduled workflows, retention policy, or restore guide were found.

### Missing / Weak Areas
- No automated database backup.
- No file storage backup.
- No GitHub Actions scheduled workflow.
- No retention policy.

### Why Points Were Deducted
- Bonus not awarded because backup automation is not implemented.

### Recommended Codex Prompt

```text
Add optional backup automation:
- create a database backup script for PostgreSQL/Neon
- add a scheduled GitHub Actions workflow
- store encrypted backup artifacts in a secure external location
- define retention policy settings
- document restore steps in docs/backup-and-restore.md
- do not commit credentials or raw backup files
```

## Highest-Impact Next Steps

1. Verify the assumed Netlify URLs and replace them with final production URLs if needed.
2. Replace README placeholder screenshots with real capstone evidence.
3. Add API integration tests and GitHub Actions CI.
4. Add browser/mobile screenshot verification for final UI confidence.
5. Optionally implement file storage and backups for bonus readiness.
