# Performance Test

## Purpose

The performance test validates that Badminton Club Planner remains responsive with a large local demo dataset. It focuses on list-heavy workflows that can become slow when the database contains many groups, sessions, attendance rows, and comments.

The dataset is generated data only. It does not use real names, email addresses, clubs, venues, players, attendance notes, or comments.

## Generated Dataset

Run the performance seed to create:

| Record Type | Count |
| --- | ---: |
| Users | 3,000 |
| Players | 2,500 |
| Venues | 50 |
| Groups | 500 |
| Sessions | 5,000 |
| Attendance records | 15,000 |
| Session comments | 15,000 |

The session load is intentionally concentrated in the first three performance groups to stress dashboard, session, attendance, and comment queries.

## Safety Model

The performance seed is separate from the normal development seed.

- It refuses to run with `NODE_ENV=production`.
- It deletes only records with performance-specific naming and email prefixes.
- Generated users use emails like `performance.user1@badminton.test`.
- Generated groups use names like `Performance Group 1`.
- Generated venues use names like `Performance Venue 1`.
- The normal `db:seed` script is unchanged.

## How To Run

From the repository root:

```bash
npm install
npm run db:migrate
npm run db:seed:performance
npm run test:performance
```

Or from the web workspace:

```bash
npm run db:migrate --workspace badminton-web
npm run db:seed:performance --workspace badminton-web
```

`npm run test:performance` expects the web app to be running locally. By default it calls `http://localhost:3000` and logs in with `performance.user1@badminton.test`.

Optional environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BADMINTON_PERFORMANCE_BASE_URL` | `http://localhost:3000` | Web/API base URL to test. |
| `BADMINTON_PERFORMANCE_EMAIL` | `performance.user1@badminton.test` | Demo user used for API authentication. |
| `BADMINTON_PERFORMANCE_PASSWORD` | `pass123` | Demo password used for API authentication. |

All generated users use:

| Field | Value |
| --- | --- |
| Password | `pass123` |
| Example email | `performance.user1@badminton.test` |

## Tested Screens

| Screen | Performance Concern | Optimization |
| --- | --- | --- |
| Dashboard | Large session volume for active/archive lists. | Existing dashboard pagination uses database `limit`/`offset` through `getDashboardSessions`. |
| Groups | Many group cards and group statistics. | Groups page now renders one server-side page at a time. |
| Group details | Large player, member, announcement, and session sublists. | Group detail sublists now use independent server-side pagination. |
| Events | Large event lists and registration counts. | Events list now uses database-level pagination and batched registration counts. |
| Session details | Large attendance and comment data. | Session comment API supports pagination; attendance updates are scoped by session and player indexes. |
| Mobile sessions | Active sessions endpoint previously sliced in memory. | `/api/sessions` now uses paged database queries and returns richer pagination metadata. |
| Mobile events | Events endpoint previously loaded all rows before slicing. | `/api/events` now uses database `count`, `limit`, and `offset`. |

## Tested Endpoints

| Endpoint | Pagination |
| --- | --- |
| `GET /api/sessions?page=1&pageSize=20` | Yes |
| `GET /api/events?page=1&pageSize=20` | Yes |
| `GET /api/announcements?page=1&pageSize=20` | Yes |
| `GET /api/sessions/:id` | Detail endpoint, scoped by authenticated group access |
| `GET /api/sessions/:id/comments?page=1&pageSize=20` | Yes |
| `POST /api/sessions/:id/attendance` | Single player/session update |
| `GET /api/events/:id` | Detail endpoint |

Paginated API responses include:

```json
{
  "paging": {
    "page": 1,
    "pageSize": 20,
    "total": 5000,
    "totalCount": 5000,
    "totalPages": 250,
    "hasMore": true,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

The legacy `total` and `hasMore` fields remain available for the current mobile app.

## Database Indexes

Additional indexes were added for performance-sensitive filters and sort orders:

| Index | Purpose |
| --- | --- |
| `sessions_group_date_time_idx` | Paged session listing by group/date/time. |
| `sessions_venue_date_idx` | Venue-based session lookups. |
| `sessions_coach_date_idx` | Coach schedule lookups. |
| `session_attendance_session_id_idx` | Attendance lookup for a session. |
| `session_attendance_player_id_idx` | Attendance lookup for a player. |
| `session_comments_session_time_idx` | Paged session comments ordered by comment time. |

Existing indexes already cover important lookups such as `users.email`, `players.parentUserId`, `groups.venueId`, `group_members.groupId`, `group_members.userId`, `sessions.groupId`, `sessions.venueId`, `sessions.coachUserId`, `events.eventDate`, `event_registrations.eventId`, and `event_registrations.userId`.

## Optimizations Implemented

- Added `db:seed:performance` for large deterministic demo data.
- Added a Drizzle migration for additional performance indexes.
- Added reusable API pagination metadata.
- Changed `/api/sessions` to use the paged dashboard query instead of slicing a fully loaded list.
- Changed `/api/events` to use database `count`, `limit`, and `offset`.
- Changed `/api/announcements` to use database `count`, `limit`, and `offset`.
- Added pagination metadata to session comments API.
- Added server-side pagination controls to the web Groups page.
- Added server-side pagination controls to the web Events page.
- Added independent pagination controls to group detail sublists for players, members, announcements, and sessions.
- Added `npm run test:performance` for lightweight API timing checks.
- Avoided loading all groups for admin session-detail and comment authorization checks.
- Batched event registration counts for event list pages to avoid one count query per event card.
- Preserved compatibility with the existing mobile infinite-scroll screens.

## Known Bottlenecks Found

- Session detail pages return visible attendance data with the session detail response. For extremely large groups, attendance should be split into a dedicated paginated endpoint.
- Offset pagination is simple and evaluator-friendly, but keyset pagination would be faster for very deep pages.
- Local dev server timings include Next.js development overhead, local machine load, and remote database latency. Production timings should be measured separately after deployment.

## Before / After Notes

Before optimization:

- Mobile sessions loaded all accessible active sessions and sliced in memory.
- Mobile events loaded all upcoming events and sliced in memory.
- Web group and event list pages rendered every visible record returned by the database.
- Session comments API returned every comment for a session.

After optimization:

- List endpoints and list pages cap page size and return only one page of data.
- APIs return complete pagination metadata.
- Additional indexes support common filters, joins, and sort orders.
- The performance seed can be rerun locally to reproduce the same scale test.

Latest local timing run:

| Check | Status | Time |
| --- | ---: | ---: |
| `POST /api/auth/login` | 200 | 2,293 ms |
| `GET /api/sessions?page=1&pageSize=20` | 200 | 1,456 ms |
| `GET /api/events?page=1&pageSize=20` | 200 | 242 ms |
| `GET /api/announcements?page=1&pageSize=20` | 200 | 1,556 ms |
| `GET /api/sessions/8681` | 200 | 3,626 ms |
| `GET /api/sessions/8681/comments?page=1&pageSize=20` | 200 | 1,663 ms |

The timing script writes the latest machine-readable result to:

```text
docs/assessments/performance-check-latest.json
```

## Recommended Future Improvements

- Add thresholds to `npm run test:performance` once deployed baseline timings are known.
- Add database `EXPLAIN ANALYZE` snapshots for the highest-volume queries.
- Move session attendance and event registrations into independently paginated subviews.
- Add keyset pagination for sessions and comments.
- Add CI-safe performance smoke tests against a seeded test database.
