# EchoVault Demo Web

EchoVault demo console built with React + Vite. The app runs fully in the browser and can use local sample data or live API data to showcase the operator dashboard.

## Highlights

- Clickable navigation across Overview, Vaults, Records, Alerts, Audit, and Settings.
- Vault inventory with compliance and SLA metadata.
- Activity stream, alert queue, and audit log views.
- Runtime toggles in Settings to illustrate on-chain strict mode, storage, and alerting.

## Run locally

```bash
npm install
npm run dev
```

## Env options

```bash
# Data mode: local (default) or live
VITE_DATA_MODE=local

# API base for live mode
VITE_ECHOVAULT_API=https://your-api

# Optional demo asset links for Demo Flow
VITE_DEMO_LOGS_URL=https://your-demo-logs
VITE_DEMO_OUTPUT_URL=https://your-demo-output
VITE_DEMO_VIDEO_URL=https://your-demo-video
```

## Build

```bash
npm run build
```

## Deploy (Vercel)

1) Push the repo to GitHub.
2) In Vercel, import the repo and set **Root Directory** to `demo-web/`.
3) Framework preset: **Vite** (or leave auto-detect).
4) Set env vars from `.env.example` (optional: add `VITE_DEMO_*` links for Demo Flow).
5) Build: `npm run build`
6) Output: `dist/`

## Branding

The logo lives at `public/echovault-logo.svg`. Update it in-place if you want a different mark or colorway.
