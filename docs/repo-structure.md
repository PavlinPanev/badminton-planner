# Repository Structure

## Monorepo Overview
Badminton Club Planner is an npm workspace monorepo with separate web, mobile, and shared packages.

```
badminton-club-planner/
├── badminton-web/
├── badminton-mobile/
├── badminton-shared/
├── docs/
├── package.json
└── README.md
```

## Folder Purpose
- **badminton-web**: Next.js web application and backend API
- **badminton-mobile**: Expo React Native mobile app
- **badminton-shared**: Shared types and utilities
- **docs**: Architecture, database, and setup docs

## Important Web Folders
- **src/app**: App Router pages and layouts
- **src/app/api**: REST API routes for mobile
- **src/components**: Reusable UI components
- **src/db**: Drizzle schema, database setup, migrations
- **src/lib**: Service layer and data helpers (queries, validation, domain logic)
- **src/auth**: Auth utilities, sessions, JWT
- **src/services**: Optional service modules if extracted from `src/lib`
- **src/types**: Optional app-specific types if not shared

## Important Mobile Folders
- **src/app**: Expo Router screens
- **src/components**: Mobile UI components
- **src/auth**: Auth context and token storage
- **src/lib**: API helpers

## Shared Code Strategy
- **badminton-shared** holds TypeScript models and helpers
- Web and mobile import shared types for consistency

## Configuration Files
- **package.json** (root): npm workspaces and scripts
- **badminton-web/next.config.ts**: Next.js configuration
- **badminton-web/drizzle.config.ts**: Drizzle migrations
- **badminton-mobile/app.config.js**: Expo configuration
- **badminton-mobile/eslint.config.js**: Mobile linting

## Environment Variables
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `BADMINTON_API_URL`

## Workspaces
The monorepo uses npm workspaces to install and run packages together:
- `npm install` installs all dependencies
- `npm run dev` can start the full stack
- Per-package scripts are scoped with `--workspace`
