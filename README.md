# EchoVault

**Composable Personal Context Layer for AI on Solana**

EchoVault makes AI context portable, permissioned, and user‑owned. Instead of every app trapping your preferences and history in a silo, EchoVault lets users hold their context as on‑chain assets and grant time‑boxed or paid access to agents — with revocation and auditability.

## The Problem (Why This Matters)
AI agents are only as good as their context. Today that context is:
- **Siloed** per app or vendor
- **Non‑portable** across agents and workflows
- **Non‑monetizable** for users who generated it
- **Non‑revocable** once shared

This limits agent performance, creates lock‑in, and blocks a real market for high‑quality context.

## The Approach
EchoVault combines on‑chain ownership with off‑chain encryption:

- **Context as an asset**: Encrypted context lives off‑chain; on‑chain metadata points to it.
- **Access grants**: Users authorize specific agents for specific scopes, with expiries.
- **Revocation**: Grants can be revoked at any time.
- **Payment gating (x402)**: Optional pay‑per‑read access for agents or apps.

The goal is a simple, composable primitive: *portable context that respects user control*.

## What’s in the MVP
**On‑chain primitives**
- Context vault asset (cNFT / Token‑2022)
- Access grant PDA
- Revocation registry

**Off‑chain services**
- Encryption gateway + storage (IPFS/Arweave/S3)
- Context API
- Agent SDK + CLI

**Payments**
- x402 pay‑per‑read (mint/amount validation + payer/recipient checks)

## Status (Current Dev Stub)
- End‑to‑end flow: init → grant → request → payment verify → return encrypted blob
- In‑memory grant + revocation store (dev stub)
- In‑memory encrypted blob store (dev stub)
- SDK helpers for init/grant/revoke/preview/request + fetch/decrypt + AES-GCM encrypt/decrypt helpers

See `docs/demo.md` for the walkthrough.

## Architecture at a Glance
```
User (owner)
  ├─ Encrypt context → Storage (IPFS/Arweave/S3)
  ├─ Mint Context Asset (on‑chain)
  └─ Grant access (PDA) / Revoke

Agent
  ├─ Request context → 402 challenge (optional)
  ├─ Pay via x402
  └─ Receive encrypted blob pointer + metadata
```

## Why Solana
- **Cheap, fast primitives** for access grants and revocation
- **Token‑2022 / cNFTs** for context ownership
- **Composable** with agent payments and on‑chain reputation

## Demo
Copy `.env.example` to `.env` and adjust values if needed. See `docs/demo.md` for the end‑to‑end walkthrough, or run:

```bash
npx tsx scripts/e2e-demo.ts
```

## CLI (dev)
Point at the API with `ECHOVAULT_API` and drive the flow:

```bash
export ECHOVAULT_API=http://localhost:8787
export ECHOVAULT_OWNER=OWNER
export ECHOVAULT_GRANTEE=GRANTEE
export ECHOVAULT_SCOPE_HASH=SCOPE_HASH

# init vault + encrypted blob
npx echovault init

# fetch vault + list grants
npx echovault vault
npx echovault grants

# grant + preview + request
npx echovault grant
npx echovault preview
npx echovault request
```

Dangerous reset (dev store only):
```bash
ECHOVAULT_RESET_OK=yes npx echovault reset
```

One‑shot helper (starts API, waits for `/status`, runs encrypted demo, saves logs):
```bash
./scripts/demo-record.sh
```

### Encrypted demo (AES‑GCM)
```bash
export ECHOVAULT_SECRET=dev-secret
npx tsx scripts/encrypt-blob.ts '{"hello":"world"}' > /tmp/echovault-encrypted.json
export ECHOVAULT_ENCRYPTED_BLOB=$(cat /tmp/echovault-encrypted.json)
npx tsx scripts/e2e-encrypt-demo.ts
```

See `docs/demo-video-plan.md` for the recording checklist.

## API Reference (Dev Stub)
See `docs/api.md` for request/response examples and error codes.

## Runtime toggles (dev)
- `ECHOVAULT_ONCHAIN_RPC` + `ECHOVAULT_PROGRAM_ID` + `ECHOVAULT_ONCHAIN_STRICT=true` to enforce on-chain grant validation.
- `ECHOVAULT_STORAGE_DIR` to persist encrypted blobs to disk (filesystem adapter).

## Repo Layout
- `programs/` — Solana programs (Anchor)
- `packages/` — SDK + API + CLI
- `docs/` — Specs, architecture, flows

## Roadmap (Short‑Term)
- Replace in‑memory stores with persistent storage
- Encrypt/decrypt flow with real keys
- On‑chain grant + revoke enforcement
- SDK ergonomics + agent integrations

---

EchoVault is a foundation for **user‑owned, permissioned AI context** — portable across agents and apps, without sacrificing control or privacy.
