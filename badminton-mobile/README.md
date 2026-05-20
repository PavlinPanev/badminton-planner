# Badminton Mobile

Expo React Native app for Badminton Club Planner parents, players, and group members.

## Responsibilities

- Mobile login and registration.
- Secure token storage with Expo SecureStore on native platforms.
- Session, group, announcement, event, account, attendance, and comments screens.
- REST API communication with the deployed Next.js backend.

## Local Setup

Create `badminton-mobile/.env` from `badminton-mobile/.env.example`:

```env
BADMINTON_API_URL="http://localhost:3000/api"
```

For physical devices, replace `localhost` with the LAN IP address of the machine running the web/API app.

Run from the repository root:

```bash
npm install
npm run dev:mobile
```

## Web Export

The mobile app can be exported as a static web preview for capstone evaluation:

```bash
npm run build:mobile
```

The export writes files to:

```text
badminton-mobile/dist
```

Recommended Netlify settings:

| Setting | Value |
| --- | --- |
| Base directory | `badminton-mobile` |
| Build command | `npm run build` |
| Publish directory | `dist` |

Set `BADMINTON_API_URL` in Netlify to the deployed web API, for example:

```env
BADMINTON_API_URL="https://badminton-planner-web-may-2026.netlify.app/api"
```

See [../docs/deployment-guide.md](../docs/deployment-guide.md) for the full deployment checklist.
