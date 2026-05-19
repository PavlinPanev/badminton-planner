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
| Architecture | 4 | 5 |
| Backend | 4 | 5 |
| Database | 5 | 5 |
| Users and Roles | 4 | 5 |
| Scalability | 4 | 5 |
| Web App | 14 | 15 |
| Admin Panel | 3 | 5 |
| Mobile App | 14 | 15 |
| Deployment | 1 | 5 |
| Documentation | 5 | 5 |
| TOTAL | 88 | 100 |

Estimated current capstone score: **88 / 100**.

Bonus items reviewed but not added to the base score:

| Bonus Area | Status |
|---|---|
| File Storage | Not implemented |
| Automated Tests | Not implemented |
| Automated Backups | Not implemented |

Historical assessment note: this report was saved as a new dated assessment. A previous assessment exists at `docs/assessments/assessment-2026-05-18.md`.

## GitHub Commits — 15 / 15

### Evidence Found
- `git rev-list --count HEAD` reports **43 commits**.
- The history shows meaningful project progression across setup, database, auth, web workflows, mobile features, performance work, and documentation.
- The current repository contains committed implementation for the monorepo, Next.js web app, Expo mobile app, Drizzle schema/migrations, REST API routes, and capstone documentation.

### Missing / Weak Areas
- No weakness for the commit-count criterion.
- Some local working-tree changes may still be uncommitted, so final submission should use clean, meaningful commits.

### Why Points Were Deducted
- No points deducted. The requirement caps at 15 points and the repository exceeds 15 commits.

### Recommended Codex Prompt

```text
Review the current working tree and prepare a clean final commit sequence for the capstone.
Group changes by purpose:
- performance seed and indexes
- API pagination
- web UI pagination
- mobile fixes
- documentation and assessment

Do not squash unrelated work together.
Run lint/build/type checks before the final commits and summarize the results.
```

## GitHub Commit Days — 15 / 15

### Evidence Found
- `git log --date=short --pretty=format:%ad` shows commits on **2026-05-17**, **2026-05-18**, and **2026-05-19**.
- That is 3 distinct commit days.
- Official scoring is 5 points per day, capped at 15.

### Missing / Weak Areas
- No weakness for this criterion.

### Why Points Were Deducted
- No points deducted. The repository has commits on at least 3 different days.

### Recommended Codex Prompt

```text
Inspect my git history and suggest whether the final capstone commits tell a clear implementation story.
Identify any large mixed commits that should be explained in the README or project defense notes.
Do not rewrite history unless I explicitly ask.
```

## Architecture — 4 / 5

### Evidence Found
- Root `package.json` uses npm workspaces for `badminton-web` and `badminton-mobile`.
- `badminton-web/` is a Next.js app with App Router pages, API routes, auth, database, services/data modules, UI components, and Drizzle migrations.
- `badminton-mobile/` is an Expo React Native app using Expo Router and REST API communication.
- `badminton-shared/` exists as a shared package location for TypeScript types and cross-app utilities.
- Web app communication uses Server Actions for form workflows and REST API routes for mobile clients.
- Mobile app communicates with the backend through `badminton-mobile/src/lib/api.ts` using `BADMINTON_API_URL` and Bearer tokens.
- Backend logic is partly separated into service/data modules such as `session-data.ts`, `group-data.ts`, `event-data.ts`, and `venue-data.ts`.

### Missing / Weak Areas
- `badminton-shared/src` appears empty or underused, so shared TypeScript models are not fully realized.
- Some route handlers and Server Actions still contain business logic directly instead of consistently delegating to services.
- There is no dedicated repository layer; the project uses service/data modules plus direct Drizzle queries.

### Why Points Were Deducted
- Deducted 1 point for incomplete shared package usage and partially mixed route/action/service responsibilities.

### Recommended Codex Prompt

```text
Refactor the architecture incrementally:
- move stable API response types into badminton-shared
- import those types from both badminton-web and badminton-mobile
- keep route handlers thin by moving event, group, and announcement query logic into service/data modules
- preserve all existing routes, forms, and API response shapes
- do not rewrite the app structure

Run TypeScript checks for web, mobile, and shared packages after the refactor.
```

## Backend — 4 / 5

### Evidence Found
- Next.js backend exists under `badminton-web`.
- RESTful API endpoints exist for auth, sessions, session attendance, session comments, events, event registration, announcements, and API docs.
- Database persistence uses Drizzle ORM and PostgreSQL/Neon configuration.
- JWT generation and verification exist in `badminton-web/src/auth/token.ts`.
- Bearer-token API authentication exists in `badminton-web/src/auth/api.ts`.
- Web session handling exists through auth actions, cookies, and protected-page proxy logic.
- Authorization checks exist in service/action paths for group management, session management, attendance ownership, comments, venue management, and event management.
- Business logic is meaningfully separated in several files under `badminton-web/src/lib`.

### Missing / Weak Areas
- Manual validation is used in many places; no consistent schema validation layer such as Zod was found.
- Some API route handlers still perform direct database queries and business decisions.
- Token handling is capstone-appropriate but not production-grade refresh-token/session-rotation architecture.

### Why Points Were Deducted
- Deducted 1 point for inconsistent validation/service separation and limited production auth hardening.

### Recommended Codex Prompt

```text
Upgrade the backend API architecture without changing behavior:
- add reusable validation helpers or Zod schemas for auth, pagination, events, comments, and attendance inputs
- keep route handlers thin: parse input, call service, return stable JSON
- move remaining direct route-handler business logic into services
- preserve the existing REST endpoints and response shapes
- keep all authorization checks server-side

Run web lint and TypeScript checks after the refactor.
```

## Database — 5 / 5

### Evidence Found
- Drizzle configuration exists in `badminton-web/drizzle.config.ts`.
- PostgreSQL schema exists in `badminton-web/src/db/schema.ts`.
- Migration SQL is committed under `badminton-web/drizzle/`, including performance indexes in `0005_performance_indexes.sql`.
- The schema has well over the required 4 tables, including `users`, `players`, `venues`, `groups`, `group_members`, `group_invitations`, `group_announcements`, `sessions`, `session_attendance`, `session_comments`, `events`, and `event_registrations`.
- Drizzle relations are defined for users, players, groups, memberships, invitations, announcements, sessions, attendance, comments, events, and registrations.
- Indexes exist for frequent query paths including user email, player parent, group venue, memberships, session group/date/venue/coach, attendance session/player, comments session/time, event date, and registrations.
- Normal and performance seed scripts exist.

### Missing / Weak Areas
- No major weakness for the database criterion.
- One minor maintenance risk: verify the Drizzle migration metadata stays synchronized after manual migration files.

### Why Points Were Deducted
- No points deducted. The database implementation exceeds the table-count requirement and includes relationships, migrations, seeds, and indexes.

### Recommended Codex Prompt

```text
Audit the Drizzle database layer for final submission:
- verify every schema change has a corresponding migration
- verify migration metadata is consistent
- document all tables and relationships in docs/database-schema.md
- confirm seed and performance seed scripts still run against a local Neon/Postgres database
- do not drop or rewrite existing tables
```

## Users and Roles — 4 / 5

### Evidence Found
- Web register, login, and logout flows exist.
- Mobile login/logout and token storage exist.
- Mobile register screen exists.
- Password hashing uses `bcrypt`.
- JWT token generation and verification use `jose`.
- Roles exist: `admin`, `manager`, `coach`, and `parent`.
- Group membership roles exist: `manager`, `coach`, `parent`, and `player`.
- Seed data includes admin, manager, coach, and parent users.
- Server-side authorization checks exist for group creation/edit/delete, member management, sessions, attendance, comments, venues, and events.
- Group member management includes promotion/demotion workflows for group managers.

### Missing / Weak Areas
- No dedicated global admin user-management panel was found.
- No UI was found for changing a user's global platform role.
- Auth does not include refresh tokens, token revocation lists, or advanced session rotation.

### Why Points Were Deducted
- Deducted 1 point because authentication and authorization are strong for the capstone, but global admin/user-role management is incomplete.

### Recommended Codex Prompt

```text
Add global admin user management:
- create an admin-only /admin/users page
- list users with email, name, role, and created date
- allow admins to change global user roles
- enforce admin-only access server-side
- add pagination to the user list
- keep group-level member management unchanged
- add clear empty/error states

Do not change the existing login/register/logout behavior.
```

## Scalability — 4 / 5

### Evidence Found
- Performance seed script exists at `badminton-web/src/db/seed-performance.ts`.
- Root and web package scripts include `db:seed:performance`.
- Performance documentation exists at `docs/performance-test.md`.
- The performance seed is deterministic and uses clearly marked demo addresses such as `performance.user1@badminton.test`.
- The seed script is scoped to performance data and avoids intentionally deleting unrelated production data.
- Dataset targets meet the requirement: 3,000 users, 500 groups, 5,000 sessions, 10,000+ attendance records, and 10,000+ comments.
- Database indexes were added for key large-list and foreign-key access paths.
- API pagination helpers return metadata including `page`, `pageSize`, `totalCount`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.
- Sessions, events, comments, groups, and dashboard lists use paging.
- Web list pages include pagination controls for groups, events, and dashboard session lists.
- Mobile sessions and events screens use paged loading.

### Missing / Weak Areas
- Announcements API still slices rows in memory after fetching matching rows.
- Some detail pages necessarily load related records, and very large single-group pages could still benefit from member/comment/attendance sub-pagination.
- No automated performance benchmark script or timing report was found beyond the seed and documentation.

### Why Points Were Deducted
- Deducted 1 point for remaining in-memory pagination in announcements and limited measurable performance benchmark automation.

### Recommended Codex Prompt

```text
Finish scalability hardening:
- convert /api/announcements to database-level pagination
- add pagination for large group detail sublists where needed: members, players, announcements, sessions
- add a lightweight test:performance script that calls key paginated APIs and records response times
- document measured timings in docs/performance-test.md
- preserve current response shapes and mobile behavior

Run lint, TypeScript checks, migration, and the performance seed after changes.
```

## Web App — 14 / 15

### Evidence Found
- Next.js App Router web app exists.
- Route surface exceeds the minimum 10 screens/pages/popups:
  - home
  - login
  - register
  - dashboard
  - groups list
  - group details
  - group create/edit/delete
  - group members
  - group join
  - group session create/edit/delete
  - group announcement create/edit/delete
  - sessions detail
  - venues list/create/edit/delete
  - events list/create/detail/edit/delete
- Tailwind CSS is used throughout.
- Reusable UI components exist under `badminton-web/src/components`.
- Server Actions power web form workflows.
- UI includes loading/empty/error-oriented components and pagination controls for important large lists.
- The app supports manager and coach workflows for groups, sessions, attendance, comments, venues, announcements, and events.

### Missing / Weak Areas
- No dedicated profile/settings page was found.
- No dedicated global admin panel route was found.
- Some large detail screens could still be split further for very large group membership datasets.

### Why Points Were Deducted
- Deducted 1 point for missing profile/settings and dedicated global admin panel coverage. The web app otherwise satisfies the screen-count and workflow breadth requirements strongly.

### Recommended Codex Prompt

```text
Round out the web app for final capstone polish:
- add a profile/settings page for the signed-in user
- add a dedicated /admin dashboard for global admin workflows
- keep existing groups, sessions, venues, and events pages unchanged except for navigation links
- ensure protected routes redirect unauthenticated users
- add responsive empty/loading/error states where missing

Run web lint and build after implementation.
```

## Admin Panel — 3 / 5

### Evidence Found
- `admin` role exists in schema and seed data.
- Admins receive broad access in service functions such as group/session management.
- Group managers have a strong special-user dashboard/workflow through group detail and group members pages.
- Group member management supports assigning coaches, removing users/players, and promoting/demoting group managers.
- Manager/admin checks exist for venues and events.

### Missing / Weak Areas
- No dedicated `/admin` route or global admin dashboard was found.
- No global user/role management page was found.
- Admin behavior is implemented through service checks and manager-oriented pages rather than a clearly separated admin panel.

### Why Points Were Deducted
- Deducted 2 points because admin/special-user workflows exist, but the official criterion asks for an admin dashboard/panel and user/role management or equivalent protected admin features.

### Recommended Codex Prompt

```text
Implement a focused admin panel:
- add /admin as an admin-only route
- show summary cards for users, groups, sessions, events, venues, and performance seed data
- add /admin/users with paginated user and role management
- reuse existing web UI components
- enforce admin-only access server-side in page loaders and actions
- add links from the main navigation only for admin users

Do not remove existing manager/group workflows.
```

## Mobile App — 14 / 15

### Evidence Found
- Expo React Native app exists in `badminton-mobile`.
- Expo Router screens include home, login, register, sessions, session details, events, event details, and announcements.
- Mobile app connects to backend REST APIs through `badminton-mobile/src/lib/api.ts`.
- Mobile auth context stores and sends Bearer tokens.
- Session list supports paginated loading and refresh.
- Event list supports paginated loading and refresh.
- Session details supports attendance updates and comments.
- Event details supports registration and cancellation workflows.
- Announcements screen connects to the announcements API.
- Reusable mobile UI components and theme files exist.

### Missing / Weak Areas
- No mobile group list/group detail screen was found.
- No dedicated account/profile screen was found.
- Shared package types are not fully used by the mobile app.

### Why Points Were Deducted
- Deducted 1 point for missing mobile groups/account coverage and limited shared model reuse. The Expo app otherwise strongly meets the mobile criterion.

### Recommended Codex Prompt

```text
Complete the mobile capstone surface:
- add My Groups and Group Details screens
- add an Account/Profile screen with user info and logout
- connect the group screens to efficient REST endpoints
- reuse the existing mobile theme and navigation
- move repeated API response types into badminton-shared where practical
- preserve current sessions, events, announcements, auth, attendance, and comments behavior

Run mobile lint and TypeScript checks after implementation.
```

## Deployment — 1 / 5

### Evidence Found
- Build/development scripts exist for the web and mobile packages.
- Environment variables are documented in `docs/setup-guide.md`.
- `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, and `BADMINTON_API_URL` are referenced in docs/code.
- Expo config reads the API URL from environment configuration.
- README has placeholders for live demo URLs.

### Missing / Weak Areas
- No public web deployment URL was verified.
- No public Expo/mobile deployment or export URL was verified.
- No Vercel/Netlify/Fly/Render deployment config was found.
- No EAS config was found.
- No `.env.example` files were verified.
- Production environment configuration cannot be verified from the repository.

### Why Points Were Deducted
- Deducted 4 points because deployment is not verifiable. Local setup is documented, but the criterion asks for publicly working deployed apps and production configuration.

### Recommended Codex Prompt

```text
Prepare the project for deployment:
- add .env.example files for root, badminton-web, and badminton-mobile
- add docs/deployment-guide.md covering Vercel/Next.js, Neon, JWT_SECRET, and Expo export or EAS
- add production readiness checks for DATABASE_URL and JWT_SECRET
- deploy the web app and mobile export
- update README live demo URLs after deployment
- never commit real secrets

Verify the deployed API docs, login, events, sessions, and mobile API connection.
```

## Documentation — 5 / 5

### Evidence Found
- Root `README.md` is project-specific and includes description, roles, features, tech stack, screenshots placeholders, live demo placeholders, demo credentials, quick start, and documentation links.
- `docs/architecture.md` includes architecture explanation and Mermaid diagrams.
- `docs/database-schema.md` documents tables, relationships, indexes, and ERD-style Mermaid content.
- `docs/repo-structure.md` explains the monorepo folders and workspace strategy.
- `docs/setup-guide.md` covers local requirements, install, env vars, database setup, and running web/mobile/monorepo.
- `docs/performance-test.md` documents the large dataset performance setup.
- `AGENTS.md` exists and gives project-specific development guidance.
- API docs endpoint exists at `/api/docs`.

### Missing / Weak Areas
- Deployment documentation is the main remaining documentation gap.
- Live demo URLs are still placeholders.

### Why Points Were Deducted
- No points deducted for the documentation criterion. The required documentation set is present and evaluator-friendly, with deployment handled separately under the deployment criterion.

### Recommended Codex Prompt

```text
Add final documentation polish:
- add docs/deployment-guide.md
- add a screen map for web and mobile routes
- update README live demo links after deployment
- add final screenshots for web and mobile
- ensure docs stay consistent with current routes, scripts, and env vars

Do not include real credentials or secrets.
```

## File Storage Bonus — Not implemented

### Evidence Found
- Search found schema fields such as photo/avatar URLs in some contexts, but no complete upload/download feature.
- No Cloudflare R2, S3, signed URL, upload API, or object storage integration was found.

### Missing / Weak Areas
- No upload UI.
- No object storage provider integration.
- No signed URL flow.
- No storage backup strategy.

### Recommended Codex Prompt

```text
Add optional file storage support:
- integrate Cloudflare R2 or another S3-compatible storage provider
- add secure venue or player photo upload
- validate file type and size
- store object keys or public URLs in the database
- use signed URLs where appropriate
- document all required env vars

Keep the app functional in local demo mode without storage credentials.
```

## Automated Tests Bonus — Not implemented

### Evidence Found
- No Vitest/Jest/Playwright/Cypress test files were found.
- No `.github/workflows` CI configuration was found.
- Package scripts do not expose a normal automated test suite.

### Missing / Weak Areas
- No unit tests.
- No integration tests.
- No E2E tests.
- No CI automation.

### Recommended Codex Prompt

```text
Add a focused automated test suite:
- add Vitest for service/helper tests
- test pagination helpers, auth validation helpers, session status logic, and permission helpers
- add Playwright smoke tests for login, dashboard, groups, sessions, and events
- add GitHub Actions to run lint, TypeScript checks, build, and tests
- keep tests deterministic and avoid real production services

Start small and prioritize high-risk business logic.
```

## Automated Backups Bonus — Not implemented

### Evidence Found
- No backup scripts were found.
- No scheduled GitHub Actions workflows were found.
- No retention policy or restore guide was found.

### Missing / Weak Areas
- No automated database backup.
- No file storage backup.
- No scheduled execution.
- No restore procedure.

### Recommended Codex Prompt

```text
Add optional backup automation:
- create a database backup script for PostgreSQL/Neon
- add a scheduled GitHub Actions workflow
- store backups in a secure external location
- include retention policy settings
- document restore steps
- use GitHub Actions secrets for credentials

Do not commit database dumps or secrets.
```

## Highest-Impact Next Steps

1. Add a dedicated global admin panel with paginated user/role management.
2. Add deployment guide, `.env.example` files, and public deployed URLs.
3. Move shared API models into `badminton-shared` and use them from web/mobile.
4. Replace remaining in-memory pagination in announcements and large detail sublists.
5. Add tests and CI for bonus credibility and safer final submission.
