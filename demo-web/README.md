# EchoVault Demo Web ✨

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A polished EchoVault operator console built with React + Vite. The UI can run fully in the browser and connect to the **EchoVault API** for live data, with a local data mode for offline demos.

> **Goal:** show the end‑to‑end consented access flow (grant → request → revoke) plus audit visibility and operator UX.

---

## 🌟 Highlights

- Multi‑section navigation: Overview, Vaults, Records, Alerts, Audit, Grants, Playbooks, Usage, Demo Flow
- Demo Flow checklist with copyable commands + report generator
- Detail drawers with exportable Markdown reports
- Live API status checks in Settings + Overview

---

## 🚀 Run locally

```bash
npm install
npm run dev
```

---

## ⚙️ Environment

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

Live mode will show sample data if the API is unreachable or returns zero vaults, so the UI stays populated during demos.

---

## 🧱 Build

```bash
npm run build
```

---

## ☁️ Deploy (Vercel)

1) Push the repo to GitHub.
2) In Vercel, import the repo and set **Root Directory** to `demo-web/`.
3) Framework preset: **Vite** (or auto-detect).
4) Set env vars from `.env.example` (optional: add `VITE_DEMO_*` links).
5) Build: `npm run build`
6) Output: `dist/`

---

## 🎨 Branding

The logo lives at `public/echovault-logo.svg`. Update it in‑place if you want a different mark or colorway.
