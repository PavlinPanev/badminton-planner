# Badminton Mobile Agent Instructions

## Project Description

A badminton planner app: users log in, view groups and sessions, mark attendance, and view comments and events.

## Technology Stack

- Expo
- React Native
- Expo Router
- TypeScript
- Badminton Club Planner RESTful API
- Bearer token authentication

## Architectural Guidelines

- Follow Expo Router conventions for stack navigation, tabs, route groups, and protected screens.
- Keep screens focused on rendering and user interaction.
- Put API access in dedicated client modules or services.
- Keep domain models and reusable types aligned with `badminton-shared/` when possible.
- Design around RESTful API calls to the Badminton Club Planner backend.
- Store and attach Bearer tokens through a centralized auth client or session provider.
- Handle loading, refresh, empty, offline, and error states for all remote data views.

## Mobile UI Guidelines

- Build a user-friendly mobile interface optimized for quick session checks and attendance updates.
- Keep the product colorful, friendly, sporty, and youth-oriented while preserving operational clarity.
- Use a bright balanced palette inspired by badminton courts and shuttles: emerald/teal, lime, sky blue, violet, and amber.
- Prefer rounded cards, soft shadows, clear badges, accessible icons, and lively but restrained gradients for major dashboard and session surfaces.
- Do not use real member, parent, or child photos in demo UI. Use demo-safe generated data, icons, local SVG-style decoration, or abstract sporty gradients.
- Use stack navigation for drill-down flows such as group details, session details, comments, and events.
- Keep touch targets comfortable and layouts responsive across phones, tablets, and web builds.
- Use native-feeling controls where appropriate, while preserving consistent visual language.
- Keep attendance actions easy to find and hard to trigger accidentally.
- Avoid exposing manager or coach-only controls to users who should only view sessions and mark attendance.


## Mobile UI Alerts

- Ensure all native alerts, confirms, prompts, and other system dialogs have a fallback for Web.
- Implement Web fallbacks as modal popups instead of relying on native-only APIs.
- Keep confirmation dialogs accessible, keyboard-usable on Web, and easy to dismiss safely.

## Pages and Navigation Guidelines

- Expected mobile areas include login, group list, group details, session list, session details, attendance action, comments, events, and account/logout.
- Keep protected routes inaccessible without a valid authenticated session.
- Redirect logged-out users to login and avoid flashing protected data during auth checks.
- Prefer simple, predictable navigation over deep hidden flows.

## Backend and API Guidelines

- Consume the Badminton Club Planner RESTful API.
- Send authenticated requests with an `Authorization: Bearer <token>` header.
- Keep API URL configuration environment-based.
- Parse and normalize API errors before showing them in UI.
- Avoid duplicating backend authorization logic in the app; use client checks only to improve UX.

## Authentication and Authorization Guidelines

- Centralize login, logout, token storage, token loading, and authenticated fetch behavior.
- Never hard-code tokens or user IDs.
- Treat the backend as the source of truth for permissions.
- Clear local auth state when the token is invalid, expired, or rejected by the API.
