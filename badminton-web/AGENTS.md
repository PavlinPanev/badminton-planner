# Badminton Web Agent Instructions

## Project Description

A badminton club planner app: club managers create groups, coaches manage sessions, and parents view sessions and mark attendance.

## Technology Stack

- Next.js
- React
- Tailwind CSS
- Neon Postgres
- Drizzle ORM
- TypeScript

## Architectural Guidelines

- Use Next.js conventions for routing, server-rendered components, layouts, route handlers, and data loading.
- Prefer server-rendered components for database-backed views unless client interactivity is required.
- Keep UI components focused on presentation and interaction; place business logic in services.
- Keep database code in a dedicated schema/repository/service layer using Drizzle ORM.
- Organize features modularly around product areas such as groups, sessions, attendance, comments, events, users, and auth.
- Use RESTful API routes for mobile app integration and any web client features that need HTTP access.
- Validate all route inputs and form submissions before calling service or database logic.

## User Interface Guidelines

- Build a modern, responsive interface with Tailwind.
- Keep the product colorful, friendly, sporty, and youth-oriented while preserving operational clarity.
- Use a bright balanced palette inspired by badminton courts and shuttles: emerald/teal, lime, sky blue, violet, and amber.
- Prefer rounded cards, soft shadows, clear badges, accessible icons, and lively but restrained gradients for major dashboard and session surfaces.
- Do not use real member, parent, or child photos in demo UI. Use demo-safe generated data, icons, local SVG-style decoration, or abstract sporty gradients.
- Favor clean operational screens over marketing-style layouts.
- Keep dashboards dense enough for club management while still easy to scan.
- Use accessible controls, labels, focus states, loading states, and empty states.
- Make role-specific actions clear: managers manage groups, coaches manage sessions, parents view sessions and mark attendance.
- Keep destructive actions explicit and confirmed.
- Extract repeated dashboard/session UI into small reusable components rather than large monolithic page files.

## Pages and Navigation Guidelines

- Expected web areas include dashboard, groups, group details, sessions, attendance, comments, events, users/account, login, and logout.
- Protect app pages that require a logged-in user.
- Show navigation items according to the authenticated user's role and permissions.
- Keep page URLs stable and descriptive.
- Use shared layouts for authenticated app screens and lightweight layouts for auth pages.

## Backend and Database Guidelines

- Use Neon Postgres as the production database.
- Use Drizzle ORM for schema definitions, migrations, typed queries, and relations.
- Keep migrations intentional and review schema changes carefully.
- Prefer service functions for workflows that combine validation, authorization, and persistence.
- Keep API responses predictable and documented through TypeScript types where possible.
- Handle database errors gracefully and avoid exposing internal error details.

## Authentication and Authorization Guidelines

- Enforce authentication in server-side loaders, route handlers, and server actions.
- Enforce authorization on every protected mutation and sensitive read.
- Support role-based access: club managers can create groups, coaches can manage sessions, and parents can view sessions and mark attendance.
- Do not rely on hidden UI alone for access control.
- Keep session and token handling centralized so web and mobile auth behavior remains consistent.
