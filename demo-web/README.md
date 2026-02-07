# EchoVault Demo Web

Mock UI for the EchoVault demo experience, built with React + Vite. The app is intentionally front-end only and uses local mock data to showcase how an operator dashboard could look.

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
